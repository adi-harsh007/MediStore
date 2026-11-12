import React, { useState } from 'react';
import { s, COLORS, CATEGORY_STYLE, DEFAULT_STYLE, API } from '../utils/theme';
import ProductCard from '../components/ProductCard';
import { CategoryIcon } from '../components/MedicineArt';

export default function HomePage({ products, setPage, setActiveCategory, setSelectedProduct, onAddToCart, categoryData, showToast, wishlist, toggleWishlist }) {
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxFile, setRxFile] = useState(null);
  const [rxUploading, setRxUploading] = useState(false);
  const [rxUploaded, setRxUploaded] = useState(false);
  const [rxError, setRxError] = useState(null);

  const totalProducts = categoryData.reduce((acc, c) => acc + c.count, 0);

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
      await res.json();
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
  };

  const rxModalStyles = {
    overlay: {
      position: "fixed", inset: 0, background: "rgba(3, 12, 14, 0.78)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)", padding: 20
    },
    modal: {
      background: COLORS.surface, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 18,
      padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 24px 64px rgba(0,0,0,0.6)", position: "relative"
    },
    closeBtn: {
      position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.05)",
      border: `1px solid ${COLORS.border}`, borderRadius: 8, width: 32, height: 32,
      fontSize: 16, cursor: "pointer", color: COLORS.textMuted, lineHeight: 1,
      display: "flex", alignItems: "center", justifyContent: "center"
    },
    title: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 6, color: COLORS.text },
    sub: { fontSize: 13.5, color: COLORS.textMuted, marginBottom: 20, lineHeight: 1.55 },
    dropzone: {
      display: "block", border: `1.5px dashed ${COLORS.borderStrong}`, borderRadius: 12,
      padding: "32px 20px", textAlign: "center", cursor: "pointer",
      transition: "border-color 0.2s", background: COLORS.inputBg
    },
    dropzoneActive: {
      display: "block", border: `1.5px dashed ${COLORS.primary}`, borderRadius: 12,
      padding: "32px 20px", textAlign: "center", cursor: "pointer", background: COLORS.primaryLight
    },
    fileName: {
      display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
      background: COLORS.successBg, border: "1px solid rgba(52, 211, 153, 0.3)",
      borderRadius: 10, marginTop: 14, fontSize: 13, fontWeight: 600, color: COLORS.success
    },
    uploadBtn: {
      background: "linear-gradient(135deg, #2EE6C5 0%, #14B8A6 100%)",
      color: COLORS.primaryInk, border: "none", borderRadius: 10, padding: "12px",
      fontSize: 14, fontWeight: 800, cursor: "pointer", width: "100%", marginTop: 16
    },
    successBox: { textAlign: "center", padding: "12px 0" },
    errText: { fontSize: 12.5, color: COLORS.danger, marginTop: 10, fontWeight: 600 },
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
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                  Pharmacist Verification
                </div>
                <div style={rxModalStyles.title}>Upload Your Prescription</div>
                <div style={rxModalStyles.sub}>
                  Submit a valid clinician prescription for Rx-regulated medications. Accepted formats: JPG, PNG, WEBP, or PDF.
                </div>

                <label style={rxFile ? rxModalStyles.dropzoneActive : rxModalStyles.dropzone}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={e => { setRxFile(e.target.files[0]); setRxError(null); }}
                  />
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.primaryLight, border: `1px solid ${COLORS.borderStrong}`, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>Select prescription file</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>JPG, PNG, or PDF · Encrypted Cloudinary storage</div>
                </label>

                {rxFile && (
                  <div style={rxModalStyles.fileName}>
                    <span>✓</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rxFile.name}</span>
                    <span style={{ fontSize: 11.5, color: COLORS.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{(rxFile.size / 1024).toFixed(0)} KB</span>
                  </div>
                )}

                {rxError && <div style={rxModalStyles.errText}>{rxError}</div>}

                <button
                  className="ms-btn-primary"
                  style={{ ...rxModalStyles.uploadBtn, opacity: (!rxFile || rxUploading) ? 0.55 : 1 }}
                  onClick={handleRxUpload}
                  disabled={!rxFile || rxUploading}
                >
                  {rxUploading ? "Uploading to Vault..." : "Submit Prescription"}
                </button>
              </>
            ) : (
              <div style={rxModalStyles.successBox}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: COLORS.successBg, border: "1px solid rgba(52,211,153,0.35)", color: COLORS.success, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 14px", fontWeight: 800 }}>✓</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8, color: COLORS.text }}>Prescription Verified &amp; Stored</div>
                <div style={{ fontSize: 13.5, color: COLORS.textMuted, marginBottom: 22, lineHeight: 1.6 }}>
                  Your prescription has been uploaded securely. You can now browse Rx-regulated formulations and complete checkout.
                </div>
                <button
                  className="ms-btn-primary"
                  style={rxModalStyles.uploadBtn}
                  onClick={() => { closeRxModal(); setActiveCategory("All"); setPage("listing"); }}
                >
                  Browse All Medicines
                </button>
                <button
                  style={{ ...rxModalStyles.uploadBtn, background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, marginTop: 10 }}
                  onClick={closeRxModal}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editorial Clinical Hero */}
      <div style={s.hero}>
        {/* Ambient radial highlights & grid */}
        <div style={{
          position: "absolute", top: -120, right: -80, width: 380, height: 380,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(46,230,197,0.18) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: -140, left: "35%", width: 320, height: 320,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div className="ms-hero-grid" style={{ position: "relative", zIndex: 2 }}>
          <div>
            <div style={s.heroBadge}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.primary, boxShadow: "0 0 8px #2EE6C5" }} />
              Licensed Clinical Dispensary · Free Express Delivery ₹499+
            </div>
            <h1 style={s.heroTitle}>
              Precision Medicine,<br />
              <span style={{ color: COLORS.primary }}>Delivered with Care.</span>
            </h1>
            <p style={s.heroSub}>
              Verified pharmaceutical formulations, chronic-care therapies, and clinical supplements sourced directly from licensed manufacturers with batch-level traceability.
            </p>
            <div style={s.heroActions}>
              <button className="ms-btn-primary" style={s.heroBtnPrimary} onClick={() => { setActiveCategory("All"); setPage("listing"); }}>
                Explore Medicines →
              </button>
              <button
                style={s.heroBtnSecondary}
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) { showToast("Please login first to upload a prescription.", "warning"); setPage("auth"); return; }
                  setShowRxModal(true);
                }}
              >
                Upload Rx Prescription
              </button>
            </div>

            {/* Live Catalog Metrics */}
            <div style={{ display: "flex", gap: 28, marginTop: 30, paddingTop: 22, borderTop: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
              {[
                { val: totalProducts > 0 ? `${totalProducts}+` : "100+", label: "Verified Formulations" },
                { val: categoryData.length > 0 ? `${categoryData.length}` : "7", label: "Therapeutic Classes" },
                { val: "2–4 hrs", label: "Express Metro Dispatch" },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.text }}>{m.val}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Clinical Bento Panel */}
          <div style={{
            background: "rgba(6, 24, 26, 0.72)",
            border: `1px solid ${COLORS.borderStrong}`,
            borderRadius: 16,
            padding: 20,
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.primary, fontFamily: "'JetBrains Mono', monospace" }}>
                Featured Dispensary Picks
              </span>
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>Live Stock</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(products.slice(0, 3)).map(p => {
                const st = CATEGORY_STYLE[p.category] || DEFAULT_STYLE;
                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setPage("detail"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                      borderRadius: 12, background: "rgba(15, 45, 50, 0.7)",
                      border: `1px solid ${COLORS.border}`, cursor: "pointer",
                      transition: "border-color 0.2s, background 0.2s"
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${st.color}18`, border: `1px solid ${st.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      <CategoryIcon category={p.category} size={18} color={st.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>
                        {p.manufacturer} · {p.category}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: COLORS.primary }}>
                        ₹{p.price}
                      </div>
                      <div style={{ fontSize: 10.5, color: COLORS.textMuted }}>
                        {p.prescription ? "Rx" : "OTC"}
                      </div>
                    </div>
                  </div>
                );
              })}
              {products.length === 0 && (
                <div style={{ padding: "24px 12px", textAlign: "center", fontSize: 13, color: COLORS.textMuted }}>
                  Syncing dispensary inventory...
                </div>
              )}
            </div>

            <button
              style={{
                width: "100%", marginTop: 14, padding: "10px 14px", borderRadius: 10,
                background: "rgba(46, 230, 197, 0.1)", border: `1px solid rgba(46, 230, 197, 0.28)`,
                color: COLORS.primary, fontSize: 12.5, fontWeight: 700, cursor: "pointer"
              }}
              onClick={() => { setActiveCategory("All"); setPage("listing"); }}
            >
              View Full Formulary →
            </button>
          </div>
        </div>
      </div>

      {/* Therapeutic Categories */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={s.sectionTitle}>Therapeutic Categories</h2>
          <span style={{ fontSize: 13, color: COLORS.primary, cursor: "pointer", fontWeight: 700 }} onClick={() => { setActiveCategory("All"); setPage("listing"); }}>
            Browse all →
          </span>
        </div>
        <p style={s.sectionSub}>
          {categoryData.length > 0
            ? `Explore ${totalProducts} clinical formulations across ${categoryData.length} specialized departments`
            : "Loading therapeutic departments..."}
        </p>
        <div className="ms-cat-grid" style={{ marginBottom: 0 }}>
          {categoryData.map(cat => {
            const style = CATEGORY_STYLE[cat.name] || DEFAULT_STYLE;
            return (
              <div
                key={cat.name}
                className="ms-card-hover"
                style={{ ...s.catCard, borderTop: `2px solid ${style.color}` }}
                onClick={() => { setActiveCategory(cat.name); setPage("listing"); }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, margin: "0 auto 10px",
                  background: `${style.color}16`, border: `1px solid ${style.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <CategoryIcon category={cat.name} size={20} color={style.color} />
                </div>
                <div style={s.catName}>{cat.name}</div>
                <div style={s.catCount}>{cat.count} items</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Essentials / Best Sellers */}
      <div style={{ marginBottom: "2.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={s.sectionTitle}>Clinical Essentials</h2>
          <span style={{ fontSize: 13, color: COLORS.primary, cursor: "pointer", fontWeight: 700 }} onClick={() => { setActiveCategory("All"); setPage("listing"); }}>
            Full catalog →
          </span>
        </div>
        <p style={s.sectionSub}>Most prescribed and frequently dispensed medicines</p>
        <div className="ms-prod-grid-4">
          {products.slice(0, 8).map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => { setSelectedProduct(p); setPage("detail"); }}
              onAddToCart={onAddToCart}
              isWishlisted={wishlist?.some(w => w.id === p.id)}
              onToggleWishlist={() => toggleWishlist(p)}
            />
          ))}
        </div>
      </div>

      {/* Clinical Standards / Trust Grid */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ ...s.sectionTitle, marginBottom: 4 }}>The MediStore Clinical Standard</h2>
        <p style={s.sectionSub}>Built for pharmaceutical safety, authenticity, and rapid fulfillment</p>
        <div className="ms-trust-grid">
          {[
            {
              title: "100% Authentic Batches",
              desc: "Sourced directly from authorized pharma manufacturers with sealed batch verification.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
                </svg>
              )
            },
            {
              title: "Temperature-Safe Dispatch",
              desc: "Express 2–4 hour metro delivery with insulated packaging for sensitive formulations.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              )
            },
            {
              title: "Pharmacist Rx Review",
              desc: "Every uploaded prescription is reviewed before dispatch to ensure accurate dosage.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              )
            },
            {
              title: "Encrypted Payments",
              desc: "Bank-grade Razorpay checkout supporting UPI, cards, and transparent order receipts.",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )
            },
          ].map(t => (
            <div key={t.title} style={s.trustCard}>
              <div style={s.trustIcon}>{t.icon}</div>
              <div>
                <div style={s.trustTitle}>{t.title}</div>
                <div style={s.trustDesc}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Footer */}
      <footer style={{
        borderTop: `1px solid ${COLORS.border}`,
        paddingTop: 28, paddingBottom: 12,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16, fontSize: 12.5, color: COLORS.textMuted
      }}>
        <div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: COLORS.text, fontSize: 15 }}>
            Medi<span style={{ color: COLORS.primary }}>Store</span>
          </span>
          <span style={{ marginLeft: 10 }}>· Licensed Clinical Pharmacy &amp; Healthcare Dispensary</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ cursor: "pointer", color: COLORS.textMuted }} onClick={() => { setActiveCategory("All"); setPage("listing"); }}>Medicines</span>
          <span style={{ cursor: "pointer", color: COLORS.textMuted }} onClick={() => setPage("cart")}>Cart</span>
          <span style={{ cursor: "pointer", color: COLORS.textMuted }} onClick={() => setPage("my-orders")}>Orders</span>
        </div>
      </footer>
    </div>
  );
}
