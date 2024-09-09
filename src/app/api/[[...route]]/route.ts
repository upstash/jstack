import { httpHandler } from "@/server"

export const runtime = "edge"

export { httpHandler as GET, httpHandler as POST }
