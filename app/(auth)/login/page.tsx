'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LivingOrb from '@/components/ui/LivingOrb';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md flex flex-col items-center"
      >
        {/* Orb */}
        <div className="mb-6">
          <LivingOrb size={60} color="jade" />
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl tracking-display text-text mb-10">
          Connexion
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:border-jade transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:border-jade transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-jade py-3 text-sm font-semibold tracking-label text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '...' : 'SE CONNECTER'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-rose text-center">{error}</p>
        )}

        {/* Divider */}
        <div className="my-8 flex w-full items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted">ou</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full rounded-lg border border-border bg-bg-surface py-3 text-sm font-medium tracking-label text-text transition-colors hover:bg-bg-surface-hover disabled:opacity-50"
        >
          Continuer avec Google
        </button>

        {/* Sign-up link */}
        <p className="mt-10 text-sm text-muted">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-jade hover:underline">
            Créer un compte
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
