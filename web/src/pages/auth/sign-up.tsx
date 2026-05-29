import { useState } from 'react'
import { Link } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [matchError, setMatchError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: (payload: typeof form) => api.post('/api/auth/register', payload),
  })

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setMatchError(null)
    if (form.password !== form.confirmPassword) {
      setMatchError('Şifreler eşleşmiyor')
      return
    }
    mutate(form)
  }

  const errorMessage = matchError ?? (error as Error | null)?.message

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
            <CheckCircle className="size-8 text-green-500 mt-2" />
            <h1 className="text-xl font-semibold tracking-tight">Hesabınız oluşturuldu</h1>
            <p className="text-xs text-muted-foreground">Artık giriş yapabilirsiniz.</p>
          </div>
          <Link to="/sign-in" className="text-xs text-foreground hover:underline underline-offset-4 transition-colors">
            Giriş yap →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
          <h1 className="text-xl font-semibold tracking-tight">Hesap oluştur</h1>
          <p className="text-xs text-muted-foreground">Birkaç saniyede başlayın.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Ad soyad</Label>
            <Input id="name" type="text" placeholder="Ali Yılmaz" autoComplete="name"
              value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" placeholder="ornek@sirket.com" autoComplete="email"
              value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                autoComplete="new-password" className="pr-8"
                value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Şifre tekrar</Label>
            <div className="relative">
              <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                autoComplete="new-password" className="pr-8"
                value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} required />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending ? 'Oluşturuluyor...' : 'Hesap oluştur'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Zaten hesabın var mı?{' '}
          <Link to="/sign-in" className="text-foreground hover:underline underline-offset-4 transition-colors">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  )
}
