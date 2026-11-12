import React, { useState, useEffect } from 'react';
import { s, COLORS, API } from '../utils/theme';
import StarRating from '../components/StarRating';
import MedicineArt from '../components/MedicineArt';

export default function DetailPage({ product: initialProduct, setPage, cart, onAddToCart, user, showToast, wishlist, toggleWishlist }) {
  const [product, setProduct] = useState(initialProduct);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct?.id) {
      fetch(`${API}/api/products/${initialProduct.id}`)
        .then(res => res.json())
        .then(data => setProduct(data))
        .catch(console.error);
    }
  }, [initialProduct]);

  const inCart = cart.find(i => i.id === product?.id);

  if (!product) return null;
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const isRx = Boolean(product.prescription || product.prescriptionRequired);
  const isWishlisted = wishlist?.some(w => w.id === product.id);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return showToast("Please login to review", "error");
    setSubmitting(true);

    try {
      const res = await fetch(`${API}/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      showToast("Review submitted successfully!", "success");
      setComment("");
      setRating(5);

      // Refresh product details
      const refreshRes = await fetch(`${API}/api/products/${product.id}`);
      const updatedProduct = await refreshRes.json();
      setProduct(updatedProduct);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => setPage("listing")}>← Back to Medicines</button>
      <div className="ms-detail-grid">
        <div style={{ ...s.detailImgBox, position: "relative" }}>
          <button
            style={{
              position: "absolute", top: 16, right: 16, zIndex: 10,
              cursor: "pointer", padding: 0,
              background: isWishlisted ? "rgba(251, 113, 133, 0.2)" : "rgba(6, 24, 26, 0.82)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 42, height: 42,
              color: isWishlisted ? COLORS.danger : COLORS.textMuted,
              border: `1px solid ${isWishlisted ? "rgba(251, 113, 133, 0.45)" : COLORS.borderStrong}`,
              transition: "all 0.15s", backdropFilter: "blur(8px)"
            }}
            onClick={(e) => { e.stopPropagation(); toggleWishlist?.(product); }}
            title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <MedicineArt category={product.category} name={product.name} variant="detail" />
        </div>

        <div>
          {isRx && <div style={{ ...s.rxBadge, marginBottom: 10 }}>PRESCRIPTION REQUIRED (Rx)</div>}
          <div style={s.detailCat}>{product.category}</div>
          <h1 style={s.detailName}>{product.name}</h1>

          <div style={s.detailRating}>
            <div style={s.detailRatingStars}><StarRating rating={product.rating || 0} /></div>
            <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{product.rating || 0}</span>
            <span style={{ color: COLORS.textMuted, fontSize: 13 }}>({(product.reviews || 0).toLocaleString()} reviews)</span>
            <span style={product.inStock ? s.inStockBadge : s.outStockBadge}>
              {product.inStock ? `In Stock${product.stock ? ` · ${product.stock} units` : ""}` : "Out of Stock"}
            </span>
          </div>

          <div style={s.detailPriceRow}>
            <span style={s.detailPrice}>₹{product.price}</span>
            <span style={s.detailOrig}>₹{product.originalPrice}</span>
            <span style={s.detailBadge}>{discount}% off</span>
          </div>

          <p style={s.detailDesc}>{product.description}</p>

          <div style={s.tagRow}>
            {(product.tags || [isRx ? "Rx Only" : "OTC"]).map(t => <span key={t} style={s.tag}>{t}</span>)}
          </div>

          <div style={s.detailInfoBox}>
            {[
              ["Dosage", product.dosage],
              ["Manufacturer", product.manufacturer],
              ["Department", product.category],
              ["Availability", product.inStock ? `${product.stock ?? "Available"} units ready for dispatch` : "Currently out of stock"]
            ].map(([label, val]) => (
              <div key={label} style={s.detailInfoRow}>
                <span style={s.detailInfoLabel}>{label}</span>
                <span style={s.detailInfoVal}>{val}</span>
              </div>
            ))}
          </div>

          <div style={s.qtyRow}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.textMuted }}>Quantity</span>
            <button style={s.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span style={s.qtyNum}>{qty}</span>
            <button style={s.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="ms-btn-primary"
              style={{
                ...s.addToCartBtn,
                opacity: product.inStock ? 1 : 0.45,
                cursor: product.inStock ? "pointer" : "not-allowed"
              }}
              onClick={() => { if (product.inStock) { for (let i = 0; i < qty; i++) onAddToCart(product); } }}
            >
              {inCart ? "✓ Added to Cart" : "Add to Cart"}
            </button>
            <button
              style={{
                ...s.buyNowBtn,
                opacity: product.inStock ? 1 : 0.45,
                cursor: product.inStock ? "pointer" : "not-allowed"
              }}
              onClick={() => { if (product.inStock) { for (let i = 0; i < qty; i++) onAddToCart(product); setPage("cart"); } }}
            >
              Buy Now →
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {(() => {
        const reviews = product.reviewList || [];
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / totalReviews) : 0;
        const distribution = [5, 4, 3, 2, 1].map(star => ({
          star,
          count: reviews.filter(r => r.rating === star).length,
          pct: totalReviews > 0 ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0
        }));

        const timeAgo = (date) => {
          const diff = Date.now() - new Date(date).getTime();
          const mins = Math.floor(diff / 60000);
          if (mins < 60) return `${mins}m ago`;
          const hrs = Math.floor(mins / 60);
          if (hrs < 24) return `${hrs}h ago`;
          const days = Math.floor(hrs / 24);
          if (days < 30) return `${days}d ago`;
          const months = Math.floor(days / 30);
          if (months < 12) return `${months}mo ago`;
          return `${Math.floor(months / 12)}y ago`;
        };

        const avatarColors = ["#14B8A6", "#0EA5E9", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];
        const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

        const starBarColor = (star) => {
          if (star >= 4) return COLORS.success;
          if (star === 3) return COLORS.warning;
          return COLORS.danger;
        };

        return (
          <div style={{ maxWidth: 980, margin: "44px auto 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: COLORS.primary }} />
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>Customer Reviews</h2>
              <span style={{
                fontSize: 12, color: COLORS.primary, fontWeight: 700,
                background: COLORS.primaryLight, border: `1px solid ${COLORS.border}`,
                padding: "3px 10px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace"
              }}>
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: totalReviews > 0 ? "320px 1fr" : "1fr", gap: 20, marginBottom: 28 }}>
              {totalReviews > 0 && (
                <div style={{ background: COLORS.surface, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 46, fontWeight: 700, color: COLORS.text, lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
                  <div style={{ display: "flex", gap: 3, margin: "10px 0 6px" }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <span key={i} style={{ fontSize: 16, color: i <= Math.round(avgRating) ? COLORS.warning : "#22494E" }}>★</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500, marginBottom: 18 }}>
                    Based on {totalReviews} verified review{totalReviews !== 1 ? "s" : ""}
                  </div>

                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
                    {distribution.map(d => (
                      <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, width: 14, textAlign: "right" }}>{d.star}</span>
                        <span style={{ fontSize: 11, color: COLORS.warning }}>★</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: COLORS.inputBg, overflow: "hidden" }}>
                          <div style={{ width: `${d.pct}%`, height: "100%", borderRadius: 3, background: starBarColor(d.star), transition: "width 0.5s ease" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, width: 24, textAlign: "right" }}>{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: COLORS.surface, borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
                {user ? (
                  <form onSubmit={submitReview}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: getAvatarColor(user.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, color: COLORS.text }}>Write a Clinical Review</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted }}>Available to verified buyers of this formulation</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Rating</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <span
                            key={i}
                            onClick={() => setRating(i)}
                            style={{
                              fontSize: 24, cursor: "pointer",
                              color: i <= rating ? COLORS.warning : "#22494E",
                              transition: "transform 0.15s, color 0.15s",
                              display: "inline-block", userSelect: "none"
                            }}
                          >★</span>
                        ))}
                        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, marginLeft: 8 }}>
                          {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Review</div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share effectiveness, tolerance, or delivery feedback..."
                        style={{
                          width: "100%", padding: "12px 14px", borderRadius: 10,
                          border: `1px solid ${COLORS.border}`, background: COLORS.inputBg,
                          color: COLORS.text, fontSize: 13.5, minHeight: 90,
                          fontFamily: "inherit", resize: "vertical", outline: "none",
                          boxSizing: "border-box", lineHeight: 1.6
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="ms-btn-primary"
                      style={{
                        background: submitting ? COLORS.textLight : "linear-gradient(135deg, #2EE6C5 0%, #14B8A6 100%)",
                        color: COLORS.primaryInk, border: "none", borderRadius: 9, padding: "11px 24px",
                        fontSize: 13.5, fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer",
                        display: "inline-flex", alignItems: "center", gap: 8
                      }}
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 16px" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>Share Your Experience</div>
                    <p style={{ color: COLORS.textMuted, fontSize: 13.5, marginBottom: 18, lineHeight: 1.6 }}>Sign in to leave a verified review and guide other patients.</p>
                    <button className="ms-btn-primary" onClick={() => setPage("auth")} style={s.btnPrimary}>
                      Sign In to Review
                    </button>
                  </div>
                )}
              </div>
            </div>

            {totalReviews > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: COLORS.surface, borderRadius: 14, padding: "18px 20px", border: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 9,
                          background: getAvatarColor(r.user.name),
                          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 700, flexShrink: 0
                        }}>
                          {r.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{r.user.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.success, background: COLORS.successBg, border: "1px solid rgba(52,211,153,0.25)", padding: "2px 7px", borderRadius: 5 }}>Verified Buyer</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: COLORS.textMuted, marginTop: 2 }}>{timeAgo(r.createdAt)}</div>
                        </div>
                      </div>

                      <div style={{
                        display: "flex", alignItems: "center", gap: 2,
                        background: COLORS.inputBg, padding: "4px 10px", borderRadius: 8,
                        border: `1px solid ${COLORS.border}`
                      }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} style={{ fontSize: 12, color: i <= r.rating ? COLORS.warning : "#22494E" }}>★</span>
                        ))}
                      </div>
                    </div>

                    {r.comment && (
                      <p style={{ fontSize: 13.5, color: "#B8D4D2", lineHeight: 1.6, margin: 0, paddingLeft: 48 }}>
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center", padding: "44px 20px",
                background: COLORS.surface, borderRadius: 14, border: `1px dashed ${COLORS.borderStrong}`
              }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>No Reviews Yet</div>
                <p style={{ fontSize: 13.5, color: COLORS.textMuted, maxWidth: 380, margin: "0 auto" }}>
                  Be the first verified buyer to review this formulation.
                </p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
