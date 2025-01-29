import fs from "fs-extra"
import path from "node:path"

const filesToIgnore = [
  "src/server/jstack.ts",
  "src/server/routers/post-router.ts", 
  "drizzle.config.ts",
  "node_modules",
  ".git",
  ".vscode",
  ".wrangler",
  ".dev.vars",
  ".next", 
  ".turbo",
  "dist",
  "eslintrc.json",
  ".DS_Store",
  "bun.lockb",
  ".env",
  ".prettierrc"
]

async function main() {
  const sourceDir = path.join(process.cwd(), "..", "app")
  const targetDir = path.join(process.cwd(), "template", "base")

  try {
    // Ensure source directory exists
    if (!(await fs.pathExists(sourceDir))) {
      throw new Error(`Source directory not found at: ${sourceDir}`)
    }

    // Remove target directory if it exists
    await fs.remove(targetDir)

    // Copy app directory to template/base, excluding ignored paths
    await fs.copy(sourceDir, targetDir, {
      filter: (src) => {
        const relativePath = path.relative(sourceDir, src)
        return !filesToIgnore.some((path) => 
          // Check if the path contains the ignored file/folder
          relativePath.includes(path) ||
          // Check if any parent directory matches exactly
          relativePath.split("/").some(part => path === part)
        )
      },
    })

    // Replace package.json with base template version
    const basePackageJson = path.join(process.cwd(), "template/base-assets/base-package.json")
    const targetPackageJson = path.join(targetDir, "package.json")
    await fs.copy(basePackageJson, targetPackageJson)
    console.log("Replaced package.json with base template version")

    console.log("Successfully copied base template!")
  } catch (error) {
    console.error("Error copying base template:", error)
    process.exit(1)
  }
}

main()
