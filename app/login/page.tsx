'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { UserRole } from '@/lib/types';
import { HardHat, Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

function LoginContent() {
  const { locale, dict, signIn, switchDemoRole } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (res.success && res.user) {
        setSuccessMsg(`Welcome back, ${res.user.displayName}`);
        setTimeout(() => {
          if (res.user?.role === 'admin') router.push('/admin');
          else if (res.user?.role === 'vendor') router.push('/vendor/dashboard');
          else router.push(redirectUrl);
        }, 600);
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = (role: UserRole) => {
    const user = switchDemoRole(role);
    setSuccessMsg(`Switched to active role: ${role.toUpperCase()} (${user.displayName})`);
    setTimeout(() => {
      if (role === 'admin') router.push('/admin');
      else if (role === 'vendor') router.push('/vendor/dashboard');
      else router.push('/account');
    }, 500);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-industrial-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded bg-safety-orange mx-auto flex items-center justify-center text-white shadow-lg mb-3">
          <HardHat className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {dict.auth.signInTitle}
        </h1>
        <p className="mt-2 text-xs text-industrial-400 max-w-sm mx-auto">
          {dict.auth.signInSubtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-industrial-900 border border-industrial-800 py-8 px-6 shadow-xl rounded-lg sm:px-10 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-950/60 border border-red-800 text-red-300 p-3 rounded text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3 rounded text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-industrial-300 uppercase mb-1">
                {dict.auth.email}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 pl-9 pr-3 text-sm text-white placeholder-industrial-500 focus:outline-none focus:border-safety-orange transition"
                />
                <Mail className="w-4 h-4 text-industrial-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-industrial-300 uppercase mb-1">
                {dict.auth.password}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 pl-9 pr-3 text-sm text-white placeholder-industrial-500 focus:outline-none focus:border-safety-orange transition"
                />
                <Lock className="w-4 h-4 text-industrial-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-safety-orange hover:bg-safety-orange-hover text-white py-2.5 px-4 rounded font-bold text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading ? dict.common.loading : dict.auth.submitSignIn}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="border-t border-industrial-800 pt-5 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-safety-orange font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{dict.auth.orQuickRoleSwitch}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRole('customer')}
                className="bg-industrial-950 border border-industrial-700 hover:border-safety-orange text-industrial-200 hover:text-white p-2 rounded text-center text-xs font-mono transition"
              >
                <div className="font-bold">Customer</div>
                <div className="text-[10px] text-industrial-400">Contractor</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('vendor')}
                className="bg-industrial-950 border border-industrial-700 hover:border-safety-orange text-industrial-200 hover:text-white p-2 rounded text-center text-xs font-mono transition"
              >
                <div className="font-bold">Vendor</div>
                <div className="text-[10px] text-industrial-400">Supplier</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('admin')}
                className="bg-industrial-950 border border-industrial-700 hover:border-safety-orange text-industrial-200 hover:text-white p-2 rounded text-center text-xs font-mono transition"
              >
                <div className="font-bold">Admin</div>
                <div className="text-[10px] text-industrial-400">Operations</div>
              </button>
            </div>
          </div>

          <div className="border-t border-industrial-800 pt-4 text-center text-xs text-industrial-400">
            <span>{dict.auth.noAccount} </span>
            <Link href="/register" className="text-safety-orange hover:underline font-bold">
              {dict.auth.submitSignUp}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-industrial-950" />}>
      <LoginContent />
    </Suspense>
  );
}
