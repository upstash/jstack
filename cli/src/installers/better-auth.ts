import fs from "fs-extra"
import path from "path"
import { type Installer } from "@/installers/index.js"
import { PKG_ROOT } from "@/constants.js"
import { addPackageDependency } from "@/utils/add-package-dep.js"


export const betterAuthInstaller: Installer = ({ projectDir, databaseProvider }) => {
  addPackageDependency({
    projectDir,
    dependencies: ["better-auth"],
    devDependencies: false,
  })

  const extrasDir = path.join(PKG_ROOT, "template/extras")

  // auth routes
  const routerSrc = path.join(extrasDir, `src/app/api/auth/[...all]/route.ts`)
  const routerDest = path.join(projectDir, `src/app/api/auth/[...all]/route.ts`)

  // auth client
  const clientSrc = path.join(extrasDir, `src/lib/auth-client.ts`)
  const clientDest = path.join(projectDir, `src/lib/auth-client.ts`)

  // auth lib
  const libSrc = path.join(extrasDir, `src/lib/auth.ts`)
  const libDest = path.join(projectDir, `src/lib/auth.ts`)

  // auth schema
  const schemaSrc = path.join(extrasDir, `src/server/db/schema/with-postgres-auth.ts`)
  const schemaDest = path.join(projectDir, `src/server/db/schema.ts`)

  const envSrc = path.join(extrasDir, `config/_env-drizzle-better-auth`)
  const envDest = path.join(projectDir, ".env")

  fs.copySync(routerSrc, routerDest)
  fs.copySync(clientSrc, clientDest)
  fs.copySync(libSrc, libDest)
  fs.copySync(envSrc, envDest)
  fs.copySync(schemaSrc, schemaDest)
}