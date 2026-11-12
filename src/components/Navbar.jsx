import React from 'react';
import { s, COLORS } from '../utils/theme';

export default function Navbar({ page, setPage, cartCount, user, setUser, setCart, wishlistCount, setActiveCategory }) {
  const links = ["Home", "Medicines"];
  if (user) links.push("Wishlist", "My Orders");
  if (user && user.isAdmin) links.push("Admin");

  return (
    <nav style={s.nav}>
      <div style={s.navInner}>
        <div style={s.logo} onClick={() => { setActiveCategory && setActiveCategory("All"); setPage("home"); }}>
          <div style={s.logoMark}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <div>
            <div style={s.logoText}>Medi<span style={s.logoSpan}>Store</span></div>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.textLight, fontFamily: "'JetBrains Mono', monospace" }}>
              Clinical Dispensary
            </div>
          </div>
        </div>

        <ul style={s.navLinks}>
          {links.map(link => {
            const linkPage = link === "Medicines" ? "listing" : link === "My Orders" ? "my-orders" : link === "Wishlist" ? "wishlist" : link.toLowerCase();
            const isActive = page === linkPage;
            return (
              <li
                key={link}
                style={{
                  ...s.navLink,
                  color: isActive ? COLORS.primary : COLORS.textMuted,
                  background: isActive ? "rgba(46, 230, 197, 0.1)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(46, 230, 197, 0.28)" : "transparent"}`,
                }}
                onClick={() => {
                  if (link === "Medicines" && setActiveCategory) setActiveCategory("All");
                  setPage(linkPage);
                }}
              >
                {link}
              </li>
            );
          })}
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user && (
            <button
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: page === "wishlist" ? COLORS.dangerBg : "rgba(255,255,255,0.03)",
                border: `1px solid ${page === "wishlist" ? "rgba(251, 113, 133, 0.35)" : COLORS.border}`,
                borderRadius: 9, padding: "8px 12px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", color: wishlistCount > 0 ? COLORS.danger : COLORS.textMuted,
              }}
              onClick={() => setPage("wishlist")}
              title="My Wishlist"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlistCount > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{wishlistCount}</span>}
            </button>
          )}
          <button className="ms-btn-primary" style={s.cartBtn} onClick={() => setPage("cart")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Cart
            {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
          </button>
          {user ? (
            <div style={s.userMenu}>
              <div style={{ ...s.avatar, cursor: "pointer" }} title="My Profile" onClick={() => setPage("profile")}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                style={s.logoutBtn}
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); setCart([]); setPage("home"); }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              style={{
                background: "rgba(255,255,255,0.04)", color: COLORS.text,
                border: `1px solid ${COLORS.borderStrong}`, borderRadius: 9,
                padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer"
              }}
              onClick={() => setPage("auth")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
