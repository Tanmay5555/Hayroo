import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  CheckCircle2,
  XCircle,
  Edit3,
  Search,
  Filter,
  Tag,
  Percent,
  Truck,
  Building2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Eye,
  Copy,
  Check,
  UploadCloud,
  Store,
  FileText,
  DollarSign,
  Palette,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';

const PRODUCT_CATEGORIES = [
  'Computers',
  'Phone/Tablets',
  'Audio',
  'Wearables',
  'Smart Home',
  'Accessories',
  'Gaming',
  'Fashion',
  'Home & Kitchen',
];

const FESTIVAL_THEMES_CONFIG = [
  {
    id: 'default',
    name: 'Botanical Emerald (हयरू क्लासिक)',
    occasion: 'All-Season Signature Platform Palette',
    description: 'Signature Hayroo human-centered design. Warm alabaster stone with calming botanical emerald green and slate accents.',
    primaryColor: '#0F6B52',
    primaryDarkColor: '#229A77',
    accentColor: '#D1EAE2',
    bgColor: '#FAF9F6',
    bgDarkColor: '#0D0F0E',
    icon: '🌿',
    tag: 'Classic Standard',
  },
  {
    id: 'diwali',
    name: 'Diwali Festive Gold & Amber (दीपावली उत्सव)',
    occasion: 'Dhanteras, Diwali, Festive Mega Sale & Weddings',
    description: 'Luminous royal saffron amber, champagne alabaster, and warm festive glow. Deep charcoal amber obsidian in dark mode.',
    primaryColor: '#B25E00',
    primaryDarkColor: '#E58A1F',
    accentColor: '#FDE8CB',
    bgColor: '#FAF8F4',
    bgDarkColor: '#110E0A',
    icon: '🪔',
    tag: 'Festive Gold',
  },
  {
    id: 'holi',
    name: 'Holi Spring Blossom & Coral (होली उत्सव)',
    occasion: 'Holi, Spring Season, Vasant Panchami & Summer Sales',
    description: 'Vibrant coral rosewood, terracotta sunset, and whisper blush pearl. Festive exuberance with refined minimalist balance.',
    primaryColor: '#C93B62',
    primaryDarkColor: '#E65A82',
    accentColor: '#FAD4DE',
    bgColor: '#FAF7F8',
    bgDarkColor: '#120D10',
    icon: '🎨',
    tag: 'Spring Blossom',
  },
  {
    id: 'eid',
    name: 'Eid Celestial Jade & Teal (ईद व रमजान मुबारक)',
    occasion: 'Ramadan, Eid-ul-Fitr, Eid-ul-Adha & Spiritual Celebrations',
    description: 'Royal celestial teal, moonlit desert sand alabaster, and tranquil jade. Peaceful, dignified elegance in both light & dark modes.',
    primaryColor: '#0D6E6E',
    primaryDarkColor: '#21A3A3',
    accentColor: '#CEE7E7',
    bgColor: '#F7FAF9',
    bgDarkColor: '#0C1010',
    icon: '🌙',
    tag: 'Celestial Jade',
  },
  {
    id: 'christmas',
    name: 'Christmas & Winter Velvet (क्रिसमस एवं नव वर्ष)',
    occasion: 'Christmas, Boxing Day, New Year & Winter Clearance',
    description: 'Velvet ruby crimson, alpine winter frost alabaster, and dark garnet obsidian. Cozy holiday warmth and high-energy checkout conversion.',
    primaryColor: '#A82020',
    primaryDarkColor: '#E03E3E',
    accentColor: '#F7D4D4',
    bgColor: '#FAF8F8',
    bgDarkColor: '#110D0D',
    icon: '🎄',
    tag: 'Velvet Crimson',
  },
  {
    id: 'independence',
    name: 'Independence & Republic Pride (राष्ट्रीय पर्व)',
    occasion: 'Independence Day (15 Aug), Republic Day (26 Jan), Gandhi Jayanti',
    description: 'National saffron orange, subtle Ashoka chakra indigo notes, and pure pearl tones. Dignified, patriotic, and proud.',
    primaryColor: '#C24E00',
    primaryDarkColor: '#F06E1B',
    accentColor: '#FDE2CC',
    bgColor: '#FAF8F6',
    bgDarkColor: '#110E0C',
    icon: '🇮🇳',
    tag: 'National Pride',
  },
  {
    id: 'monsoon',
    name: 'Monsoon Oceanic Indigo (मानसून व मिडनाइट)',
    occasion: 'Rainy Season, Autumn Cool, Tech & Gaming Showcases',
    description: 'Deep oceanic indigo, serene slate rain, and twilight calm. Sleek, deeply modern tech aesthetic.',
    primaryColor: '#2C4875',
    primaryDarkColor: '#4B78B8',
    accentColor: '#D7E3F3',
    bgColor: '#F7F9FC',
    bgDarkColor: '#0C1017',
    icon: '🌧️',
    tag: 'Oceanic Rain',
  },
];

