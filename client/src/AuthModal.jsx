import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 
import { useNavigate } from 'react-router-dom'; // The proper way to move between pages
import { LogIn, UserPlus } from 'lucide-react'; 

// We add 'initialMode' as a prop so your Landing Page buttons can control it
const AuthModal = ({ initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); // Initialize the navigator

  // This ensures that if the prop changes, the modal updates
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Send data to Supabase
    const { data, error: authError } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      // 2. Logic for redirection
      if (isLogin) {
        // User is logged in, move to Dashboard
        navigate("/dashboard"); 
      } else {
        // New user created! 
        // Note: By default, Supabase requires email confirmation.
        // If you've disabled "Email Confirmation" in Supabase settings, 
        // you can navigate("/") or navigate("/dashboard") immediately.
        alert("Account created! Check your email to verify before logging in.");
        setLoading(false);
        setIsLogin(true); // Switch to login view so they can sign in after verifying
      }
    }
  };

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: 'http://localhost:5173/dashboard' 
      }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
      <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      <form onSubmit={handleAuth} className="space-y-4">
        <input 
          type="email" 
          placeholder="Email Address" 
          className="w-full p-4 rounded-xl bg-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-4 rounded-xl bg-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="px-3 text-slate-400 text-xs uppercase">Or continue with</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          className="w-full border border-slate-200 p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition font-medium"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
          Google
        </button>
        
        <p className="text-center text-slate-500 text-sm">
          {isLogin ? "New to Keja Find?" : "Already have an account?"}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="ml-1 text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-xs text-red-600 text-center">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AuthModal;