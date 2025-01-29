export const logger = {
  info(message: string, ...args: any[]) {
    console.log(`[Socket] ℹ️ ${message}`, ...args)
  },

  error(message: string, error?: Error | unknown) {
    console.error(`[Socket] ❌ ${message}`, error || "")
  },

  debug(message: string, ...args: any[]) {
    console.log(`[Socket] 🔍 ${message}`, ...args)
  },

  warn(message: string, ...args: any[]) {
    console.warn(`[Socket] ⚠️ ${message}`, ...args)
  },

  success(message: string, ...args: any[]) {
    console.log(`[Socket] ✅ ${message}`, ...args)
  },
}
