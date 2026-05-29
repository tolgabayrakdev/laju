import { Outlet, Navigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function GuestLayout() {
  const { isLoading, isSuccess } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/api/auth/me'),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Yükleniyor…</p>
      </div>
    )
  }

  if (isSuccess) return <Navigate to="/" replace />

  return <Outlet />
}
