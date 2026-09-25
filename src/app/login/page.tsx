'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail, resetPassword, user } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // If already logged in, redirect to builder
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { isNewUser } = await loginWithGoogle();
      if (isNewUser) {
        const newId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        router.push(`/builder/${newId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (mode === 'signup' && !name) {
      setError('Please provide your full name.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { isNewUser } = await loginWithEmail(email, password, name, mode === 'signup');
      if (isNewUser) {
        const newId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        router.push(`/builder/${newId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }
    setIsResetting(true);
    setForgotStatus(null);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotStatus({
        type: 'success',
        message: 'Password reset link sent! Check your email inbox to reset your password.',
      });
    } catch (err: unknown) {
      setForgotStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Could not send reset link. Please try again.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="border-b border-[#E4E4DF] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#1C1C1A]"
            style={{ fontFamily: 'var(--font-plex-sans)' }}
          >
            Resume Maker
          </Link>
          <Link
            href="/builder/default"
            className="text-sm font-medium text-[#6B6B63] hover:text-[#1C1C1A] transition-colors"
          >
            Skip to Builder →
          </Link>
        </div>
      </nav>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-[#E4E4DF] rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1
              className="text-2xl font-bold tracking-tight text-[#1C1C1A]"
              style={{ fontFamily: 'var(--font-plex-sans)' }}
            >
              {mode === 'signin' ? 'Welcome back to Resume Maker' : 'Create your account'}
            </h1>
            <p className="text-sm text-[#6B6B63]">
              {mode === 'signin'
                ? 'Sign in to access and sync your ATS-friendly resume'
                : 'Get started and build a professional resume in minutes'}
            </p>
          </div>

          {/* Sign in with Google Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 h-11 px-4 bg-white border border-[#E4E4DF] hover:bg-[#FAFAF9] hover:border-[#33415C]/40 active:bg-[#f0f0ec] text-[#1C1C1A] text-sm font-medium rounded-[6px] transition-all cursor-pointer shadow-xs"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E4E4DF] w-full" />
            <span className="absolute bg-white px-3 text-xs uppercase tracking-wider text-[#6B6B63]">
              Or continue with email
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-[6px] bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <Input
                id="login-name"
                label="Full Name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              id="login-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <Input
                id="login-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === 'signin' && (
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotStatus(null);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs font-medium text-[#33415C] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full h-11 text-base font-semibold"
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Mode switch */}
          <div className="text-center text-sm text-[#6B6B63] pt-2">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="font-semibold text-[#33415C] hover:underline cursor-pointer"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <p className="text-sm text-[#6B6B63]">
            Enter your account email address below and we will send you a link to reset your password.
          </p>

          {forgotStatus && (
            <div
              className={`p-3 rounded-[6px] text-xs ${
                forgotStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700 font-medium'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {forgotStatus.message}
            </div>
          )}

          <Input
            id="forgot-email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isResetting}
            >
              Send Reset Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Footer */}
      <footer className="border-t border-[#E4E4DF] py-6 text-center text-xs text-[#6B6B63]">
        Resume Maker — Powered by Firebase & Next.js.
      </footer>
    </div>
  );
}
