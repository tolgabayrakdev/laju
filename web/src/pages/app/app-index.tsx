import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

export default function AppIndex() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)

  const { mutate: logout, isPending } = useMutation({
    mutationFn: () => api.post('/api/auth/logout', {}),
    onSuccess: () => {
      clearUser()
      navigate('/sign-in', { replace: true })
    },
  })

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Çıkış yapılıyor…</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
        <ModeToggle />
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Hoş geldin, {user?.name}</h1>
        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
      </div>
      <Button variant="outline" size="sm" disabled={isPending} onClick={() => logout()}>
        Çıkış yap
      </Button>
    </div>
  )
}
