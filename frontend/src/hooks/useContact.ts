import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useContactMessages() {
  return useQuery({
    queryKey: ['contact'],
    queryFn: () => api.get('/api/admin/contact').then(r => r.data),
    staleTime: 0, // Toujours frais
  })
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/admin/contact/${id}/read`, {}).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact'] }),
  })
}
