import React, { useState } from 'react';
import { s, COLORS } from '../utils/theme';
import StarRating from './StarRating';
import Discount from './Discount';

export default function ProductCard({ product, onClick, onAddToCart, isWishlisted, onToggleWishlist }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...s.prodCard, transform: hovered ? "translateY(-2px)" : "none", boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.06)" : "none", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <button
        style={{
          position: "absolute", top: 8, right: 8, zIndex: 10,
          cursor: "pointer", fontSize: 16, padding: 0,
          background: "rgba(255,255,255,0.85)", borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 30, height: 30,
          color: isWishlisted ? COLORS.danger : COLORS.textLight,
          border: `1px solid ${isWishlisted ? "#FECACA" : COLORS.border}`,
          transition: "all 0.15s"
        }}
        onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(); }}
      >
        ♥
      </button>
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
          <span style={s.prodRatingCount}>({product.reviews})</span>
        </div>
        <div style={s.prodPriceRow}>
          <div>
            <span style={s.prodPrice}>₹{product.price}</span>
            {" "}
            <span style={s.prodOriginal}>₹{product.originalPrice}</span>
          </div>
          <Discount price={product.price} original={product.originalPrice} />
        </div>
        <span style={product.inStock ? s.inStockBadge : s.outStockBadge}>{product.inStock ? "In Stock" : "Out of Stock"}</span>
        <button
          style={{ ...s.addBtn, opacity: product.inStock ? 1 : 0.5 }}
          onClick={e => { e.stopPropagation(); if (product.inStock) onAddToCart(product); }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
