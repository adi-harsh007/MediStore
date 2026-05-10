import { useState, useEffect } from "react";
import { GoogleLogin } from '@react-oauth/google';
import Admin from "./Admin.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const COLORS = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  primaryLight: "#CCFBF1",
  bg: "#FAFAFA",
  white: "#FFFFFF",
  text: "#111827",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  danger: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
};

// Static PRODUCTS array removed; fetching from backend now

// Category visual config (icon, colors) — counts come from DB
const CATEGORY_STYLE = {
  "Pain Relief": { icon: "💊", color: "#FEF3C7", border: "#F59E0B" },
  "Vitamins":    { icon: "✨", color: "#ECFDF5", border: "#10B981" },
  "Antibiotics": { icon: "💉", color: "#EFF6FF", border: "#3B82F6" },
  "Digestive":   { icon: "🫁", color: "#F0FDF4", border: "#22C55E" },
  "Allergy":     { icon: "🤧", color: "#FDF4FF", border: "#A855F7" },
  "Diabetes":    { icon: "🩸", color: "#FFF1F2", border: "#F43F5E" },
  "Cholesterol": { icon: "❤️", color: "#FFF7ED", border: "#F97316" },
};
const DEFAULT_STYLE = { icon: "💊", color: "#F3F4F6", border: "#9CA3AF" };

const s = {
  app: { fontFamily: "'Plus Jakarta Sans', sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text },
  nav: { background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 100, padding: "0 2rem" },
  navInner: { maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 },
  logo: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  logoMark: { width: 36, height: 36, background: COLORS.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 },
  logoText: { fontSize: 20, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.5px" },
  logoSpan: { color: COLORS.primary },
  navLinks: { display: "flex", gap: 28, listStyle: "none", margin: 0, padding: 0 },
  navLink: { fontSize: 14, fontWeight: 500, color: COLORS.textMuted, cursor: "pointer", transition: "color 0.2s" },
  cartBtn: { display: "flex", alignItems: "center", gap: 8, background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  cartBadge: { background: "#fff", color: COLORS.primary, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 },
  page: { maxWidth: 1200, margin: "0 auto", padding: "2rem" },
  hero: { background: `linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)`, borderRadius: 20, padding: "3.5rem", color: "#fff", marginBottom: "2.5rem", position: "relative", overflow: "hidden" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, marginBottom: 16, backdropFilter: "blur(4px)" },
  heroTitle: { fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 16, letterSpacing: "-1px" },
  heroSub: { fontSize: 17, opacity: 0.85, marginBottom: 28, maxWidth: 480, lineHeight: 1.6 },
  heroActions: { display: "flex", gap: 12 },
  heroBtnPrimary: { background: "#fff", color: COLORS.primaryDark, border: "none", borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  heroBtnSecondary: { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "13px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(4px)" },
  heroDecor: { position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)", fontSize: 120, opacity: 0.08 },
  sectionTitle: { fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 6 },
  sectionSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: "1.5rem" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: "2.5rem" },
  catCard: { borderRadius: 14, padding: "18px 12px", textAlign: "center", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", border: "1.5px solid transparent" },
  catIcon: { fontSize: 28, marginBottom: 8 },
  catName: { fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 2 },
  catCount: { fontSize: 11, color: COLORS.textMuted },
  prodGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  prodCard: { background: COLORS.white, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" },
  prodImg: { height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 },
  prodBody: { padding: "14px 16px" },
  prodCat: { fontSize: 11, fontWeight: 600, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 },
  prodName: { fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 },
  prodRating: { display: "flex", alignItems: "center", gap: 4, marginBottom: 10 },
  prodStar: { color: "#F59E0B", fontSize: 12 },
  prodRatingNum: { fontSize: 12, fontWeight: 600 },
  prodRatingCount: { fontSize: 11, color: COLORS.textMuted },
  prodPriceRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  prodPrice: { fontSize: 18, fontWeight: 800, color: COLORS.text },
  prodOriginal: { fontSize: 12, color: COLORS.textMuted, textDecoration: "line-through" },
  prodDiscount: { fontSize: 11, fontWeight: 700, color: COLORS.success, background: "#ECFDF5", padding: "2px 7px", borderRadius: 6 },
  addBtn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 10, width: "100%" },
  rxBadge: { display: "inline-flex", alignItems: "center", gap: 4, background: "#FFF1F2", color: "#F43F5E", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, marginBottom: 6 },
  trustRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: "2.5rem", marginBottom: "2rem" },
  trustCard: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "20px 16px", display: "flex", alignItems: "flex-start", gap: 12 },
  trustIcon: { fontSize: 24, width: 44, height: 44, background: COLORS.primaryLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  trustTitle: { fontSize: 14, fontWeight: 700, marginBottom: 3 },
  trustDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 },
  filterSidebar: { width: 220, flexShrink: 0 },
  filterTitle: { fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: COLORS.textMuted, marginBottom: 10 },
  filterOption: { display: "flex", alignItems: "center", gap: 8, padding: "7px 0", cursor: "pointer", fontSize: 14, fontWeight: 500 },
  listingLayout: { display: "flex", gap: 24 },
  listingMain: { flex: 1 },
  listingHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  searchBox: { display: "flex", alignItems: "center", gap: 10, background: COLORS.white, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "9px 14px", width: 280 },
  searchInput: { border: "none", outline: "none", fontSize: 14, flex: 1, background: "transparent", color: COLORS.text },
  sortSelect: { border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "9px 14px", fontSize: 14, background: COLORS.white, cursor: "pointer", outline: "none", color: COLORS.text },
  inStockBadge: { background: "#ECFDF5", color: "#059669", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 },
  outStockBadge: { background: "#F9FAFB", color: COLORS.textLight, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 },
  detailLayout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" },
  detailImgBox: { borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, aspectRatio: "1", border: `1px solid ${COLORS.border}` },
  detailCat: { fontSize: 13, fontWeight: 700, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 },
  detailName: { fontSize: 34, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 12 },
  detailRating: { display: "flex", alignItems: "center", gap: 8, marginBottom: 18 },
  detailRatingStars: { display: "flex", gap: 2, color: "#F59E0B", fontSize: 16 },
  detailPriceRow: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 },
  detailPrice: { fontSize: 36, fontWeight: 800 },
  detailOrig: { fontSize: 18, color: COLORS.textMuted, textDecoration: "line-through" },
  detailBadge: { fontSize: 13, fontWeight: 700, color: COLORS.success, background: "#ECFDF5", padding: "4px 10px", borderRadius: 8 },
  detailInfoBox: { background: COLORS.bg, borderRadius: 12, padding: "16px", marginBottom: 20 },
  detailInfoRow: { display: "flex", gap: 8, marginBottom: 8, fontSize: 14 },
  detailInfoLabel: { fontWeight: 600, color: COLORS.textMuted, minWidth: 120 },
  detailInfoVal: { color: COLORS.text },
  detailDesc: { fontSize: 15, lineHeight: 1.7, color: "#374151", marginBottom: 20 },
  qtyRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  qtyBtn: { width: 36, height: 36, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.white, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  qtyNum: { fontSize: 16, fontWeight: 700, minWidth: 24, textAlign: "center" },
  addToCartBtn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", flex: 1 },
  buyNowBtn: { background: COLORS.text, color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", flex: 1 },
  tagRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  tag: { fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted },
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: COLORS.primary, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 24 },
  cartLayout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" },
  cartItem: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "16px 20px", display: "flex", gap: 16, alignItems: "center", marginBottom: 12 },
  cartItemImg: { width: 60, height: 60, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 },
  cartItemName: { fontSize: 15, fontWeight: 700, marginBottom: 3 },
  cartItemCat: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  cartItemPriceRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  cartItemPrice: { fontSize: 17, fontWeight: 800 },
  cartQtyRow: { display: "flex", alignItems: "center", gap: 8 },
  cartQtyBtn: { width: 28, height: 28, border: `1.5px solid ${COLORS.border}`, borderRadius: 6, background: COLORS.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 },
  removeBtn: { background: "none", border: "none", color: COLORS.textLight, cursor: "pointer", fontSize: 18, padding: "0 4px" },
  summaryBox: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "24px" },
  summaryTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20 },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 12, color: COLORS.textMuted },
  summaryTotal: { display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, paddingTop: 14, borderTop: `1px solid ${COLORS.border}`, marginTop: 6 },
  checkoutBtn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 16 },
  emptyCart: { textAlign: "center", padding: "60px 20px", color: COLORS.textMuted },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  toast: { position: "fixed", bottom: 28, right: 28, borderRadius: 14, padding: "14px 22px 14px 18px", fontSize: 14, fontWeight: 600, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 12px 40px rgba(0,0,0,0.18)", maxWidth: 420, lineHeight: 1.4, animation: "slideInToast 0.35s cubic-bezier(0.16,1,0.3,1)" },
  authContainer: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 64px)", padding: "2rem" },
  authCard: { background: COLORS.white, borderRadius: 20, padding: "3rem", width: "100%", maxWidth: 440, border: `1px solid ${COLORS.border}`, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" },
  authTitle: { fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" },
  authSub: { fontSize: 15, color: COLORS.textMuted, marginBottom: 30 },
  formGroup: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 8 },
  input: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", transition: "border-color 0.2s" },
  authBtn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 10 },
  authToggle: { textAlign: "center", marginTop: 24, fontSize: 14, color: COLORS.textMuted },
  authToggleLink: { color: COLORS.primary, fontWeight: 700, cursor: "pointer" },
  userMenu: { display: "flex", alignItems: "center", gap: 16 },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: COLORS.primaryLight, color: COLORS.primaryDark, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 },
  logoutBtn: { background: "none", border: "none", color: COLORS.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "color 0.2s" },
};

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB", fontSize: 13 }}>★</span>
      ))}
    </div>
  );
}

