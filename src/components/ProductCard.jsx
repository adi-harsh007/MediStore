import React from 'react';
import { s, COLORS } from '../utils/theme';
import StarRating from './StarRating';
import Discount from './Discount';
import MedicineArt from './MedicineArt';

export default function ProductCard({ product, onClick, onAddToCart, isWishlisted, onToggleWishlist }) {
  const isRx = Boolean(product.prescription || product.prescriptionRequired);

  return (
    <div
      className="ms-card-hover"
      style={{ ...s.prodCard, position: "relative" }}
      onClick={onClick}
    >
      {/* Top Action & Rx Overlay */}
      <div style={{ position: "absolute", top: 10, left: 10, right: 10, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", pointerEvents: "none" }}>
        <div>
          {isRx ? (
            <span style={s.rxBadge}>Rx REQUIRED</span>
          ) : (
            <span style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(6, 24, 26, 0.78)", color: COLORS.textMuted,
              border: `1px solid ${COLORS.border}`, fontSize: 9.5, fontWeight: 700,
              padding: "2px 7px", borderRadius: 5, fontFamily: "'JetBrains Mono', monospace"
            }}>OTC</span>
          )}
        </div>
        <button
          style={{
            pointerEvents: "auto", cursor: "pointer", padding: 0,
            background: isWishlisted ? "rgba(251, 113, 133, 0.18)" : "rgba(6, 24, 26, 0.78)",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32,
            color: isWishlisted ? COLORS.danger : COLORS.textMuted,
            border: `1px solid ${isWishlisted ? "rgba(251, 113, 133, 0.4)" : COLORS.border}`,
            transition: "all 0.15s", backdropFilter: "blur(6px)"
          }}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(); }}
          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Clinical Vector Thumbnail */}
      <MedicineArt category={product.category} name={product.name} variant="card" />

      <div style={s.prodBody}>
        <div style={s.prodCat}>{product.category}</div>
        <div style={s.prodName}>{product.name}</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {product.manufacturer}
        </div>

        <div style={s.prodRating}>
          <StarRating rating={product.rating || 0} />
          <span style={s.prodRatingNum}>{(product.rating || 0).toFixed ? Number(product.rating || 0).toFixed(1) : product.rating}</span>
          <span style={s.prodRatingCount}>({product.reviews || 0})</span>
        </div>

        <div style={{ marginTop: "auto" }}>
          <div style={s.prodPriceRow}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={s.prodPrice}>₹{product.price}</span>
              <span style={s.prodOriginal}>₹{product.originalPrice}</span>
            </div>
            <Discount price={product.price} original={product.originalPrice} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <span style={product.inStock ? s.inStockBadge : s.outStockBadge}>
              {product.inStock ? (product.stock ? `In Stock · ${product.stock}` : "In Stock") : "Out of Stock"}
            </span>
          </div>

          <button
            className="ms-btn-primary"
            style={{
              ...s.addBtn,
              opacity: product.inStock ? 1 : 0.42,
              cursor: product.inStock ? "pointer" : "not-allowed",
              background: product.inStock ? s.addBtn.background : "rgba(148,163,184,0.16)",
              color: product.inStock ? COLORS.primaryInk : COLORS.textMuted
            }}
            onClick={e => { e.stopPropagation(); if (product.inStock) onAddToCart(product); }}
          >
            {product.inStock ? "Add to Cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
