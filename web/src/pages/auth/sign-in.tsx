import { useState } from 'react'
import { Link } from 'react-router'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
          <h1 className="text-xl font-semibold tracking-tight">Giriş yap</h1>
          <p className="text-xs text-muted-foreground">Devam etmek için hesabına giriş yap.</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" placeholder="ornek@sirket.com" autoComplete="email" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Şifre</Label>
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Şifremi unuttum
              </Link>
            </div>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                autoComplete="current-password" className="pr-8" />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-2">
            Giriş yap
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Hesabın yok mu?{' '}
          <Link to="/sign-up" className="text-foreground hover:underline underline-offset-4 transition-colors">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  )
}
