import { client } from "@/src/lib/client"
import { useQuery } from "@tanstack/react-query"

export const useCategories = () => {
    const {data, isPending, isError, } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await client.hono.products.getAllCategoriesAndSubCategories.$get()
            const data = await res.json()

            return data
        }
    })

    return { categories: data?.categories, isCategoryLoading: isPending, isError}
}
