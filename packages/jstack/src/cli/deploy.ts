import boxen from "boxen"
import chalk from "chalk"
import { exec as execCb, execSync } from "child_process"
import { Command } from "commander"
import dotenv from "dotenv"
import { build } from "esbuild"
import ora from "ora"
import * as path from "path"
import { promisify } from "util"
import type { Router, RouterConfig } from "../server"
import fs from "fs-extra"
import { InferSchemaFromRouters } from "../server/merge-routers"

const exec = promisify(execCb)
const program = new Command()

const success = (msg: string) => chalk.green(`✨ ${msg}`)
const info = (msg: string) => chalk.blue(`ℹ️  ${msg}`)
const err = (msg: string) => chalk.red(`❌ ${msg}`)
const warn = (msg: string) => chalk.yellow(`⚠️  ${msg}`)

const buildAppRouter = async (projectDir: string): Promise<{ appRouter: Router<any>; appRouterPath: string }> => {
  // Try both potential router paths
  const srcPath = "src/server/index.ts"
  const regularPath = "server/index.ts"
  const distPath = path.join(projectDir, "dist/server/index.js")

  // Use whichever path exists
  const appRouterPath = await fs
    .access(path.join(projectDir, srcPath))
    .then(() => srcPath)
    .catch(() => fs.access(path.join(projectDir, regularPath)).then(() => regularPath))

  try {
    await build({
      entryPoints: [path.join(projectDir, appRouterPath)],
      bundle: true,
      outfile: distPath,
      format: "cjs",
      platform: "node",
      external: ["events"],
      minify: true,
    })

    const imported = await import(distPath)

    const appRouter = imported?.default?.default || imported.default || imported

    return { appRouter, appRouterPath }
  } catch (error) {
    console.log(error)

    throw new Error(
      "Failed to load router configuration\n\n" +
        `Looking for router at: ${appRouterPath}\n\n` +
        "Please check if:\n" +
        "  • You are executing this command in the project root directory\n" +
        "  • Your server/index.ts file exports default 'appRouter'\n" +
        "  • There are no syntax errors in your routers"
    )
  }
}

const execCommand = async (command: string) => {
  const { stdout, stderr } = await exec(command)
  if (stderr) console.error(chalk.dim(stderr))
  return stdout
}