function Discount({ price, original }) {
  const pct = Math.round((1 - price / original) * 100);
  return <span style={s.prodDiscount}>{pct}% off</span>;
}

function ProductCard({ product, onClick, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...s.prodCard, transform: hovered ? "translateY(-3px)" : "none", boxShadow: hovered ? "0 10px 30px rgba(0,0,0,0.08)" : "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={{ ...s.prodImg, background: product.color }}>
        <span>{product.icon}</span>
      </div>
      <div style={s.prodBody}>
        {product.prescription && <div style={s.rxBadge}>Rx Required</div>}
        <div style={s.prodCat}>{product.category}</div>
        <div style={s.prodName}>{product.name}</div>
        <div style={s.prodRating}>
          <StarRating rating={product.rating} />
          <span style={s.prodRatingNum}>{product.rating}</span>
          <span style={s.prodRatingCount}>({product.reviews.toLocaleString()})</span>
        </div>
        <div style={s.prodPriceRow}>
          <div>
            <span style={s.prodPrice}>₹{product.price}</span>
            {" "}
            <span style={s.prodOriginal}>₹{product.originalPrice}</span>
          </div>
          <Discount price={product.price} original={product.originalPrice} />
        </div>
        {product.inStock
          ? <span style={s.inStockBadge}>In Stock</span>
          : <span style={s.outStockBadge}>Out of Stock</span>}
        <button
          style={{ ...s.addBtn, opacity: product.inStock ? 1 : 0.5 }}
          onClick={e => { e.stopPropagation(); if (product.inStock) onAddToCart(product); }}
        >
          + Add to Cart
        </button>
      </div>
    </div>
  );
}

