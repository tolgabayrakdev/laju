import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { isLoading, isError } = useQuery({
    queryKey: ['verify-reset-token', token],
    queryFn: () => api.get(`/api/auth/verify-reset-token?token=${token}`),
    enabled: !!token,
    retry: false,
  })

  const { mutate, isPending, error: mutationError, isSuccess } = useMutation({
    mutationFn: (password: string) => api.post('/api/auth/reset-password', { token, password }),
  })

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    mutate(password)
  }

  if (!token || isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
            <h1 className="text-xl font-semibold tracking-tight">Geçersiz bağlantı</h1>
            <p className="text-xs text-muted-foreground">
              Bu sıfırlama bağlantısı geçersiz veya süresi dolmuş.
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            <Link to="/forgot-password" className="text-foreground hover:underline underline-offset-4 transition-colors">
              Yeni bağlantı iste
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
            <h1 className="text-xl font-semibold tracking-tight">Şifren güncellendi</h1>
            <p className="text-xs text-muted-foreground">
              Yeni şifrenle giriş yapabilirsin.
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            <Link to="/sign-in" className="text-foreground hover:underline underline-offset-4 transition-colors">
              Giriş yap →
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Doğrulanıyor…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
          <h1 className="text-xl font-semibold tracking-tight">Yeni şifre belirle</h1>
          <p className="text-xs text-muted-foreground">
            Hesabın için yeni bir şifre gir.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="password">Yeni şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pr-8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          {mutationError && <p className="text-xs text-destructive">{mutationError.message}</p>}

          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending ? 'Kaydediliyor…' : 'Şifremi güncelle'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          <Link to="/sign-in" className="text-foreground hover:underline underline-offset-4 transition-colors">
            ← Girişe dön
          </Link>
        </p>
      </div>
    </div>
  )
}
