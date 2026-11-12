import React, { useState } from 'react';
import { X, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';
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
  const [tab, setTab] = useState(authModalTab || 'otp');

  const [phoneInput, setPhoneInput] = useState('+919876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Scrim */}
      <div
        onClick={() => setAuthModal(false)}
        className="fixed inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[var(--color-card)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] z-10 text-[var(--color-text)] rounded-lg p-6 sm:p-7">
        <button
          type="button"
          onClick={() => setAuthModal(false)}
          className="absolute top-4 right-4 p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded hover:bg-[var(--color-bg-subtle)] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="w-8 h-8 rounded-[6px] bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-text)] font-bold text-sm mb-3">
            H
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Sign in to Hayroo</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Access orders, saved addresses, and escrow tracking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--color-border)] mb-5 gap-4">
          {[
            { id: 'otp', label: 'Phone OTP' },
            { id: 'login', label: 'Email' },
            { id: 'register', label: 'Create Account' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
                tab === item.id
                  ? 'border-[var(--color-primary)] text-[var(--color-text)] font-semibold'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 1. Phone OTP Form */}
        {tab === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="auth-phone-input" className="form-label">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      id="auth-phone-input"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+919876543210"
                      className="form-input pl-9"
                    />
                  </div>
                  <p className="form-hint">
                    We will send a 6-digit verification code via SMS.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isOtpLoading}
                  className="btn-primary w-full"
                >
                  {isOtpLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-2">
                  <span className="text-xs text-[var(--color-text-muted)]">Enter code sent to {phoneInput}</span>
                  <span className="block text-[11px] font-mono text-[var(--color-primary)] mt-0.5">
                    Demo OTP: 582914
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="••••••"
                    className="form-input text-center text-xl font-mono tracking-widest font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isOtpLoading}
                  className="btn-primary w-full"
                >
                  {isOtpLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Use a different phone number
                </button>
              </form>
            )}
          </div>
        )}

        {/* 2. Email Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
            <div>
              <label htmlFor="auth-login-email" className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="auth-login-email"
                  type="email"
                  {...loginRegister('email')}
                  placeholder="name@domain.com"
                  className="form-input pl-9"
                />
              </div>
              {loginErrors.email && <p className="form-error">{loginErrors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="auth-login-password" className="form-label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="auth-login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  {...loginRegister('password')}
                  placeholder="••••••••"
                  className="form-input pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
                  aria-label="Toggle password visibility"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginErrors.password && <p className="form-error">{loginErrors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoginSubmitting}
              className="btn-primary w-full"
            >
              {isLoginSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* 3. Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegSubmit(onRegister)} className="space-y-3.5">
            <div>
              <label htmlFor="auth-reg-name" className="form-label">Full Name</label>
              <input
                id="auth-reg-name"
                type="text"
                {...regRegister('name')}
                placeholder="Rohan Sharma"
                className="form-input"
              />
              {regErrors.name && <p className="form-error">{regErrors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="auth-reg-email" className="form-label">Email</label>
              <input
                id="auth-reg-email"
                type="email"
                {...regRegister('email')}
                placeholder="name@domain.com"
                className="form-input"
              />
              {regErrors.email && <p className="form-error">{regErrors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="auth-reg-phone" className="form-label">Mobile Phone</label>
                <input
                  id="auth-reg-phone"
                  type="tel"
                  {...regRegister('phone')}
                  placeholder="+919876543210"
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="auth-reg-role" className="form-label">Account Type</label>
                <select
                  id="auth-reg-role"
                  {...regRegister('role')}
                  className="form-select"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="SELLER">Seller / Vendor</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="auth-reg-password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="auth-reg-password"
                  type={showRegPassword ? 'text' : 'password'}
                  {...regRegister('password')}
                  placeholder="••••••••"
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-2.5 text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
                  aria-label="Toggle password visibility"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regErrors.password && <p className="form-error">{regErrors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isRegSubmitting}
              className="btn-primary w-full mt-1"
            >
              {isRegSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Social / Google Login */}
        <div className="mt-5 pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="btn-secondary w-full text-xs"
          >
            {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>
          <div id="recaptcha-container" />
        </div>
      </div>
    </div>
  );
}
