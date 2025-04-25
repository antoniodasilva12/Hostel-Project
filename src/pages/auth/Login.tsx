import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { FiSmartphone, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiX } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    // Trigger animations after component mounts
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      if (!user) {
        throw new Error('No user returned after login');
      }

      // Step 2: Get user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error('No profile found');
      }

      // Step 3: Redirect based on role
      if (profile.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setResetSuccess(true);
    } catch (err) {
      console.error('Error:', err);
      setResetError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-fixed bg-no-repeat before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-900/70 before:via-blue-900/60 before:to-blue-800/70 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-indigo-500/20 p-3 rounded-full backdrop-blur-sm transform hover:scale-110 transition-transform duration-300">
            <FiSmartphone className="h-10 w-10 text-indigo-300" />
          </div>
        </div>
        <h2 className={`mt-6 text-center text-3xl font-extrabold text-white transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {showForgotPassword ? 'Reset your password' : 'Sign in to your account'}
        </h2>
        <p className={`mt-2 text-center text-sm text-indigo-200 transition-opacity duration-1000 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {showForgotPassword ? (
            'Enter your email to receive a password reset link'
          ) : (
            <>
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-300 hover:text-indigo-200 transition-colors duration-300">
                Sign up now
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`bg-white/20 backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-white/30 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-100 bg-red-900/60 rounded-lg border border-red-500/40">
              {error}
            </div>
          )}
          
          {showForgotPassword ? (
            <div>
              {resetSuccess ? (
                <div className="mb-4 p-3 text-sm text-green-100 bg-green-900/50 rounded-lg border border-green-500/30 backdrop-blur-sm">
                  Password reset email sent! Check your inbox.
                </div>
              ) : (
                <>
                  {resetError && (
                    <div className="mb-4 p-3 text-sm text-red-100 bg-red-900/50 rounded-lg border border-red-500/30 backdrop-blur-sm">
                      {resetError}
                    </div>
                  )}
                  
                  <form className="space-y-6" onSubmit={handleResetPassword}>
                    <div>
                      <label htmlFor="reset-email" className="block text-sm font-medium text-indigo-100">
                        Email address
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-indigo-300" />
                        </div>
                        <input
                          id="reset-email"
                          name="email"
                          type="email"
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-indigo-300/30 rounded-md bg-white/10 text-white placeholder-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="you@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors duration-300"
                      >
                        Back to login
                      </button>
                      
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300"
                      >
                        {resetLoading ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          'Send reset link'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-100">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-indigo-300" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-indigo-300/30 rounded-md bg-white/10 text-white placeholder-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-indigo-100">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors duration-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-indigo-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-10 py-2 border border-indigo-300/30 rounded-md bg-white/10 text-white placeholder-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-300 hover:text-indigo-200 transition-colors duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300 group"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <>
                      Sign in
                      <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {!showForgotPassword && (
            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center items-center py-3 px-4 border border-indigo-300/30 rounded-md shadow-sm text-sm font-medium text-indigo-100 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
              >
                Create an account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 