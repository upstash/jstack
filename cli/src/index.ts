// #!/usr/bin/env node

import fs from "fs-extra"
import path from "path"

import { runCli } from "./cli/index.js"
import { scaffoldProject } from "./helpers/scaffold-project.js"
import { buildInstallerMap } from "./installers/index.js"
import { logger } from "./utils/logger.js"
import { installDependencies } from "./helpers/install-deps.js"

const main = async () => {
  const results = await runCli()

  if (!results) {
    return
  }

  const { projectName, orm, dialect, provider } = results

  const installers = buildInstallerMap(orm, provider)

  const projectDir = await scaffoldProject({
    orm,
    dialect,
    databaseProvider: provider ?? "neon",
    installers,
    projectName,
  })

  const pkgJson = fs.readJSONSync(path.join(projectDir, "package.json"))
  pkgJson.name = projectName

  fs.writeJSONSync(path.join(projectDir, "package.json"), pkgJson, {
    spaces: 2,
  })

  if (!results.noInstall) {
    await installDependencies({ projectDir })
  }

  // Run git init in the projectDir
  execSync("git init", { cwd: projectDir })

  process.exit(0)
}

main().catch((err) => {
  logger.error("Aborting installation...")
  if (err instanceof Error) {
    logger.error(err)
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:"
    )
    console.log(err)
  }
  process.exit(1)
})
