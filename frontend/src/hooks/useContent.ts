import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export function useContent() {
  return useQuery({
    queryKey: ['content'],
    queryFn: () => api.get('/api/admin/content').then(r => r.data),
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateContent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.patch(`/api/admin/content/${id}`, { data }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content'] }),
  })
}
