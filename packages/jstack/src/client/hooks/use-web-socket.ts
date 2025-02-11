import { useEffect, useRef } from "react"
import { ClientSocket, SystemEvents } from "jstack-shared"

export function useWebSocket<
  IncomingEvents extends Partial<SystemEvents> & Record<string, unknown>,
>(
  socket: ClientSocket<IncomingEvents & SystemEvents, any>,
  events: Partial<{
    [K in keyof (IncomingEvents & SystemEvents)]: (
      data: (IncomingEvents & SystemEvents)[K]
    ) => void
  }>,
  opts: { enabled?: boolean } = { enabled: true }
) {
  const eventsRef = useRef(events)
  eventsRef.current = events

  useEffect(() => {
    if (opts?.enabled === false || !socket) {
      return
    }

    const defaultHandlers = {
      onConnect: () => {},
      onError: (error: Error) => console.error("WebSocket error:", error),
      onDisconnect: () => socket.reconnect(),
    }

    const mergedEvents = {
      ...defaultHandlers,
      ...eventsRef.current, // Use ref to avoid stale closures
    }

    const eventNames = Object.keys(mergedEvents) as Array<
      keyof IncomingEvents & SystemEvents
    >

    eventNames.forEach((eventName) => {
      const handler = mergedEvents[eventName]
      if (handler) {
        socket.on(eventName, handler)
      }
    })

    return () => {
      eventNames.forEach((eventName) => {
        const handler = mergedEvents[eventName]
        if (handler) {
          socket.off(eventName, handler)
        }
      })
      socket.close()
    }
  }, [socket, opts?.enabled]) 
}
