import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  ShieldCheck,
  Plus,
  Truck,
  CheckCircle2,
  FileText,
  RefreshCw,
  ShoppingBag,
  X,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';

const STANDARD_CATEGORIES = [
  'Electronics',
  'Computers',
  'Phone & Tablets',
  'Fashion & Apparel',
  'Grocery & Gourmet Foods',
  'Books',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Automotive',
];

export default function SellerPage() {
  useSeo({
    title: 'Seller Operations Portal — Hayroo',
    description: 'Merchant dashboard for order fulfillment, catalog listings, shipping labels, and escrow payouts.',
    canonicalPath: '/seller',
  });

  const { user, isLoading: isAuthLoading, setAuthModal } = useAuthStore();
  const [activeTab, setActiveTab] = useState('products'); // default to catalog per user workflow
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [ledgerData, setLedgerData] = useState({ currentBalance: 0, unsettledEscrowBalance: 0, ledgerEntries: [] });
  const [kycData, setKycData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Catalog search & filter state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('ALL');
  const [catalogStockFilter, setCatalogStockFilter] = useState('ALL');

  // Add / Edit Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form Fields
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('Electronics');
  const [prodBrand, setProdBrand] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodMrp, setProdMrp] = useState('');
  const [prodStock, setProdStock] = useState('50');
  const [prodHsn, setProdHsn] = useState('85183000');
  const [prodDiscountTag, setProdDiscountTag] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');

  // Delete Confirmation Modal state
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // KYC state
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
        apiClient.get('/seller/orders').catch(() => ({ data: { data: [] } })),
        apiClient.get('/seller/products').catch(() => ({ data: { data: [] } })),
        apiClient.get('/seller/ledger').catch(() => ({ data: { data: { currentBalance: 0, unsettledEscrowBalance: 0, ledgerEntries: [] } } })),
        apiClient.get('/seller/kyc/status').catch(() => ({ data: { data: { isApproved: false, kyc: { status: 'NOT_SUBMITTED' } } } })),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorizedSeller]);

  // Open modal in Add mode
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdCategory('Electronics');
    setProdBrand(kycData?.businessName || user?.fullName || 'Official Seller');
    setProdPrice('');
    setProdMrp('');
    setProdStock('50');
    setProdHsn('85183000');
    setProdDiscountTag('');
    setProdDesc('');
    setProdImage('');
    setIsProductModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setProdTitle(p.title || '');
    setProdCategory(p.category || 'Electronics');
    setProdBrand(p.brand || '');
    setProdPrice(p.price !== undefined ? String(p.price) : '');
    setProdMrp(p.originalPrice !== undefined ? String(p.originalPrice) : '');
    setProdStock(p.stock !== undefined ? String(p.stock) : '50');
    setProdHsn(p.hsnCode || '85183000');
    setProdDiscountTag(p.discountTag || '');
    setProdDesc(p.description || '');
    setProdImage(p.imageLight || '');
    setIsProductModalOpen(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodTitle.trim() || !prodPrice || !prodCategory) {
      return toast.error('Please enter product title, price, and category');
    }
    const numPrice = Number(prodPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      return toast.error('Please enter a valid price greater than 0');
    }

    setIsSubmittingProduct(true);
    const payload = {
      title: prodTitle.trim(),
      category: prodCategory,
      brand: prodBrand.trim() || kycData?.businessName || user?.fullName || 'Merchant',
      price: numPrice,
      originalPrice: prodMrp ? Number(prodMrp) : numPrice * 1.25,
      stock: Number(prodStock) || 0,
      hsnCode: prodHsn.trim() || '85183000',
      discountTag: prodDiscountTag.trim(),
      description: prodDesc.trim() || `${prodTitle.trim()} by ${prodBrand || 'Seller'}`,
      imageLight: prodImage.trim() || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    };

    try {
      if (editingProduct) {
        await apiClient.put(`/seller/products/${editingProduct._id || editingProduct.id}`, payload);
        toast.success(`"${payload.title}" updated successfully!`);
      } else {
        await apiClient.post('/seller/products', payload);
        toast.success(`"${payload.title}" added to site catalog!`);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchSellerData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product listing');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Handle direct file upload for product image
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('image', file);
    setIsUploadingImage(true);

    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data?.data?.url || res.data?.url;
      if (uploadedUrl) {
        setProdImage(uploadedUrl);
        toast.success('Product image uploaded successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. You can also paste an Image URL directly.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Delete product confirmation execution
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const pId = deletingProduct._id || deletingProduct.id;
      await apiClient.delete(`/seller/products/${pId}`);
      toast.success(`"${deletingProduct.title}" removed from marketplace!`);
      setDeletingProduct(null);
      fetchSellerData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateLabel = async (subOrderId) => {
    try {
      const res = await apiClient.post(`/seller/orders/${subOrderId}/generate-label`);
      toast.success(`Shipping label generated. AWB: ${res.data.data.trackingNumber}`);
      fetchSellerData();
    } catch {
      toast.error('Failed to generate shipping label');
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

  // Filter products by search and dropdowns
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !catalogSearch.trim() ||
      p.title?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.brand?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.hsnCode?.includes(catalogSearch);

    const matchesCategory = catalogCategory === 'ALL' || p.category === catalogCategory;

    let matchesStock = true;
    if (catalogStockFilter === 'IN_STOCK') {
      matchesStock = Number(p.stock) > 10;
    } else if (catalogStockFilter === 'LOW_STOCK') {
      matchesStock = Number(p.stock) > 0 && Number(p.stock) <= 10;
    } else if (catalogStockFilter === 'OUT_OF_STOCK') {
      matchesStock = Number(p.stock) === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const inStockCount = products.filter((p) => Number(p.stock) > 10).length;
  const lowStockCount = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10).length;
  const outOfStockCount = products.filter((p) => Number(p.stock) === 0).length;

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
          <ShieldCheck className="w-6 h-6 shrink-0" aria-hidden="true" />
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
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
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
            Easily list, edit, or remove catalog products, fulfill orders, and monitor T+7 escrow payouts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchSellerData}
            className="btn-secondary btn-sm"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Structural KPI Strip */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-border)]">
        <div className="p-5 space-y-1">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Active Catalog SKUs</span>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-text)]">
            {products.length}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">
            {inStockCount} in-stock · {lowStockCount} low-stock · {outOfStockCount} out-of-stock
          </span>
        </div>

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
          <span className="text-[11px] text-[var(--color-text-subtle)] block">Cleared for bank transfer</span>
        </div>

        <div className="p-5 space-y-1">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Vendor Orders</span>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-text)]">
            {orders.length}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">Customer order shipments</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--color-border)] gap-6 overflow-x-auto">
        {[
          { id: 'products', label: `Manage Products (${products.length})`, icon: Package },
          { id: 'orders', label: `Fulfillment Orders (${orders.length})`, icon: Truck },
          { id: 'ledger', label: 'Escrow Ledger', icon: TrendingUp },
          { id: 'kyc', label: 'KYC & GST Compliance', icon: ShieldCheck },
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
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Products Management (Add, Edit, Remove, Search, Filter) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Filter Toolbar */}
          <div className="card p-4 bg-[var(--color-bg-subtle)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search input with centered icon and zero text overlap */}
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Search products by title, brand, HSN..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="form-input text-xs pl-10 pr-3 py-2"
                />
                <Search className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" aria-hidden="true" />
              </div>

              {/* Category Dropdown */}
              <select
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                className="form-select text-xs py-2 w-full sm:w-44"
              >
                <option value="ALL">All Categories</option>
                {STANDARD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Stock Filter Dropdown */}
              <select
                value={catalogStockFilter}
                onChange={(e) => setCatalogStockFilter(e.target.value)}
                className="form-select text-xs py-2 w-full sm:w-40"
              >
                <option value="ALL">All Stock Status</option>
                <option value="IN_STOCK">In Stock (&gt;10)</option>
                <option value="LOW_STOCK">Low Stock (1-10)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn-primary btn-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Add Product
            </button>
          </div>

          {/* Product Listings Table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-card)]">
              <span className="text-xs font-semibold text-[var(--color-text)]">
                Showing {filteredProducts.length} of {products.length} Products
              </span>
              {(catalogSearch || catalogCategory !== 'ALL' || catalogStockFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setCatalogSearch('');
                    setCatalogCategory('ALL');
                    setCatalogStockFilter('ALL');
                  }}
                  className="text-xs text-[var(--color-primary)] hover:underline font-medium"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Package className="w-10 h-10 text-[var(--color-text-subtle)] mx-auto" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-[var(--color-text)]">No Products Found</h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                  {products.length === 0
                    ? 'You have not added any products to the site yet. Click "Add Product" above to publish your first SKU.'
                    : 'No products match your current search or filters.'}
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="btn-primary btn-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] font-medium border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">HSN Code</th>
                      <th className="px-4 py-3">Price & MRP</th>
                      <th className="px-4 py-3">Stock Units</th>
                      <th className="px-4 py-3">Catalog Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-subtle)]">
                    {filteredProducts.map((p) => {
                      const numStock = Number(p.stock) || 0;
                      const isLowStock = numStock > 0 && numStock <= 10;
                      const isOutOfStock = numStock === 0;

                      return (
                        <tr key={p._id || p.id} className="hover:bg-[var(--color-bg-subtle)]/50 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageLight || '/favicon.svg'}
                                alt=""
                                className="w-10 h-10 object-contain rounded bg-[var(--color-card)] border border-[var(--color-border)] p-1 shrink-0"
                              />
                              <div className="min-w-0 max-w-xs">
                                <p className="font-semibold text-[var(--color-text)] truncate">{p.title}</p>
                                <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-subtle)]">
                                  <span>{p.brand || 'Official'}</span>
                                  {p.discountTag && (
                                    <span className="px-1 py-0.2 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold text-[10px]">
                                      {p.discountTag}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-[var(--color-text-muted)]">{p.category}</td>
                          <td className="px-4 py-3 font-mono text-[var(--color-text-muted)]">{p.hsnCode || '85183000'}</td>

                          <td className="px-4 py-3">
                            <div className="tabular-nums">
                              <span className="font-bold text-[var(--color-text)] text-sm">
                                ₹{p.price?.toLocaleString('en-IN')}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-[11px] text-[var(--color-text-subtle)] line-through ml-1.5">
                                  ₹{p.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded border text-[11px] font-mono font-medium tabular-nums inline-flex items-center gap-1 ${
                                isOutOfStock
                                  ? 'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error)]/30'
                                  : isLowStock
                                  ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning)]/30'
                                  : 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-border)]'
                              }`}
                            >
                              {isOutOfStock ? '0 units (Sold out)' : `${numStock} in stock`}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-border)] text-[11px] font-medium inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                              Live on Site
                            </span>
                          </td>

                          {/* Quick Action Buttons: View, Edit, Remove */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. View live on store */}
                              <Link
                                to={`/product/${p.slug || p._id || p.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                                title="View live on website"
                                aria-label={`View ${p.title} live on website`}
                              >
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              </Link>

                              {/* 2. Edit SKU */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(p)}
                                className="p-1.5 rounded hover:bg-[var(--color-primary-light)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                                title="Edit product details"
                                aria-label={`Edit ${p.title}`}
                              >
                                <Edit2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              </button>

                              {/* 3. Remove SKU from site */}
                              <button
                                type="button"
                                onClick={() => setDeletingProduct(p)}
                                className="p-1.5 rounded hover:bg-[var(--color-error-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                                title="Remove product from website"
                                aria-label={`Remove ${p.title} from catalog`}
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Orders Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="card p-12 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-[var(--color-text-subtle)] mx-auto shrink-0" aria-hidden="true" />
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
                        {item.quantity}x {item.title} (₹{item.price?.toLocaleString('en-IN')})
                      </p>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-[var(--color-text-subtle)] block">
                      Financials
                    </span>
                    <p className="text-[var(--color-text-muted)]">
                      Subtotal: <span className="font-semibold text-[var(--color-text)] tabular-nums">₹{ord.subtotal?.toLocaleString('en-IN')}</span>
                    </p>
                    <p className="text-[var(--color-text-muted)]">
                      Commission (10%): <span className="tabular-nums">-₹{ord.commissionAmount?.toLocaleString('en-IN')}</span>
                    </p>
                    <p className="font-semibold text-[var(--color-success)] text-sm tabular-nums">
                      Net Payout: ₹{ord.sellerNetPayout?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                  <div className="text-[11px] text-[var(--color-text-subtle)] font-mono">
                    {ord.shipment?.trackingNumber && `AWB: ${ord.shipment.trackingNumber}`}
                  </div>

                  {ord.status !== 'READY_FOR_PICKUP' && ord.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => handleGenerateLabel(ord.subOrderId)}
                      className="btn-primary btn-sm flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      Generate 3PL Label & AWB
                    </button>
                  )}
                  {ord.status === 'READY_FOR_PICKUP' && (
                    <span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                      Ready for Courier Pickup
                    </span>
                  )}
                  {ord.status === 'DELIVERED' && (
                    <span className="text-xs font-medium text-[var(--color-success)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" aria-hidden="true" />
                      Delivered & OTP Verified
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
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
              <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
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

      {/* Unified Add & Edit Product Modal */}
      {isProductModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsProductModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] max-w-xl w-full p-6 shadow-[var(--shadow-lg)] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-border)]">
              <div>
                <h3 id="product-modal-title" className="text-base font-semibold text-[var(--color-text)]">
                  {editingProduct ? 'Edit Catalog Product' : 'List New Product on Hayroo'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {editingProduct
                    ? 'Update price, stock, or descriptions for this SKU.'
                    : 'Add a new product to be discovered by shoppers across India.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded hover:bg-[var(--color-bg-subtle)]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 shrink-0" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Title */}
              <div>
                <label htmlFor="sku-title" className="form-label form-label-required">Product Title</label>
                <input
                  id="sku-title"
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Noise Cancelling Headphones"
                  className="form-input"
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sku-cat" className="form-label form-label-required">Category</label>
                  <select
                    id="sku-cat"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="form-select"
                  >
                    {STANDARD_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sku-brand" className="form-label">Brand Name</label>
                  <input
                    id="sku-brand"
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="e.g. Sony, Apple, Nike"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="sku-price" className="form-label form-label-required">Selling Price (₹)</label>
                  <input
                    id="sku-price"
                    type="number"
                    required
                    min="1"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="26990"
                    className="form-input tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="sku-mrp" className="form-label">MRP (₹)</label>
                  <input
                    id="sku-mrp"
                    type="number"
                    value={prodMrp}
                    onChange={(e) => setProdMrp(e.target.value)}
                    placeholder="34990"
                    className="form-input tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="sku-stock" className="form-label form-label-required">Stock Units</label>
                  <input
                    id="sku-stock"
                    type="number"
                    required
                    min="0"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="50"
                    className="form-input tabular-nums"
                  />
                </div>
              </div>

              {/* HSN & Discount Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sku-hsn" className="form-label">GST HSN Code</label>
                  <input
                    id="sku-hsn"
                    type="text"
                    value={prodHsn}
                    onChange={(e) => setProdHsn(e.target.value)}
                    placeholder="85183000"
                    className="form-input font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="sku-tag" className="form-label">Badge / Discount Tag (Optional)</label>
                  <input
                    id="sku-tag"
                    type="text"
                    value={prodDiscountTag}
                    onChange={(e) => setProdDiscountTag(e.target.value)}
                    placeholder="e.g. 15% OFF, HOT, NEW"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Image Input & Upload */}
              <div className="space-y-2">
                <label htmlFor="sku-image" className="form-label">Product Image</label>
                <div className="flex gap-2">
                  <input
                    id="sku-image"
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="Paste image URL (https://images.unsplash.com/...)"
                    className="form-input text-xs flex-1"
                  />
                  <label className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileUpload}
                      className="sr-only"
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>

                {/* Instant Image Preview */}
                {prodImage && (
                  <div className="relative mt-2 p-2 border border-[var(--color-border)] rounded-md bg-[var(--color-bg-subtle)] flex items-center gap-3">
                    <img
                      src={prodImage}
                      alt="Preview"
                      className="w-14 h-14 object-contain rounded bg-[var(--color-card)] border border-[var(--color-border)]"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-medium text-[var(--color-text)] block">Image preview ready</span>
                      <span className="text-[10px] text-[var(--color-text-subtle)] truncate block">{prodImage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProdImage('')}
                      className="p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-error)]"
                      title="Clear image"
                    >
                      <X className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="sku-desc" className="form-label">Product Description</label>
                <textarea
                  id="sku-desc"
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Detail key specifications, warranty terms, and box contents..."
                  className="form-textarea text-xs"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-secondary btn-sm"
                  disabled={isSubmittingProduct}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  {isSubmittingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />}
                  <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deletingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => !isDeleting && setDeletingProduct(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] max-w-md w-full p-6 shadow-[var(--shadow-lg)] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-error-bg)] text-[var(--color-error)] flex items-center justify-center shrink-0 border border-[var(--color-error)]/30">
                <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              </div>
              <div>
                <h3 id="delete-dialog-title" className="text-base font-semibold text-[var(--color-text)]">
                  Remove Product from Site?
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  Are you sure you want to delete this listing? It will be removed immediately from the public catalog, search results, and categories.
                </p>
              </div>
            </div>

            {/* Product item preview */}
            <div className="p-3 bg-[var(--color-bg-subtle)] rounded-md border border-[var(--color-border)] flex items-center gap-3">
              <img
                src={deletingProduct.imageLight || '/favicon.svg'}
                alt=""
                className="w-11 h-11 object-contain rounded bg-[var(--color-card)] border border-[var(--color-border)] p-1 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--color-text)] truncate">{deletingProduct.title}</p>
                <p className="text-[11px] text-[var(--color-text-subtle)] tabular-nums">
                  ₹{deletingProduct.price?.toLocaleString('en-IN')} · {deletingProduct.category}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="btn-secondary btn-sm"
              >
                Keep Product
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="btn-danger btn-sm flex items-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />}
                <span>{isDeleting ? 'Removing...' : 'Yes, Remove Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
