'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldCheck, Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signInWithCredentials } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await signInWithCredentials(email, password);
      if (success) {
        router.push('/admin');
      } else {
        setError('Invalid administrative credentials. Please verify and try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#130726] relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#442852]/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#582da8]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>

      {/* Login Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-[#7f56d9] to-[#b292c7] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-lg">CG</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Admin Workspace</h2>
          <p className="text-purple-200 text-xs font-medium">Log in using authorized staff credentials</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-350 p-3.5 rounded-xl text-xs font-semibold text-rose-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email field */}
          <div className="relative">
            <input 
              type="email" 
              placeholder="e.g. staff@craft.com" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-305 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-transparent transition-all text-sm font-semibold"
              required 
              disabled={loading}
            />
            <Mail className="absolute left-3.5 top-4 w-4.5 h-4.5 text-purple-300" />
          </div>

          {/* Password field */}
          <div className="relative">
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-305 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-transparent transition-all text-sm font-semibold"
              required 
              disabled={loading}
            />
            <Lock className="absolute left-3.5 top-4 w-4.5 h-4.5 text-purple-300" />
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#442852] to-[#582da8] text-white py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(88,45,168,0.3)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In to Portal'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}