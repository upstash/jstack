import { withContentCollections } from "@content-collections/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    inlineCss: true,
  },
  redirects: async () => {
    return [
      {
        source: "/docs",
        destination: "/docs/introduction/jstack",
        permanent: true,
      },
    ]
  },
}

export default withContentCollections(nextConfig)
