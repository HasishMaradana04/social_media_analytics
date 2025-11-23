import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight, UserPlus, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        await signUp(email, password);
        navigate('/'); 
      }
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('Supabase is not configured')) {
        setError('Database connection missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: 'linkedin_oidc' | 'google' | 'twitter') => {
    try {
      await api.signInWithOAuth(provider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2"></div>

      <div className="w-full max-w-md p-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-slate-400">
            {isLogin ? 'Sign in to access your analytics dashboard' : 'Join SocialPulse to analyze your growth'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? 'Sign In' : 'Sign Up')}
            {!isSubmitting && (isLogin ? <ArrowRight className="ml-2 h-4 w-4" /> : <UserPlus className="ml-2 h-4 w-4" />)}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-700 rounded-lg text-sm font-medium text-white hover:bg-slate-700 transition-colors bg-white/10 hover:bg-white/20"
            >
                <img src="https://cdn-icons-png.flaticon.com/512/300/300221.png" alt="Google" className="w-5 h-5" />
                Google
            </button>

            <button 
                onClick={() => handleOAuthLogin('linkedin_oidc')}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-700 rounded-lg text-sm font-medium text-white hover:bg-slate-700 transition-colors bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border-[#0077b5]/30"
            >
                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" className="w-5 h-5" />
                LinkedIn
            </button>
            
            <button 
                onClick={() => handleOAuthLogin('twitter')}
                className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-700 rounded-lg text-sm font-medium text-white hover:bg-slate-700 transition-colors bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border-[#1DA1F2]/30"
            >
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" className="w-5 h-5" />
                Twitter
            </button>
        </div>

        <div className="mt-6 text-center">
            <button 
                onClick={() => { setError(''); setIsLogin(!isLogin); }}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;