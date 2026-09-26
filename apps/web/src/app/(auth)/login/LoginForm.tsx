'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema } from '@budget-pocket/shared';
import { Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const router   = useRouter();
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [showPwd,  setShowPwd] = useState(false);
  // Story 15.32 (MFA): once lib/auth.ts's authorize() throws MFA_REQUIRED
  // for this email/password pair, we keep both around (the credentials
  // provider needs them again on the second submit — NextAuth doesn't
  // remember a prior partial attempt) and swap the password field for a
  // TOTP code field instead of restarting the form.
  const [mfaPending, setMfaPending] = useState<{ email: string; password: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    if (mfaPending) {
      const totp = String(fd.get('totp') ?? '').trim();
      if (!totp) {
        setError('Veuillez saisir votre code de vérification');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', { ...mfaPending, totp, redirect: false });
      if (result?.error) {
        setError(result.error === 'MFA_INVALID' ? 'Code invalide' : 'Une erreur est survenue');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
      return;
    }

    const parsed = loginSchema.safeParse({
      email:    fd.get('email'),
      password: fd.get('password'),
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', { ...parsed.data, redirect: false });

    if (result?.error === 'MFA_REQUIRED') {
      setMfaPending({ email: parsed.data.email, password: parsed.data.password });
      setLoading(false);
      return;
    }

    if (result?.error) {
      setError('Email ou mot de passe incorrect');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  if (mfaPending) {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-teal-50 rounded-lg px-3 py-2.5">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-teal-600" />
          Saisissez le code à 6 chiffres de votre application d'authentification,
          ou l'un de vos codes de récupération.
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="totp" className="text-gray-700 font-medium text-sm">Code de vérification</Label>
          <Input
            id="totp"
            name="totp"
            type="text"
            inputMode="numeric"
            placeholder="123456"
            autoComplete="one-time-code"
            autoFocus
            required
            className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-teal-500 focus-visible:border-teal-500"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm shadow-teal-200"
        >
          {loading ? 'Vérification...' : 'Vérifier'}
        </Button>

        <button
          type="button"
          onClick={() => { setMfaPending(null); setError(''); }}
          className="w-full text-xs text-gray-500 hover:text-gray-700"
        >
          Retour
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="vous@exemple.com"
          autoComplete="email"
          required
          className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-teal-500 focus-visible:border-teal-500"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Mot de passe</Label>
          <Link href="/forgot-password" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-teal-500 focus-visible:border-teal-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm shadow-teal-200"
      >
        {loading ? 'Connexion en cours...' : 'Se connecter'}
      </Button>
    </form>
  );
}
