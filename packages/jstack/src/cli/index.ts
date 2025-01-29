#!/usr/bin/env node

import { Command } from "commander"
import { deploy } from "./noop-deploy"

const program = new Command()

program
  .command("deploy")
  .description("Deploy JStack application to Cloudflare Workers") 
  .option("-n, --name <name>", "Deploy specific router by name")
  .action(deploy)

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

// Handle shutdown gracefully
const handleShutdown = async () => {
  console.log("\n") // Add newline after ^C
  process.exit(0)
}

process.on("SIGINT", handleShutdown) // Ctrl+C
process.on("SIGTERM", handleShutdown) // Kill signal
