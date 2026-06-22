'use client';

import { useAuth } from '@/context/AuthContext';
<<<<<<< HEAD
import { X, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type AuthView = 'login' | 'register';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  if (!authModalOpen) return null;

  const reset = () => {
    setError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setShowPassword(false);
  };

  const switchView = (v: AuthView) => {
    reset();
    setView(v);
  };

=======
import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
<<<<<<< HEAD
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (view === 'register') {
        if (!displayName.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName.trim());
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(e.message || 'An error occurred. Please try again.');
      }
    } finally {
=======
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
<<<<<<< HEAD
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setAuthModalOpen(false)}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-[#442852] transition-colors z-10"
=======
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setAuthModalOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={() => setAuthModalOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-[#442852] transition-colors"
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
        >
          <X className="w-6 h-6" />
        </button>

<<<<<<< HEAD
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#F9F6F0] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E5E0D8]">
              <span className="text-[#442852] font-bold text-xl">CG</span>
            </div>
            <h2 className="text-2xl font-bold text-[#2D2D2D]">
              {view === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {view === 'login'
                ? 'Sign in to track orders and save addresses.'
                : 'Join to shop handmade crafts from Sri Lanka.'}
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#D1C9C0] text-[#2D2D2D] py-3 px-4 rounded-xl font-medium hover:bg-[#F9F6F0] transition-colors disabled:opacity-50 mb-4"
=======
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[#F9F6F0] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[#442852] font-bold text-2xl">CG</span>
          </div>
          
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Sign in or create an account to track your orders and save delivery addresses.</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#D1C9C0] text-[#2D2D2D] py-3 px-4 rounded-xl font-medium hover:bg-[#F9F6F0] transition-colors disabled:opacity-50"
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#442852]" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>
<<<<<<< HEAD

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E0D8]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 font-medium">or with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {view === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D1C9C0] text-[#2D2D2D] text-sm focus:outline-none focus:border-[#442852] focus:ring-1 focus:ring-[#442852] transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D1C9C0] text-[#2D2D2D] text-sm focus:outline-none focus:border-[#442852] focus:ring-1 focus:ring-[#442852] transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={view === 'register' ? 'Password (min. 6 characters)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#D1C9C0] text-[#2D2D2D] text-sm focus:outline-none focus:border-[#442852] focus:ring-1 focus:ring-[#442852] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#442852] text-white py-3 rounded-xl font-semibold hover:bg-[#321c3d] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {view === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {view === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => switchView('register')} className="text-[#442852] font-semibold hover:underline">
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => switchView('login')} className="text-[#442852] font-semibold hover:underline">
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>

=======
        </div>
        
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
        <div className="bg-[#F9F6F0] p-4 text-center border-t border-[#E5E0D8]">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
