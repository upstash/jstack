import { Redis } from "@upstash/redis/cloudflare"
import { logger } from "jstack-shared"

export class IO<IncomingEvents, OutgoingEvents> {
  private targetRoom: string | null = null
  private redis: Redis

  constructor(redisUrl: string, redisToken: string) {
    this.redis = new Redis({ token: redisToken, url: redisUrl })
  }

  /**
   * Sends to all connected clients (broadcast)
   */
  async emit<K extends keyof OutgoingEvents>(event: K, data: OutgoingEvents[K]) {
    if (this.targetRoom) {
      await this.redis.publish(this.targetRoom, [event, data])
    }

    logger.success(`IO emitted to room "${this.targetRoom}":`, [event, data])

    // Reset target room after emitting
    this.targetRoom = null
  }

  /**
   * Sends to all in a room
   */
  to(room: string): this {
    this.targetRoom = room
    return this
  }
}
