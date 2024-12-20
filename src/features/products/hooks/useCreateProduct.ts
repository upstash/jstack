import { useMutation, useQueryClient } from '@tanstack/react-query'

// This is a placeholder for the actual API call
const createProductAPI = async (data: any) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(data)
  return { id: 'new-product-id' }
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProductAPI,
    onSuccess: (data) => {

      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
