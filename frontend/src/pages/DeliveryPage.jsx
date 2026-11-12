import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSeo } from '../hooks/useSeo';

export default function DeliveryPage() {
  useSeo({
    title: 'Delivery Partner Station — Hayroo',
    description: 'Field delivery run-sheet manifest and doorstep OTP verification portal for courier agents.',
    canonicalPath: '/delivery',
  });

  const { user, isLoading: isAuthLoading, setAuthModal } = useAuthStore();
  const [manifest, setManifest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const userRole = (user?.role || '').toUpperCase();
  const isAuthorizedCourier = userRole === 'DELIVERY_PARTNER' || userRole === 'ADMIN';

  const fetchManifest = useCallback(async () => {
    if (!isAuthorizedCourier) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get('/delivery/manifest');
      setManifest(res.data?.data || { totalAssigned: 0, deliveredCount: 0, pendingCount: 0, packages: [] });
    } catch {
      setManifest({ totalAssigned: 0, deliveredCount: 0, pendingCount: 0, packages: [] });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorizedCourier]);

  useEffect(() => {
    if (isAuthorizedCourier) {
      fetchManifest();
    }
  }, [isAuthorizedCourier, fetchManifest]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 4) {
      return toast.error('Please enter the 4-digit customer OTP');
    }

    setIsVerifying(true);
    try {
      await apiClient.post(`/delivery/shipments/${selectedPackage.shipmentId}/verify-otp-delivery`, {
        deliveryOtp: otpInput,
      });

      toast.success(`Delivery verified. Package handed off to ${selectedPackage.recipientName}.`);
      setSelectedPackage(null);
      setOtpInput('');
      fetchManifest();
    } catch {
      // handled by axios interceptor
    } finally {
      setIsVerifying(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-4">
        <div className="h-16 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
        <div className="h-40 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!user || !isAuthorizedCourier) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 card text-center space-y-4">
        <div className="w-12 h-12 rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)] flex items-center justify-center mx-auto">
          <Truck className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-semibold text-[var(--color-text)]">
          Delivery Partner Access Required
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {!user
            ? 'Please sign in with an authorized Delivery Partner or Admin account to view route manifests and verify doorstep deliveries.'
            : `Your current account role (${userRole}) does not have courier dispatch permissions.`}
        </p>
        {!user && (
          <button
            type="button"
            onClick={() => setAuthModal(true, 'login')}
            className="btn-primary w-full"
          >
            Sign In to Delivery Hub
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Workspace Header Bar */}
      <div className="pb-6 border-b border-[var(--color-border)] flex justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-border)] font-medium">
              <Truck className="w-3.5 h-3.5" aria-hidden="true" />
              Active Route Run-Sheet
            </span>
            <span className="font-mono text-[11px] text-[var(--color-text-subtle)]">Hub #BLR-04</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            Amit Kumar · Field Courier Station
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Assigned Dispatch: Bangalore Central Hub
          </p>
        </div>

        <button
          type="button"
          onClick={fetchManifest}
          className="btn-secondary btn-sm shrink-0"
          title="Refresh Run-Sheet"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Structural Metrics Bar */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] grid grid-cols-3 divide-x divide-[var(--color-border)]">
        <div className="p-4 text-center space-y-0.5">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Assigned</span>
          <p className="text-xl font-semibold tabular-nums text-[var(--color-text)]">
            {manifest?.totalAssigned || 0}
          </p>
        </div>
        <div className="p-4 text-center space-y-0.5">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Delivered</span>
          <p className="text-xl font-semibold tabular-nums text-[var(--color-success)]">
            {manifest?.deliveredCount || 0}
          </p>
        </div>
        <div className="p-4 text-center space-y-0.5">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Pending</span>
          <p className="text-xl font-semibold tabular-nums text-[var(--color-warning)]">
            {manifest?.pendingCount || 0}
          </p>
        </div>
      </div>

      {/* Package Run-Sheet List */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          Doorstep Delivery Stops
        </h2>

        {(!manifest?.packages || manifest.packages.length === 0) && (
          <div className="card p-10 text-center text-xs text-[var(--color-text-muted)] space-y-1">
            <p className="font-semibold text-[var(--color-text)]">No active delivery stops</p>
            <p>Assigned dispatches and COD packages will appear here once ready for pickup.</p>
          </div>
        )}

        {manifest?.packages?.map((pkg) => (
          <div
            key={pkg.shipmentId || pkg.orderNumber}
            className="card p-5 space-y-3"
          >
            <div className="flex flex-wrap justify-between items-center pb-3 border-b border-[var(--color-border-subtle)] gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-semibold text-[var(--color-text)]">
                  #{pkg.orderNumber}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  From: {pkg.sellerBusinessName}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
                  pkg.status === 'DELIVERED'
                    ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-border)]'
                    : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-border)]'
                }`}
              >
                {pkg.status}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[var(--color-text-subtle)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{pkg.recipientName}</p>
                  <p className="text-[var(--color-text-muted)] mt-0.5">{pkg.deliveryAddress}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="flex items-center gap-1.5 text-[var(--color-text-muted)] font-mono">
                  <Phone className="w-3.5 h-3.5 text-[var(--color-text-subtle)]" aria-hidden="true" />
                  {pkg.recipientPhone}
                </span>
                <span
                  className={`font-medium px-2 py-0.5 rounded border tabular-nums ${
                    pkg.paymentType === 'CASH_ON_DELIVERY'
                      ? 'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-border)]'
                      : 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-border)]'
                  }`}
                >
                  {pkg.paymentType === 'CASH_ON_DELIVERY'
                    ? `Collect Cash: ₹${pkg.collectibleAmount?.toLocaleString('en-IN')}`
                    : 'Prepaid Order'}
                </span>
              </div>
            </div>

            {pkg.status !== 'DELIVERED' && (
              <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPackage(pkg)}
                  className="btn-primary btn-sm"
                >
                  <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                  Verify Customer OTP
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Doorstep OTP Modal */}
      {selectedPackage && (
        <div role="dialog" aria-modal="true" aria-label="Verify Doorstep Hand-off" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => {
              setSelectedPackage(null);
              setOtpInput('');
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] max-w-sm w-full p-6 shadow-[var(--shadow-lg)]">
            <div className="text-center mb-5 space-y-1.5">
              <div className="w-10 h-10 bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)] rounded-md flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">Verify Doorstep Hand-off</h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Ask <strong>{selectedPackage.recipientName}</strong> for the 4-digit delivery code sent via SMS.
              </p>
              {selectedPackage.deliveryOtpHint && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded text-[11px] font-mono text-[var(--color-text-muted)]">
                  Demo OTP: {selectedPackage.deliveryOtpHint}
                </span>
              )}
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="••••"
                className="form-input text-center text-2xl font-mono tracking-widest font-semibold"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPackage(null);
                    setOtpInput('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="btn-primary flex-1"
                >
                  {isVerifying ? 'Verifying...' : 'Confirm Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
