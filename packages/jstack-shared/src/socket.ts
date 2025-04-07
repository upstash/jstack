import { Redis } from "@upstash/redis/cloudflare"
import { z } from "zod"
import { EventEmitter } from "./event-emitter"
import { logger } from "./logger"

interface ServerSocketOptions {
  redisUrl: string
  redisToken: string
  incomingSchema: z.ZodSchema
  outgoingSchema: z.ZodSchema
}

export interface SystemEvents {
  onConnect: void
  onError: Error
}

export class ServerSocket<IncomingEvents, OutgoingEvents> {
  private room: string = "DEFAULT_ROOM"
  private ws: WebSocket
  private controllers: Map<string, AbortController> = new Map()
  private emitter: EventEmitter

  private redis: Redis
  private redisUrl: string
  private redisToken: string
  private lastPingTimes: Map<string, number> = new Map()
  private heartbeatTimers: Map<
    string,
    {
      sender: NodeJS.Timeout
      monitor: NodeJS.Timeout
    }
  > = new Map()

  constructor(ws: WebSocket, opts: ServerSocketOptions) {
    const { incomingSchema, outgoingSchema, redisUrl, redisToken } = opts

    this.redisUrl = redisUrl
    this.redisToken = redisToken
    this.redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })

    this.ws = ws
    this.emitter = new EventEmitter(ws, { incomingSchema, outgoingSchema })
  }

  get rooms() {
    return [this.room]
  }

  close() {
    this.ws.close()

    // clear all active subscriptions
    for (const controller of this.controllers.values()) {
      controller.abort()
    }
    this.controllers.clear()

    // clear all heartbeat timers
    for (const timers of this.heartbeatTimers.values()) {
      clearInterval(timers.sender)
      clearInterval(timers.monitor)
    }
    this.heartbeatTimers.clear()
  }

  off<K extends keyof IncomingEvents & SystemEvents>(event: K, callback?: (data: IncomingEvents[K]) => any): void {
    return this.emitter.off(event as string, callback)
  }

  on<K extends keyof IncomingEvents>(event: K, callback?: (data: IncomingEvents[K]) => any): void {
    return this.emitter.on(event as string, callback)
  }

  emit<K extends keyof OutgoingEvents>(event: K, data: OutgoingEvents[K]): boolean {
    return this.emitter.emit(event as string, data)
  }

  handleEvent(eventName: string, eventData: unknown) {
    this.emitter.handleEvent(eventName, eventData)
  }

  async join(room: string): Promise<void> {
    this.room = room
    logger.info(`Socket trying to join room: "${room}".`)
    await this.subscribe(room)
      .catch((error) => {
        logger.error(`Subscription error for room ${room}:`, error)
      })
      .then(() => logger.success(`Joined room: ${room}`))
      .then(() => this.createHeartbeat(room))
  }

  leave(room: string) {
    const controller = this.controllers.get(room)

    if (controller) {
      controller.abort()
      this.controllers.delete(room)
      logger.info(`Left room: ${room}`)
    } else {
      logger.warn(`Attempted to leave room "${room}" but no active controller found`)
    }
  }

  private createHeartbeat(room: string) {
    const heartbeat = {
      sender: setInterval(async () => {
        await this.redis.publish(room, ["ping", null])
      }, 30000),

      monitor: setInterval(() => {
        const lastPingTime = this.lastPingTimes.get(room) ?? 0

        if (Date.now() - lastPingTime > 45000) {
          logger.warn("Heartbeat timeout detected")
          this.unsubscribe(room).then(() => this.subscribe(room))
        }
      }, 5000),
    }

    this.heartbeatTimers.set(room, heartbeat)
  }

  private async subscribe(room: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const controller = new AbortController()
        this.controllers.set(room, controller)

        // initialize heartbeat
        this.lastPingTimes.set(room, Date.now())

        const stream = await fetch(`${this.redisUrl}/subscribe/${room}`, {
          headers: {
            Authorization: `Bearer ${this.redisToken}`,
            accept: "text/event-stream",
          },
          signal: controller.signal,
        })

        const reader = stream.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (reader) {
          const { done, value } = await reader.read()

          // continue execution once connection is established
          // otherwise subscription below would be blocking
          resolve()

          if (done) break

          const chunk = decoder.decode(value)
          buffer += chunk

          const messages = buffer.split("\n")
          buffer = messages.pop() || ""

          for (const message of messages) {
            logger.info("Received message:", message)
            if (message.startsWith("data: ")) {
              const data = message.slice(6)
              try {
                // extract payload from message format: message,room,payload
                // skip first two commas to get the start of the payload
                const firstCommaIndex = data.indexOf(",")
                const secondCommaIndex = data.indexOf(",", firstCommaIndex + 1)

                if (firstCommaIndex === -1 || secondCommaIndex === -1) {
                  logger.warn("Invalid message format - missing commas")
                  continue
                }

                const payloadStr = data.slice(secondCommaIndex + 1)

                if (!payloadStr) {
                  logger.warn("Missing payload in message")
                  continue
                }

                const parsed = JSON.parse(payloadStr)

                if (parsed[0] === "ping") {
                  logger.success("Heartbeat received successfully")

                  this.lastPingTimes.set(room, Date.now())
                }

                if (this.ws.readyState === WebSocket.OPEN) {
                  this.ws.send(JSON.stringify(parsed))
                } else {
                  logger.debug("WebSocket not open, skipping message")
                }
              } catch (err) {
                logger.debug("Failed to parse message payload", err)
              }
            }
          }
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  private async unsubscribe(room: string) {
    const controller = this.controllers.get(room)
    if (controller) {
      controller.abort()
      this.controllers.delete(room)
      logger.info(`Unsubscribed from room: ${room}`)
    } else {
      logger.warn(`No active subscription found for room: ${room}`)
    }
  }
}

type Schema = z.ZodSchema | undefined

export class ClientSocket<IncomingEvents extends SystemEvents, OutgoingEvents> {
  private ws!: WebSocket
  private emitter!: EventEmitter

  private url: string | URL
  private incomingSchema: Schema
  private outgoingSchema: Schema

  private pingTimer?: NodeJS.Timeout
  private pongTimer?: NodeJS.Timeout
  private reconnectAttempts: number = 0

  isConnected: boolean = false

  constructor(
    url: string | URL,
    { incomingSchema, outgoingSchema }: { incomingSchema?: Schema; outgoingSchema?: Schema } = {}
  ) {
    this.url = url
    this.incomingSchema = incomingSchema
    this.outgoingSchema = outgoingSchema

    this.connect()
  }

  cleanup() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = undefined
    }

    if (this.pongTimer) {
      clearTimeout(this.pongTimer)
      this.pongTimer = undefined
    }
  }

  close() {
    this.cleanup()

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, "Client closed connection")
    }

    this.isConnected = false
  }

  connect() {
    const ws = new WebSocket(this.url)

    const existingHandlers = this.emitter?.eventHandlers

    this.emitter = new EventEmitter(ws, { incomingSchema: this.incomingSchema, outgoingSchema: this.outgoingSchema })

    if (existingHandlers) {
      this.emitter.eventHandlers = new Map(existingHandlers)
    }

    this.ws = ws

    ws.onerror = (err) => {
      const url = (err.currentTarget as WebSocket)?.url

      if (typeof url === "string") {
        if (url.includes(":3000")) {
          console.error(`🚨 Cannot connect to WebSocket server

WebSocket connections require Cloudflare Workers (port 8080).
Node.js servers (port 3000) do not support WebSocket connections.

To start your Cloudflare Worker locally:
$ wrangler dev

Fix this issue: https://jstack.app/docs/getting-started/local-development
          `)
        }
      } else {
        logger.error(`Connection error:`, err)
      }

      this.emitter.handleEvent("onError", err)
    }

    ws.onopen = () => {
      logger.success("Connected")
      this.isConnected = true
      this.reconnectAttempts = 0

      this.emitter.handleEvent("onConnect", undefined)
    }

    ws.onclose = () => {
      logger.warn(`Connection closed, trying to reconnect...`)
      this.isConnected = false

      this.reconnectAttempts++

      if (this.reconnectAttempts < 3) {
        setTimeout(() => this.connect(), 1500)
      } else {
        logger.error(
          "Failed to establish connection after multiple attempts. Check your network connection, or refresh the page to try again."
        )
      }
    }

    ws.onmessage = (event) => {
      const data = z.string().parse(event.data)
      const eventSchema = z.tuple([z.string(), z.unknown()])

      const parsedData = JSON.parse(data)

      const parseResult = eventSchema.safeParse(parsedData)

      if (parseResult.success) {
        const [eventName, eventData] = parseResult.data
        this.emitter.handleEvent(eventName, eventData)
      } else {
        logger.warn("Unable to parse event:", event.data)
      }
    }
  }

  emit<K extends keyof OutgoingEvents>(event: K, data: OutgoingEvents[K]): boolean {
    return this.emitter.emit(event as string, data)
  }

  off<K extends keyof IncomingEvents & SystemEvents>(event: K, callback?: (data: IncomingEvents[K]) => any): void {
    return this.emitter.off(event as string, callback)
  }

  on<K extends keyof IncomingEvents>(event: K, callback?: (data: IncomingEvents[K]) => any): void {
    return this.emitter.on(event as string, callback)
  }
}
