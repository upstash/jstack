import boxen from "boxen"
import chalk from "chalk"

export const deploy = async () => {
  console.log(
    boxen(chalk.green("⚠️ This command will eventually support multi-worker deployment"), {
      padding: 1,
      margin: 1,
      borderStyle: "round",
    })
  )

  console.log(chalk.dim("\nTo deploy your backend:"))
  console.log(chalk.cyan("  $ wrangler deploy\n"))

  console.log(chalk.dim("For more information, see:"))
  console.log(chalk.blue.underline("  https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler"))
  console.log(chalk.blue.underline("  https://developers.cloudflare.com/workers/wrangler/commands/#deploy\n"))
}
