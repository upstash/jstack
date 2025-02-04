import { slugify } from "@/lib/utils"
import { SearchMetadata } from "@/types"
import { Index } from "@upstash/vector"
import { allDocs } from "content-collections"
import "dotenv/config"

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

function splitMdxByHeadings(mdx: string) {
  const sections = mdx.split(/(?=^#{1,6}\s)/m)

  return sections
    .map((section) => {
      const lines = section.trim().split("\n")
      const headingMatch = lines[0]?.match(/^(#{1,6})\s+(.+)$/)

      if (!headingMatch) return null

      const [, hashes, title] = headingMatch
      const content = lines.slice(1).join("\n").trim()

      return {
        level: hashes?.length,
        title,
        content,
      }
    })
    .filter(Boolean)
}

async function indexDocs() {
  await index.reset()

  for (const doc of allDocs) {
    try {
      const sections = splitMdxByHeadings(doc.content)

      for (const section of sections) {
        if (!section || !section.content) continue

        const headingId = `${doc._meta.path}#${slugify(section.title!)}`

        const metadata = {
          title: section.title ?? "<Error displaying title>",
          path: doc._meta.path,
          level: section.level ?? 2,
          type: "section",
          content: section.content,
          documentTitle: doc.title,
        } satisfies SearchMetadata

        await index.upsert({
          id: headingId,
          data: `${section.title}\n\n${section.content}`,
          metadata,
        })
      }

      console.log(`✅ Indexed document sections: ${doc.title}`)
    } catch (error) {
      console.error(`❌ Failed to index ${doc.title}:`, error)
    }
  }

  console.log("✅ Finished indexing docs")
}

indexDocs().catch(console.error)
