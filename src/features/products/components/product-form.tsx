"use client"

import { useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, HelpCircle } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip"
import { useCreateProduct } from "@/src/features/products/hooks/useCreateProduct"
import { useImageUpload } from "@/src/features/products/hooks/useUploadImage"
import { cn } from "@/src/lib/utils"
import Image from "next/image"
import { UploadDropzone } from "@/src/lib/uploadthings"
import { Combobox } from "@/src/components/ui/combo-with-create"
import { useCategories } from "../hooks/useCategories"

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  price: z.string().min(0, "Price must be a positive number"),
  stock: z.string().min(0, "Stock must be a non-negative integer"),
  images: z
    .array(
      z.object({
        imageId: z.string(),
        imageUrl: z.string().url(),
      })
    )
    .max(4, "Maximum 4 images allowed per variant"),
})

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  shortDescription: z
    .string()
    .max(200, "Short description must be 200 characters or less")
    .optional(),
  fullDescription: z.string().min(1, "Full description is required"),
  category: z.object({
    id: z.string().min(1, "Category ID is required"),
    name: z.string().min(1, "Category name is required"),
  }),
  subcategory: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
  }),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
})

type ProductFormData = z.infer<typeof productSchema>

export function CreateProductForm() {
  const { mutate: createProduct, isPending } = useCreateProduct()
  const { categories, isCategoryLoading, isError } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { uploadImage, isUploading } = useImageUpload()
  const [activeVariant, setActiveVariant] = useState(0)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      fullDescription: "",
      category: { id: "", name: "" },
      subcategory: { id: "", name: "" },
      variants: [{ name: "", price: "0", stock: "0", images: [] }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  })

  const onSubmit = (data: ProductFormData) => {
    console.log(data)
    createProduct(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-5xl mx-auto p-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} id="name" />}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Controller
              name="shortDescription"
              control={control}
              render={({ field }) => (
                <Textarea {...field} id="shortDescription" />
              )}
            />
            {errors.shortDescription && (
              <p className="text-sm text-red-500">
                {errors.shortDescription.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Description</Label>
            <Controller
              name="fullDescription"
              control={control}
              render={({ field }) => (
                <Textarea {...field} id="fullDescription" />
              )}
            />
            {errors.fullDescription && (
              <p className="text-sm text-red-500">
                {errors.fullDescription.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Variants</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={() =>
                    append({ name: "", price: "0", stock: "0", images: [] })
                  }
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add a new product variant with unique attributes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {fields.map((field, index) => (
                <Button
                  key={field.id}
                  type="button"
                  variant={activeVariant === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveVariant(index)}
                >
                  Variant {index + 1}
                </Button>
              ))}
            </div>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  "space-y-4 p-4 border rounded-lg",
                  activeVariant !== index && "hidden"
                )}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-lg">Variant {index + 1}</h4>
                  {fields.length > 1 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove this variant</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`variants.${index}.name`}>Name</Label>
                    <Controller
                      name={`variants.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <Input {...field} id={`variants.${index}.name`} />
                      )}
                    />
                    {errors.variants?.[index]?.name && (
                      <p className="text-sm text-red-500">
                        {errors.variants[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`variants.${index}.price`}>Price</Label>
                    <Controller
                      name={`variants.${index}.price`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          id={`variants.${index}.price`}
                        />
                      )}
                    />
                    {errors.variants?.[index]?.price && (
                      <p className="text-sm text-red-500">
                        {errors.variants[index]?.price?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`variants.${index}.stock`}>Stock</Label>
                    <Controller
                      name={`variants.${index}.stock`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          id={`variants.${index}.stock`}
                        />
                      )}
                    />
                    {errors.variants?.[index]?.stock && (
                      <p className="text-sm text-red-500">
                        {errors.variants[index]?.stock?.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name={`variants.${index}.images`}
                      control={control}
                      render={({ field }) => (
                        <>
                          {field.value.map((image, imageIndex) => (
                            <div
                              key={image.imageId}
                              className="relative aspect-square"
                            >
                              <Image
                                fill
                                src={image.imageUrl}
                                alt={`Variant ${index + 1} image ${
                                  imageIndex + 1
                                }`}
                                className="object-cover rounded-lg w-full h-full"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  const newImages = [...field.value]
                                  newImages.splice(imageIndex, 1)
                                  field.onChange(newImages)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {field.value.length < 4 && (
                            <div
                              className={cn(
                                "relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors",
                                "flex items-center justify-center",
                                isUploading && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    const result = await uploadImage(file)
                                    field.onChange([...field.value, result])
                                  }
                                }}
                                disabled={isUploading}
                              />
                              <Plus className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </>
                      )}
                    />
                  </div>
                  {errors.variants?.[index]?.images && (
                    <p className="text-sm text-red-500">
                      {errors.variants[index]?.images?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              {isCategoryLoading ? (
                <div className="h-10 w-full bg-gray-300 rounded animate-pulse " />
              ) : (
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      mode="single" //single or multiple
                      options={
                        categories?.map((category) => {
                          return { name: category.name, id: category.id }
                        }) ?? []
                      }
                      placeholder="Select option..."
                      selected={field.value} // string or array
                      onChange={(value) => {
                        console.log(value)
                        const cate = categories?.filter(
                          (c) => c.id === value.id
                        )
                        console.log(cate)
                        field.onChange(cate?.[0])
                        console.log(field.value)
                        setSelectedCategory(value.id)
                      }}
                      onCreate={(value) => {
                        console.log(value)
                      }}
                    />
                  )}
                />
              )}
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>
            {selectedCategory && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory (optional)</Label>
                <Controller
                  name="subcategory"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      mode="single"
                      options={
                        categories
                          ?.find((category) => category.id === selectedCategory)
                          ?.subcategories?.map((subcategory) => ({
                            name: subcategory.name,
                            id: subcategory.id,
                          })) ?? []
                      }
                      placeholder="Select subcategory..."
                      selected={field.value ? field.value : null}
                      onChange={(value) => {
                        const selectedSubcategory = categories
                          ?.find((cat) => cat.id === selectedCategory)
                          ?.subcategories?.find(
                            (subcat) => subcat.id === value.id
                          )
                        field.onChange(
                          selectedSubcategory || { id: "", name: "" }
                        )
                      }}
                      onCreate={(newSubcategory) => {
                        // Handle creation of a new subcategory
                        console.log("Created new subcategory:", newSubcategory)
                      }}
                    />
                  )}
                />
                {errors.subcategory && (
                  <p className="text-sm text-red-500">
                    {errors.subcategory.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save your progress without publishing</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Product"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Publish your product and make it live</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </form>
  )
}
