import { z } from "zod"
import { logger } from "./logger"

type Schema = z.ZodTypeAny | undefined

interface SchemaConfig {
  incomingSchema: Schema
  outgoingSchema: Schema
}

export class EventEmitter {
  eventHandlers = new Map<string, ((data: any) => any)[]>()
  ws: WebSocket

  incomingSchema: Schema
  outgoingSchema: Schema

  constructor(ws: WebSocket, schemas: SchemaConfig) {
    const { incomingSchema, outgoingSchema } = schemas

    this.ws = ws
    this.incomingSchema = incomingSchema
    this.outgoingSchema = outgoingSchema
  }

  emit(event: string, data: any): boolean {
    if (this.ws.readyState !== WebSocket.OPEN) {
      logger.warn("WebSocket is not in OPEN state. Message not sent.")
      return false
    }

    if (this.outgoingSchema) {
      console.log('there is outgoing schema');
      try {
        this.outgoingSchema.parse(data)
      } catch (err) {
        this.handleSchemaMismatch(event, data, err)
        return false
      }
    }

    this.ws.send(JSON.stringify([event, data]))
    return true
  }

  handleSchemaMismatch(event: string, data: any, err: any) {
    if (err instanceof z.ZodError) {
      logger.error(`Invalid outgoing event data for "${event}":`, {
        errors: err.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
        data: JSON.stringify(data, null, 2),
      })
    } else {
      logger.error(`Error validating outgoing event "${event}":`, err)
    }
  }

  handleEvent(eventName: string, data: any) {
    const handlers = this.eventHandlers.get(eventName)

    if (!handlers?.length) {
      logger.warn(
        `No handlers registered for event "${eventName}". Did you forget to call .on("${eventName}", handler)?`
      )
      return
    }

    let validatedData = data
    if (this.incomingSchema) {
      try {
        validatedData = this.incomingSchema.parse(data)
      } catch (err) {
        if (err instanceof z.ZodError) {
          logger.error(`Invalid incoming event data for "${eventName}":`, {
            errors: err.errors
              .map((e) => `${e.path.join(".")}: ${e.message}`)
              .join(", "),
            data: JSON.stringify(data, null, 2),
          })
        } else {
          logger.error(`Error validating incoming event "${eventName}":`, err)
        }
        return
      }
    }

    let hasErrors = false
    handlers.forEach((handler, index) => {
      try {
        handler(validatedData)
      } catch (err) {
        hasErrors = true
        const error = err instanceof Error ? err : new Error(String(err))
        logger.error(
          `Error in handler ${index + 1}/${handlers.length} for event "${eventName}":`,
          {
            error: error.message,
            stack: error.stack,
            data: JSON.stringify(validatedData, null, 2),
          }
        )
      }
    })

    if (hasErrors) {
      throw new Error(
        `One or more handlers failed for event "${eventName}". Check logs for details.`
      )
    }
  }

  off(event: string, callback?: (data: any) => any) {
    if (!callback) {
      this.eventHandlers.delete(event as string)
    } else {
      const handlers = this.eventHandlers.get(event as string)
      if (handlers) {
        const index = handlers.indexOf(callback)
        if (index !== -1) {
          handlers.splice(index, 1)
          if (handlers.length === 0) {
            this.eventHandlers.delete(event as string)
          }
        }
      }
    }
  }

  on(event: string, callback?: (data: any) => any): void {
    if (!callback) {
      logger.error(
        `No callback provided for event handler "${event.toString()}". Ppass a callback to handle this event.`
      )

      return
    }

    const handlers = this.eventHandlers.get(event as string) || []
    handlers.push(callback)
    this.eventHandlers.set(event as string, handlers)
  }
}
