"use client"
import DashboardPage from "@/src/components/dashboard-page"
import { CreateProductForm } from "@/src/features/products/components/product-form"
import { UploadDropzone } from "@/src/lib/uploadthings"

const page = () => {
  return (
    <DashboardPage title="Create Product">
      <CreateProductForm />
    </DashboardPage>
  )
}

export default page
