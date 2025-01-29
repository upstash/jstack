import fs from "fs-extra"
import path from "path"

import { PKG_ROOT } from "@/constants.js"
import { addPackageDependency } from "@/utils/add-package-dep.js"
import { logger } from "@/utils/logger.js"
import { Installer } from "./index.js"

export const postgresInstaller: Installer = ({ projectDir }) => {
  const extrasDir = path.join(PKG_ROOT, "template/extras")
  logger.info("Installing Postgres...")

  addPackageDependency({
    projectDir,
    dependencies: ["postgres"],
    devDependencies: false,
  })

  const configFile = path.join(extrasDir, `config/drizzle-config-postgres.ts`)
  const configDest = path.join(projectDir, "drizzle.config.ts")

  const schemaSrc = path.join(extrasDir, "src/server/db/schema", `with-postgres.ts`)
  const schemaDest = path.join(projectDir, "src/server/db/schema.ts")

  const jstackSrc = path.join(extrasDir, "src/server/jstack", `drizzle-with-postgres.ts`)
  const jstackDest = path.join(projectDir, "src/server/jstack.ts")

  fs.ensureDirSync(path.dirname(configDest))
  fs.ensureDirSync(path.dirname(schemaDest))
  fs.ensureDirSync(path.dirname(jstackDest))

  fs.copySync(configFile, configDest)
  fs.copySync(schemaSrc, schemaDest)
  fs.copySync(jstackSrc, jstackDest)
}
