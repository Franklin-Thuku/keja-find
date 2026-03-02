import React, { useState } from 'react';
import { supabase } from './supabaseClient'; 
import { LogIn, UserPlus } from 'lucide-react'; 

const AuthModal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Dynamic choice between login and signup logic
    const { data, error: authError } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      if (isLogin) {
        window.location.href = "/dashboard"; // Redirect on success
      } else {
        alert("Success! Check your email for a verification link.");
        setLoading(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'http://localhost:5173/dashboard' }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      <form onSubmit={handleAuth} className="space-y-4">
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-4 rounded-xl bg-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-4 rounded-xl bg-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        <button 
          onClick={handleGoogleAuth}
          className="w-full border border-slate-200 p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition"
        >
          Continue with Google
        </button>
        
        <p className="text-center text-slate-500 text-sm">
          {isLogin ? "New to Keja Find?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="ml-1 text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>

      {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
};

export default AuthModal;