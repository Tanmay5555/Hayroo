import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  Clock,
  CheckCircle2,
  Truck,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import ProductCard from '../components/ProductCard';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';

export default function AccountPage() {
  const navigate = useNavigate();

  useSeo({
    title: 'My Account & Orders',
    description: 'Manage your Hayroo profile, saved shipping addresses, order tracking, and wishlist.',
    canonicalPath: '/account',
  });

  const { user, logout, updateProfile, addAddress, setAuthModal } = useAuthStore();
  const { wishlistItems } = useWishlistStore();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses' | 'wishlist'
  const [myOrders, setMyOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Address Modal form state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');

  // Profile Edit form state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (!user) {
      setAuthModal(true, 'login');
      return;
    }

    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await apiClient.get('/orders/my-orders');
        setMyOrders(res.data.data || []);
      } catch {
        // error handled by axios interceptor
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, setAuthModal]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const success = await updateProfile({ name: editName, phone: editPhone });
    if (success) toast.success('Profile details updated successfully');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newState || !newPincode) {
      toast.error('Please fill in all address fields');
      return;
    }
    const success = await addAddress({
      street: newStreet,
      city: newCity,
      state: newState,
      pincode: newPincode,
    });
    if (success) {
      toast.success('Shipping address added');
      setIsAddAddressOpen(false);
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewPincode('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Signed out of Hayroo account');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 card text-center space-y-4">
        <div className="w-16 h-16 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)] flex items-center justify-center mx-auto">
          <User className="w-8 h-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold font-heading text-[var(--color-text)]">Account Login Required</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Please sign in to access your order tracking history, addresses, and wishlist.
        </p>
        <button
          type="button"
          onClick={() => setAuthModal(true, 'login')}
          className="btn-primary btn-md w-full"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[var(--color-text)]">
      
      {/* User Overview Profile Card */}
      <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-[#047857] text-[#FFFBEB] font-black text-2xl flex items-center justify-center shadow-md">
            {user.name?.charAt(0).toUpperCase() || 'H'}
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl font-bold font-heading text-[var(--color-text)]">{user.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-primary)] uppercase">
                {user.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
            {user.phone && <p className="text-xs text-[var(--color-text-muted)]">+91 {user.phone}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Admin Portal</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary btn-sm flex items-center gap-1.5 hover:text-[#DC2626]"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Account Grid Navigation & Body */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Tabs */}
        <div className="space-y-1.5">
          {[
            { id: 'orders', label: 'My Orders', icon: Package, count: myOrders.length },
            { id: 'profile', label: 'Personal Info', icon: User },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: user.addresses?.length || 0 },
            { id: 'wishlist', label: 'My Wishlist', icon: Heart, count: wishlistItems.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-3 rounded-md text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#047857] text-[#FFFBEB] shadow-sm'
                    : 'bg-[var(--color-card)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      isActive
                        ? 'bg-black/20 text-[#FFFBEB]'
                        : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* TAB 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold font-heading text-[var(--color-text)]">Order History & Tracking</h2>
              {isLoadingOrders ? (
                <div className="h-48 card rounded-md animate-pulse" />
              ) : myOrders.length === 0 ? (
                <div className="card p-10 text-center text-[var(--color-text-muted)] space-y-3">
                  <Package className="w-12 h-12 text-[var(--color-text-subtle)] mx-auto" aria-hidden="true" />
                  <p className="text-sm font-bold text-[var(--color-text)]">No orders placed yet</p>
                  <p className="text-xs">Browse our catalog to order quality electronics with free delivery over ₹1,500.</p>
                  <button type="button" onClick={() => navigate('/products')} className="btn-primary btn-sm mt-2">
                    Browse Products
                  </button>
                </div>
              ) : (
                myOrders.map((ord) => (
                  <div key={ord._id} className="card p-5 sm:p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)] text-xs">
                      <div>
                        <span className="text-[var(--color-text-subtle)]">Order Reference: </span>
                        <span className="font-bold text-[var(--color-text)]">#{ord.orderId || ord._id.slice(-8)}</span>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-primary)]">
                          {ord.orderStatus || 'Processing'}
                        </span>
                        <span className="text-sm font-bold text-[var(--color-text)]">
                          ₹{(ord.grandTotal || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {(ord.items || []).map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-[var(--color-bg-subtle)] p-3 rounded-md border border-[var(--color-border)]">
                          <img
                            src={item.imageLight || item.images?.[0] || 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200'}
                            alt={item.title}
                            className="w-12 h-12 object-contain rounded-md bg-[var(--color-card)] p-1 shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0 text-xs">
                            <h4 className="font-bold text-[var(--color-text)] truncate">{item.title}</h4>
                            <p className="text-[11px] text-[var(--color-text-muted)]">
                              Quantity: {item.quantity} | ₹{(item.price || 0).toLocaleString('en-IN')} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Stepper */}
                    <div className="pt-2">
                      <p className="text-xs font-bold text-[var(--color-text)] mb-3 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
                        Shipment Progress
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        {['Placed', 'Confirmed', 'Dispatched', 'Delivered'].map((step, sIdx) => {
                          const isDone = sIdx <= (['Placed', 'Confirmed', 'Dispatched', 'Delivered'].indexOf(ord.orderStatus) !== -1 ? ['Placed', 'Confirmed', 'Dispatched', 'Delivered'].indexOf(ord.orderStatus) : 1);
                          return (
                            <div key={step} className="space-y-1">
                              <div className={`h-1.5 rounded-sm ${isDone ? 'bg-[#047857]' : 'bg-[var(--color-border)]'}`} />
                              <span className={isDone ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-subtle)]'}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Personal Profile Info */}
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-4">
              <h2 className="text-base font-bold font-heading text-[var(--color-text)]">Personal Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text-muted)]">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text-muted)]">Email Address (Registered)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text-subtle)] cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text-muted)]">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <button type="submit" className="btn-primary btn-md">
                  Update Profile Details
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-heading text-[var(--color-text)]">Saved Shipping Addresses</h2>
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(true)}
                  className="btn-primary btn-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add New Address
                </button>
              </div>

              {isAddAddressOpen && (
                <form onSubmit={handleSaveAddress} className="card p-5 space-y-3 max-w-lg border border-[var(--color-primary)]">
                  <h3 className="text-xs font-bold text-[var(--color-text)]">New Delivery Address</h3>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--color-text-muted)]">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 123 Tech Park Road, Sector 62"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--color-text-muted)]">City</label>
                      <input
                        type="text"
                        placeholder="Bengaluru"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--color-text-muted)]">State</label>
                      <input
                        type="text"
                        placeholder="Karnataka"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[var(--color-text-muted)]">Postal Pincode</label>
                    <input
                      type="text"
                      placeholder="560055"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-md px-3 py-2 text-[var(--color-text)]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="btn-primary btn-sm">Save Address</button>
                    <button type="button" onClick={() => setIsAddAddressOpen(false)} className="btn-secondary btn-sm">Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(user.addresses || []).length === 0 ? (
                  <div className="card p-8 text-center text-[var(--color-text-muted)] sm:col-span-2">
                    <MapPin className="w-10 h-10 text-[var(--color-text-subtle)] mx-auto mb-2" aria-hidden="true" />
                    <p className="text-xs">No saved addresses. Add an address for faster checkout.</p>
                  </div>
                ) : (
                  user.addresses.map((addr, i) => (
                    <div key={i} className="card p-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--color-text)] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" aria-hidden="true" />
                          Address #{i + 1}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-muted)]">{addr.street}</p>
                      <p className="text-[var(--color-text-muted)]">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Saved Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold font-heading text-[var(--color-text)]">My Saved Items</h2>
              {wishlistItems.length === 0 ? (
                <div className="card p-10 text-center text-[var(--color-text-muted)] space-y-3">
                  <Heart className="w-12 h-12 text-[var(--color-text-subtle)] mx-auto" aria-hidden="true" />
                  <p className="text-sm font-bold text-[var(--color-text)]">Your wishlist is empty</p>
                  <p className="text-xs">Explore the store to bookmark your favorite everyday essentials.</p>
                  <button type="button" onClick={() => navigate('/products')} className="btn-primary btn-sm mt-2">
                    Discover Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((prod) => (
                    <ProductCard key={prod._id || prod.id} product={prod} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
