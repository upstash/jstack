import superjson from "superjson"

export const parseSuperJSON = (value: string) => {
  try {
    return superjson.parse(value)
  } catch {
    return value
  }
}
