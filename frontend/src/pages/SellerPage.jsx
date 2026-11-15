import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  ShieldCheck,
  Plus,
  Truck,
  CheckCircle2,
  FileText,
  Barcode,
  RefreshCw,
  ShoppingBag,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';

export default function SellerPage() {
  useSeo({
    title: 'Seller Operations Portal — Hayroo',
    description: 'Merchant dashboard for order fulfillment, catalog listings, shipping labels, and escrow payouts.',
    canonicalPath: '/seller',
  });

  const { user, isLoading: isAuthLoading, setAuthModal } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [ledgerData, setLedgerData] = useState({ currentBalance: 0, unsettledEscrowBalance: 0, ledgerEntries: [] });
  const [kycData, setKycData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newBrand, setNewBrand] = useState('Apex Tech');
  const [newPrice, setNewPrice] = useState('');
  const [newMrp, setNewMrp] = useState('');
  const [newStock, setNewStock] = useState('50');
  const [newHsn] = useState('85183000');
  const [newDesc] = useState('');
  const [newImage, setNewImage] = useState('');

  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accName, setAccName] = useState('');

  const userRole = (user?.role || '').toUpperCase();
  const isAuthorizedSeller = userRole === 'SELLER' || userRole === 'ADMIN';

  const fetchSellerData = async () => {
    if (!isAuthorizedSeller) return;
    setIsLoading(true);
    try {
      const [ordersRes, prodsRes, ledgerRes, kycRes] = await Promise.all([
        apiClient.get('/seller/orders'),
        apiClient.get('/seller/products'),
        apiClient.get('/seller/ledger'),
        apiClient.get('/seller/kyc/status'),
      ]);

      setOrders(ordersRes.data?.data || []);
      setProducts(prodsRes.data?.data || []);
      setLedgerData(ledgerRes.data?.data || { currentBalance: 0, unsettledEscrowBalance: 0, ledgerEntries: [] });
      setKycData(kycRes.data?.data || { isApproved: false, kyc: { status: 'NOT_SUBMITTED' } });
    } catch {
      // handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorizedSeller) {
      fetchSellerData();
    }
  }, [isAuthorizedSeller]);

  const handleGenerateLabel = async (subOrderId) => {
    try {
      const res = await apiClient.post(`/seller/orders/${subOrderId}/generate-label`);
      toast.success(`Shipping label generated. AWB: ${res.data.data.trackingNumber}`);
      fetchSellerData();
    } catch {
      toast.error('Failed to generate shipping label');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newCategory) {
      return toast.error('Please fill required fields');
    }

    try {
      await apiClient.post('/seller/products', {
        title: newTitle,
        category: newCategory,
        brand: newBrand,
        price: Number(newPrice),
        originalPrice: newMrp ? Number(newMrp) : Number(newPrice) * 1.25,
        stock: Number(newStock),
        hsnCode: newHsn,
        description: newDesc || `${newTitle} by ${newBrand}`,
        imageLight: newImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      });

      toast.success('Product listed to catalog');
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewPrice('');
      fetchSellerData();
    } catch {
      toast.error('Failed to create product listing');
    }
  };

  const handleSubmitKyc = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/seller/kyc/submit', {
        gstinNumber: gstin,
        panNumber: pan,
        bankAccountNumber: bankAcc,
        bankIfscCode: ifsc,
        bankAccountName: accName,
      });
      toast.success('KYC documents submitted for admin verification');
      fetchSellerData();
    } catch {
      toast.error('Failed to submit KYC');
    }
  };

  const kycStatusLabel = kycData?.kyc?.status || 'NOT_SUBMITTED';

  if (isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        <div className="h-16 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
        <div className="h-40 bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!user || !isAuthorizedSeller) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 card text-center space-y-4">
        <div className="w-12 h-12 rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-lg font-semibold text-[var(--color-text)]">
          Seller Portal Access Required
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {!user
            ? 'Please sign in with an authorized Seller or Admin account to view merchant orders, catalog listings, and escrow ledgers.'
            : `Your current account role (${userRole}) does not have seller access. Sign in with a Seller account to manage a storefront.`}
        </p>
        {!user && (
          <button
            type="button"
            onClick={() => setAuthModal(true, 'login')}
            className="btn-primary w-full"
          >
            Sign In to Seller Portal
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Workspace Header Bar */}
      <div className="pb-6 border-b border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-border)] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Verified Seller ({kycStatusLabel})
            </span>
            <span className="font-mono text-[11px] text-[var(--color-text-subtle)]">
              {kycData?.storeSlug || (user?.email ? user.email.split('@')[0] : 'merchant-store')}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            {kycData?.businessName || user?.fullName || 'Seller Operations'}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Manage split sub-orders, dispatch labels, catalog SKUs, and T+7 escrow payouts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchSellerData}
            className="btn-secondary btn-sm"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Add SKU
          </button>
        </div>
      </div>

      {/* Structural KPI Strip */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-border)]">
        <div className="p-5 space-y-1">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Unsettled Escrow</span>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-warning)]">
            ₹{ledgerData.unsettledEscrowBalance.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">T+7 days post-delivery hold</span>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Settled Funds</span>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-success)]">
            ₹{ledgerData.currentBalance.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">Cleared for bank disbursement</span>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Sub-Orders</span>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-text)]">
            {orders.length}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">Segregated vendor orders</span>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Active SKUs</span>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-text)]">
            {products.length}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">Published in catalog</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--color-border)] gap-6 overflow-x-auto">
        {[
          { id: 'orders', label: `Orders (${orders.length})`, icon: Truck },
          { id: 'products', label: `Catalog (${products.length})`, icon: Package },
          { id: 'ledger', label: 'Escrow Ledger', icon: TrendingUp },
          { id: 'kyc', label: 'KYC Compliance', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-[var(--color-primary)] text-[var(--color-text)] font-semibold'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Orders Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="card p-12 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-[var(--color-text-subtle)] mx-auto" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-[var(--color-text)]">No Sub-Orders Yet</h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto">
                When shoppers buy your listed SKUs, your segregated vendor sub-orders will appear here for fulfillment and label generation.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.subOrderId || ord.subOrderNumber}
                className="card p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[var(--color-border-subtle)] gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-[var(--color-text)]">
                      #{ord.subOrderNumber}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-text-subtle)]">
                      Master: #{ord.masterOrderId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
                        ord.status === 'DELIVERED'
                          ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-border)]'
                          : ord.status === 'READY_FOR_PICKUP'
                          ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text)] border-[var(--color-border)]'
                          : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-border)]'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[11px] font-medium text-[var(--color-text-muted)]">
                      Escrow: {ord.escrowStatus || 'HELD'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-[var(--color-text-subtle)] block">
                      Customer & Destination
                    </span>
                    <p className="font-semibold text-[var(--color-text)]">
                      {ord.shippingAddress?.fullName || 'Customer'}
                    </p>
                    <p className="text-[var(--color-text-muted)]">
                      {ord.shippingAddress?.street}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                    </p>
                    <p className="text-[var(--color-text-subtle)] font-mono">
                      {ord.shippingAddress?.phone}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-[var(--color-text-subtle)] block">
                      Items
                    </span>
                    {ord.items?.map((item, idx) => (
                      <p key={idx} className="font-medium text-[var(--color-text)] tabular-nums">
                        {item.title} × {item.quantity} — ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-1 tabular-nums">
                    <span className="text-[11px] font-medium text-[var(--color-text-subtle)] block">
                      Financial Partition
                    </span>
                    <p className="text-[var(--color-text)]">
                      Subtotal: ₹{ord.subtotal?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[var(--color-error)]">
                      Commission (10%): -₹{ord.commissionAmount?.toLocaleString('en-IN')}
                    </p>
                    <p className="font-semibold text-[var(--color-success)] pt-0.5">
                      Net Payout: ₹{ord.sellerNetPayout?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-[var(--color-text-subtle)]" aria-hidden="true" />
                    <span>AWB Tracking:</span>
                    <span className="font-mono font-medium text-[var(--color-text)]">
                      {ord.shipment?.trackingNumber || 'Pending Label Generation'}
                    </span>
                  </div>

                  {ord.status !== 'READY_FOR_PICKUP' && ord.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => handleGenerateLabel(ord.subOrderId)}
                      className="btn-primary btn-sm"
                    >
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      Generate 3PL Label & AWB
                    </button>
                  )}
                  {ord.status === 'READY_FOR_PICKUP' && (
                    <span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" aria-hidden="true" />
                      Ready for Courier Pickup
                    </span>
                  )}
                  {ord.status === 'DELIVERED' && (
                    <span className="text-xs font-medium text-[var(--color-success)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Delivered & OTP Verified
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Products Table */}
      {activeTab === 'products' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex justify-between items-center">
            <h3 className="font-semibold text-sm text-[var(--color-text)]">Active Catalog Listings</h3>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn-secondary btn-sm"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              New SKU
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] font-medium border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">HSN Code</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Inventory</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {products.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-[var(--color-bg-subtle)]/60 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageLight}
                          alt=""
                          className="w-9 h-9 object-contain rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-1 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-text)] truncate max-w-xs">{p.title}</p>
                          <span className="text-[11px] text-[var(--color-text-subtle)]">{p.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{p.category}</td>
                    <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">{p.hsnCode || '85183000'}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-[var(--color-text)]">
                      ₹{p.price?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[11px] font-mono text-[var(--color-text)] tabular-nums">
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-border)] text-[11px] font-medium">
                        Published
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Ledger */}
      {activeTab === 'ledger' && (
        <div className="card p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-base text-[var(--color-text)]">Financial Settlement Ledger</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Order credits, 10% marketplace commission deductions, 1% GST TCS, and T+7 escrow releases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] space-y-3">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Cleared Balance</span>
              <p className="text-2xl font-semibold tabular-nums text-[var(--color-success)]">
                ₹{ledgerData.currentBalance?.toLocaleString('en-IN')}
              </p>
              <button
                type="button"
                onClick={() => toast.success('Payout withdrawal request submitted. Transfer clears within 24 hours.')}
                className="btn-primary btn-sm"
              >
                Withdraw to Bank Account
              </button>
            </div>

            <div className="p-5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] space-y-2">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Unsettled Escrow Balance</span>
              <p className="text-2xl font-semibold tabular-nums text-[var(--color-warning)]">
                ₹{ledgerData.unsettledEscrowBalance?.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Held under the buyer 7-day return window. Disburses automatically on T+7 post-delivery.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
              Recent Ledger Activity
            </h4>
            {Array.isArray(ledgerData.ledgerEntries) && ledgerData.ledgerEntries.length > 0 ? (
              <div className="border border-[var(--color-border)] rounded-md divide-y divide-[var(--color-border-subtle)]">
                {ledgerData.ledgerEntries.map((entry, idx) => (
                  <div key={entry._id || idx} className="p-4 flex justify-between items-center gap-4">
                    <div>
                      <p
                        className={`text-xs font-semibold tabular-nums ${
                          entry.amount >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'
                        }`}
                      >
                        {entry.amount >= 0 ? '+' : '-'} ₹{Math.abs(entry.amount || 0).toLocaleString('en-IN')} · {entry.referenceType}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        {entry.description}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--color-text-subtle)] shrink-0">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs text-[var(--color-text-muted)]">
                No ledger transactions recorded yet. Order credits and payouts will appear here automatically.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: KYC Compliance */}
      {activeTab === 'kyc' && (
        <div className="card p-6 max-w-2xl space-y-6">
          <div className="flex items-start gap-3 pb-4 border-b border-[var(--color-border)]">
            <div className="p-2 rounded-md bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-border)]">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[var(--color-text)]">GST & Business KYC</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Verified merchants qualify for automated daily payouts and national 3PL shipping coverage.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitKyc} className="space-y-4">
            <div>
              <label htmlFor="kyc-gstin" className="form-label">GSTIN Number (15 Digits)</label>
              <input
                id="kyc-gstin"
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="form-input font-mono"
              />
            </div>

            <div>
              <label htmlFor="kyc-pan" className="form-label">Company PAN (10 Characters)</label>
              <input
                id="kyc-pan"
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="form-input font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="kyc-bank" className="form-label">Bank Account Number</label>
                <input
                  id="kyc-bank"
                  type="text"
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                  className="form-input font-mono"
                />
              </div>
              <div>
                <label htmlFor="kyc-ifsc" className="form-label">Bank IFSC Code</label>
                <input
                  id="kyc-ifsc"
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="form-input font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="kyc-name" className="form-label">Beneficiary Legal Name</label>
              <input
                id="kyc-name"
                type="text"
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-primary">
              Update KYC Credentials
            </button>
          </form>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div role="dialog" aria-modal="true" aria-label="Add New SKU" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsAddModalOpen(false)} aria-hidden="true" />
          <div className="relative z-10 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] max-w-lg w-full p-6 shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border)]">
              <h3 className="text-base font-semibold text-[var(--color-text)]">List New SKU</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label htmlFor="sku-title" className="form-label form-label-required">Product Title</label>
                <input
                  id="sku-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sku-cat" className="form-label form-label-required">Category</label>
                  <select
                    id="sku-cat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Computers">Computers</option>
                    <option value="Phone & Tablets">Phone & Tablets</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Grocery & Gourmet Foods">Grocery & Gourmet Foods</option>
                    <option value="Books">Books</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sku-brand" className="form-label">Brand</label>
                  <input
                    id="sku-brand"
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="sku-price" className="form-label form-label-required">Price (₹)</label>
                  <input
                    id="sku-price"
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="26990"
                    className="form-input tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="sku-mrp" className="form-label">MRP (₹)</label>
                  <input
                    id="sku-mrp"
                    type="number"
                    value={newMrp}
                    onChange={(e) => setNewMrp(e.target.value)}
                    placeholder="34990"
                    className="form-input tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="sku-stock" className="form-label">Stock</label>
                  <input
                    id="sku-stock"
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="form-input tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sku-image" className="form-label">Image URL</label>
                <input
                  id="sku-image"
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm">
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
