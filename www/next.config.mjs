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
        destination: "/docs/getting-started/first-steps",
        permanent: true,
      },
    ]
  },
}

export default withContentCollections(nextConfig)
