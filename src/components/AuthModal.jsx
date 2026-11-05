import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import { signInWithGoogle } from '../utils/firebase';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Enter 10-digit mobile number'),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER'),
});

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    setAuthModal,
    login,
    register: registerUser,
    requestPhoneOtp,
    verifyPhoneOtp,
    firebaseLogin,
  } = useAuthStore();
  const [tab, setTab] = useState(authModalTab || 'otp'); // 'otp' | 'login' | 'register'

  // Phone OTP state
  const [phoneInput, setPhoneInput] = useState('+919876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Password Visibility State
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    formState: { errors: regErrors, isSubmitting: isRegSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CUSTOMER' },
  });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.length < 10) {
      return toast.error('Please enter a valid 10-digit mobile number');
    }
    setIsOtpLoading(true);
    const res = await requestPhoneOtp(phoneInput);
    setIsOtpLoading(false);
    if (res) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      return toast.error('Please enter the 6-digit OTP code');
    }
    setIsOtpLoading(true);
    await verifyPhoneOtp(phoneInput, otpCode);
    setIsOtpLoading(false);
  };

  const onLogin = async (data) => {
    await login(data.email, data.password);
  };

  const onRegister = async (data) => {
    await registerUser(data.name, data.email, data.password, data.phone, data.role);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const cred = await signInWithGoogle();
      const token = await cred.user.getIdToken();
      await firebaseLogin(token, 'CUSTOMER', {
        fullName: cred.user.displayName,
        email: cred.user.email,
        phoneNumber: cred.user.phoneNumber,
      });
    } catch (err) {
      toast.error('Google Sign-in failed: ' + err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="User Authentication"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      {/* Backdrop */}
      <div
        onClick={() => setAuthModal(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md card p-6 sm:p-8 bg-[var(--color-card)] border-[var(--color-border)] shadow-2xl z-10 text-[var(--color-text)] rounded-2xl">
        <button
          onClick={() => setAuthModal(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Emblem */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg mx-auto mb-2 shadow-md">
            A
          </div>
          <h2 className="text-xl font-black tracking-tight">Welcome to ApexBazaar</h2>
          <p className="text-xs text-slate-400 mt-0.5">India's Enterprise Multi-Vendor Marketplace</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--color-border)] mb-6">
          <button
            onClick={() => setTab('otp')}
            className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'otp' ? 'border-indigo-600 text-indigo-400' : 'border-transparent text-slate-500'
            }`}
          >
            ⚡ Phone OTP
          </button>
          <button
            onClick={() => setTab('login')}
            className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'login' ? 'border-indigo-600 text-indigo-400' : 'border-transparent text-slate-500'
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'register' ? 'border-indigo-600 text-indigo-400' : 'border-transparent text-slate-500'
            }`}
          >
            Register
          </button>
        </div>

        {/* 1. Phone OTP Form */}
        {tab === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Mobile Number (India / Global)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm font-medium focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    We will send a 6-digit verification code via SMS.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isOtpLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {isOtpLoading ? 'Sending...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-2">
                  <span className="text-xs text-slate-400">Enter code sent to {phoneInput}</span>
                  <span className="block text-[11px] font-mono text-emerald-400 mt-0.5">Test OTP Code: 582914</span>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="• • • • • •"
                    className="w-full text-center text-2xl font-mono tracking-widest py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] font-bold focus:border-indigo-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isOtpLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {isOtpLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-xs text-slate-400 hover:text-white"
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. Email Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  {...loginRegister('email')}
                  placeholder="rohan@apexbazaar.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
                />
              </div>
              {loginErrors.email && <span className="text-xs text-rose-500">{loginErrors.email.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  {...loginRegister('password')}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginErrors.password && <span className="text-xs text-rose-500">{loginErrors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoginSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              {isLoginSubmitting ? 'Signing in...' : 'Sign In with Email'}
            </button>
          </form>
        )}

        {/* 3. Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegSubmit(onRegister)} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Legal Name</label>
              <input
                type="text"
                {...regRegister('name')}
                placeholder="Rohan Sharma"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
              />
              {regErrors.name && <span className="text-xs text-rose-500">{regErrors.name.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
              <input
                type="email"
                {...regRegister('email')}
                placeholder="rohan@apexbazaar.com"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
              />
              {regErrors.email && <span className="text-xs text-rose-500">{regErrors.email.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile Phone</label>
              <input
                type="tel"
                {...regRegister('phone')}
                placeholder="+919876543210"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Account Role</label>
              <select
                {...regRegister('role')}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
              >
                <option value="CUSTOMER">Shopper / Customer</option>
                <option value="SELLER">Verified Seller / Merchant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input
                type={showRegPassword ? 'text' : 'password'}
                {...regRegister('password')}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
              />
              {regErrors.password && <span className="text-xs text-rose-500">{regErrors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isRegSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50 mt-2"
            >
              {isRegSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Social / Firebase Quick Login */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2 px-3 border border-[var(--color-border)] hover:bg-white/5 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isGoogleLoading ? 'Connecting...' : '1-Click Sign In with Google'}
          </button>
          <div id="recaptcha-container" />
        </div>
      </div>
    </div>
  );
}
