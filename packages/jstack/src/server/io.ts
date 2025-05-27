import { logger } from "jstack-shared"

export class IO<IncomingEvents, OutgoingEvents> {
  private targetRoom: string | null = null
  private redisUrl: string
  private redisToken: string

  constructor(redisUrl: string, redisToken: string) {
    this.redisUrl = redisUrl
    this.redisToken = redisToken
  }

  /**
   * Sends to all connected clients (broadcast)
   */
  async emit<K extends keyof OutgoingEvents>(
    event: K,
    data: OutgoingEvents[K],
  ) {
    if (this.targetRoom) {
      await fetch(`${this.redisUrl}/publish/${this.targetRoom}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([event, data]),
      })
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
