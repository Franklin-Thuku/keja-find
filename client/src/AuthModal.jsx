import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthModal = ({ initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation(); // Used to catch the ?role=landlord from the URL

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);


  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Identify the role from the URL (default to 'student' if not found)
    const params = new URLSearchParams(location.search);
    const userRole = params.get('role') || 'student';

    // 2. Perform Supabase Auth
    const { data, error: authError } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
    } else {

      // NEW LOGIC: Force the role based on the button clicked, saving directly to local storage
      localStorage.setItem('userRole', userRole);

      if (!isLogin && data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              role: userRole
            }
          ]);

        if (profileError) {
          console.error("Profile Error:", profileError.message);
        }
      }

      if (isLogin || data?.user?.identities?.length !== 0) {
        toast.success("Welcome successfully!");
        navigate("/dashboard", { replace: true });
      } else {
        toast.success("Account created! Check your email to verify before logging in.", { duration: 5000 });
        setLoading(false);
        setIsLogin(true);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const params = new URLSearchParams(location.search);
    const userRole = params.get('role') || 'student';
    localStorage.setItem('userRole', userRole);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">

        {new URLSearchParams(location.search).get('role') === 'landlord' && !isLogin
          ? 'Landlord Signup'
          : (isLogin ? 'Welcome Back' : 'Create Account')}
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

      <div className="mt-6 flex items-center justify-between">
        <span className="w-1/5 border-b border-gray-200"></span>
        <span className="text-xs text-center text-gray-500 uppercase">Or continue with</span>
        <span className="w-1/5 border-b border-gray-200"></span>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full mt-4 flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 p-4 rounded-xl font-bold transition-all disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
      </button>

      <div className="mt-6 space-y-4">
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

    </div>
  );
};

export default AuthModal;