import DashboardPage from "@/src/components/dashboard-page"
import React from "react"
import EmptyProductsState from "./empty-products-state"
import { client } from "@/src/lib/client"
import { currentUser } from "@/src/features/auth/lib/auth"
import { Button, buttonVariants } from "@/src/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/src/utils"

const ProductsPage = async () => {
  const res = await client.hono.products.getAllProducts.$get()
  const products = await res.json()
  return (
    <DashboardPage
      title="Products"
      cta={
        <Link
          href={"/dashboard/products/create"}
          className={cn(buttonVariants(), "flex items-center justify-center font-bold")}
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Product
        </Link>
      }
    >
      {/* <EmptyProductsState products={products} /> */}
    </DashboardPage>
  )
}

export default ProductsPage
