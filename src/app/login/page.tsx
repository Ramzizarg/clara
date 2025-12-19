'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/admin',
      });

      if (result?.error) {
        setError("Nom d'utilisateur ou mot de passe incorrect");
      } else {
        router.push('/admin');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 md:px-0">
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-9 md:px-10 md:py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] border border-zinc-100">
        {/* Logo / Brand */}
        <div className="mb-7 flex flex-col items-center">
          <div
            className="text-3xl md:text-[32px] font-semibold tracking-tight text-zinc-900"
            style={{ fontFamily: 'Abramo, var(--font-geist-sans), system-ui, sans-serif' }}
          >
            Carla
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-7">
          <h1 className="text-2xl md:text-[26px] font-semibold text-zinc-900">Connexion Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">Accédez au tableau de bord</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Nom d'utilisateur</label>
            <div className="flex items-center rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900">
              <span className="mr-2 text-zinc-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M10 2a4 4 0 0 0-4 4v1a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" />
                  <path d="M4.25 12A2.25 2.25 0 0 0 2 14.25v.5C2 16.54 3.46 18 5.25 18h9.5A3.25 3.25 0 0 0 18 14.75v-.5A2.25 2.25 0 0 0 15.75 12h-11.5Z" />
                </svg>
              </span>
              <input
                type="text"
                className="h-6 w-full border-none bg-transparent p-0 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                placeholder="admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Mot de passe</label>
            <div className="flex items-center rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900">
              <span className="mr-2 text-zinc-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M10 2a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4Z" />
                </svg>
              </span>
              <input
                type="password"
                className="h-6 w-full border-none bg-transparent p-0 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <span className="ml-2 cursor-default text-zinc-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M10 4.5C5.5 4.5 2.2 7.3 1 10c1.2 2.7 4.5 5.5 9 5.5s7.8-2.8 9-5.5c-1.2-2.7-4.5-5.5-9-5.5Zm0 9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Primary button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-3 w-full rounded-md bg-gradient-to-r from-[#ff6b00] to-[#ff1744] py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-95 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Connexion…' : 'Se connecter'}
          </button>

          {/* Secondary button */}
          <Link
            href="/"
            className="mt-2 flex w-full items-center justify-center rounded-md border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300"
          >
            <span className="mr-2 text-zinc-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10 2.25a.75.75 0 0 0-.47.17l-7 5.75A.75.75 0 0 0 2 9h1v6.25A1.75 1.75 0 0 0 4.75 17h3.5A1.75 1.75 0 0 0 10 15.25V12h2v3.25A1.75 1.75 0 0 0 13.75 17h3.5A1.75 1.75 0 0 0 19 15.25V9h1a.75.75 0 0 0 .47-1.33l-7-5.75A.75.75 0 0 0 10 2.25Z" />
              </svg>
            </span>
            Retour à l'accueil
          </Link>
        </form>
      </div>
    </div>
  );
}

