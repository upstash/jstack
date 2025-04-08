import fs from "fs-extra"
import path from "path"

import { PKG_ROOT } from "@/constants.js"
import { addPackageDependency } from "@/utils/add-package-dep.js"
import { Installer } from "./index.js"

export const neonInstaller: Installer = ({ projectDir }) => {
  const extrasDir = path.join(PKG_ROOT, "template/extras")

  addPackageDependency({
    projectDir,
    dependencies: ["@neondatabase/serverless"],
    devDependencies: false,
  })

  const configFile = path.join(extrasDir, `config/drizzle-config-neon.ts`)
  const configDest = path.join(projectDir, "drizzle.config.ts")

  const schemaSrc = path.join(extrasDir, "src/server/db/schema", `with-postgres.ts`)
  const schemaDest = path.join(projectDir, "src/server/db/schema.ts")

  // neon db instance
  const dbSrc = path.join(extrasDir, `src/server/db/index-neon.ts`)
  const dbDest = path.join(projectDir, `src/server/db/index.ts`)

  const jstackSrc = path.join(extrasDir, "src/server/jstack", `drizzle-with-neon.ts`)
  const jstackDest = path.join(projectDir, "src/server/jstack.ts")

  fs.ensureDirSync(path.dirname(configDest))
  fs.ensureDirSync(path.dirname(schemaDest))
  fs.ensureDirSync(path.dirname(jstackDest))

  fs.copySync(dbSrc, dbDest)
  fs.copySync(configFile, configDest)
  fs.copySync(schemaSrc, schemaDest)
  fs.copySync(jstackSrc, jstackDest)
}
