import React from 'react';
import { s, COLORS } from '../utils/theme';

export default function Navbar({ page, setPage, cartCount, user, setUser, setCart, wishlistCount, setActiveCategory }) {
  const links = ["Home", "Medicines"];
  if (user) links.push("Wishlist", "My Orders");
  if (user && user.isAdmin) links.push("Admin");

  return (
    <nav style={s.nav}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={s.navInner}>
        <div style={s.logo} onClick={() => { setActiveCategory && setActiveCategory("All"); setPage("home"); }}>
          <div style={s.logoMark}>M</div>
          <span style={s.logoText}>Medi<span style={s.logoSpan}>Store</span></span>
        </div>
        <ul style={s.navLinks}>
          {links.map(link => {
            const linkPage = link === "Medicines" ? "listing" : link === "My Orders" ? "my-orders" : link === "Wishlist" ? "wishlist" : link.toLowerCase();
            const isActive = page === linkPage;
            return (
              <li key={link}
                style={{
                  ...s.navLink,
                  color: isActive ? COLORS.primary : COLORS.textMuted,
                  fontWeight: isActive ? 600 : 500,
                  borderBottom: isActive ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                  paddingBottom: 4,
                }}
                onClick={() => {
                  if (link === "Medicines" && setActiveCategory) setActiveCategory("All");
                  setPage(linkPage);
                }}
              >{link}</li>
            );
          })}
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user && (
            <button
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: page === "wishlist" ? "#FEF2F2" : "transparent",
                border: page === "wishlist" ? "1px solid #FECACA" : `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", color: wishlistCount > 0 ? COLORS.danger : COLORS.textMuted,
                position: "relative"
              }}
              onClick={() => setPage("wishlist")}
              title="My Wishlist"
            >
              <span style={{ fontSize: 14 }}>♥</span>
              {wishlistCount > 0 && <span style={{ fontSize: 12 }}>{wishlistCount}</span>}
            </button>
          )}
          <button style={s.cartBtn} onClick={() => setPage("cart")}>
            Cart
            {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
          </button>
          {user ? (
            <div style={s.userMenu}>
              <div style={{ ...s.avatar, cursor: "pointer" }} title="My Profile" onClick={() => setPage("profile")}>{user.name.charAt(0).toUpperCase()}</div>
              <button style={s.logoutBtn} onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setCart([]); setPage("home"); }}>Logout</button>
            </div>
          ) : (
            <button style={{ ...s.cartBtn, background: COLORS.white, color: COLORS.text, border: `1px solid ${COLORS.border}` }} onClick={() => setPage("auth")}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