export default function AdminPage() {
  const navigate = useNavigate();

  useSeo({
    title: 'Executive Platform Governance | Hayroo Admin Central',
    description: 'Enterprise marketplace administration for Hayroo. Master catalog, fulfillment, seller KYC governance, users, promotions, and dispute arbitration.',
    canonicalPath: '/admin',
  });

  const { user, isLoading: isAuthLoading } = useAuthStore();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'products' | 'orders' | 'sellers' | 'users' | 'coupons' | 'disputes'

  // Platform Data
  const [stats, setStats] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [pendingKYCs, setPendingKYCs] = useState([]);
  const [allSellers, setAllSellers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [allDisputes, setAllDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCouponId, setCopiedCouponId] = useState(null);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productStockFilter, setProductStockFilter] = useState('ALL');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Add / Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Computers');
  const [prodBrand, setProdBrand] = useState('Hayroo');
  const [prodStock, setProdStock] = useState('25');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsFlashSale, setProdIsFlashSale] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Product Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Add Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('15');
  const [couponMinAmount, setCouponMinAmount] = useState('999');
  const [couponExpiryDays, setCouponExpiryDays] = useState('30');
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  // Order Detail Drawer/Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch all admin data concurrently
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [
        statsRes,
        prodsRes,
        ordersRes,
        pendingKycRes,
        sellersRes,
        usersRes,
        couponsRes,
        disputesRes,
      ] = await Promise.all([
        apiClient.get('/admin/stats').catch(() => ({ data: { data: null } })),
        apiClient.get('/products?limit=100').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/orders').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/sellers/pending').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/sellers').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/users').catch(() => ({ data: { data: [] } })),
        apiClient.get('/coupons').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/disputes').catch(() => ({ data: { data: [] } })),
      ]);

      setStats(statsRes.data?.data || null);
      setAllProducts(prodsRes.data?.data || []);
      setAllOrders(ordersRes.data?.data || []);
      setPendingKYCs(pendingKycRes.data?.data || []);
      setAllSellers(sellersRes.data?.data || []);
      setAllUsers(usersRes.data?.data || []);
      setAllCoupons(couponsRes.data?.data || []);
      setAllDisputes(disputesRes.data?.data || []);
    } catch {
      toast.error('Unable to synchronize platform metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || user.role?.toUpperCase() !== 'ADMIN') {
      navigate('/account');
      toast.error('Admin privileges required to access this portal');
      return;
    }
    fetchAdminData();
  }, [user, isAuthLoading, navigate]);

  // Open Product Modal (New or Edit)
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProdTitle(product.title || '');
      setProdPrice(product.price?.toString() || '');
      setProdOriginalPrice(product.originalPrice?.toString() || '');
      setProdCategory(product.category || 'Computers');
      setProdBrand(product.brand || 'Hayroo');
      setProdStock(product.stock?.toString() || '20');
      setProdDescription(product.description || '');
      setProdImage(product.imageLight || (product.images && product.images[0]) || '');
      setProdIsFeatured(Boolean(product.isFeatured));
      setProdIsFlashSale(Boolean(product.isFlashSale));
    } else {
      setEditingProduct(null);
      setProdTitle('');
      setProdPrice('');
      setProdOriginalPrice('');
      setProdCategory('Computers');
      setProdBrand('Hayroo');
      setProdStock('25');
      setProdDescription('');
      setProdImage('');
      setProdIsFeatured(false);
      setProdIsFlashSale(false);
    }
    setIsProductModalOpen(true);
  };

  // Upload image handler
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image file must be under 5MB');
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
      toast.error(err.response?.data?.message || 'Image upload failed. You can paste an image URL instead.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Submit Add or Edit Product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodTitle.trim() || !prodPrice || !prodCategory) {
      return toast.error('Please complete title, price, and category');
    }

    const payload = {
      title: prodTitle.trim(),
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : Number(prodPrice) * 1.25,
      category: prodCategory,
      brand: prodBrand.trim() || 'Hayroo',
      stock: Number(prodStock) || 0,
      description: prodDescription.trim() || `${prodTitle.trim()} premium platform stock.`,
      imageLight: prodImage.trim() || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
      images: [prodImage.trim() || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'],
      isFeatured: prodIsFeatured,
      isFlashSale: prodIsFlashSale,
      isPublished: true,
    };

    setIsSavingProduct(true);
    try {
      if (editingProduct) {
        const pId = editingProduct._id || editingProduct.id;
        const res = await apiClient.put(`/products/${pId}`, payload);
        const updated = res.data?.data || { ...editingProduct, ...payload };
        setAllProducts((prev) => prev.map((p) => (p._id === pId ? updated : p)));
        toast.success(`"${payload.title}" updated successfully`);
      } else {
        const res = await apiClient.post('/products', payload);
        const created = res.data?.data || payload;
        setAllProducts((prev) => [created, ...prev]);
        toast.success(`"${payload.title}" published to marketplace`);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Toggle Featured or Flash Sale flag on product
  const handleToggleProductFlag = async (productId, flagName, currentValue) => {
    try {
      const updates = { [flagName]: !currentValue };
      await apiClient.put(`/products/${productId}`, updates);
      setAllProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, [flagName]: !currentValue } : p))
      );
      toast.success(
        `Product ${flagName === 'isFeatured' ? 'Featured' : 'Flash Sale'} status updated`
      );
    } catch {
      toast.error('Failed to update product highlight');
    }
  };

  // Delete product confirmation
  const handleConfirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      const pId = deletingProduct._id || deletingProduct.id;
      await apiClient.delete(`/products/${pId}`);
      toast.success(`"${deletingProduct.title}" removed from catalog`);
      setAllProducts((prev) => prev.filter((p) => p._id !== pId));
      setDeletingProduct(null);
    } catch {
      toast.error('Failed to delete product from database');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId.slice(-6)} set to ${newStatus}`);
      setAllOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch {
      toast.error('Failed to update fulfillment status');
    }
  };

  // Decide Seller KYC
  const handleDecideKyc = async (kycId, decision, rejectionReason = '') => {
    try {
      await apiClient.post(`/admin/sellers/${kycId}/kyc-decision`, {
        decision,
        rejectionReason,
      });
      toast.success(`Seller KYC ${decision === 'APPROVED' ? 'Approved & Store Activated' : 'Rejected'}`);
      setPendingKYCs((prev) => prev.filter((k) => k._id !== kycId));
      fetchAdminData();
    } catch {
      toast.error('Failed to process KYC decision');
    }
  };

  // Toggle Seller Active / Suspended
  const handleToggleSellerStatus = async (sellerId) => {
    try {
      const res = await apiClient.patch(`/admin/sellers/${sellerId}/toggle-status`);
      toast.success(res.data?.message || 'Seller status updated');
      setAllSellers((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, isApproved: !s.isApproved } : s))
      );
    } catch {
      toast.error('Failed to toggle merchant status');
    }
  };

  // Update User Role or Active state
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      setAllUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      toast.error('Failed to update user authorization role');
    }
  };

  const handleToggleUserActive = async (userId, currentActive) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/role`, { isActive: !currentActive });
      toast.success(`User account ${!currentActive ? 'Activated' : 'Suspended'}`);
      setAllUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentActive } : u))
      );
    } catch {
      toast.error('Failed to update user account status');
    }
  };

  // Create Coupon
  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return toast.error('Coupon code is required');

    setIsSavingCoupon(true);
    try {
      const expiresAt = new Date(Date.now() + Number(couponExpiryDays) * 24 * 60 * 60 * 1000);
      const res = await apiClient.post('/coupons', {
        code: couponCode.trim().toUpperCase(),
        discountPercent: Number(couponDiscount) || 10,
        minOrderAmount: Number(couponMinAmount) || 0,
        expiresAt,
      });
      const created = res.data?.data || {
        _id: Date.now().toString(),
        code: couponCode.trim().toUpperCase(),
        discountPercent: Number(couponDiscount),
        minOrderAmount: Number(couponMinAmount),
        expiresAt,
        isActive: true,
      };
      setAllCoupons((prev) => [created, ...prev]);
      toast.success(`Coupon code ${created.code} activated`);
      setIsCouponModalOpen(false);
      setCouponCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create promotional coupon');
    } finally {
      setIsSavingCoupon(false);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await apiClient.delete(`/coupons/${couponId}`);
      toast.success(`Coupon ${code} deleted`);
      setAllCoupons((prev) => prev.filter((c) => c._id !== couponId));
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  // Resolve Dispute
  const handleResolveDispute = async (disputeId, newStatus) => {
    try {
      await apiClient.patch(`/admin/disputes/${disputeId}`, { status: newStatus });
      toast.success(`Dispute status updated to ${newStatus}`);
      setAllDisputes((prev) =>
        prev.map((d) => (d._id === disputeId ? { ...d, status: newStatus } : d))
      );
    } catch {
      toast.error('Failed to arbitrate dispute');
    }
  };

  // Copy coupon code helper
  const handleCopyCoupon = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponId(id);
    toast.success(`Copied code: ${code}`);
    setTimeout(() => setCopiedCouponId(null), 2000);
  };

  // Festive Theme State & Handlers
  const {
    festivalTheme,
    isFestivalMode,
    festivalBannerText,
    setFestivalThemeAdmin,
    isSyncingFestival,
  } = useThemeStore();

  const [localFestivalMode, setLocalFestivalMode] = useState(isFestivalMode);
  const [localBannerText, setLocalBannerText] = useState(festivalBannerText || '');

  useEffect(() => {
    setLocalFestivalMode(isFestivalMode);
    setLocalBannerText(festivalBannerText || '');
  }, [isFestivalMode, festivalBannerText]);

  const handleApplyTheme = async (themeId) => {
    try {
      await setFestivalThemeAdmin({
        activeTheme: themeId,
        isFestivalMode: localFestivalMode,
        festivalBannerText: localBannerText,
      });
      const themeConfig = FESTIVAL_THEMES_CONFIG.find((t) => t.id === themeId);
      toast.success(`Platform theme changed to "${themeConfig?.name || themeId}"!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update marketplace theme');
    }
  };

  const handleSaveFestivalSettings = async (e) => {
    e.preventDefault();
    try {
      await setFestivalThemeAdmin({
        activeTheme: festivalTheme,
        isFestivalMode: localFestivalMode,
        festivalBannerText: localBannerText,
      });
      toast.success('Festival settings updated and applied across the marketplace!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update festival settings');
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchSearch =
        !productSearch.trim() ||
        p.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(productSearch.toLowerCase());

      const matchCat =
        productCategoryFilter === 'ALL' ||
        p.category?.toLowerCase() === productCategoryFilter.toLowerCase();

      const matchStock =
        productStockFilter === 'ALL' ||
        (productStockFilter === 'IN_STOCK' && (p.stock || 0) > 0) ||
        (productStockFilter === 'LOW_STOCK' && (p.stock || 0) > 0 && (p.stock || 0) < 10) ||
        (productStockFilter === 'OUT_OF_STOCK' && (p.stock || 0) <= 0);

      return matchSearch && matchCat && matchStock;
    });
  }, [allProducts, productSearch, productCategoryFilter, productStockFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter((o) => {
      const orderNum = o.orderId || o._id || '';
      const custName = o.shippingAddress?.fullName || o.user?.fullName || '';
      const custPhone = o.shippingAddress?.phoneNumber || o.user?.phoneNumber || '';
      const custEmail = o.user?.email || '';

      const matchSearch =
        !orderSearch.trim() ||
        orderNum.toLowerCase().includes(orderSearch.toLowerCase()) ||
        custName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        custPhone.toLowerCase().includes(orderSearch.toLowerCase()) ||
        custEmail.toLowerCase().includes(orderSearch.toLowerCase());

      const matchStatus =
        orderStatusFilter === 'ALL' ||
        (o.orderStatus || '').toLowerCase() === orderStatusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [allOrders, orderSearch, orderStatusFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchSearch =
        !userSearch.trim() ||
        u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phoneNumber?.toLowerCase().includes(userSearch.toLowerCase());

      const matchRole =
        userRoleFilter === 'ALL' ||
        (u.role || '').toUpperCase() === userRoleFilter.toUpperCase();

      return matchSearch && matchRole;
    });
  }, [allUsers, userSearch, userRoleFilter]);

  // KPI Calculations
  const gmv = stats?.metrics?.grossMerchandiseValue ?? stats?.totalSales ?? 0;
  const platformCommission = stats?.metrics?.platformCommissionEarned ?? Math.round(gmv * 0.1);
  const totalOrdersCount = stats?.metrics?.totalOrders ?? allOrders.length;
  const totalSellersCount = stats?.metrics?.totalSellers ?? allSellers.length;
  const totalUsersCount = stats?.metrics?.totalUsers ?? allUsers.length;
  const lowStockCount = allProducts.filter((p) => (p.stock || 0) < 10).length;
  const pendingKycCount = pendingKYCs.length;
  const openDisputesCount = allDisputes.filter((d) => d.status === 'REQUESTED').length;

  if (isAuthLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-28 card rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 card rounded-md" />
          <div className="h-24 card rounded-md" />
          <div className="h-24 card rounded-md" />
          <div className="h-24 card rounded-md" />
        </div>
        <div className="h-96 card rounded-md" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[var(--color-text)]">
      {/* Top Header Banner */}
      <div className="pb-5 border-b border-[var(--color-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Hayroo Root Governance
            </span>
            <span className="text-[11px] text-[var(--color-text-subtle)] font-medium">
              Amazon & Flipkart-grade Seller Central
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-[var(--color-text)]">
            Marketplace Administration Central
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Platform GMV control, multi-seller inventory management, logistics dispatch, merchant KYC arbitration, and customer governance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchAdminData}
            className="btn-secondary btn-sm flex items-center gap-1.5"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Sync Live Metrics</span>
          </button>
          <button
            type="button"
            onClick={() => openProductModal(null)}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Add Platform Product</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-border)] shadow-xs">
        <div className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Gross Merchandise (GMV)</span>
            <DollarSign className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-[var(--color-text)]">
            ₹{gmv.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">
            Comm: ₹{platformCommission.toLocaleString('en-IN')} (10% platform take)
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Total Order Volume</span>
            <Package className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-[var(--color-text)]">
            {totalOrdersCount}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">
            {allOrders.filter((o) => o.orderStatus === 'Delivered').length} fulfilled & delivered
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Active Merchants & Stores</span>
            <Store className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-[var(--color-text)]">
            {totalSellersCount}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">
            {pendingKycCount > 0 ? (
              <span className="text-[var(--color-error)] font-semibold">{pendingKycCount} pending KYC verifications</span>
            ) : (
              'All vendor KYC records approved'
            )}
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Catalog SKUs & Stock</span>
            <ShoppingBag className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
          </div>
          <p className="text-2xl font-bold tabular-nums text-[var(--color-text)]">
            {allProducts.length}
          </p>
          <span className="text-[11px] text-[var(--color-text-subtle)] block">
            {lowStockCount > 0 ? (
              <span className="text-[var(--color-error)] font-semibold">{lowStockCount} SKUs low in stock (&lt;10)</span>
            ) : (
              'Inventory levels healthy'
            )}
          </span>
        </div>
      </div>

      {/* Quick Action Alerts Strip */}
      {(pendingKycCount > 0 || openDisputesCount > 0 || lowStockCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pendingKycCount > 0 && (
            <div className="p-3.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span>
                  <strong className="text-[var(--color-text)]">{pendingKycCount}</strong> new seller KYC requests waiting
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('sellers')}
                className="btn-secondary btn-sm text-[11px] py-1 px-2.5 flex items-center gap-1"
              >
                <span>Review</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </button>
            </div>
          )}

          {openDisputesCount > 0 && (
            <div className="p-3.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[var(--color-error)] shrink-0" />
                <span>
                  <strong className="text-[var(--color-text)]">{openDisputesCount}</strong> buyer dispute claims require arbitration
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('disputes')}
                className="btn-secondary btn-sm text-[11px] py-1 px-2.5 flex items-center gap-1"
              >
                <span>Arbitrate</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </button>
            </div>
          )}

          {lowStockCount > 0 && (
            <div className="p-3.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span>
                  <strong className="text-[var(--color-text)]">{lowStockCount}</strong> items require warehouse restocking
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('products');
                  setProductStockFilter('LOW_STOCK');
                }}
                className="btn-secondary btn-sm text-[11px] py-1 px-2.5 flex items-center gap-1"
              >
                <span>Restock</span>
                <ChevronRight className="w-3 h-3 shrink-0" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs (7 Flipkart/Amazon Modules) */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] overflow-x-auto pb-1">
        {[
          { id: 'metrics', label: 'Store Overview', icon: TrendingUp },
          { id: 'products', label: `Master Catalog (${allProducts.length})`, icon: ShoppingBag },
          { id: 'orders', label: `Fulfillment & Orders (${allOrders.length})`, icon: Package },
          { id: 'sellers', label: `Sellers & KYC (${allSellers.length})`, icon: Building2 },
          { id: 'users', label: `Users & Roles (${totalUsersCount})`, icon: Users },
          { id: 'coupons', label: `Campaigns & Coupons (${allCoupons.length})`, icon: Percent },
          { id: 'disputes', label: `Disputes & Claims (${allDisputes.length})`, icon: ShieldCheck },
          { id: 'themes', label: 'Festive Themes', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Overview */}
            <div className="card p-5 space-y-4 border border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  Recent Store Dispatch Stream
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                >
                  View All Orders <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>

              <div className="space-y-2.5">
                {allOrders.slice(0, 5).map((ord) => (
                  <div
                    key={ord._id}
                    className="p-3 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-text)]">
                          #{ord.orderId || ord._id.slice(-6)}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
                              : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'
                          }`}
                        >
                          {ord.orderStatus || 'Processing'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        {ord.shippingAddress?.fullName || ord.user?.fullName || 'Customer'} • {ord.items?.length || 1} item(s) • {ord.paymentMethod || 'COD'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[var(--color-text)] tabular-nums">
                        ₹{(ord.grandTotal || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-[var(--color-text-subtle)]">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
                {allOrders.length === 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">No orders registered yet.</p>
                )}
              </div>
            </div>

            {/* Critical Low Stock Replenishment */}
            <div className="card p-5 space-y-4 border border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--color-error)] shrink-0" />
                  Inventory Replenishment Warnings (&lt;10 Units)
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('products');
                    setProductStockFilter('LOW_STOCK');
                  }}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                >
                  Manage SKUs <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>

              <div className="space-y-2.5">
                {allProducts
                  .filter((p) => (p.stock || 0) < 10)
                  .slice(0, 5)
                  .map((prod) => (
                    <div
                      key={prod._id}
                      className="p-3 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageLight}
                          alt={prod.title}
                          className="w-10 h-10 object-contain rounded bg-[var(--color-card)] p-1 border border-[var(--color-border)] shrink-0"
                        />
                        <div className="truncate max-w-[200px] sm:max-w-xs">
                          <p className="font-bold text-[var(--color-text)] truncate">{prod.title}</p>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            {prod.category} • ₹{(prod.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-border)] tabular-nums">
                          {prod.stock || 0} left
                        </span>
                        <button
                          type="button"
                          onClick={() => openProductModal(prod)}
                          className="btn-secondary btn-sm p-1.5"
                          title="Restock SKU"
                        >
                          <Edit3 className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      </div>
                    </div>
                  ))}

                {allProducts.filter((p) => (p.stock || 0) < 10).length === 0 && (
                  <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                    <CheckCircle2 className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-2" />
                    All catalog products have sufficient stock levels (&ge; 10 units).
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Platform Governance Summary */}
          <div className="card p-5 border border-[var(--color-border)] space-y-4">
            <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              Marketplace Integrity & Operational Health
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] space-y-1">
                <span className="text-[11px] text-[var(--color-text-muted)]">Average Order Value (AOV)</span>
                <p className="text-lg font-bold text-[var(--color-text)] tabular-nums">
                  ₹{(totalOrdersCount > 0 ? Math.round(gmv / totalOrdersCount) : 0).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[var(--color-text-subtle)]">Computed across all paid transactions</span>
              </div>

              <div className="p-3.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] space-y-1">
                <span className="text-[11px] text-[var(--color-text-muted)]">Customer Dispute Ratio</span>
                <p className="text-lg font-bold text-[var(--color-text)] tabular-nums">
                  {totalOrdersCount > 0 ? ((allDisputes.length / totalOrdersCount) * 100).toFixed(1) : 0}%
                </p>
                <span className="text-[10px] text-[var(--color-text-subtle)]">
                  {allDisputes.length} total return/refund claims filed
                </span>
              </div>

              <div className="p-3.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] space-y-1">
                <span className="text-[11px] text-[var(--color-text-muted)]">Active Discount Campaigns</span>
                <p className="text-lg font-bold text-[var(--color-text)] tabular-nums">
                  {allCoupons.filter((c) => new Date(c.expiresAt) > new Date()).length} Live Promos
                </p>
                <span className="text-[10px] text-[var(--color-text-subtle)]">Driving customer conversion & cart checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MASTER CATALOG MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search catalog by title, brand, SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={productStockFilter}
                onChange={(e) => setProductStockFilter(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="IN_STOCK">In Stock (&gt;0)</option>
                <option value="LOW_STOCK">Low Stock (&lt;10)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => openProductModal(null)}
              className="btn-primary btn-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="card border border-[var(--color-border)] overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-[11px] font-semibold">
                <tr>
                  <th className="p-3">Product / SKU Details</th>
                  <th className="p-3">Category & Brand</th>
                  <th className="p-3">Price (₹)</th>
                  <th className="p-3">Inventory</th>
                  <th className="p-3 text-center">Featured</th>
                  <th className="p-3 text-center">Flash Deal</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageLight || (p.images && p.images[0])}
                          alt={p.title}
                          className="w-10 h-10 object-contain rounded bg-[var(--color-card)] p-1 border border-[var(--color-border)] shrink-0"
                        />
                        <div className="max-w-xs">
                          <p className="font-bold text-[var(--color-text)] truncate">{p.title}</p>
                          <span className="text-[10px] text-[var(--color-text-muted)] block truncate">
                            ID: {p._id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-medium text-[var(--color-text)] block">{p.category}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{p.brand || 'Generic'}</span>
                    </td>

                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[var(--color-primary)] block tabular-nums">
                          ₹{(p.price || 0).toLocaleString('en-IN')}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-[var(--color-text-muted)] line-through tabular-nums block">
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium tabular-nums ${
                          (p.stock || 0) <= 0
                            ? 'bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-border)]'
                            : (p.stock || 0) < 10
                            ? 'bg-[var(--color-warning-bg, #fef3c7)] text-[var(--color-warning, #d97706)] border border-[var(--color-border)]'
                            : 'bg-[var(--color-bg-subtle)] text-[var(--color-text)] border border-[var(--color-border)]'
                        }`}
                      >
                        {p.stock || 0} units
                      </span>
                    </td>

                    {/* Featured on Homepage Toggle */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleProductFlag(p._id, 'isFeatured', p.isFeatured)}
                        className={`p-1.5 rounded transition-colors ${
                          p.isFeatured
                            ? 'text-[var(--color-primary)] bg-[var(--color-primary-light)]'
                            : 'text-[var(--color-text-subtle)] hover:text-[var(--color-text)]'
                        }`}
                        title={p.isFeatured ? 'Featured on Homepage (Click to disable)' : 'Click to feature on homepage'}
                      >
                        <ShieldCheck className="w-4 h-4 mx-auto shrink-0" />
                      </button>
                    </td>

                    {/* Flash Sale Deal Toggle */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleProductFlag(p._id, 'isFlashSale', p.isFlashSale)}
                        className={`p-1.5 rounded transition-colors ${
                          p.isFlashSale
                            ? 'text-[var(--color-error)] bg-[var(--color-error-bg)]'
                            : 'text-[var(--color-text-subtle)] hover:text-[var(--color-text)]'
                        }`}
                        title={p.isFlashSale ? 'Active in Flash Sales (Click to disable)' : 'Click to add to Flash Sales'}
                      >
                        <Tag className="w-4 h-4 mx-auto shrink-0" />
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openProductModal(p)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] rounded hover:bg-[var(--color-bg)] transition-colors"
                          title="Edit Product Details"
                        >
                          <Edit3 className="w-4 h-4 shrink-0" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)] rounded hover:bg-[var(--color-bg)] transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                      No matching products found in catalog.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ORDER FULFILLMENT & LOGISTICS */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Order ID, customer, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="ALL">All Fulfillment Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <span className="text-xs text-[var(--color-text-muted)]">
              Showing <strong>{filteredOrders.length}</strong> orders
            </span>
          </div>

          {/* Orders Table */}
          <div className="card border border-[var(--color-border)] overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-[11px] font-semibold">
                <tr>
                  <th className="p-3">Order ID & Date</th>
                  <th className="p-3">Customer & Destination</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Grand Total</th>
                  <th className="p-3">Fulfillment Status</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-[var(--color-text)] block">
                        #{ord.orderId || ord._id.slice(-8)}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-bold text-[var(--color-text)] block">
                        {ord.shippingAddress?.fullName || ord.user?.fullName || 'Customer'}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] block truncate max-w-xs">
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.state} {ord.shippingAddress?.postalCode} • {ord.shippingAddress?.phoneNumber || ord.user?.phoneNumber || 'N/A'}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-medium text-[var(--color-text)] block">{ord.paymentMethod || 'COD'}</span>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          ord.paymentStatus === 'Paid'
                            ? 'text-[var(--color-primary)]'
                            : 'text-[var(--color-error)]'
                        }`}
                      >
                        {ord.paymentStatus || 'Pending'}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-bold text-[var(--color-text)] block tabular-nums">
                        ₹{(ord.grandTotal || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">
                        {ord.items?.length || 1} item(s)
                      </span>
                    </td>

                    <td className="p-3">
                      <select
                        value={ord.orderStatus || 'Processing'}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded px-2.5 py-1 text-[var(--color-text)] font-semibold cursor-pointer focus:outline-none focus:border-[var(--color-primary)]"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="btn-secondary btn-sm p-1.5"
                        title="View Full Order Invoice & Items"
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SELLERS & VENDOR GOVERNANCE */}
      {/* ======================================================== */}
      {activeTab === 'sellers' && (
        <div className="space-y-6">
          {/* Section A: Pending KYC Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  Seller KYC Verification & Onboarding Queue ({pendingKYCs.length})
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Verify merchant GSTIN, PAN, and bank accounts prior to activating store catalog trading.
                </p>
              </div>
            </div>

            {pendingKYCs.length === 0 ? (
              <div className="card p-6 text-center text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                <CheckCircle2 className="w-7 h-7 text-[var(--color-primary)] mx-auto mb-2" />
                All vendor KYC applications are up to date and verified.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingKYCs.map((kyc) => {
                  const sellerProfile = kyc.sellerProfileId || {};
                  const owner = sellerProfile.userId || {};

                  return (
                    <div
                      key={kyc._id}
                      className="card p-5 border border-[var(--color-border)] space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-text)]">
                            {sellerProfile.businessName || 'Business Entity'}
                          </h3>
                          <span className="text-[11px] text-[var(--color-text-muted)] block">
                            Owner: {owner.fullName || 'Vendor Owner'} • {owner.phoneNumber || owner.email}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-warning-bg, #fef3c7)] text-[var(--color-warning, #d97706)] border border-[var(--color-border)]">
                          Pending Verification
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[11px]">
                        <div>
                          <span className="text-[var(--color-text-muted)] block">GSTIN Number:</span>
                          <span className="font-mono font-semibold text-[var(--color-text)]">
                            {kyc.gstinNumber || 'UNREGISTERED'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-muted)] block">PAN Number:</span>
                          <span className="font-mono font-semibold text-[var(--color-text)]">
                            {kyc.panNumber || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-muted)] block">Bank Account:</span>
                          <span className="font-mono font-semibold text-[var(--color-text)]">
                            {kyc.bankAccountNumber || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-muted)] block">Bank IFSC Code:</span>
                          <span className="font-mono font-semibold text-[var(--color-text)]">
                            {kyc.bankIfscCode || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[var(--color-text-muted)]">
                        <strong>Registered Address:</strong>{' '}
                        {kyc.businessAddress?.street}, {kyc.businessAddress?.city}, {kyc.businessAddress?.state} {kyc.businessAddress?.postalCode}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                        <button
                          type="button"
                          onClick={() => handleDecideKyc(kyc._id, 'REJECTED', 'Documents illegible')}
                          className="btn-secondary btn-sm text-[var(--color-error)] hover:border-[var(--color-error)]"
                        >
                          Reject KYC
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecideKyc(kyc._id, 'APPROVED')}
                          className="btn-primary btn-sm flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Approve & Activate Store</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Registered Sellers Directory */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <Store className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              Registered Marketplace Merchants Directory ({allSellers.length})
            </h2>

            <div className="card border border-[var(--color-border)] overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="p-3">Store & Business Name</th>
                    <th className="p-3">Merchant Contact</th>
                    <th className="p-3">Commission %</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3 text-right">Governance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {allSellers.map((s) => (
                    <tr key={s._id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                      <td className="p-3">
                        <span className="font-bold text-[var(--color-text)] block">{s.businessName}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">
                          store/{s.storeSlug}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-medium text-[var(--color-text)] block">
                          {s.userId?.fullName || s.businessEmail}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">
                          {s.businessPhone}
                        </span>
                      </td>

                      <td className="p-3 font-semibold tabular-nums text-[var(--color-text)]">
                        {s.commissionPercent || 10}%
                      </td>

                      <td className="p-3">
                        <span className="font-medium tabular-nums text-[var(--color-text)]">
                          ⭐ {s.ratingAverage?.toFixed(1) || '4.8'} ({s.ratingCount || 0})
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            s.isApproved
                              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                              : 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
                          }`}
                        >
                          {s.isApproved ? 'Active (Approved)' : 'Suspended / Inactive'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleSellerStatus(s._id)}
                          className={`btn-sm ${
                            s.isApproved ? 'btn-secondary text-[var(--color-error)]' : 'btn-primary'
                          }`}
                        >
                          {s.isApproved ? 'Suspend Merchant' : 'Activate Merchant'}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {allSellers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                        No sellers registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: USER & ACCESS ROLE GOVERNANCE */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search users by name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="CUSTOMER">Customer</option>
                <option value="SELLER">Seller</option>
                <option value="DELIVERY_PARTNER">Delivery Partner</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <span className="text-xs text-[var(--color-text-muted)]">
              Showing <strong>{filteredUsers.length}</strong> registered accounts
            </span>
          </div>

          <div className="card border border-[var(--color-border)] overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-[11px] font-semibold">
                <tr>
                  <th className="p-3">User Profile</th>
                  <th className="p-3">Contact & Phone</th>
                  <th className="p-3">Access Role</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Suspend / Restore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold flex items-center justify-center shrink-0 text-xs">
                          {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-[var(--color-text)] block">{u.fullName}</span>
                          <span className="text-[10px] text-[var(--color-text-muted)] block truncate max-w-[180px]">
                            {u.email || 'No email attached'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-medium text-[var(--color-text)] block font-mono">
                        {u.phoneNumber || 'N/A'}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">
                        {u.addresses?.length || 0} saved address(es)
                      </span>
                    </td>

                    <td className="p-3">
                      <select
                        value={u.role || 'CUSTOMER'}
                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                        className="bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded px-2.5 py-1 text-[var(--color-text)] font-semibold cursor-pointer focus:outline-none focus:border-[var(--color-primary)]"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="SELLER">SELLER</option>
                        <option value="DELIVERY_PARTNER">DELIVERY_PARTNER</option>
                        <option value="SUPPORT_STAFF">SUPPORT_STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.isActive !== false
                            ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                            : 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
                        }`}
                      >
                        {u.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="p-3 text-[var(--color-text-muted)] text-[11px]">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleUserActive(u._id, u.isActive !== false)}
                        className={`btn-sm ${
                          u.isActive !== false
                            ? 'btn-secondary text-[var(--color-error)]'
                            : 'btn-primary'
                        }`}
                      >
                        {u.isActive !== false ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                      No matching user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: CAMPAIGNS & COUPONS */}
      {/* ======================================================== */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                <Percent className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                Storewide Promotional Campaigns & Discount Coupons
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Create promotional discount codes for checkout discounts, cart size incentives, and seasonal sales.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="btn-primary btn-sm flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="card border border-[var(--color-border)] overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-[11px] font-semibold">
                <tr>
                  <th className="p-3">Coupon Code</th>
                  <th className="p-3">Discount Rate</th>
                  <th className="p-3">Min Order Amount</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {allCoupons.map((c) => {
                  const isExpired = new Date(c.expiresAt) < new Date();

                  return (
                    <tr key={c._id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[var(--color-primary)]">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCoupon(c.code, c._id)}
                            className="p-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors"
                            title="Copy Coupon Code"
                          >
                            {copiedCouponId === c._id ? (
                              <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-3 font-bold text-xs tabular-nums text-[var(--color-text)]">
                        {c.discountPercent}% OFF
                      </td>

                      <td className="p-3 tabular-nums text-[var(--color-text-muted)]">
                        ₹{(c.minOrderAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="p-3 text-[var(--color-text-muted)] text-[11px]">
                        {new Date(c.expiresAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            !isExpired && c.isActive !== false
                              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                              : 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
                          }`}
                        >
                          {!isExpired && c.isActive !== false ? 'Active' : 'Expired'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c._id, c.code)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)] rounded hover:bg-[var(--color-bg)] transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {allCoupons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                      No active discount coupons found. Create your first campaign above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: DISPUTES & RETURNS ARBITRATION */}
      {/* ======================================================== */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              Customer Returns, Claims & Dispute Arbitration
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Amazon A-to-Z style guarantee arbitration. Mediate returns between buyers and sellers.
            </p>
          </div>

          <div className="card border border-[var(--color-border)] overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase text-[11px] font-semibold">
                <tr>
                  <th className="p-3">Order & Product</th>
                  <th className="p-3">Claimant Customer</th>
                  <th className="p-3">Seller Store</th>
                  <th className="p-3">Claim Amount</th>
                  <th className="p-3">Dispute Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Arbitration Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {allDisputes.map((d) => (
                  <tr key={d._id} className="hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-[var(--color-text)] block">
                        #{d.orderId}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] block truncate max-w-xs">
                        {d.productTitle}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-medium text-[var(--color-text)] block">
                        {d.userId?.fullName || 'Customer'}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">
                        {d.userId?.phoneNumber || d.userId?.email || 'N/A'}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-medium text-[var(--color-text)] block">
                        {d.sellerId?.businessName || 'Platform Vendor'}
                      </span>
                    </td>

                    <td className="p-3 font-bold text-[var(--color-primary)] tabular-nums">
                      ₹{(d.refundAmount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3">
                      <span className="font-medium text-[var(--color-text)] block">{d.reason}</span>
                      {d.customerNotes && (
                        <span className="text-[10px] text-[var(--color-text-muted)] block truncate max-w-xs">
                          &quot;{d.customerNotes}&quot;
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          d.status === 'VERIFIED_REFUNDED'
                            ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                            : d.status === 'REJECTED'
                            ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]'
                            : 'bg-[var(--color-warning-bg, #fef3c7)] text-[var(--color-warning, #d97706)]'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleResolveDispute(d._id, 'VERIFIED_REFUNDED')}
                          className="btn-primary btn-sm py-1 px-2 text-[10px]"
                          title="Grant buyer full refund"
                        >
                          Approve Refund
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveDispute(d._id, 'REJECTED')}
                          className="btn-secondary btn-sm py-1 px-2 text-[10px] text-[var(--color-error)]"
                          title="Reject dispute claim"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {allDisputes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                      No dispute claims or buyer arbitration requests logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: FESTIVAL & SEASONAL THEME GOVERNANCE */}
      {/* ======================================================== */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          {/* Header & Status Card */}
          <div className="card p-5 border border-[var(--color-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)]">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  Admin-Exclusive Platform Styling
                </span>
                {isFestivalMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-accent)] text-[var(--color-accent-text)] border border-[var(--color-border)]">
                    Festive Mode Live
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-[var(--color-text)]">
                Marketplace Festive & Seasonal Themes
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] max-w-2xl">
                Switch themes during Indian & international festivals (Diwali, Holi, Eid, Christmas, Independence Day, etc.). 
                Theme changes propagate in real-time across the entire storefront for all visitors and customers.
              </p>
            </div>

            <div className="p-3 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs text-right shrink-0">
              <span className="text-[11px] text-[var(--color-text-muted)] block">Currently Active Theme</span>
              <span className="font-bold text-[var(--color-primary)] text-sm flex items-center justify-end gap-1.5 mt-0.5">
                <span>
                  {FESTIVAL_THEMES_CONFIG.find((t) => t.id === festivalTheme)?.icon || '🌿'}
                </span>
                <span>
                  {FESTIVAL_THEMES_CONFIG.find((t) => t.id === festivalTheme)?.name || 'Classic Emerald'}
                </span>
              </span>
            </div>
          </div>

          {/* Festival Aura & Announcement Banner Controls */}
          <div className="card p-5 border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                  Storewide Festive Announcement Ribbon
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Configure the celebratory announcement bar that appears at the top of every page.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFestivalMode}
                  onChange={(e) => setLocalFestivalMode(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-xs font-bold text-[var(--color-text)]">
                  Enable Festival Mode
                </span>
              </label>
            </div>

            <form onSubmit={handleSaveFestivalSettings} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text)]">
                  Festive Greeting / Sale Announcement Text
                </label>
                <input
                  type="text"
                  maxLength={250}
                  placeholder="e.g. ✨ Shubh Deepawali Sale: Special Festive Offers & Lightning Discounts Live on Hayroo! ✨"
                  value={localBannerText}
                  onChange={(e) => setLocalBannerText(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                />
                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-1">
                  <span>Shown at the top of the storefront when Festival Mode is checked.</span>
                  <span>{localBannerText.length}/250</span>
                </div>
              </div>

              {/* Quick Preset Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                  Quick Festival Greeting Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '🪔 Diwali Sale', text: '✨ Shubh Deepawali: Celebrate with exclusive festive discounts & lightning deals across Hayroo!' },
                    { label: '🎨 Holi Special', text: '🎨 Rang Barse: Celebrate the festival of colors with vibrant seasonal collections & free delivery!' },
                    { label: '🌙 Eid Mubarak', text: '🌙 Eid Mubarak: Blessed greetings and celebratory festive offers for you and your family!' },
                    { label: '🎄 Christmas Joy', text: '🎄 Festive Joy: Merry Christmas and Happy New Year special deals on premium essentials!' },
                    { label: '🇮🇳 National Pride', text: '🇮🇳 Pride of the Nation: Celebrate with special Indian-crafted collections & festive perks!' },
                    { label: '🌧️ Monsoon Delights', text: '🌧️ Monsoon Delights: Refreshing rainy season deals & lightning delivery at your doorstep!' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLocalBannerText(preset.text)}
                      className="px-2.5 py-1 rounded bg-[var(--color-bg-subtle)] hover:bg-[var(--color-border-subtle)] text-[11px] font-medium border border-[var(--color-border)] text-[var(--color-text)] transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSyncingFestival}
                  className="btn-primary btn-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSyncingFestival ? 'Saving Settings...' : 'Save Festival Banner Settings'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Curated Aesthetic Themes Grid */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                Curated Minimalist & Aesthetic Color Palettes (7 Presets)
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                Selecting a theme instantly transforms buttons, accents, badges, navigation, and checkout surfaces for both light & dark modes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FESTIVAL_THEMES_CONFIG.map((themeItem) => {
                const isActive = festivalTheme === themeItem.id;

                return (
                  <div
                    key={themeItem.id}
                    className={`card p-5 border transition-all space-y-3.5 flex flex-col justify-between ${
                      isActive
                        ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-ring)] shadow-sm'
                        : 'border-[var(--color-border)] hover:border-[var(--color-text-subtle)]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl" role="img" aria-label={themeItem.name}>
                            {themeItem.icon}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-[var(--color-text)]">
                              {themeItem.name}
                            </h4>
                            <span className="text-[10px] text-[var(--color-primary)] font-semibold block">
                              {themeItem.tag}
                            </span>
                          </div>
                        </div>

                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-border)] shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                        {themeItem.description}
                      </p>

                      <div className="text-[10px] text-[var(--color-text-subtle)] italic">
                        <strong>Best for:</strong> {themeItem.occasion}
                      </div>
                    </div>

                    {/* Color Swatches Strip */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-[var(--color-text-muted)] block uppercase tracking-wider">
                        Color Tokens Swatch
                      </span>
                      <div className="flex items-center gap-1.5 p-2 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                        <div
                          className="w-6 h-6 rounded border border-black/10 shadow-xs"
                          style={{ backgroundColor: themeItem.primaryColor }}
                          title={`Primary Light: ${themeItem.primaryColor}`}
                        />
                        <div
                          className="w-6 h-6 rounded border border-black/10 shadow-xs"
                          style={{ backgroundColor: themeItem.primaryDarkColor }}
                          title={`Primary Dark: ${themeItem.primaryDarkColor}`}
                        />
                        <div
                          className="w-6 h-6 rounded border border-black/10 shadow-xs"
                          style={{ backgroundColor: themeItem.accentColor }}
                          title={`Accent: ${themeItem.accentColor}`}
                        />
                        <div
                          className="w-6 h-6 rounded border border-black/10 shadow-xs"
                          style={{ backgroundColor: themeItem.bgColor }}
                          title={`Canvas Light: ${themeItem.bgColor}`}
                        />
                        <div
                          className="w-6 h-6 rounded border border-black/10 shadow-xs"
                          style={{ backgroundColor: themeItem.bgDarkColor }}
                          title={`Canvas Dark: ${themeItem.bgDarkColor}`}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-[var(--color-border)]">
                      <button
                        type="button"
                        onClick={() => handleApplyTheme(themeItem.id)}
                        disabled={isActive || isSyncingFestival}
                        className={`w-full btn-sm flex items-center justify-center gap-1.5 ${
                          isActive
                            ? 'btn-secondary text-[var(--color-primary)] opacity-80 cursor-default'
                            : 'btn-primary'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Currently Active</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Apply Site-Wide</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full p-6 space-y-5 border border-[var(--color-border)] my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">
                  {editingProduct ? 'Edit Catalog SKU' : 'Publish New Platform Product'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Specify marketplace pricing, category tagging, stock levels, and store promotions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple, Sony, Hayroo"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2499"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]">MRP / Original Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 3999"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Available Stock (Units) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 50"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                {/* Direct Image Upload or URL */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Product Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL or upload ->"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                    <label className="btn-secondary btn-sm cursor-pointer shrink-0 flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {prodImage && (
                <div className="flex items-center gap-3 p-2.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
                  <img
                    src={prodImage}
                    alt="Preview"
                    className="w-12 h-12 object-contain rounded bg-[var(--color-card)] p-1 border border-[var(--color-border)] shrink-0"
                  />
                  <div className="truncate text-[11px] text-[var(--color-text-muted)]">
                    <span className="font-semibold text-[var(--color-text)] block">Active Image Source</span>
                    <span className="truncate block max-w-sm">{prodImage}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--color-text)]">Description & Specifications</label>
                <textarea
                  rows={3}
                  placeholder="Detailed specifications, warranty information, and package contents..."
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              {/* Marketing Toggles */}
              <div className="p-3 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex flex-wrap items-center gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="font-medium text-[var(--color-text)]">Feature on Homepage Banner</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFlashSale}
                    onChange={(e) => setProdIsFlashSale(e.target.checked)}
                    className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="font-medium text-[var(--color-text)]">Include in Lightning Flash Deals</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-secondary btn-sm"
                  disabled={isSavingProduct}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm flex items-center gap-1.5"
                  disabled={isSavingProduct}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingProduct ? 'Saving SKU...' : editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DELETE PRODUCT CONFIRMATION */}
      {/* ======================================================== */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 border border-[var(--color-border)]">
            <div className="flex items-center gap-3 text-[var(--color-error)]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[var(--color-text)]">Confirm SKU Deletion</h3>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[var(--color-text)]">&quot;{deletingProduct.title}&quot;</strong> from the
              Hayroo catalog? This will remove the listing across all search indexes and seller channels.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="btn-primary btn-sm bg-[var(--color-error)] hover:bg-[var(--color-error)]/90"
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CREATE COUPON */}
      {/* ======================================================== */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 border border-[var(--color-border)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">Create Promotion Coupon</h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Launch discount code for checkout conversion
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--color-text)]">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE25, DIWALI50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 font-mono font-bold uppercase text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--color-text)]">Discount % *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[var(--color-text)]">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponMinAmount}
                    onChange={(e) => setCouponMinAmount(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--color-text)]">Valid Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={couponExpiryDays}
                  onChange={(e) => setCouponExpiryDays(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="btn-secondary btn-sm"
                  disabled={isSavingCoupon}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm flex items-center gap-1.5"
                  disabled={isSavingCoupon}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingCoupon ? 'Activating...' : 'Activate Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ORDER DETAILS INVOICE DRAWER */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card max-w-xl w-full p-6 space-y-4 border border-[var(--color-border)] my-8 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--color-primary)] block">
                  Logistics Master Record
                </span>
                <h3 className="text-base font-bold text-[var(--color-text)]">
                  Order #{selectedOrder.orderId || selectedOrder._id.slice(-8)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--color-text)]">Fulfillment Status:</span>
                <span className="font-bold text-[var(--color-primary)]">{selectedOrder.orderStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Payment Method:</span>
                <span className="text-[var(--color-text)] font-medium">
                  {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Order Timestamp:</span>
                <span className="text-[var(--color-text)]">
                  {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[var(--color-text)]">Shipping Address:</span>
              <p className="p-2.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                {selectedOrder.shippingAddress?.fullName}
                <br />
                {selectedOrder.shippingAddress?.addressLine1 || selectedOrder.shippingAddress?.street}
                <br />
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                <br />
                Phone: {selectedOrder.shippingAddress?.phoneNumber || selectedOrder.user?.phoneNumber || 'N/A'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[var(--color-text)]">Ordered Line Items ({selectedOrder.items?.length || 0}):</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.imageLight || item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'}
                        alt={item.title}
                        className="w-9 h-9 object-contain rounded bg-[var(--color-card)] p-0.5 border border-[var(--color-border)] shrink-0"
                      />
                      <div className="max-w-[200px] truncate">
                        <span className="font-bold text-[var(--color-text)] block truncate">{item.title}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          Qty: {item.quantity} × ₹{(item.price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-[var(--color-text)] tabular-nums">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-sm">
              <span className="font-bold text-[var(--color-text)]">Grand Total:</span>
              <span className="text-base font-bold text-[var(--color-primary)] tabular-nums">
                ₹{(selectedOrder.grandTotal || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary btn-sm"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
