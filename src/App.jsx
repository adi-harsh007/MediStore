import React, { useState, useEffect } from "react";
import Admin from "./pages/AdminPage.jsx";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import ListingPage from "./pages/ListingPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MyOrdersPage from "./pages/MyOrdersPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import { s, API } from "./utils/theme.js";

export default function App() {
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "home";
  });
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userLoading, setUserLoading] = useState(!!localStorage.getItem("token"));
  const [categoryData, setCategoryData] = useState([]);

  // Load user-specific cart when user changes
  useEffect(() => {
    if (user) {
      try {
        const saved = localStorage.getItem(`cart_${user.id}`);
        setCart(saved ? JSON.parse(saved) : []);
      } catch { setCart([]); }
    } else {
      setCart([]);
    }
  }, [user]);

  // Persist cart to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  // Sync page state with URL hash
  useEffect(() => {
    window.location.hash = page;
  }, [page]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      setPage(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const fetchProducts = (pageNum = 1) => {
    fetch(`${API}/api/products?page=${pageNum}&limit=12`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.products.map(p => ({
          ...p,
          tags: [p.prescriptionRequired ? "Rx Only" : "OTC"],
          prescription: p.prescriptionRequired
        })).filter(p => p.isActive !== false);
        
        if (pageNum === 1) {
          setProducts(formatted);
        } else {
          setProducts(prev => {
            // Prevent duplicates if clicked twice quickly
            const newProducts = formatted.filter(newP => !prev.some(p => p.id === newP.id));
            return [...prev, ...newProducts];
          });
        }
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch(console.error);
  };

  const fetchCategories = () => {
    fetch(`${API}/api/products/categories`)
      .then(res => res.json())
      .then(data => setCategoryData(data.categories || []))
      .catch(console.error);
  };

  const [wishlist, setWishlist] = useState([]);
  
  const fetchWishlist = (token) => {
    fetch(`${API}/api/user/wishlist`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWishlist(data.map(item => item.product));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts(1);
    fetchCategories();

    const token = localStorage.getItem("token");
    if (token) {
      // Verify user with backend instead of trusting localStorage alone
      fetch(`${API}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => {
          if (!r.ok) throw new Error("Invalid token");
          return r.json();
        })
        .then(data => {
          const verifiedUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            isAdmin: data.role === "ADMIN"
          };
          localStorage.setItem("user", JSON.stringify(verifiedUser));
          setUser(verifiedUser);
          setUserLoading(false);
          fetchWishlist(token); // Load wishlist on successful login
        })
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setWishlist([]);
          setUserLoading(false);
        });
    } else {
      setUserLoading(false);
    }
  }, []);

  const onAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} added to cart`, "success");
  };

  const toggleWishlist = (product) => {
    if (!user) {
      showToast("Please login to save items to your wishlist.", "warning");
      setPage("auth");
      return;
    }
    const token = localStorage.getItem("token");
    const isWishlisted = wishlist.some(p => p.id === product.id);

    if (isWishlisted) {
      // Optimistic update
      setWishlist(prev => prev.filter(p => p.id !== product.id));
      showToast(`${product.name} removed from wishlist`, "info");
      
      fetch(`${API}/api/user/wishlist/${product.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.error(err);
        fetchWishlist(token); // Revert on failure
      });
    } else {
      // Optimistic update
      setWishlist(prev => [product, ...prev]);
      showToast(`${product.name} added to wishlist`, "success");

      fetch(`${API}/api/user/wishlist`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId: product.id })
      }).catch(err => {
        console.error(err);
        fetchWishlist(token); // Revert on failure
      });
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Protect admin route
  useEffect(() => {
    if (userLoading) return; // Wait for user to load
    if (page === "admin" && (!user || !user.isAdmin)) {
      setPage("home");
    }
  }, [page, user, userLoading]);

  return (
    <div style={s.app}>
      <style>{`
        @keyframes slideInToast {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Navbar page={page} setPage={setPage} cartCount={cartCount} user={user} setUser={setUser} setCart={setCart} wishlistCount={wishlist.length} setActiveCategory={setSelectedCategory} />
      {page === "home" && <HomePage products={products} setPage={setPage} setActiveCategory={setSelectedCategory} setSelectedProduct={setSelectedProduct} onAddToCart={onAddToCart} categoryData={categoryData} user={user} showToast={showToast} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
      {page === "listing" && <ListingPage setPage={setPage} selectedCat={selectedCategory} setSelectedCat={setSelectedCategory} setSelectedProduct={setSelectedProduct} onAddToCart={onAddToCart} categoryData={categoryData} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
      {page === "detail" && <DetailPage product={selectedProduct} setPage={setPage} cart={cart} onAddToCart={onAddToCart} user={user} showToast={showToast} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
      {page === "cart" && <CartPage cart={cart} setCart={setCart} setPage={setPage} showToast={showToast} />}
      {page === "wishlist" && <WishlistPage wishlist={wishlist} setPage={setPage} setSelectedProduct={setSelectedProduct} onAddToCart={onAddToCart} toggleWishlist={toggleWishlist} user={user} />}
      {page === "auth" && <AuthPage setPage={setPage} setUser={setUser} />}
      {page === "profile" && user && <ProfilePage setPage={setPage} user={user} setUser={setUser} />}
      {page === "my-orders" && user && <MyOrdersPage setPage={setPage} />}
      {page === "admin" && user && user.isAdmin && <Admin />}
      {toast && (() => {
        const cfg = {
          success: { bg: "linear-gradient(135deg, #065F46, #047857)", icon: "✓", iconBg: "rgba(255,255,255,0.2)", color: "#fff" },
          error:   { bg: "linear-gradient(135deg, #991B1B, #DC2626)", icon: "✗", iconBg: "rgba(255,255,255,0.2)", color: "#fff" },
          warning: { bg: "linear-gradient(135deg, #92400E, #D97706)", icon: "!", iconBg: "rgba(255,255,255,0.2)", color: "#fff" },
          info:    { bg: "linear-gradient(135deg, #1E40AF, #3B82F6)", icon: "i", iconBg: "rgba(255,255,255,0.2)", color: "#fff" },
        };
        const t = cfg[toast.type] || cfg.success;
        return (
          <div style={{ ...s.toast, background: t.bg, color: t.color }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{t.icon}</div>
            {toast.message}
            <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 18, cursor: "pointer", marginLeft: 8, lineHeight: 1, padding: 0 }}>✕</button>
          </div>
        );
      })()}
    </div>
  );
}