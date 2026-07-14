'use client';

import { X, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// Map Firebase error codes to user-friendly messages
function getAuthErrorMessage(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in.';
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

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, signInWithEmail, registerWithEmail, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Close modal automatically once Firebase confirms the user is signed in.
  useEffect(() => {
    if (user && authModalOpen) {
      setAuthModalOpen(false);
    }
  }, [user, authModalOpen, setAuthModalOpen]);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    setAuthModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast.success('Signed in successfully! 🎉');
        resetForm();
      } else {
        if (!displayName.trim()) {
          const msg = 'Please enter your full name.';
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName.trim());
        toast.success('Account created successfully! Please sign in. 🎉');
        setPassword('');
        setDisplayName('');
        setError('');
        setIsLogin(true);
      }
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-md p-6 sm:p-8 relative shadow-2xl rounded-none border border-[#E8E4DF]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#0A0A0A] transition-colors p-1 rounded-none hover:bg-[#FAFAF8]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#FAFAF8] rounded-none flex items-center justify-center mx-auto mb-4 border border-[#E8E4DF]">
            <span className="text-[#0A0A0A] font-bold text-base tracking-widest uppercase">CG</span>
          </div>
          <h2 className="text-sm font-bold tracking-[0.2em] text-[#0A0A0A] uppercase">
            {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h2>
          <p className="text-[10px] font-bold tracking-wider text-gray-400 mt-2 uppercase">
            {isLogin
              ? 'Sign in to access your checkout and track orders.'
              : 'Join to shop handmade crafts and custom gifts.'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-none border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="FULL NAME"
                required
                className="w-full pl-10 pr-4 py-3 rounded-none border border-[#C4BFBA] text-[#0A0A0A] text-xs font-semibold focus:outline-none focus:border-[#0A0A0A] tracking-wider uppercase transition-all"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              required
              className="w-full pl-10 pr-4 py-3 rounded-none border border-[#C4BFBA] text-[#0A0A0A] text-xs font-semibold focus:outline-none focus:border-[#0A0A0A] tracking-wider uppercase transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="PASSWORD"
              required
              className="w-full pl-10 pr-10 py-3 rounded-none border border-[#C4BFBA] text-[#0A0A0A] text-xs font-semibold focus:outline-none focus:border-[#0A0A0A] tracking-wider uppercase transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A0A0A] text-white py-3.5 rounded-none font-bold uppercase tracking-[0.25em] hover:bg-[#222222] transition-colors flex items-center justify-center gap-2 text-[10px] disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-[#0A0A0A] hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}