function Navbar({ page, setPage, cartCount, user, setUser, setCart }) {
  const links = ["Home", "Medicines"];
  if (user) links.push("My Orders");
  if (user && user.isAdmin) links.push("Admin");

  return (
    <nav style={s.nav}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={s.navInner}>
        <div style={s.logo} onClick={() => setPage("home")}>
          <div style={s.logoMark}>M</div>
          <span style={s.logoText}>Medi<span style={s.logoSpan}>Store</span></span>
        </div>
        <ul style={s.navLinks}>
          {links.map(link => {
            const linkPage = link === "Medicines" ? "listing" : link === "My Orders" ? "my-orders" : link.toLowerCase();
            const isActive = page === linkPage;
            return (
              <li key={link}
                style={{
                  ...s.navLink,
                  color: isActive ? COLORS.primary : COLORS.textMuted,
                  fontWeight: isActive ? 700 : 500,
                  borderBottom: isActive ? `2.5px solid ${COLORS.primary}` : "2.5px solid transparent",
                  paddingBottom: 4,
                }}
                onClick={() => setPage(linkPage)}
              >{link}</li>
            );
          })}
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button style={s.cartBtn} onClick={() => setPage("cart")}>
            🛒 Cart
            {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
          </button>
          {user ? (
            <div style={s.userMenu}>
              <div style={{ ...s.avatar, cursor: "pointer" }} title="My Profile" onClick={() => setPage("profile")}>{user.name.charAt(0).toUpperCase()}</div>
              <button style={s.logoutBtn} onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setCart([]); setPage("home"); }}>Logout</button>
            </div>
          ) : (
            <button style={{ ...s.cartBtn, background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}` }} onClick={() => setPage("auth")}>
              Login / Signup
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function HomePage({ products, setPage, setSelectedProduct, onAddToCart, categoryData, user, showToast }) {
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxFile, setRxFile] = useState(null);
  const [rxUploading, setRxUploading] = useState(false);
  const [rxUploaded, setRxUploaded] = useState(false);
  const [rxError, setRxError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleRxUpload = async () => {
    if (!rxFile) return;
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login first to upload a prescription.", "warning");
      setPage("auth");
      return;
    }
    setRxUploading(true);
    setRxError(null);
    try {
      const formData = new FormData();
      formData.append("prescription", rxFile);
      const res = await fetch(`${API}/api/orders/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadedUrl(data.url);
      setRxUploaded(true);
    } catch (e) {
      setRxError(e.message || "Upload failed. Please try again.");
    } finally {
      setRxUploading(false);
    }
  };

  const closeRxModal = () => {
    setShowRxModal(false);
    setRxFile(null);
    setRxUploaded(false);
    setRxError(null);
    setUploadedUrl(null);
  };

  const rxModalStyles = {
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
    modal: { background: COLORS.white, borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", position: "relative" },
    closeBtn: { position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.textMuted, lineHeight: 1 },
    title: { fontSize: 22, fontWeight: 800, marginBottom: 6 },
    sub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24, lineHeight: 1.5 },
    dropzone: { border: `2px dashed ${COLORS.border}`, borderRadius: 14, padding: "40px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s", background: "#FAFAFA" },
    dropzoneActive: { border: `2px dashed ${COLORS.primary}`, borderRadius: 14, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: COLORS.primaryLight },
    fileName: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#F0FDF4", borderRadius: 10, marginTop: 16, fontSize: 14, fontWeight: 600, color: "#166534" },
    uploadBtn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 20, transition: "opacity 0.2s" },
    successBox: { textAlign: "center", padding: "20px 0" },
    errText: { fontSize: 13, color: COLORS.danger, marginTop: 12, fontWeight: 600 },
  };

  return (
    <div style={s.page}>
      {/* Prescription Upload Modal */}
      {showRxModal && (
        <div style={rxModalStyles.overlay} onClick={closeRxModal}>
          <div style={rxModalStyles.modal} onClick={e => e.stopPropagation()}>
            <button style={rxModalStyles.closeBtn} onClick={closeRxModal}>✕</button>

            {!rxUploaded ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={rxModalStyles.title}>Upload Prescription</div>
                <div style={rxModalStyles.sub}>
                  Upload your doctor's prescription and we'll help you order the right medicines. We accept images (JPG, PNG) and PDF files.
                </div>

                <label style={rxFile ? rxModalStyles.dropzoneActive : rxModalStyles.dropzone}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={e => { setRxFile(e.target.files[0]); setRxError(null); }}
                  />
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>Click to select file</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>JPG, PNG, or PDF (max 5MB)</div>
                </label>

                {rxFile && (
                  <div style={rxModalStyles.fileName}>
                    <span>📎</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rxFile.name}</span>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>{(rxFile.size / 1024).toFixed(0)} KB</span>
                  </div>
                )}

                {rxError && <div style={rxModalStyles.errText}>⚠ {rxError}</div>}

                <button
                  style={{ ...rxModalStyles.uploadBtn, opacity: (!rxFile || rxUploading) ? 0.6 : 1 }}
                  onClick={handleRxUpload}
                  disabled={!rxFile || rxUploading}
                >
                  {rxUploading ? "Uploading..." : "Upload Prescription"}
                </button>
              </>
            ) : (
              <div style={rxModalStyles.successBox}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Prescription Uploaded!</div>
                <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                  Your prescription has been uploaded successfully. You can now browse our prescription medicines and add them to your cart.
                </div>
                <button
                  style={rxModalStyles.uploadBtn}
                  onClick={() => { closeRxModal(); setPage("listing"); }}
                >
                  Browse Prescription Medicines →
                </button>
                <button
                  style={{ ...rxModalStyles.uploadBtn, background: "transparent", color: COLORS.textMuted, border: `1.5px solid ${COLORS.border}`, marginTop: 10 }}
                  onClick={closeRxModal}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={s.hero}>
        <div style={s.heroDecor}>💊</div>
        <div style={s.heroBadge}>🎉 Free delivery on orders above ₹499</div>
        <h1 style={s.heroTitle}>Your Health,<br />Delivered Fast.</h1>
        <p style={s.heroSub}>Genuine medicines, vitamins & healthcare products delivered to your doorstep.</p>
        <div style={s.heroActions}>
          <button style={s.heroBtnPrimary} onClick={() => setPage("listing")}>Shop Medicines</button>
          <button style={s.heroBtnSecondary} onClick={() => {
            const token = localStorage.getItem("token");
            if (!token) { showToast("Please login first to upload a prescription.", "warning"); setPage("auth"); return; }
            setShowRxModal(true);
          }}>Upload Prescription</button>
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={s.sectionTitle}>Shop by Category</h2>
          <span style={{ fontSize: 13, color: COLORS.primary, cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("listing")}>View all →</span>
        </div>
        <p style={s.sectionSub}>
          {categoryData.length > 0
            ? `Browse ${categoryData.reduce((s, c) => s + c.count, 0)} products across ${categoryData.length} categories`
            : "Loading categories…"}
        </p>
        <div style={s.catGrid}>
          {categoryData.map(cat => {
            const style = CATEGORY_STYLE[cat.name] || DEFAULT_STYLE;
            return (
              <div key={cat.name}
                style={{ ...s.catCard, background: style.color, borderColor: `${style.border}33` }}
                onClick={() => setPage("listing")}
              >
                <div style={s.catIcon}>{style.icon}</div>
                <div style={s.catName}>{cat.name}</div>
                <div style={s.catCount}>{cat.count} products</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={s.sectionTitle}>Best Sellers</h2>
          <span style={{ fontSize: 13, color: COLORS.primary, cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("listing")}>View all →</span>
        </div>
        <p style={s.sectionSub}>Most purchased medicines this month</p>
        <div style={s.prodGrid}>
          {products.slice(0, 4).map(p => (
            <ProductCard key={p.id} product={p}
              onClick={() => { setSelectedProduct(p); setPage("detail"); }}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ ...s.sectionTitle, marginBottom: 4 }}>Why Choose MediStore?</h2>
        <p style={s.sectionSub}>We prioritize your health above everything else</p>
        <div style={s.trustRow}>
          {[
            { icon: "✅", title: "100% Genuine", desc: "All medicines are sourced directly from licensed manufacturers and distributors." },
            { icon: "🚚", title: "Fast Delivery", desc: "Get medicines delivered within 2–4 hours in select cities, same-day otherwise." },
            { icon: "👩‍⚕️", title: "Pharmacist Support", desc: "Talk to a certified pharmacist anytime for advice on your prescriptions." },
            { icon: "🔒", title: "Secure Checkout", desc: "Your data and payments are protected with bank-grade encryption." },
          ].map(t => (
            <div key={t.title} style={s.trustCard}>
              <div style={s.trustIcon}><span style={{ fontSize: 20 }}>{t.icon}</span></div>
              <div>
                <div style={s.trustTitle}>{t.title}</div>
                <div style={s.trustDesc}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListingPage({ products, setPage, setSelectedProduct, onAddToCart, fetchProducts, currentPage, totalPages, categoryData }) {
  const dynamicCategories = ["All", ...categoryData.map(c => c.name)];
  const [selectedCat, setSelectedCat] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [rxFilter, setRxFilter] = useState(false);
  const [inStockFilter, setInStockFilter] = useState(false);

  let filtered = products.filter(p => {
    if (selectedCat !== "All" && p.category !== selectedCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (rxFilter && !p.prescription) return false;
    if (inStockFilter && !p.inStock) return false;
    return true;
  });

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (sort === "discount") filtered = [...filtered].sort((a, b) => (1 - a.price / a.originalPrice) - (1 - b.price / b.originalPrice)).reverse();

  return (
    <div style={s.page}>
      <h1 style={{ ...s.sectionTitle, fontSize: 28, marginBottom: 4 }}>All Medicines</h1>
      <p style={s.sectionSub}>Showing {filtered.length} products</p>
      <div style={s.listingLayout}>
        <div style={s.filterSidebar}>
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
            <div style={s.filterTitle}>Categories</div>
            {dynamicCategories.map(cat => (
              <div key={cat} style={{ ...s.filterOption, color: selectedCat === cat ? COLORS.primary : COLORS.text }}
                onClick={() => setSelectedCat(cat)}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selectedCat === cat ? COLORS.primary : COLORS.border}`, background: selectedCat === cat ? COLORS.primary : "transparent", flexShrink: 0 }} />
                {cat}
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 16, paddingTop: 16 }}>
              <div style={s.filterTitle}>Filters</div>
              <div style={{ ...s.filterOption }} onClick={() => setRxFilter(!rxFilter)}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${rxFilter ? COLORS.primary : COLORS.border}`, background: rxFilter ? COLORS.primary : "transparent", flexShrink: 0 }} />
                Prescription Only
              </div>
              <div style={{ ...s.filterOption }} onClick={() => setInStockFilter(!inStockFilter)}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${inStockFilter ? COLORS.primary : COLORS.border}`, background: inStockFilter ? COLORS.primary : "transparent", flexShrink: 0 }} />
                In Stock Only
              </div>
            </div>
          </div>
        </div>

        <div style={s.listingMain}>
          <div style={s.listingHeader}>
            <div style={s.searchBox}>
              <span style={{ color: COLORS.textMuted, fontSize: 16 }}>🔍</span>
              <input style={s.searchInput} placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select style={s.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Best Discount</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          {filtered.length === 0
            ? <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textMuted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600 }}>No products found</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Try a different search or category</div>
            </div>
            : <div style={{ ...s.prodGrid, gridTemplateColumns: "repeat(3, 1fr)" }}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p}
                  onClick={() => { setSelectedProduct(p); setPage("detail"); }}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          }
          {currentPage < totalPages && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button 
                style={{ background: "#fff", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", color: COLORS.text }}
                onClick={() => fetchProducts(currentPage + 1)}
              >
                Load More Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailPage({ product, setPage, cart, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const inCart = cart.find(i => i.id === product.id);

  if (!product) return null;
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => setPage("listing")}>← Back to Medicines</button>
      <div style={s.detailLayout}>
        <div style={{ ...s.detailImgBox, background: product.color }}>
          <span style={{ fontSize: 120 }}>{product.icon}</span>
        </div>
        <div>
          {product.prescription && <div style={{ ...s.rxBadge, marginBottom: 10 }}>Prescription Required</div>}
          <div style={s.detailCat}>{product.category}</div>
          <h1 style={s.detailName}>{product.name}</h1>
          <div style={s.detailRating}>
            <div style={s.detailRatingStars}><StarRating rating={product.rating} /></div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{product.rating}</span>
            <span style={{ color: COLORS.textMuted, fontSize: 14 }}>({product.reviews.toLocaleString()} reviews)</span>
            <span style={product.inStock ? s.inStockBadge : s.outStockBadge}>{product.inStock ? "In Stock" : "Out of Stock"}</span>
          </div>
          <div style={s.detailPriceRow}>
            <span style={s.detailPrice}>₹{product.price}</span>
            <span style={s.detailOrig}>₹{product.originalPrice}</span>
            <span style={s.detailBadge}>{discount}% off</span>
          </div>
          <p style={s.detailDesc}>{product.description}</p>
          <div style={s.tagRow}>
            {product.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}
          </div>
          <div style={s.detailInfoBox}>
            {[["Dosage", product.dosage], ["Manufacturer", product.manufacturer], ["Category", product.category]].map(([label, val]) => (
              <div key={label} style={s.detailInfoRow}>
                <span style={s.detailInfoLabel}>{label}</span>
                <span style={s.detailInfoVal}>{val}</span>
              </div>
            ))}
          </div>
          <div style={s.qtyRow}>
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Quantity</span>
            <button style={s.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span style={s.qtyNum}>{qty}</span>
            <button style={s.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ ...s.addToCartBtn, opacity: product.inStock ? 1 : 0.5 }}
              onClick={() => { if (product.inStock) { for (let i = 0; i < qty; i++) onAddToCart(product); } }}>
              {inCart ? "✓ Add More" : "🛒 Add to Cart"}
            </button>
            <button style={{ ...s.buyNowBtn, opacity: product.inStock ? 1 : 0.5 }}
              onClick={() => { if (product.inStock) { for (let i = 0; i < qty; i++) onAddToCart(product); setPage("cart"); } }}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPage({ cart, setCart, setPage, showToast }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState({});
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const rxRequired = cart.some(item => item.prescriptionRequired || item.prescription);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = subtotal >= 499 ? 0 : 49;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + delivery - discount;

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };
  const remove = id => setCart(prev => prev.filter(i => i.id !== id));

  const handleProceedToCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to checkout", "warning");
      setPage("auth");
      return;
    }
    // Pre-fill from profile if available
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.phone) setPhone(user.phone);
      if (user?.address) setAddress(user.address);
    } catch {}
    setShowCheckout(true);
  };

  const validateAndPlaceOrder = () => {
    const errs = {};
    if (!phone.trim() || phone.trim().length < 10) errs.phone = "Valid phone number is required (min 10 digits)";
    if (!address.trim() || address.trim().length < 10) errs.address = "Full delivery address is required (min 10 characters)";
    if (rxRequired && !prescriptionFile) errs.prescription = "Prescription file is required for your order";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    placeOrder();
  };

  const placeOrder = async () => {
    const token = localStorage.getItem("token");
    setPlacing(true);

    try {
      // Save address & phone to user profile
      await fetch(`${API}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phone: phone.trim(), address: address.trim() })
      });

      // Upload Prescription if required
      let prescriptionUrl = null;
      if (prescriptionFile) {
        const formData = new FormData();
        formData.append("prescription", prescriptionFile);
        const uploadRes = await fetch(`${API}/api/orders/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        if (!uploadRes.ok) throw new Error("Failed to upload prescription");
        const uploadData = await uploadRes.json();
        prescriptionUrl = uploadData.url;
      }

      // Create order on backend
      const orderRes = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.id, quantity: i.qty })),
          prescriptionUrl
        })
      });
      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Order creation failed');
      }
      const orderData = await orderRes.json();

      // If backend says use Razorpay, open payment modal
      if (orderData.useRazorpay) {
        const loadScript = () => new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
        const loaded = await loadScript();
        if (!loaded) { showToast('Razorpay SDK failed to load.', 'error'); setPlacing(false); return; }

        const rzp = new window.Razorpay({
          key: orderData.razorpayKeyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'MediStore',
          description: 'Payment for your order',
          order_id: orderData.razorpayOrderId,
          prefill: { contact: phone.trim() },
          handler: async function (response) {
            await fetch(`${API}/api/orders/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            showToast('Payment successful! Your order has been placed.', 'success');
            setCart([]);
            setPage("my-orders");
          },
          modal: { ondismiss: () => setPlacing(false) },
          theme: { color: '#0D9488' }
        });
        rzp.open();
      } else {
        showToast('Order placed successfully!', 'success');
        setCart([]);
        setPage("my-orders");
      }
    } catch (e) {
      console.error(e);
      showToast('Error creating order: ' + e.message, 'error');
      setPlacing(false);
    }
  };

  // ─── Checkout Page ───
  if (showCheckout) {
    const cs = {
      wrapper: { maxWidth: 900, margin: "0 auto", padding: "2rem" },
      grid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" },
      card: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, marginBottom: 20 },
      cardTitle: { fontSize: 17, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 },
      fieldGroup: { marginBottom: 20 },
      label: { display: "block", fontSize: 13, fontWeight: 700, color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" },
      input: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
      inputError: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.danger}`, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
      textarea: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", minHeight: 90, resize: "vertical" },
      textareaError: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.danger}`, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", minHeight: 90, resize: "vertical" },
      errText: { fontSize: 12, color: COLORS.danger, marginTop: 4, fontWeight: 600 },
      itemRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` },
      placeBtn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 12, padding: "15px", fontSize: 16, fontWeight: 800, cursor: "pointer", width: "100%", marginTop: 8, transition: "opacity 0.2s" },
    };

    return (
      <div style={cs.wrapper}>
        <button style={{ ...s.backBtn, marginBottom: 16 }} onClick={() => setShowCheckout(false)}>← Back to Cart</button>
        <h1 style={{ ...s.sectionTitle, fontSize: 28, marginBottom: 4 }}>Checkout</h1>
        <p style={s.sectionSub}>Review your order and enter delivery details</p>

        <div style={cs.grid}>
          {/* Left Column */}
          <div>
            {/* Delivery Details */}
            <div style={cs.card}>
              <div style={cs.cardTitle}>📍 Delivery Details</div>
              <div style={cs.fieldGroup}>
                <label style={cs.label}>Phone Number *</label>
                <input
                  style={errors.phone ? cs.inputError : cs.input}
                  type="tel"
                  placeholder="Enter your 10-digit phone number"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setErrors(er => ({ ...er, phone: undefined })); }}
                />
                {errors.phone && <div style={cs.errText}>{errors.phone}</div>}
              </div>
              <div style={cs.fieldGroup}>
                <label style={cs.label}>Delivery Address *</label>
                <textarea
                  style={errors.address ? cs.textareaError : cs.textarea}
                  placeholder="House/Flat No., Street, Locality, City, State, PIN Code"
                  value={address}
                  onChange={e => { setAddress(e.target.value); setErrors(er => ({ ...er, address: undefined })); }}
                />
                {errors.address && <div style={cs.errText}>{errors.address}</div>}
              </div>
              {rxRequired && (
                <div style={cs.fieldGroup}>
                  <label style={cs.label}>Upload Prescription *</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => { setPrescriptionFile(e.target.files[0]); setErrors(er => ({ ...er, prescription: undefined })); }}
                    style={{ ...cs.input, background: '#f9fafb' }}
                  />
                  {errors.prescription && <div style={cs.errText}>{errors.prescription}</div>}
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>Required for medicines in your cart. Upload image or PDF.</div>
                </div>
              )}
            </div>

            {/* Order Items Receipt */}
            <div style={cs.card}>
              <div style={cs.cardTitle}>🧾 Order Items ({cart.reduce((s, i) => s + i.qty, 0)})</div>
              {cart.map((item, i) => (
                <div key={item.id} style={{ ...cs.itemRow, borderBottom: i < cart.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>Qty: {item.qty} × ₹{item.price}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>₹{(item.price * item.qty).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Payment Summary */}
          <div>
            <div style={{ ...cs.card, position: "sticky", top: 24 }}>
              <div style={cs.cardTitle}>💳 Payment Summary</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10, color: COLORS.textMuted }}>
                  <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span style={{ color: COLORS.text, fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10, color: COLORS.textMuted }}>
                  <span>Delivery</span>
                  <span style={{ color: delivery === 0 ? COLORS.success : COLORS.text, fontWeight: 600 }}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10, color: COLORS.textMuted }}>
                  <span>Discount (5%)</span>
                  <span style={{ color: COLORS.success, fontWeight: 600 }}>−₹{discount.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: `2px solid ${COLORS.border}`, paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800 }}>
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                style={{ ...cs.placeBtn, opacity: placing ? 0.6 : 1 }}
                onClick={validateAndPlaceOrder}
                disabled={placing}
              >
                {placing ? "Processing..." : `Place Order — ₹${total.toLocaleString()}`}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, fontSize: 12, color: COLORS.textMuted }}>
                🔒 Secure & encrypted payment via Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Cart Page ───
  return (
    <div style={s.page}>
      <h1 style={{ ...s.sectionTitle, fontSize: 28, marginBottom: 4 }}>Your Cart</h1>
      <p style={s.sectionSub}>{cart.length} item{cart.length !== 1 ? "s" : ""} in your cart</p>
      {cart.length === 0
        ? <div style={s.emptyCart}>
          <div style={s.emptyIcon}>🛒</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</div>
          <div style={{ marginBottom: 20 }}>Add medicines to get started</div>
          <button style={{ ...s.addToCartBtn, width: "auto", padding: "12px 28px", borderRadius: 12, fontSize: 15 }} onClick={() => setPage("listing")}>Browse Medicines</button>
        </div>
        : <div style={s.cartLayout}>
          <div>
            {subtotal < 499 && (
              <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
                🚚 Add ₹{499 - subtotal} more for free delivery!
              </div>
            )}
            {cart.map(item => (
              <div key={item.id} style={s.cartItem}>
                <div style={{ ...s.cartItemImg, background: item.color }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={s.cartItemName}>{item.name}</div>
                  <div style={s.cartItemCat}>{item.category} · {item.manufacturer}</div>
                  <div style={s.cartItemPriceRow}>
                    <span style={s.cartItemPrice}>₹{(item.price * item.qty).toLocaleString()}</span>
                    <div style={s.cartQtyRow}>
                      <button style={s.cartQtyBtn} onClick={() => updateQty(item.id, -1)}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                      <button style={s.cartQtyBtn} onClick={() => updateQty(item.id, 1)}>+</button>
                      <button style={s.removeBtn} onClick={() => remove(item.id)} title="Remove">✕</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={s.summaryBox}>
              <div style={s.summaryTitle}>Order Summary</div>
              <div style={s.summaryRow}><span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div style={s.summaryRow}><span>Delivery</span><span style={{ color: delivery === 0 ? COLORS.success : COLORS.text }}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span></div>
              <div style={s.summaryRow}><span>Discount (5%)</span><span style={{ color: COLORS.success }}>−₹{discount.toLocaleString()}</span></div>
              <div style={s.summaryTotal}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              <button style={s.checkoutBtn} onClick={handleProceedToCheckout}>Proceed to Checkout →</button>
              <button style={{ ...s.checkoutBtn, background: COLORS.bg, color: COLORS.text, marginTop: 8, border: `1px solid ${COLORS.border}` }} onClick={() => setPage("listing")}>
                Continue Shopping
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 12, color: COLORS.textMuted }}>
                🔒 Secure & encrypted checkout
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

function AuthPage({ setPage, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google login failed");

      const userData = { ...data.user, token: data.token, isAdmin: data.user.role === "ADMIN" };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setPage(userData.isAdmin ? "admin" : "home");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // OTP verification state
  const [showOTP, setShowOTP] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      // Signup success → show OTP screen
      if (data.needsVerification) {
        setVerifyEmail(data.email || email);
        setShowOTP(true);
        setResendTimer(60);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || "Authentication failed");
      
      const userData = { ...data.user, token: data.token, isAdmin: data.user.role === "ADMIN" };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setPage(userData.isAdmin ? "admin" : "home");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setOtpMsg(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, code: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      // Success — user is logged in
      const userData = { ...data.user, token: data.token, isAdmin: data.user.role === "ADMIN" };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setPage("home");
    } catch (err) {
      setOtpMsg(err.message);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setOtpMsg("");
    try {
      const res = await fetch(`${API}/api/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend");
      setOtpMsg("✓ New code sent to your email");
      setResendTimer(60);
      setOtpCode("");
    } catch (err) {
      setOtpMsg(err.message);
    }
  };

  // OTP Verification Screen
  if (showOTP) {
    return (
      <div style={s.authContainer}>
        <div style={s.authCard}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <h1 style={s.authTitle}>Verify Your Email</h1>
            <p style={s.authSub}>We've sent a 6-digit code to</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary, margin: "4px 0 20px" }}>{verifyEmail}</p>
          </div>

          {otpMsg && (
            <div style={{
              fontSize: 14, marginBottom: 16, textAlign: "center", padding: "10px 12px", borderRadius: 10,
              background: otpMsg.startsWith("✓") ? "#ECFDF5" : "#FEF2F2",
              color: otpMsg.startsWith("✓") ? "#059669" : "#DC2626",
              border: `1px solid ${otpMsg.startsWith("✓") ? "#A7F3D0" : "#FECACA"}`
            }}>{otpMsg}</div>
          )}

          <div style={s.formGroup}>
            <label style={s.label}>Verification Code</label>
            <input
              style={{ ...s.input, boxSizing: "border-box", textAlign: "center", fontSize: 24, letterSpacing: 8, fontWeight: 800 }}
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
            />
          </div>

          <button
            style={{ ...s.authBtn, opacity: otpCode.length !== 6 || loading ? 0.6 : 1 }}
            onClick={handleVerifyOTP}
            disabled={otpCode.length !== 6 || loading}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            {resendTimer > 0 ? (
              <span style={{ fontSize: 14, color: COLORS.textMuted }}>Resend code in <strong>{resendTimer}s</strong></span>
            ) : (
              <span style={s.authToggleLink} onClick={handleResend}>Resend Code</span>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>Wrong email? </span>
            <span style={s.authToggleLink} onClick={() => { setShowOTP(false); setOtpCode(""); setOtpMsg(""); }}>Go back</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.authContainer}>
      <div style={s.authCard}>
        <h1 style={s.authTitle}>{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p style={s.authSub}>{isLogin ? "Log in to access your orders and prescriptions" : "Join MediStore for fast, reliable medicine delivery"}</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: COLORS.danger, fontSize: 14, marginBottom: 16, textAlign: "center", background: "#FEF2F2", padding: "10px 12px", borderRadius: 10, border: "1px solid #FECACA" }}>{error}</div>}
          {!isLogin && (
            <div style={s.formGroup}>
              <label style={s.label}>Full Name</label>
              <input style={{ ...s.input, boxSizing: "border-box" }} type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div style={s.formGroup}>
            <label style={s.label}>Email Address</label>
            <input style={{ ...s.input, boxSizing: "border-box" }} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Password</label>
            <input style={{ ...s.input, boxSizing: "border-box" }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            {!isLogin && <span style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, display: "block" }}>Minimum 8 characters</span>}
          </div>
          <button style={{ ...s.authBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>
        
        <div style={{ marginTop: 24, marginBottom: 24, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }}></div>
          <div style={{ padding: "0 10px", fontSize: 13, color: COLORS.textMuted, fontWeight: 600 }}>OR</div>
          <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }}></div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("Google Login Failed");
            }}
            useOneTap
            shape="rectangular"
            theme="outline"
            text={isLogin ? "signin_with" : "signup_with"}
          />
        </div>

        <div style={s.authToggle}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={s.authToggleLink} onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Sign up here" : "Log in here"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ setPage, user, setUser }) {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setPage("auth"); return; }
    fetch(`${API}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setProfile({ name: data.name || "", email: data.email || "", phone: data.phone || "", address: data.address || "", createdAt: data.createdAt, orderCount: data._count?.orders || 0, role: data.role });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setPage]);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name, phone: profile.phone, address: profile.address })
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      // Update localStorage user
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const newUser = { ...storedUser, name: updated.name };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPwMsg(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords don't match" }); return;
    }
    if (passwords.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters" }); return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/user/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setPwMsg({ type: "error", text: e.message });
    }
  };

  const ps = {
    container: { maxWidth: 720, margin: "0 auto", padding: "2rem" },
    header: { display: "flex", alignItems: "center", gap: 20, marginBottom: 32 },
    avatarLg: { width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800 },
    tabs: { display: "flex", gap: 4, background: COLORS.bg, borderRadius: 12, padding: 4, marginBottom: 28 },
    tab: (active) => ({ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", background: active ? COLORS.white : "transparent", color: active ? COLORS.text : COLORS.textMuted, boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }),
    card: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "24px", marginBottom: 20 },
    cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 },
    fieldGroup: { marginBottom: 20 },
    fieldLabel: { display: "block", fontSize: 13, fontWeight: 700, color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" },
    fieldInput: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", background: COLORS.white },
    fieldInputDisabled: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, background: COLORS.bg, color: COLORS.textMuted, boxSizing: "border-box" },
    textarea: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", minHeight: 80, resize: "vertical", fontFamily: "inherit" },
    saveBtn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 },
    msg: (type) => ({ padding: "10px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, marginBottom: 16, background: type === "success" ? "#ECFDF5" : "#FEF2F2", color: type === "success" ? "#059669" : "#DC2626", border: `1px solid ${type === "success" ? "#A7F3D0" : "#FECACA"}` }),
    statRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 4 },
    statCard: { background: COLORS.bg, borderRadius: 12, padding: "16px", textAlign: "center" },
    statNum: { fontSize: 22, fontWeight: 800, color: COLORS.primary, marginBottom: 2 },
    statLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: 600 },
  };

  if (loading) return (
    <div style={{ ...ps.container, textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
      <div style={{ fontSize: 16, color: COLORS.textMuted }}>Loading profile...</div>
    </div>
  );

  return (
    <div style={ps.container}>
      {/* Header */}
      <div style={ps.header}>
        <div style={ps.avatarLg}>{profile.name?.charAt(0)?.toUpperCase() || "U"}</div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 2 }}>{profile.name}</h1>
          <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>{profile.email} {profile.role === "ADMIN" && <span style={{ background: COLORS.primary, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, marginLeft: 8 }}>ADMIN</span>}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={ps.tabs}>
        <button style={ps.tab(activeTab === "profile")} onClick={() => setActiveTab("profile")}>👤 Profile</button>
        <button style={ps.tab(activeTab === "security")} onClick={() => setActiveTab("security")}>🔒 Security</button>
        <button style={ps.tab(activeTab === "account")} onClick={() => setActiveTab("account")}>📊 Account</button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <>
          {msg && <div style={ps.msg(msg.type)}>{msg.type === "success" ? "✓ " : "✕ "}{msg.text}</div>}
          <div style={ps.card}>
            <div style={ps.cardTitle}>📝 Personal Information</div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Full Name</label>
              <input style={ps.fieldInput} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Email Address</label>
              <input style={ps.fieldInputDisabled} value={profile.email} disabled />
              <span style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, display: "block" }}>Email cannot be changed</span>
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Phone Number</label>
              <input style={ps.fieldInput} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div style={ps.card}>
            <div style={ps.cardTitle}>📍 Delivery Address</div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Full Address</label>
              <textarea style={ps.textarea} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="House/Flat No, Street, Landmark, City, State - PIN Code" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={ps.saveBtn} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <>
          {pwMsg && <div style={ps.msg(pwMsg.type)}>{pwMsg.type === "success" ? "✓ " : "✕ "}{pwMsg.text}</div>}
          <div style={ps.card}>
            <div style={ps.cardTitle}>🔑 Change Password</div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Current Password</label>
              <input style={ps.fieldInput} type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" />
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>New Password</label>
              <input style={ps.fieldInput} type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} placeholder="Enter new password (min 6 chars)" />
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Confirm New Password</label>
              <input style={ps.fieldInput} type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Re-enter new password" />
            </div>
            <button style={ps.saveBtn} onClick={handlePasswordChange}>Update Password</button>
          </div>
        </>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <>
          <div style={ps.card}>
            <div style={ps.cardTitle}>📈 Account Overview</div>
            <div style={ps.statRow}>
              <div style={ps.statCard}>
                <div style={ps.statNum}>{profile.orderCount}</div>
                <div style={ps.statLabel}>Total Orders</div>
              </div>
              <div style={ps.statCard}>
                <div style={ps.statNum}>{profile.role === "ADMIN" ? "Admin" : "User"}</div>
                <div style={ps.statLabel}>Account Type</div>
              </div>
              <div style={ps.statCard}>
                <div style={ps.statNum}>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "-"}</div>
                <div style={ps.statLabel}>Member Since</div>
              </div>
            </div>
          </div>
          <div style={ps.card}>
            <div style={ps.cardTitle}>⚡ Quick Actions</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button style={{ ...ps.saveBtn, background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}` }} onClick={() => setPage("my-orders")}>📦 View My Orders</button>
              <button style={{ ...ps.saveBtn, background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}` }} onClick={() => setPage("listing")}>💊 Browse Medicines</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const STATUS_STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];
const STATUS_LABELS = { PENDING: "Order Placed", PAID: "Payment Confirmed", SHIPPED: "Shipped", DELIVERED: "Delivered" };
const STATUS_ICONS = { PENDING: "📋", PAID: "✅", SHIPPED: "🚚", DELIVERED: "📦" };
const STATUS_COLORS = { PENDING: "#F59E0B", PAID: "#3B82F6", SHIPPED: "#8B5CF6", DELIVERED: "#10B981" };

function MyOrdersPage({ setPage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setPage("auth"); return; }
    fetch(`${API}/api/orders/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setPage]);

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status);

  if (loading) return (
    <div style={{ ...s.page, textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
      <div style={{ fontSize: 16, color: COLORS.textMuted }}>Loading your orders...</div>
    </div>
  );

  return (
    <div style={s.page}>
      <h1 style={{ ...s.sectionTitle, fontSize: 28, marginBottom: 4 }}>My Orders</h1>
      <p style={s.sectionSub}>Track and manage your orders</p>

      {orders.length === 0 ? (
        <div style={s.emptyCart}>
          <div style={s.emptyIcon}>📦</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No orders yet</div>
          <div style={{ marginBottom: 20, color: COLORS.textMuted }}>Start shopping to see your orders here</div>
          <button style={{ ...s.addToCartBtn, width: "auto", padding: "12px 28px", borderRadius: 12, fontSize: 15 }} onClick={() => setPage("listing")}>Browse Medicines</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(order => {
            const currentStep = getStepIndex(order.status);
            const isExpanded = expandedOrder === order.id;
            const orderDate = new Date(order.createdAt);
            return (
              <div key={order.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", transition: "box-shadow 0.2s" }}>
                {/* Order Header */}
                <div
                  style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: STATUS_COLORS[order.status] + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {STATUS_ICONS[order.status]}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Order #{order.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                        {orderDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 17, fontWeight: 800 }}>₹{order.totalAmount?.toLocaleString()}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[order.status] }}>{STATUS_LABELS[order.status]}</div>
                    </div>
                    <span style={{ fontSize: 14, color: COLORS.textMuted, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>▼</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "20px 24px" }}>
                    {/* Status Tracker */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, padding: "0 8px" }}>
                      {STATUS_STEPS.map((step, i) => {
                        const isCompleted = i <= currentStep;
                        const isActive = i === currentStep;
                        return (
                          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STATUS_STEPS.length - 1 ? 1 : "none" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                background: isCompleted ? STATUS_COLORS[step] : COLORS.border,
                                color: isCompleted ? "#fff" : COLORS.textMuted,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700,
                                boxShadow: isActive ? `0 0 0 4px ${STATUS_COLORS[step]}30` : "none",
                                transition: "all 0.3s"
                              }}>
                                {isCompleted ? "✓" : i + 1}
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, color: isCompleted ? COLORS.text : COLORS.textMuted, whiteSpace: "nowrap" }}>
                                {STATUS_LABELS[step]}
                              </span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div style={{
                                flex: 1, height: 3, margin: "0 8px", marginBottom: 20,
                                background: i < currentStep ? STATUS_COLORS[STATUS_STEPS[i + 1]] : COLORS.border,
                                borderRadius: 2, transition: "background 0.3s"
                              }} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Items */}
                    <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: COLORS.textMuted, marginBottom: 12 }}>Items in this order</div>
                    {order.items?.map(item => (
                      <div key={item.id} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                        borderBottom: `1px solid ${COLORS.border}`
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: item.product?.color || "#F3F4F6",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0
                        }}>
                          {item.product?.icon || "📦"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.product?.name || "Product"}</div>
                          <div style={{ fontSize: 12, color: COLORS.textMuted }}>Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>₹{(item.priceAtTime * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}

                    {/* Order Summary */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Total Paid</span>
                      <span style={{ fontSize: 18, fontWeight: 800 }}>₹{order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "home";
  });
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
        })
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
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
      `}</style>
      <Navbar page={page} setPage={setPage} cartCount={cartCount} user={user} setUser={setUser} setCart={setCart} />
      {page === "home" && <HomePage products={products} setPage={setPage} setSelectedProduct={setSelectedProduct} onAddToCart={onAddToCart} categoryData={categoryData} user={user} showToast={showToast} />}
      {page === "listing" && <ListingPage products={products} setPage={setPage} setSelectedProduct={setSelectedProduct} onAddToCart={onAddToCart} fetchProducts={fetchProducts} currentPage={currentPage} totalPages={totalPages} categoryData={categoryData} />}
      {page === "detail" && <DetailPage product={selectedProduct} setPage={setPage} cart={cart} onAddToCart={onAddToCart} />}
      {page === "cart" && <CartPage cart={cart} setCart={setCart} setPage={setPage} showToast={showToast} />}
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