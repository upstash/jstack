import { Redis } from "@upstash/redis/cloudflare"
import { logger } from "jstack-shared"

export class IO<IncomingEvents, OutgoingEvents> {
  private targetRoom: string | null = null
  private redis: Redis
  private readonly timeout = 5000 // 5 seconds timeout

  constructor(redisUrl: string, redisToken: string) {
    this.redis = new Redis({ token: redisToken, url: redisUrl })
  }

  async emit<K extends keyof OutgoingEvents>(event: K, data: OutgoingEvents[K]) {
    if (!this.targetRoom) {
      throw new Error("No target room specified. Call .to(room) before .emit()")
    }

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Redis publish timeout")), this.timeout)
      })

      await Promise.race([
        this.redis.publish(this.targetRoom, [event, data]),
        timeoutPromise
      ])

      logger.success(`IO emitted to room "${this.targetRoom}":`, [event, data])
    } catch (error) {
      logger.error(`Failed to emit to room "${this.targetRoom}":`, error)
      throw error
    } finally {
      // Reset target room after emitting
      this.targetRoom = null
    }
  }

  to(room: string): this {
    if (!room) {
      throw new Error("Room name cannot be empty")
    }
    this.targetRoom = room
    return this
  }
}
