import { useState } from 'react'
import { Link } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: (email: string) => api.post('/api/auth/forgot-password', { email }),
  })

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    mutate(email)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
            <h1 className="text-xl font-semibold tracking-tight">Bağlantı gönderildi</h1>
            <p className="text-xs text-muted-foreground">
              E-posta adresin sistemde kayıtlıysa sıfırlama bağlantısı gönderildi. Gelen kutunu kontrol et.
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            <Link to="/sign-in" className="text-foreground hover:underline underline-offset-4 transition-colors">
              ← Girişe dön
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
          <h1 className="text-xl font-semibold tracking-tight">Şifreni sıfırla</h1>
          <p className="text-xs text-muted-foreground">
            E-posta adresini gir, sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@sirket.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-xs text-destructive">{error.message}</p>}

          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending ? 'Gönderiliyor…' : 'Bağlantı gönder'}
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
