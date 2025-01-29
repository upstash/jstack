import fs from "fs-extra"
import path from "path"

import { Installer } from "./index.js"
import { PKG_ROOT } from "@/constants.js"

export const noOrmInstaller: Installer = ({ projectDir }) => {
  const extrasDir = path.join(PKG_ROOT, "template/extras")

  const routerSrc = path.join(extrasDir, `src/server/routers/post/base.ts`)
  const routerDest = path.join(projectDir, `src/server/routers/post-router.ts`)

  const jstackSrc = path.join(extrasDir, "src/server/jstack", `base.ts`)
  const jstackDest = path.join(projectDir, "src/server/jstack.ts")

  fs.ensureDirSync(path.dirname(routerDest))
  fs.ensureDirSync(path.dirname(jstackDest))

  fs.copySync(routerSrc, routerDest)
  fs.copySync(jstackSrc, jstackDest)
}
