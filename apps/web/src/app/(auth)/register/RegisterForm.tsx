'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema } from '@budget-pocket/shared';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export function RegisterForm() {
  const router   = useRouter();
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [showPwd,  setShowPwd] = useState(false);
  const [pwdValue, setPwdValue] = useState('');

  const pwdStrength = pwdValue.length === 0 ? 0 : pwdValue.length < 6 ? 1 : pwdValue.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-teal-500'];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd     = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      email:    fd.get('email'),
      password: fd.get('password'),
      name:     fd.get('name') || undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de la création du compte');
      setLoading(false);
      return;
    }

    await signIn('credentials', { email: parsed.data.email, password: parsed.data.password, redirect: false });
    router.push('/onboarding');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-gray-700 font-medium text-sm">Prénom et nom</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Jean Kouassi"
          autoComplete="name"
          className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-teal-500 focus-visible:border-teal-500"
        />
      </div>

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
        <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Mot de passe</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPwd ? 'text' : 'password'}
            placeholder="Minimum 8 caractères"
            autoComplete="new-password"
            required
            value={pwdValue}
            onChange={(e) => setPwdValue(e.target.value)}
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
        {pwdValue && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${pwdStrength >= i ? strengthColor[pwdStrength] : 'bg-gray-200'}`} />
              ))}
            </div>
            <p className={`text-xs ${pwdStrength === 1 ? 'text-red-500' : pwdStrength === 2 ? 'text-amber-500' : 'text-teal-600'}`}>
              {strengthLabel[pwdStrength]}
            </p>
          </div>
        )}
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
        {loading ? 'Création du compte...' : 'Créer mon compte gratuitement'}
      </Button>

      <div className="flex items-start gap-2 text-xs text-gray-400">
        <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
        <span>Aucune carte bancaire requise. Gratuit pour toujours sur le plan de base.</span>
      </div>
    </form>
  );
}