const parseCloudflareOutput = (output: string) => {
  const metrics = {
    size: output.match(/Total Upload: (.*?) \//)?.[1] ?? "unknown",
    gzipSize: output.match(/gzip: (.*?)\n/)?.[1] ?? "unknown",
    startupTime: output.match(/Worker Startup Time: (.*?)\n/)?.[1] ?? "unknown",
    url: output.match(/https:\/\/.*?\.workers\.dev/)?.[0] ?? "unknown",
  }
  return metrics
}

export const deploy = async (options: any) => {
  const spinner = ora()
  const projectDir = process.cwd()

  console.log(
    boxen(chalk.bold.blue("JStack Deployment"), {
      padding: 1,
      margin: 1,
      borderStyle: "round",
    })
  )

  spinner.start("Building AppRouter...")
  const { appRouter, appRouterPath } = await buildAppRouter(projectDir)
  spinner.succeed("AppRouter built successfully")

  const registeredPaths: string[] = Object.keys(appRouter._metadata.subRouters) ?? []

  try {
    spinner.start("Analyzing router configuration")
    let routerPaths = registeredPaths.filter((path) => path !== "")

    // Filter for specific router if name is provided
    if (process.argv.includes("-n") || process.argv.includes("--name")) {
      const targetName = String(options.name)

      routerPaths = routerPaths.filter((path) => path === targetName)
      if (routerPaths.length === 0) {
        spinner.fail(`Router "${targetName}" not found`)
        console.log(warn(`Available routers: ${registeredPaths.join(", ")}`))
        return
      }
    }

    spinner.succeed(`Found ${chalk.cyan(routerPaths.length)} router(s)`)

    if (routerPaths.length === 0) {
      console.log(warn("No routers found to deploy"))
      return
    }

    // generate worker code
    spinner.start("Generating worker code")
    for (const routerPath of routerPaths) {
      const router = appRouter._metadata?.subRouters[routerPath]

      console.log("i should deploy this routeR:", routerPath)

      const routerConfig = appRouter._metadata?.subRouters[routerPath]._metadata.config || {}
      const workerCode = `import { Router } from "jstack"
import { ${routerPath}Router } from "../${appRouterPath.replace("index.ts", "")}routers/${routerPath}Router"

export default ${routerPath}Router`

      await fs.ensureDir("dist")
      await fs.writeFile(`dist/${routerPath}.ts`, workerCode)
    }

    spinner.succeed("Worker code generated successfully")

    for (const routerPath of routerPaths) {
      const router = appRouter._metadata?.subRouters[routerPath]
      const routerName = path.basename(routerPath, ".ts").replace("-router", "")

      // Get router config and name
      const routerConfig = appRouter._metadata?.subRouters[routerPath] || {}
      const workerName = /* routerConfig.name ||  */ routerName

      // deployment
      spinner.start(`🔧 Deploying ${chalk.cyan(workerName)} router`)
      try {
        const output = await execCommand(
          `wrangler deploy dist/${workerName}.ts --name ${workerName} --compatibility-date 2024-12-20 --minify`
        )

        const metrics = parseCloudflareOutput(output)
        spinner.succeed(`Deployed ${workerName} router successfully`)

        console.log(chalk.dim("  Size:"), chalk.cyan(metrics.size))
        console.log(chalk.dim("  Gzip size:"), chalk.cyan(metrics.gzipSize))
        console.log(chalk.dim("  Startup time:"), chalk.cyan(metrics.startupTime))
        console.log(chalk.dim("  Base URL:"), chalk.cyan.underline(metrics.url))

        const procedures = router._metadata?.procedures || {}
        if (Object.keys(procedures).length === 0) {
          console.log(chalk.dim("    No endpoints found"))
        } else {
          Object.entries(procedures).forEach(([procedureName, { type }]) => {
            // @ts-ignore
            const method = type === "get" ? "GET" : type === "post" ? "POST" : "WS"
            console.log(chalk.dim("    •"), chalk.yellow(`[${method}]`.padEnd(6)), `api/${routerName}/${procedureName}`)
          })
        }
        console.log() // Add spacing between workers
      } catch (err) {
        spinner.fail(`Failed to deploy ${workerName}`)
        throw err
      }
    }

    console.log(
      boxen(chalk.green("JStack deployed successfully! 🎉"), {
        padding: 1,
        margin: 1,
        borderStyle: "round",
      })
    )
  } catch (error) {
    spinner.fail("Deployment failed")
    console.error(err("Deployment error:"), error)
    process.exit(1)
  }
}

program
  .command("env:sync")
  .description("Sync all environment variables from .env to workers")
  .action(async () => {
    const spinner = ora()
    const projectDir = process.cwd()

    console.log(
      boxen(chalk.bold.blue("Environment Sync"), {
        padding: 1,
        margin: 1,
        borderStyle: "round",
      })
    )

    spinner.start("Loading router configuration")
    const { appRouter } = await buildAppRouter(projectDir)
    spinner.succeed("Router configuration loaded")

    const registeredPaths: string[] = appRouter._metadata.registeredPaths ?? []

    try {
      spinner.start("Reading .env file")
      let envFile: dotenv.DotenvParseOutput
      try {
        const envContent = await fs.readFile(".env", "utf-8")
        envFile = dotenv.parse(envContent)
        spinner.succeed(`Found ${chalk.cyan(Object.keys(envFile).length)} environment variables`)
      } catch (err) {
        if ((err as any).code === "ENOENT") {
          spinner.fail(".env file not found")
          console.log(warn("Please create a .env file in the project root with your environment variables."))
          process.exit(1)
        }
        throw err
      }

      const routerPaths = registeredPaths.filter((path) => path !== "")
      if (routerPaths.length === 0) {
        console.log(warn("No routers found to sync environment variables"))
        return
      }

      console.log(info("\nSyncing environment variables to workers:"))
      for (const routerPath of routerPaths) {
        const routerName = path.basename(routerPath, ".ts").replace("-router", "")

        const routerConfig = appRouter._metadata.subRouters[routerPath].config || {}
        const workerName = routerConfig.name || routerName

        console.log(chalk.dim("\n─────────────────────────────"))
        console.log(chalk.bold(`🔧 Processing ${chalk.cyan(routerName)}-router`))

        const tempJsonPath = `dist/${routerName}-secrets.json`

        const envJson = Object.entries(envFile).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = String(value)
          return acc
        }, {})

        await fs.writeFile(tempJsonPath, JSON.stringify(envJson, null, 2))

        spinner.start(`Publishing environment variables to ${routerName}`)
        try {
          execSync(`wrangler secret bulk ${tempJsonPath} --name ${workerName}`, {
            stdio: "inherit",
          })
          await fs.unlink(tempJsonPath)
          spinner.succeed(`Environment variables published to ${routerName}`)
        } catch (err) {
          spinner.fail(`Failed to publish env vars to ${routerName}`)
          throw err
        }
      }

      console.log(
        boxen(success("\nEnvironment variables synced successfully! 🎉"), {
          padding: 1,
          margin: 1,
          borderStyle: "round",
        })
      )
    } catch (error) {
      spinner.fail("Environment sync failed")
      console.error(err("Sync error:"), error)
      process.exit(1)
    }
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  console.log(
    boxen(chalk.bold.blue("JStack CLI"), {
      padding: 1,
      margin: 1,
      borderStyle: "round",
    })
  )
  program.outputHelp()
}

const handleShutdown = async () => {
  console.log("\n") // Add newline after ^C

  try {
    // Clean up dist directory
    await fs.rm("dist", { recursive: true, force: true })
    console.log(chalk.yellow("Deployment cancelled..."))
  } catch (error) {
    console.error(chalk.red("Error during cleanup:"), error)
  }

  process.exit(0)
}

// Register shutdown handlers
process.on("SIGINT", handleShutdown) // Ctrl+C
process.on("SIGTERM", handleShutdown) // Kill signal
