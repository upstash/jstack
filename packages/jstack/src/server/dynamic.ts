import { Router } from "./router"

export const dynamic = <T extends Router>(
  importFn: () => Promise<{ [key: string]: T }>,
) => {
  return async () => {
    const module = await importFn()
    const routers = Object.values(module)

    if (routers.length === 0) {
      throw new Error(
        "Error dynamically loading router: Invalid router module - Expected a default or named export of a Router, but received an empty module. Did you forget to export your router?",
      )
    }

    if (routers.length > 1) {
      throw new Error(
        `Error dynamically loading router: Multiple Router exports detected in module (${Object.keys(module).join(", ")}). ` +
          "Please export only one Router instance per module."
      )
    }

    const router = routers[0]
    if (!(router instanceof Router)) {
      throw new Error(
        "Error dynamically loading router: Invalid router module - Expected exported value to be a Router instance, " +
          `but received ${router === null ? "null" : typeof router}. Are you exporting multiple functions from this file?`,
      )
    }

    return router
  }
}
