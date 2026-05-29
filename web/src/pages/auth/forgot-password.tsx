import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPassword() {
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

        <form className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" placeholder="ornek@sirket.com" autoComplete="email" />
          </div>

          <Button type="submit" className="w-full mt-2">
            Bağlantı gönder
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          <Link
            to="/sign-in"
            className="text-foreground hover:underline underline-offset-4 transition-colors"
          >
            ← Girişe dön
          </Link>
        </p>
      </div>
    </div>
  )
}
