import { HeartIcon } from "lucide-react"

export const Footer = () => {
  return (
    <footer className="flex text-center justify-center items-center px-4 py-12 text-muted-dark text-sm">
      <p>
        JStack, a full-stack Next.js & TypeScript community project{" "}
        <HeartIcon className="inline w-4 h-4 text-red-500 fill-red-500 mx-1" />
      </p>
    </footer>
  )
}
