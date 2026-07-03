'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema } from '@budget-pocket/shared';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const router   = useRouter();
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [showPwd,  setShowPwd] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd     = new FormData(e.currentTarget);
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

    if (result?.error) {
      setError('Email ou mot de passe incorrect');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
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
          <button type="button" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
            Mot de passe oublié ?
          </button>
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
