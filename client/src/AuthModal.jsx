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
        navigate("/dashboard");
      } else {
        toast.success("Account created! Check your email to verify before logging in.", { duration: 5000 });
        setLoading(false);
        setIsLogin(true);
      }
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