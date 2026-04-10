import React, { useState } from 'react';
import { Bot, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isResetting) {
        // Simulate password reset
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResetSent(true);
      } else if (isLogin) {
        const user = await authService.login(email, password);
        onLogin(user);
      } else {
        const user = await authService.signup(email, password, name);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (isResetting) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pattern-grid">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-neo border-2 border-neo-black overflow-hidden relative">
          <div className="bg-acid/20 p-8 border-b-2 border-neo-black text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric via-hot-pink to-acid"></div>
             <div className="w-16 h-16 bg-neo-black text-acid rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-neo-sm transform -rotate-3 border-2 border-transparent">
                <Lock size={32} />
             </div>
             <h1 className="text-3xl font-display font-bold text-neo-black mb-1">Reset Password</h1>
             <p className="text-slate-600 font-medium">Get back into your account</p>
          </div>

          <div className="p-8">
             {resetSent ? (
               <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                 <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                   <Mail size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-neo-black">Check your email</h3>
                 <p className="text-slate-600">
                   We've sent a password reset link to <strong>{email}</strong>.
                 </p>
                 <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-sm text-blue-700">
                   <strong>Demo Hint:</strong> The password for all demo accounts is <code>password</code>.
                 </div>
                 <button 
                   onClick={() => { setIsResetting(false); setResetSent(false); }}
                   className="w-full bg-neo-black text-white font-bold py-3 rounded-xl mt-4 hover:bg-slate-800 transition-colors"
                 >
                   Back to Login
                 </button>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-4">
                 <p className="text-slate-600 text-sm mb-4">
                   Enter your email address and we'll send you a link to reset your password.
                 </p>
                 
                 <div className="space-y-1">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 font-medium text-neo-black focus:border-neo-black focus:ring-0 transition-colors outline-none"
                       placeholder="name@example.com"
                       required
                     />
                   </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full bg-neo-black text-white font-display font-bold text-lg py-4 rounded-xl shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {loading ? <Loader2 className="animate-spin" size={24} /> : 'Send Reset Link'}
                 </button>

                 <button 
                   type="button"
                   onClick={() => setIsResetting(false)}
                   className="w-full text-slate-500 font-bold py-2 hover:text-neo-black transition-colors"
                 >
                   Cancel
                 </button>
               </form>
             )}
          </div>
          <div className="h-2 bg-slate-100 border-t-2 border-neo-black flex">
             <div className="flex-1 bg-acid border-r-2 border-neo-black"></div>
             <div className="flex-1 bg-electric border-r-2 border-neo-black"></div>
             <div className="flex-1 bg-hot-pink"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pattern-grid">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-neo border-2 border-neo-black overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-acid/20 p-8 border-b-2 border-neo-black text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric via-hot-pink to-acid"></div>
           <div className="w-16 h-16 bg-neo-black text-acid rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-neo-sm transform -rotate-3 border-2 border-transparent">
              <Bot size={32} />
           </div>
           <h1 className="text-3xl font-display font-bold text-neo-black mb-1">GigFinder</h1>
           <p className="text-slate-600 font-medium">Your AI-powered career companion</p>
        </div>

        {/* Form */}
        <div className="p-8">
           <h2 className="text-xl font-bold text-neo-black mb-6 flex items-center gap-2">
             {isLogin ? 'Welcome back!' : 'Create your account'}
           </h2>

           {error && (
             <div className="mb-6 p-3 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
               {error}
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 font-medium text-neo-black focus:border-neo-black focus:ring-0 transition-colors outline-none"
                      placeholder="e.g. Alex Chen"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 font-medium text-neo-black focus:border-neo-black focus:ring-0 transition-colors outline-none"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => setIsResetting(true)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-12 pr-4 font-medium text-neo-black focus:border-neo-black focus:ring-0 transition-colors outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-neo-black text-white font-display font-bold text-lg py-4 rounded-xl shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
           </form>

           <div className="mt-8 text-center">
             <p className="text-slate-500 font-medium">
               {isLogin ? "Don't have an account?" : "Already have an account?"}
               <button 
                 onClick={() => setIsLogin(!isLogin)}
                 className="ml-2 text-blue-600 font-bold hover:underline focus:outline-none"
               >
                 {isLogin ? 'Sign Up' : 'Log In'}
               </button>
             </p>
           </div>
        </div>
        
        {/* Decorative footer */}
        <div className="h-2 bg-slate-100 border-t-2 border-neo-black flex">
           <div className="flex-1 bg-acid border-r-2 border-neo-black"></div>
           <div className="flex-1 bg-electric border-r-2 border-neo-black"></div>
           <div className="flex-1 bg-hot-pink"></div>
        </div>
      </div>
    </div>
  );
};
