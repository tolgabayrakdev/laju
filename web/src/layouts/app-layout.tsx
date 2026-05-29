import { Outlet, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

export default function AppLayout() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<{ user: { id: number; name: string; email: string; created_at: string } }>('/api/auth/me'),
    retry: false,
  })

  useEffect(() => {
    if (isError) navigate('/sign-in', { replace: true })
  }, [isError, navigate])

  useEffect(() => {
    if (data) setUser(data.user)
  }, [data, setUser])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Yükleniyor…</p>
      </div>
    )
  }

  if (isError) return null

  return (
    <section>
      <Outlet />
    </section>
  )
}
