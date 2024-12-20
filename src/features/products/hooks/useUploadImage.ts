import { useState } from "react"

export const useImageUpload = () => {
    const [isUploading, setIsUploading] = useState(false)

    const uploadImage = async (file: File) => {
      setIsUploading(true)
      try {
        // Simulate image upload
        await new Promise(resolve => setTimeout(resolve, 1000))
        const imageUrl = URL.createObjectURL(file)
        return { imageId: Math.random().toString(36).substr(2, 9), imageUrl }
      } finally {
        setIsUploading(false)
      }
    }

    return { uploadImage, isUploading }
  }
