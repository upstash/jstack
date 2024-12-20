import { db } from "@/src/db"
import { router } from "../__internals/router"
import { publicProcedure } from "../procedures"

export const productsRouter = router({
  getAllProducts: publicProcedure.query(async ({ c, ctx }) => {
    const products = await db.product.findMany()
    // console.log(products)
    return c.json({ products})
  }),
  getAllCategoriesAndSubCategories: publicProcedure.query(async ({c}) => {
    const categories = await db.category.findMany({
        select: {
            id: true,
            subcategories: true,
            name: true
        }
    })

    return c.json({ success: true, categories}, 200)
  })
})
