"use server"

interface Stargazer {
  id: number
  login: string
  avatar_url: string
}

type GithubResponse = {
  stargazers: Stargazer[]
  stargazerCount: number
}

export const fetchStargazers = async ({ GITHUB_TOKEN }: { GITHUB_TOKEN: string }): Promise<GithubResponse> => {
  if(!GITHUB_TOKEN) {
    throw new Error("GitHub token is required but was not provided. Set the GITHUB_TOKEN environment variable.")
  }

  try {
    // Fetch repository details
    const repoRes = await fetch("https://api.github.com/repos/upstash/jstack", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Cloudflare Workers",
      },
    })

    if (!repoRes.ok) {
      const errorText = await repoRes.text()
      const error = new Error(`GitHub API failed: ${repoRes.status} ${repoRes.statusText}`)

      console.error("[GitHub API Error] Failed to fetch repository details:", {
        status: repoRes.status,
        statusText: repoRes.statusText,
        error: errorText,
        timestamp: new Date().toISOString(),
      })

      throw error
    }

    const { stargazers_count } = (await repoRes.json()) as { stargazers_count: number }

    const lastPage = Math.ceil(stargazers_count / 20)
    const remainingItems = stargazers_count % 20
    const needExtraItems = remainingItems > 0 && remainingItems < 20

    let stargazers: Stargazer[] = []

    if (needExtraItems) {
      try {
        const previousPageRes = await fetch(
          `https://api.github.com/repos/upstash/jstack/stargazers?per_page=20&page=${lastPage - 1}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              "X-GitHub-Api-Version": "2022-11-28",
              "User-Agent": "Cloudflare Workers",
            },
          }
        )

        if (!previousPageRes.ok) {
          throw new Error(`Failed to fetch previous page: ${previousPageRes.status} ${previousPageRes.statusText}`)
        }

        const previousPageStargazers = (await previousPageRes.json()) as Stargazer[]
        stargazers = previousPageStargazers.slice(-(20 - remainingItems))
      } catch (error) {
        console.error("[GitHub API Error] Failed to fetch previous page:", {
          page: lastPage - 1,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        })
      }
    }

    try {
      const lastPageRes = await fetch(
        `https://api.github.com/repos/upstash/jstack/stargazers?per_page=20&page=${lastPage}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "Cloudflare Workers",
          },
        }
      )

      if (!lastPageRes.ok) {
        throw new Error(`Failed to fetch last page: ${lastPageRes.status} ${lastPageRes.statusText}`)
      }

      const lastPageStargazers = (await lastPageRes.json()) as Stargazer[]
      stargazers = [...stargazers, ...lastPageStargazers].reverse()

      return { stargazers, stargazerCount: stargazers_count }
    } catch (error) {
      console.error("[GitHub API Error] Failed to fetch last page:", {
        page: lastPage,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  } catch (error) {
    console.error("[GitHub API Error] Unhandled error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })

    return { stargazers: [], stargazerCount: 0 }
  }
}
