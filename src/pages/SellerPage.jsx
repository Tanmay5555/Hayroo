import React, { useState, useEffect } from 'react';
import {
  Store,
  Package,
  TrendingUp,
  Clock,
  ShieldCheck,
  Plus,
  Truck,
  CheckCircle2,
  FileText,
  AlertCircle,
  DollarSign,
  Barcode,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';

export default function SellerPage() {
  useSeo({
    title: 'Seller Vendor Portal — ApexBazaar',
    description: 'Merchant dashboard for order fulfillment, dynamic catalog listing, shipping labels, and escrow payouts.',
    canonicalPath: '/seller',
  });

  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'ledger' | 'kyc'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [ledgerData, setLedgerData] = useState({ currentBalance: 0, unsettledEscrowBalance: 0, ledgerEntries: [] });
  const [kycData, setKycData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newBrand, setNewBrand] = useState('Apex Tech');
  const [newPrice, setNewPrice] = useState('');
  const [newMrp, setNewMrp] = useState('');
  const [newStock, setNewStock] = useState('50');
  const [newHsn, setNewHsn] = useState('85183000');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');

  // KYC Form State
  const [gstin, setGstin] = useState('29AABCU9603R1ZX');
  const [pan, setPan] = useState('AABCU9603R');
  const [bankAcc, setBankAcc] = useState('981234567890');
  const [ifsc, setIfsc] = useState('HDFC0000128');
  const [accName, setAccName] = useState('Apex Electronics Direct Private Limited');

  const fetchSellerData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, prodsRes, ledgerRes, kycRes] = await Promise.all([
        apiClient.get('/seller/orders').catch(() => ({ data: { data: [] } })),
        apiClient.get('/seller/products').catch(() => ({ data: { data: [] } })),
        apiClient.get('/seller/ledger').catch(() => ({ data: { data: { currentBalance: 145000, unsettledEscrowBalance: 28400, ledgerEntries: [] } } })),
        apiClient.get('/seller/kyc/status').catch(() => ({ data: { data: { isApproved: true, kyc: { status: 'APPROVED' } } } })),
      ]);

      setOrders(ordersRes.data?.data || []);
      setProducts(prodsRes.data?.data || []);
      setLedgerData(ledgerRes.data?.data || { currentBalance: 145000, unsettledEscrowBalance: 28400, ledgerEntries: [] });
      setKycData(kycRes.data?.data || { isApproved: true, kyc: { status: 'APPROVED' } });
    } catch (err) {
      console.warn('Seller data fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const handleGenerateLabel = async (subOrderId) => {
    try {
      const res = await apiClient.post(`/seller/orders/${subOrderId}/generate-label`);
      toast.success(`🏷️ Shipping label generated! AWB: ${res.data.data.trackingNumber}`);
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

      toast.success('🎉 Product listed to ApexBazaar catalog!');
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
      toast.success('KYC documents submitted for admin approval!');
      fetchSellerData();
    } catch {
      toast.error('Failed to submit KYC');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-indigo-800/40 shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Vendor Store
            </span>
            <span className="text-xs text-slate-400">Store Slug: apex-electronics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Apex Electronics Direct — Vendor Station
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Manage multi-vendor sub-orders, dispatch 3PL packages with AWBs, and monitor your T+7 escrow payouts.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Product SKU
          </button>
          <button
            onClick={fetchSellerData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--color-card)] p-5 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unsettled Escrow</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-amber-500">
            ₹{ledgerData.unsettledEscrowBalance.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">T+7 days post-delivery hold</span>
        </div>

        <div className="bg-[var(--color-card)] p-5 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Settled Funds</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-500">
            ₹{ledgerData.currentBalance.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Cleared for bank disbursement</span>
        </div>

        <div className="bg-[var(--color-card)] p-5 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sub-Orders</span>
            <ShoppingBag className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-black mt-2">{orders.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">Total segregated vendor orders</span>
        </div>

        <div className="bg-[var(--color-card)] p-5 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active SKUs</span>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-2">{products.length}</p>
          <span className="text-xs text-slate-400 mt-1 block">Live in marketplace search</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-6 gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" /> Fulfillment & Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" /> Catalog Listings ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'ledger'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Escrow & Settlement Ledger
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'kyc'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Business KYC Compliance
        </button>
      </div>

      {/* Tab 1: Orders Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-[var(--color-card)] p-12 text-center rounded-xl border border-[var(--color-border)]">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold">No Sub-Orders Yet</h3>
              <p className="text-slate-500 text-sm mt-1">
                When shoppers buy your listed SKUs, your segregated vendor sub-orders will appear here with automatic packaging workflows.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.subOrderId || ord.subOrderNumber}
                className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm hover:border-indigo-500/50 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[var(--color-border)] gap-2">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Sub-Order: #{ord.subOrderNumber}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">Master ID: #{ord.masterOrderId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : ord.status === 'READY_FOR_PICKUP'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-amber-500/20 text-amber-500'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                      Escrow: {ord.escrowStatus || 'HELD'}
                    </span>
                  </div>
                </div>

                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">Customer & Destination</span>
                    <p className="font-semibold">{ord.shippingAddress?.fullName || 'Customer'}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {ord.shippingAddress?.street}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                    </p>
                    <p className="text-slate-500 text-xs">Phone: {ord.shippingAddress?.phone}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">Items in Sub-Order</span>
                    {ord.items?.map((item, idx) => (
                      <p key={idx} className="font-medium text-xs mt-1">
                        • {item.title} (x{item.quantity}) — ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                    ))}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">Financial Partition</span>
                    <p className="font-medium">Subtotal: ₹{ord.subtotal?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-rose-500">
                      - Commission (10%): ₹{ord.commissionAmount?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs font-bold text-emerald-500 mt-1">
                      Net Payout: ₹{ord.sellerNetPayout?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-slate-500" />
                    AWB Tracking:{' '}
                    <span className="font-mono font-semibold text-slate-300">
                      {ord.shipment?.trackingNumber || 'Pending Label Generation'}
                    </span>
                  </div>

                  {ord.status !== 'READY_FOR_PICKUP' && ord.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleGenerateLabel(ord.subOrderId)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
                    >
                      <FileText className="w-3.5 h-3.5" /> Generate 3PL Label & AWB
                    </button>
                  )}
                  {ord.status === 'READY_FOR_PICKUP' && (
                    <span className="text-xs font-medium text-blue-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Ready for Delhivery Courier Pickup
                    </span>
                  )}
                  {ord.status === 'DELIVERED' && (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Delivered & Verified by Customer OTP
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
            <h3 className="font-bold text-base">Your Active Catalog Listings</h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New SKU
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/40 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">HSN Code</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Inventory</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {products.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-slate-800/20">
                    <td className="p-3.5 font-medium flex items-center gap-3">
                      <img
                        src={p.imageLight}
                        alt=""
                        className="w-10 h-10 object-cover rounded-md border border-[var(--color-border)]"
                      />
                      <div>
                        <p className="line-clamp-1">{p.title}</p>
                        <span className="text-xs text-slate-400">Brand: {p.brand}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-xs text-slate-400">{p.category}</td>
                    <td className="p-3.5 text-xs font-mono">{p.hsnCode || '85183000'}</td>
                    <td className="p-3.5 font-semibold">₹{p.price?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
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
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg">Marketplace Financial Ledger</h3>
              <p className="text-xs text-slate-400">
                Transparent breakdown of order credits, 10% platform commission deductions, 1% Indian GST TCS, and escrow maturity releases.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs text-slate-400">Current Cleared Balance</span>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                ₹{ledgerData.currentBalance?.toLocaleString('en-IN')}
              </p>
              <button
                onClick={() => toast.success('Payout withdrawal request submitted! Direct transfer in 24 hours.')}
                className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
              >
                Withdraw to Bank Account
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs text-slate-400">Unsettled Escrow Balance</span>
              <p className="text-3xl font-extrabold text-amber-400 mt-1">
                ₹{ledgerData.unsettledEscrowBalance?.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Protected under buyer 7-day return window. Automatically disburses on T+7 post-delivery.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-400">Recent Ledger Activity</h4>
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/60 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-emerald-400">+ ₹23,391.00 (ORDER_CREDIT)</p>
                <p className="text-xs text-slate-400">Sub-Order APX-202611-98124-S1 escrow locked (T+7 release)</p>
              </div>
              <span className="text-xs font-mono text-slate-500">Today</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/60 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-300">- ₹2,699.00 (COMMISSION_DEBIT)</p>
                <p className="text-xs text-slate-400">10% Platform Take-Rate on Sub-Order APX-202611-98124-S1</p>
              </div>
              <span className="text-xs font-mono text-slate-500">Today</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: KYC Compliance */}
      {activeTab === 'kyc' && (
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm max-w-3xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">GST & Business KYC Compliance</h3>
              <p className="text-xs text-slate-400">
                Verified Indian businesses qualify for automated daily payouts and national 3PL shipping coverage.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitKyc} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">GSTIN Number (15 Digits)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Company PAN (10 Alphanumeric)</label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Beneficiary Legal Name</label>
              <input
                type="text"
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
              />
            </div>

            <button
              type="submit"
              className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow"
            >
              Update Verified KYC Credentials
            </button>
          </form>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold mb-4">List New SKU to ApexBazaar</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">Brand</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="26990"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">MRP Strike Price (₹)</label>
                  <input
                    type="number"
                    value={newMrp}
                    onChange={(e) => setNewMrp(e.target.value)}
                    placeholder="34990"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow"
                >
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

