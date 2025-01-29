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
    if (opts?.enabled === false) {
      return
    }

    const defaultHandlers = {
      onConnect: () => {},
      onError: () => {},
    }

    const mergedEvents = {
      ...defaultHandlers,
      ...events,
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
        socket.off(eventName, handler)
      })
    }
  }, [opts?.enabled])
}
