import React from 'react';
import { s } from '../utils/theme';
import ProductCard from '../components/ProductCard';

export default function WishlistPage({ wishlist, setPage, setSelectedProduct, onAddToCart, toggleWishlist }) {
  return (
    <div style={s.page}>
      <h1 style={{ ...s.sectionTitle, fontSize: 30, marginBottom: 4 }}>Saved Formulations</h1>
      <p style={s.sectionSub}>{wishlist.length} item{wishlist.length !== 1 ? "s" : ""} in your wishlist</p>

      {wishlist.length === 0 ? (
        <div style={s.emptyCart}>
          <div style={s.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#ECFDFB" }}>Your wishlist is empty</div>
          <div style={{ marginBottom: 20 }}>Save medicines for quick refills anytime</div>
          <button
            className="ms-btn-primary"
            style={{ ...s.addToCartBtn, width: "auto", padding: "12px 28px" }}
            onClick={() => setPage("listing")}
          >
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="ms-prod-grid-4">
          {wishlist.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => { setSelectedProduct(p); setPage("detail"); }}
              onAddToCart={onAddToCart}
              isWishlisted={true}
              onToggleWishlist={() => toggleWishlist(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
