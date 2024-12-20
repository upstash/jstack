'use client'

import { useCallback, useState } from "react"
import { ImagePlus, X } from 'lucide-react'
import Image from "next/image"
import { cn } from "@/src/lib/utils"

interface ImageUploadProps {
  onChange: (images: { imageId: string; imageUrl: string }[]) => void
  value?: { imageId: string; imageUrl: string }[]
  maxImages?: number
}

export function ImageUpload({ onChange, value = [], maxImages = 4 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true)
    //   const result = await uploadImage(file)
    //   onChange([...value, result])
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }, [value])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleRemove = useCallback((imageId: string) => {
    onChange(value.filter(img => img.imageId !== imageId))
  }, [onChange, value])

  return (
    <div className="grid grid-cols-2 gap-4">
      {value.map((image) => (
        <div key={image.imageId} className="relative aspect-square">
          <Image
            src={image.imageUrl}
            alt="Product image"
            className="object-cover rounded-lg"
            fill
          />
          <button
            type="button"
            onClick={() => handleRemove(image.imageId)}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      {value.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "relative aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors",
            "flex items-center justify-center",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
            disabled={isUploading}
          />
          <ImagePlus className="h-6 w-6 text-gray-400" />
        </div>
      )}
    </div>
  )
}
