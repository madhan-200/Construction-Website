'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { UserRole } from '@/lib/types';
import { HardHat, Lock, Mail, User, Building, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { dict, signUp } = useApp();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!displayName || !email || !password) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp({
        email,
        password,
        displayName,
        role,
        companyName,
        phone,
      });

      if (res.success && res.user) {
        setSuccessMsg(`Account created successfully for ${res.user.displayName}`);
        setTimeout(() => {
          if (role === 'vendor') router.push('/vendor/apply');
          else router.push('/account');
        }, 800);
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during account registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-industrial-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded bg-safety-orange mx-auto flex items-center justify-center text-white shadow-lg mb-3">
          <HardHat className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {dict.auth.signUpTitle}
        </h1>
        <p className="mt-2 text-xs text-industrial-400 max-w-sm mx-auto">
          {dict.auth.signUpSubtitle}
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-industrial-300 uppercase mb-1">
                {dict.auth.fullName} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Karthik Subramanian"
                  required
                  className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 pl-9 pr-3 text-sm text-white placeholder-industrial-500 focus:outline-none focus:border-safety-orange transition"
                />
                <User className="w-4 h-4 text-industrial-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-industrial-300 uppercase mb-1">
                {dict.auth.companyName}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Chennai Civil Infra Ltd"
                  className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 pl-9 pr-3 text-sm text-white placeholder-industrial-500 focus:outline-none focus:border-safety-orange transition"
                />
                <Building className="w-4 h-4 text-industrial-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-industrial-300 uppercase mb-1">
                  {dict.auth.email} *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    required
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 pl-9 pr-3 text-sm text-white placeholder-industrial-500 focus:outline-none focus:border-safety-orange transition"
                  />
                  <Mail className="w-4 h-4 text-industrial-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-industrial-300 uppercase mb-1">
                  {dict.auth.phone}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98400 12345"
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 pl-9 pr-3 text-sm text-white placeholder-industrial-500 focus:outline-none focus:border-safety-orange transition"
                  />
                  <Phone className="w-4 h-4 text-industrial-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-industrial-300 uppercase mb-1">
                {dict.auth.role} *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-3 rounded border text-left text-xs font-mono transition ${
                    role === 'customer'
                      ? 'bg-industrial-800 border-safety-orange text-white'
                      : 'bg-industrial-950 border-industrial-700 text-industrial-400 hover:border-industrial-600'
                  }`}
                >
                  <div className="font-bold text-white mb-0.5">Contractor / Buyer</div>
                  <div className="text-[10px] text-industrial-400">Order materials & project quotes</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`p-3 rounded border text-left text-xs font-mono transition ${
                    role === 'vendor'
                      ? 'bg-industrial-800 border-safety-orange text-white'
                      : 'bg-industrial-950 border-industrial-700 text-industrial-400 hover:border-industrial-600'
                  }`}
                >
                  <div className="font-bold text-white mb-0.5">Material Vendor</div>
                  <div className="text-[10px] text-industrial-400">List and supply bulk goods</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-industrial-300 uppercase mb-1">
                {dict.auth.password} *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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
              {loading ? dict.common.loading : dict.auth.submitSignUp}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-industrial-800 pt-4 text-center text-xs text-industrial-400">
            <span>{dict.auth.alreadyHaveAccount} </span>
            <Link href="/login" className="text-safety-orange hover:underline font-bold">
              {dict.auth.submitSignIn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
