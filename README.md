# 🛒 Hayroo - Modern E-Commerce Frontend Web Application

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**Hayroo** is a state-of-the-art, feature-rich E-Commerce frontend application built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Lucide Icons**. It features a modern dark-mode aesthetic, rich micro-interactions, dynamic state management, slide-over drawers, and a complete multi-step checkout workflow.

---

## 🔥 Key Features & Capabilities

### 🛒 1. Slide-Over Shopping Cart Drawer
- **Slide-Over Drawer**: Smooth right-side drawer with backdrop blur.
- **Quantity Controls**: Adjust item quantities (`+` / `-`) or remove items instantly.
- **Free Shipping Progress Bar**: Real-time progress bar calculated dynamically based on subtotal.
- **Promo Code Engine**: Apply code `HAYROO10` for an instant 10% discount.
- **Cost Calculations**: Live calculations for Subtotal, Discount, GST (18%), Shipping, and Grand Total.

### 💳 2. Multi-Step Checkout Wizard Modal
- **Step 1 (Shipping Address)**: Form inputs for Full Name, Phone Number, Street Address, City, and Pincode.
- **Step 2 (Payment Selection)**: Supports UPI (Google Pay, PhonePe), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).
- **Step 3 (Order Receipt)**: Generates a unique Order ID (`#HYR-XXXXX`), estimated delivery date, address confirmation, and success toast.

### 🏷️ 3. 17 Interactive Product Categories
Dedicated product listings for **all 17 categories**:
- 💻 **Computers**: Apple iMac 27", Apple MacBook Pro 16", Dell XPS 15.
- 📱 **Phone & Tablets**: Apple iPhone 15 Pro Max, Apple iPad Pro, Samsung Galaxy S23 Ultra.
- ⚡ **Electronics**: Apple Watch Series 9, Apple AirPods Pro, Sony WH-1000XM5 Headphones.
- 📺 **TV & Projectors**: Apple TV 4K, Samsung 65" Neo QLED 4K Smart TV.
- 🎮 **Gaming**: PlayStation 5 Console, Logitech G Pro X Wireless Mouse.
- 👕 **Fashion**: Classic Denim Jacket, Urban Runner Leather Sneakers.
- 🧸 **Toys**: LEGO Star Wars Millennium Falcon Set.
- 🏋️ **Sport**: Pro Fitness Adjustable Dumbbells.
- 🥗 **Grocery**: Organic Whole Food Superfood Gift Basket.
- 🩺 **Health**: Omron Digital Bluetooth Blood Pressure Monitor.
- 🚗 **Auto**: 70mai Smart Dash Cam 4K.
- 📚 **Books**: Atomic Habits by James Clear.
- 🧹 **Home**: Dyson V15 Detect Vacuum Cleaner.
- 📷 **Photo/Video**: Sony Alpha A7 IV Mirrorless Camera.
- 🏆 **Collectibles**: Funko Pop! Marvel Avengers Limited Edition.
- 💄 **Beauty**: Estée Lauder Advanced Night Repair Serum.

### ⚡ 4. Flash Sale Live Countdown Banner
- Sticky top banner with a live ticking countdown clock (`HH : MM : SS`).
- Highlights active promo discount offers (`HAYROO10` for 10% OFF).

### ❤️ 5. Wishlist System & Slide-Over Drawer
- Animated red filled heart button toggle on product cards.
- Live Wishlist counter badge in header navigation.
- Dedicated Wishlist slide-over drawer allowing users to move saved items directly into the cart.

### 👁️ 6. Instant Quick-View Spec Overlay Modal
- Click the Quick View Eye icon on any product card to open an instant spec preview popup without leaving the catalog page.

### 🔍 7. Live Search, Sorting & Price Range Filter
- **Live Search**: Instant keyword filtering across all products.
- **Sorting**: Sort products by *Featured/Default*, *Price: Low to High*, *Price: High to Low*, and *Top Rated*.
- **Price Range Chips**: Instant filter chips (*All Prices*, *Under ₹500*, *₹500 - ₹1,500*, *Above ₹1,500*).

### 🔔 8. Animated Toast Notification System
- Floating bottom-right notifications for Cart additions, Wishlist updates, Promo code activations, and Share link copying.

### 🕒 9. Recently Viewed Session Tracker
- Session-based history tracker showcasing recently inspected products.

### 🔗 10. Product Share Link
- Share button on product detail pages that copies the direct URL to the clipboard with confirmation toast feedback.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```text
ecommerce-frontend/
├── public/
├── src/
│   ├── assets/
│   │   ├── component/
│   │   │   ├── button.jsx          # Reusable Button Component
│   │   │   ├── cartdrawer.jsx      # Slide-Over Cart Drawer
│   │   │   ├── category.jsx        # 17 Categories Grid
│   │   │   ├── checkoutmodal.jsx   # 3-Step Checkout Wizard
│   │   │   ├── featuredproduct.jsx # Filterable Product Grid
│   │   │   ├── flashbanner.jsx     # Live Ticking Countdown Banner
│   │   │   ├── footer.jsx          # Footer & Legal Links
│   │   │   ├── hero.jsx            # Hero Banner & Category Shortcuts
│   │   │   ├── modal.jsx           # Info & Auth Modal Dialogs
│   │   │   ├── navbar.jsx          # Sticky Top Navigation & Badges
│   │   │   ├── productcard.jsx     # Product Card Component
│   │   │   ├── productdetail.jsx   # Product Detail Page
│   │   │   ├── quickviewmodal.jsx  # Spec Preview Overlay
│   │   │   ├── recentlyviewed.jsx  # Session History Tracker
│   │   │   ├── toast.jsx           # Floating Notifications
│   │   │   └── wishlistdrawer.jsx  # Wishlist Slide-Over Drawer
│   │   └── data/
│   │       └── product.js          # Product Catalog Dataset
│   ├── App.jsx                     # Central App State & Routing
│   ├── index.css                   # Tailwind Styles
│   └── main.jsx                    # Application Entry
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18+) installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-github-username>/hayroo.git
   cd hayroo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5174/`.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📝 License & Author

Distributed under the **MIT License**.

Built with pride by **Tanmay Gupta**  
📧 Email: [varshneytanmay75@gmail.com](mailto:varshneytanmay75@gmail.com)  
💻 GitHub: [hayroo](https://github.com/varshneytanmay75/hayroo)
