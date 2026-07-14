'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Map Firebase auth error codes → human-readable messages
function getAuthErrorMessage(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return err?.message || 'Authentication failed. Please try again.';
  }
}

function LoginFormContent() {
  const { user, loading: authLoading, signInWithEmail, registerWithEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/home';

  const [view, setView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // ─── Single redirect mechanism ────────────────────────────────────────────
  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, redirectUrl]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (view === 'register') {
        if (!displayName.trim()) {
          const msg = 'Please enter your full name.';
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName.trim());
        toast.success('Account created! Please sign in to continue.');
        setView('login');
        setPassword('');
        setDisplayName('');
        setError('');
      } else {
        await signInWithEmail(email, password);
        toast.success('Signed in successfully! Welcome back.');
      }
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A0A0A]" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAFAF8]">
      <div className="w-full max-w-md bg-white border border-[#E8E4DE] p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#6B6B6B] mb-3">
            Craft Girly Store
          </p>
          <h1 className="text-2xl font-serif font-normal text-[#0A0A0A] tracking-wide">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-[#888] mt-3 tracking-wide">
            {view === 'login'
              ? 'Sign in to access your orders and checkout.'
              : 'Join to discover handmade crafts and custom gifts.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs border border-red-100 tracking-wide">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {view === 'register' && (
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
              <input
                type="text"
                placeholder="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-[#E8E4DE] text-[#0A0A0A] text-sm focus:outline-none focus:border-[#0A0A0A] transition-colors bg-transparent tracking-wide"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 border border-[#E8E4DE] text-[#0A0A0A] text-sm focus:outline-none focus:border-[#0A0A0A] transition-colors bg-transparent tracking-wide"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3.5 border border-[#E8E4DE] text-[#0A0A0A] text-sm focus:outline-none focus:border-[#0A0A0A] transition-colors bg-transparent tracking-wide"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#0A0A0A] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A0A0A] text-white py-3.5 text-xs font-medium uppercase tracking-[0.15em] hover:bg-[#1a1a1a] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {view === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E8E4DE] text-center">
          <p className="text-xs text-[#888] tracking-wide">
            {view === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => setView('register')} className="text-[#0A0A0A] font-medium underline underline-offset-4 hover:text-[#442852] transition-colors">
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setView('login')} className="text-[#0A0A0A] font-medium underline underline-offset-4 hover:text-[#442852] transition-colors">
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A0A0A]" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
