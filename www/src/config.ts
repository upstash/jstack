export const DOCS_CONFIG = {
  categories: {
    introduction: {
      title: "Introduction",
      emoji: "🐥",
      order: 1,
      items: ["why-jstack", "key-features"],
    },
    "getting-started": {
      title: "Getting Started", 
      emoji: "👷‍♂️",
      order: 2,
      items: ["first-steps", "local-development", "environment-variables"],
    },
    backend: {
      title: "Backend",
      emoji: "⚙️",
      order: 3,
      items: [
        "app-router",
        "routers", 
        "procedures",
        "api-client",
        "middleware",
        "websockets",
      ],
    },
    deploy: {
      title: "Deploy",
      emoji: "💻",
      order: 4,
      items: ["vercel, cloudflare"],
    },
  },
}
