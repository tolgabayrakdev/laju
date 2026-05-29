import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUp() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">laju</p>
          <h1 className="text-xl font-semibold tracking-tight">Hesap oluştur</h1>
          <p className="text-xs text-muted-foreground">Birkaç saniyede başlayın.</p>
        </div>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Ad</Label>
              <Input id="firstName" type="text" placeholder="Ali" autoComplete="given-name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Soyad</Label>
              <Input id="lastName" type="text" placeholder="Yılmaz" autoComplete="family-name" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" placeholder="ornek@sirket.com" autoComplete="email" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Şifre tekrar</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
          </div>

          <Button type="submit" className="w-full mt-2">
            Hesap oluştur
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
