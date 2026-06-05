import React, { useState, useEffect } from 'react';
import { s, COLORS, API } from '../utils/theme';
import StarRating from '../components/StarRating';

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
      <div style={s.detailLayout}>
        <div style={{ ...s.detailImgBox, background: product.color, position: "relative" }}>
          <button
            style={{
              position: "absolute", top: 14, right: 14, zIndex: 10,
              cursor: "pointer", fontSize: 18, padding: 0,
              background: "rgba(255,255,255,0.9)", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40,
              color: wishlist?.some(w => w.id === product.id) ? COLORS.danger : COLORS.textLight,
              border: `1px solid ${wishlist?.some(w => w.id === product.id) ? "#FECACA" : COLORS.border}`,
              transition: "all 0.15s"
            }}
            onClick={(e) => { e.stopPropagation(); toggleWishlist?.(product); }}
          >
            ♥
          </button>
          <span style={{ fontSize: 80 }}>{product.icon}</span>
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
            {(product.tags || [product.prescriptionRequired ? "Rx Only" : "OTC"]).map(t => <span key={t} style={s.tag}>{t}</span>)}
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
              {inCart ? "✓ Added" : "Add to Cart"}
            </button>
            <button style={{ ...s.buyNowBtn, opacity: product.inStock ? 1 : 0.5 }}
              onClick={() => { if (product.inStock) { for (let i = 0; i < qty; i++) onAddToCart(product); setPage("cart"); } }}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
      
      {/* ═══ Reviews Section — Premium Redesign ═══ */}
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

        const avatarColors = ["#0d9488", "#0891b2", "#2563eb", "#7c3aed", "#c026d3", "#db2777", "#dc2626", "#ea580c"];
        const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

        const starBarColor = (star) => {
          if (star >= 4) return "#22c55e";
          if (star === 3) return "#f59e0b";
          return "#ef4444";
        };

        return (
          <div style={{ maxWidth: 960, margin: "36px auto" }}>
            {/* Section Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 3, height: 24, borderRadius: 2, background: COLORS.primary }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0 }}>Customer Reviews</h2>
              <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500, background: "#f1f5f9", padding: "3px 10px", borderRadius: 4 }}>{totalReviews} review{totalReviews !== 1 ? "s" : ""}</span>
            </div>

            {/* Rating Summary + Write Review — Side by Side */}
            <div style={{ display: "grid", gridTemplateColumns: totalReviews > 0 ? "320px 1fr" : "1fr", gap: 20, marginBottom: 28 }}>

              {/* Left: Rating Summary Card */}
              {totalReviews > 0 && (
                <div style={{ background: COLORS.white, borderRadius: 10, padding: 24, border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize: 44, fontWeight: 700, color: COLORS.text, lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
                  <div style={{ display: "flex", gap: 3, margin: "8px 0 6px" }}>
                    {[1,2,3,4,5].map(i => (
                      <span key={i} style={{ fontSize: 16, color: i <= Math.round(avgRating) ? "#f59e0b" : "#d1d5db" }}>★</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500, marginBottom: 18 }}>Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}</div>
                  
                  {/* Distribution Bars */}
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                    {distribution.map(d => (
                      <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, width: 14, textAlign: "right" }}>{d.star}</span>
                        <span style={{ fontSize: 11, color: "#d1d5db" }}>★</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                          <div style={{ width: `${d.pct}%`, height: "100%", borderRadius: 3, background: starBarColor(d.star), transition: "width 0.5s ease" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, width: 24, textAlign: "right" }}>{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Right: Write a Review */}
              <div style={{ background: COLORS.white, borderRadius: 10, padding: 24, border: `1px solid ${COLORS.border}` }}>
                {user ? (
                  <form onSubmit={submitReview}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: getAvatarColor(user.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>Write a Review</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted }}>Share your experience</div>
                      </div>
                    </div>

                    {/* Interactive Star Picker */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Your Rating</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[1,2,3,4,5].map(i => (
                          <span
                            key={i}
                            onClick={() => setRating(i)}
                            style={{
                              fontSize: 24,
                              cursor: "pointer",
                              color: i <= rating ? "#f59e0b" : "#e5e7eb",
                              transition: "transform 0.15s, color 0.15s",
                              display: "inline-block",
                              userSelect: "none"
                            }}
                            onMouseEnter={(e) => e.target.style.transform = "scale(1.15)"}
                            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                          >★</span>
                        ))}
                        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginLeft: 8, alignSelf: "center" }}>
                          {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Your Review</div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you like or dislike? How did this product help you?"
                        style={{
                          width: "100%", padding: "12px 14px", borderRadius: 8,
                          border: `1px solid ${COLORS.border}`, fontSize: 13, minHeight: 90,
                          fontFamily: "inherit", resize: "vertical", outline: "none",
                          transition: "border-color 0.2s", boxSizing: "border-box",
                          lineHeight: 1.6
                        }}
                        onFocus={(e) => { e.target.style.borderColor = COLORS.primary; }}
                        onBlur={(e) => { e.target.style.borderColor = COLORS.border; }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background: submitting ? "#94a3b8" : COLORS.primary,
                        color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px",
                        fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
                        transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6
                      }}
                    >
                      {submitting ? (
                        <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Submitting...</>
                      ) : (
                        <>Submit Review</>
                      )}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: "center", padding: "28px 20px" }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Share Your Experience</div>
                    <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>Login to write a review and help other customers.</p>
                    <button
                      onClick={() => setPage("auth")}
                      style={{
                        background: COLORS.primary,
                        color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px",
                        fontSize: 13, fontWeight: 600, cursor: "pointer"
                      }}
                    >Login to Review</button>
                  </div>
                )}
              </div>
            </div>

            {/* Review Cards */}
            {totalReviews > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {reviews.map((r, idx) => (
                  <div key={r.id} style={{
                    background: COLORS.white, borderRadius: 10, padding: "18px 20px",
                    border: `1px solid ${COLORS.border}`,
                    transition: "box-shadow 0.2s"
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: getAvatarColor(r.user.name),
                          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 700, flexShrink: 0
                        }}>
                          {r.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>{r.user.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#059669", background: "#f0fdf4", padding: "2px 6px", borderRadius: 4 }}>Verified</span>
                          </div>
                          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>{timeAgo(r.createdAt)}</div>
                        </div>
                      </div>

                      {/* Star Badge */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 2,
                        background: COLORS.bg,
                        padding: "4px 10px", borderRadius: 6,
                        border: `1px solid ${COLORS.border}`
                      }}>
                        {[1,2,3,4,5].map(i => (
                          <span key={i} style={{ fontSize: 12, color: i <= r.rating ? "#f59e0b" : "#d1d5db" }}>★</span>
                        ))}
                      </div>
                    </div>

                    {r.comment && (
                      <p style={{
                        fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0,
                        paddingLeft: 48
                      }}>{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center", padding: "48px 20px",
                background: COLORS.bg,
                borderRadius: 10, border: `1px dashed ${COLORS.border}`
              }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>No Reviews Yet</div>
                <p style={{ fontSize: 13, color: COLORS.textMuted, maxWidth: 380, margin: "0 auto" }}>Be the first to share your experience with this product.</p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
