import { visit } from "unist-util-visit"

export function rehypeParseCodeBlocks() {
  return (tree) => {
    visit(tree, "element", (node, _nodeIndex, parentNode) => {
      if (node.tagName === "code" && node.properties?.className) {
        const language =
          node.properties.className[0]?.replace(/^language-/, "") || "text"
        const metastring = node.data?.meta || ""

        let title = null
        if (metastring) {
          const excludeMatch = metastring.match(/\s+\/([^/]+)\//)

          if (excludeMatch) {
            const cleanMetastring = metastring.replace(excludeMatch[0], "")
            const titleMatch = cleanMetastring.match(/^([^{]+)/)
            if (titleMatch) {
              title = titleMatch[1].trim()
            }
          } else {
            const titleMatch = metastring.match(/^([^{]+)/)
            if (titleMatch) {
              title = titleMatch[1].trim()
            }
          }
        }

        parentNode.properties = parentNode.properties || {}

        parentNode.properties.language = language
        parentNode.properties.title = title
        parentNode.properties.meta = metastring

        const codeContent = node.children[0]?.value || ""

        parentNode.properties.code = [
          "```" + language + (metastring ? " " + metastring : ""),
          codeContent.trimEnd(),
          "```",
        ].join("\n")
      }
    })
  }
}
