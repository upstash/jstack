import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import rehypePrettyCode from "rehype-pretty-code"
import { Icons } from "../icons"
import { CopyButton } from "../copy-button"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { cn } from "@/lib/utils"

/**
 * Server Component example
 */

export async function Code({
  title,
  language,
  code,
}: {
  title?: string
  language: string
  code: string
}) {
  const highlightedCode = await highlightCode(code)

  const Icon =
    language === "bash"
      ? Icons.terminal
      : language === "ts" || language === "tsx"
        ? Icons.typescript
        : () => null

  return (
    <div className="border border-dark-gray rounded-md">
      {title ? (
        <div className="rounded-t-md flex items-center justify-between py-3 px-4 bg-zinc-950/25 border-b border-dark-gray">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="grayscale size-4" />}
            <p className="text-sm font-medium text-gray-300">{title}</p>
          </div>
          <CopyButton code={code} />
        </div>
      ) : null}
      <ScrollArea className="">
        <div
          className={cn(
            "relative py-[14px] w-full bg-[#22272e] rounded-md antialiased",
            {
              "rounded-t-none": Boolean(title),
            }
          )}
        >
          {!title && (
            <div className="absolute right-2 top-2">
              <CopyButton code={code} />
            </div>
          )}
          <section
            dangerouslySetInnerHTML={{
              __html: highlightedCode,
            }}
          />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

async function highlightCode(code: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrettyCode)
    .use(rehypeStringify)
    .process(code)

  return String(file)
}

// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
// import { cn } from "@/lib/utils"
// import {
//   transformerMetaHighlight
// } from "@shikijs/transformers"
// import { DetailedHTMLProps, HTMLAttributes } from "react"
// import {
//   BundledLanguage,
//   LanguageInput,
//   SpecialLanguage,
//   codeToHtml,
// } from "shiki"
// import { CopyButton } from "../copy-button"
// import { Icons } from "../icons"

// export async function Code(
//   props: DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>
// ) {
//   const { code, language, title } = props as {
//     code: string
//     language: BundledLanguage | LanguageInput | SpecialLanguage
//     title?: string
//   }

//   console.log("props", props)

//   const html = await codeToHtml(code, {
//     lang: (language as BundledLanguage) || "tsx",
//     theme: "github-dark",
//     transformers: [transformerMetaHighlight()],
//   })

//   const Icon =
//     language === "bash"
//       ? Icons.terminal
//       : language === "ts" || language === "tsx"
//         ? Icons.typescript
//         : () => null

//   return (
//     <div className="">
//       {title ? (
//         <div className="rounded-t-md flex items-center justify-between py-3 px-5 bg-[#262a30]/50 border-b border-dark-gray">
//           <div className="flex items-center gap-3">
//             {Icon && <Icon className="size-4" />}
//             <p className="font-mono text-sm tracking-tight text-brand-300">
//               {title}
//             </p>
//           </div>
//           <CopyButton code={code} />
//         </div>
//       ) : null}
//       <ScrollArea className="">
//         <div
//           className={cn(
//             "relative px-6 py-5 w-full bg-[#262a30] rounded-md antialiased",
//             {
//               "rounded-t-none": Boolean(title),
//             }
//           )}
//         >
//           {!title && (
//             <div className="absolute right-2 top-2">
//               <CopyButton code={code} />
//             </div>
//           )}
//           <pre dangerouslySetInnerHTML={{ __html: html }}></pre>
//         </div>
//         <ScrollBar orientation="horizontal" />
//       </ScrollArea>
//     </div>
//   )
// }
