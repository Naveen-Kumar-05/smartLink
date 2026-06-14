import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] h-[500px] w-[500px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg">
            <Link2 className="h-5 w-5 rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
            SmartLink
          </span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your credentials to access your links
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass px-6 py-8 rounded-2xl shadow-xl border border-border">
          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-500 hover:text-indigo-400">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
