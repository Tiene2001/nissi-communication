import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => api.get('/api/admin/services').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/api/admin/services', data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useUpdateService(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.patch(`/api/admin/services/${id}`, data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/services/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}
