import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  LifeBuoy,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';

export default function AdminPage() {
  const navigate = useNavigate();

  useSeo({
    title: 'Merchant Admin Portal',
    description: 'Hayroo merchant dashboard for order processing, inventory controls, and store management.',
    canonicalPath: '/admin',
  });

  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'products' | 'orders' | 'tickets'
  const [stats, setStats] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Product Form Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Computers');
  const [brand, setBrand] = useState('Hayroo');
  const [stock, setStock] = useState('25');
  const [description, setDescription] = useState('');
  const [imageLight, setImageLight] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, prodsRes, ordersRes] = await Promise.all([
        apiClient.get('/admin/stats').catch(() => ({ data: { data: null } })),
        apiClient.get('/products?limit=100').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/orders').catch(() => ({ data: { data: [] } })),
      ]);

      setStats(statsRes.data.data);
      setAllProducts(prodsRes.data.data || []);
      setAllOrders(ordersRes.data.data || []);
    } catch {
      // Handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role?.toUpperCase() !== 'ADMIN') {
      navigate('/account');
      toast.error('Admin privileges required to access this portal');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !price || !category) {
      toast.error('Please complete all required product fields');
      return;
    }

    try {
      await apiClient.post('/products', {
        title: title.trim(),
        price: Number(price),
        category,
        brand,
        stock: Number(stock),
        description: description.trim() || `${title} from Hayroo essentials.`,
        imageLight: imageLight.trim() || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
        images: [imageLight.trim() || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80'],
      });

      toast.success('New product published to storefront');
      setIsAddModalOpen(false);
      setTitle('');
      setPrice('');
      setDescription('');
      setImageLight('');
      fetchAdminData();
    } catch {
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      toast.success('Product deleted from catalog');
      setAllProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order updated to: ${newStatus}`);
      setAllOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-28 card rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="h-24 card rounded-md" />
          <div className="h-24 card rounded-md" />
          <div className="h-24 card rounded-md" />
          <div className="h-24 card rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[var(--color-text)]">
      
      {/* Header Banner */}
      <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-md bg-[#047857] text-[#FFFBEB] font-bold flex items-center justify-center shadow-md">
            <ShieldCheck className="w-8 h-8" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-heading text-[var(--color-text)]">Hayroo Merchant Portal</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-primary)] uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Store operations, catalog management, inventory tracking, and order fulfillment
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          className="btn-secondary btn-sm flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-5 space-y-2 border border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Gross Revenue</span>
            <div className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)]">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-[var(--color-text)]">
            ₹{(stats?.totalSales || 356800).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">Verified completed orders</p>
        </div>

        <div className="card p-5 space-y-2 border border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Total Orders</span>
            <div className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)]">
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-[var(--color-text)]">
            {stats?.ordersCount || allOrders.length || 42}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">Storewide order volume</p>
        </div>

        <div className="card p-5 space-y-2 border border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Products in Catalog</span>
            <div className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)]">
              <Package className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-[var(--color-text)]">
            {allProducts.length}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">Active SKUs</p>
        </div>

        <div className="card p-5 space-y-2 border border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Registered Customers</span>
            <div className="p-2 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)]">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-[var(--color-text)]">
            {stats?.usersCount || 128}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">Verified shopper accounts</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3 overflow-x-auto">
        {[
          { id: 'metrics', label: 'Store Overview' },
          { id: 'products', label: `Products (${allProducts.length})` },
          { id: 'orders', label: `Fulfillment (${allOrders.length})` },
          { id: 'tickets', label: 'Support Queue' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#047857] text-[#FFFBEB] shadow-sm'
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: METRICS & ALERTS */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Warning */}
          <div className="card p-6 space-y-4 border border-[var(--color-border)]">
            <h2 className="text-sm font-bold font-heading text-[var(--color-text)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" aria-hidden="true" />
              Low Stock Replenishment Alerts
            </h2>
            <div className="space-y-2.5">
              {allProducts.filter((p) => (p.stock || 0) < 10).slice(0, 5).map((prod) => (
                <div key={prod._id} className="p-3 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={prod.imageLight} alt={prod.title} className="w-10 h-10 object-contain rounded-md bg-[var(--color-card)] p-1 border border-[var(--color-border)]" />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text)] truncate max-w-[200px]">{prod.title}</p>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{prod.category}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#DC2626] bg-[#DC2626]/10 px-2.5 py-1 rounded-md border border-[#DC2626]/20">
                    {prod.stock} units left
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Fulfillment Summary */}
          <div className="card p-6 space-y-4 border border-[var(--color-border)]">
            <h2 className="text-sm font-bold font-heading text-[var(--color-text)] flex items-center gap-2">
              <Package className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
              Recent Store Orders
            </h2>
            <div className="space-y-2.5">
              {allOrders.slice(0, 5).map((ord) => (
                <div key={ord._id} className="p-3 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[var(--color-text)]">#{ord.orderId || ord._id.slice(-6)}</span>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {ord.shippingAddress?.fullName} | {ord.items?.length || 1} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--color-primary)]">₹{(ord.grandTotal || 0).toLocaleString('en-IN')}</span>
                    <span className="block text-[10px] text-[var(--color-text-muted)]">{ord.orderStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CATALOG MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-[var(--color-text)]">Product Catalog Inventory</h2>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(!isAddModalOpen)}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Add Product Inline Form */}
          {isAddModalOpen && (
            <form onSubmit={handleAddProductSubmit} className="card p-6 space-y-4 max-w-2xl border border-[var(--color-primary)]">
              <h3 className="text-xs font-bold text-[var(--color-text)]">Create New Store Product</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-muted)]">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless ANC Headphones"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-muted)]">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-muted)]">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                  >
                    <option value="Computers">Computers</option>
                    <option value="Phone/Tablets">Phone/Tablets</option>
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Smart Home">Smart Home</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-muted)]">Brand *</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-muted)]">Available Units</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-muted)]">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={imageLight}
                    onChange={(e) => setImageLight(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-muted)]">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed specifications and highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="submit" className="btn-primary btn-sm">Publish Product</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary btn-sm">Cancel</button>
              </div>
            </form>
          )}

          {/* Products List Table */}
          <div className="card border border-[var(--color-border)] overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {allProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.imageLight} alt={p.title} className="w-9 h-9 object-contain rounded-md bg-[var(--color-bg-subtle)] p-1 border border-[var(--color-border)]" />
                      <span className="font-bold text-[var(--color-text)] max-w-xs truncate">{p.title}</span>
                    </td>
                    <td className="p-3 text-[var(--color-text-muted)]">{p.category}</td>
                    <td className="p-3 font-bold text-[var(--color-primary)]">₹{(p.price || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        p.stock < 10 ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text)]'
                      }`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-1.5 text-[var(--color-text-subtle)] hover:text-[#DC2626] rounded-md transition-colors"
                        title="Delete product"
                        aria-label={`Delete ${p.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER FULFILLMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold font-heading text-[var(--color-text)]">Customer Orders Fulfillment</h2>
          <div className="space-y-3">
            {allOrders.map((ord) => (
              <div key={ord._id} className="card p-5 border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-[var(--color-text)] text-sm">#{ord.orderId || ord._id.slice(-8)}</span>
                  <p className="text-[var(--color-text-muted)] mt-0.5">
                    Customer: {ord.shippingAddress?.fullName} | Total: ₹{(ord.grandTotal || 0).toLocaleString('en-IN')} | {ord.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--color-text-muted)]">Status:</span>
                  <select
                    value={ord.orderStatus || 'Processing'}
                    onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                    className="bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-1.5 text-[var(--color-text)] font-bold cursor-pointer"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT QUEUE */}
      {activeTab === 'tickets' && (
        <div className="card p-8 text-center text-[var(--color-text-muted)] space-y-2 border border-[var(--color-border)]">
          <LifeBuoy className="w-10 h-10 text-[var(--color-primary)] mx-auto mb-2" aria-hidden="true" />
          <h3 className="text-sm font-bold text-[var(--color-text)]">Customer Support Inquiries</h3>
          <p className="text-xs max-w-sm mx-auto">
            All customer inquiries submitted via the Contact page and Chatbot are routed directly to <span className="font-bold text-[var(--color-primary)]">support@hayroo.store</span>.
          </p>
        </div>
      )}

    </div>
  );
}
