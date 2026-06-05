import React, { useState } from 'react';
import { s, COLORS, CATEGORY_STYLE, DEFAULT_STYLE, API } from '../utils/theme';
import ProductCard from '../components/ProductCard';

export default function HomePage({ products, setPage, setActiveCategory, setSelectedProduct, onAddToCart, categoryData, user, showToast, wishlist, toggleWishlist }) {
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
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(3px)" },
    modal: { background: COLORS.white, borderRadius: 12, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 16px 48px rgba(0,0,0,0.12)", position: "relative" },
    closeBtn: { position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: COLORS.textMuted, lineHeight: 1 },
    title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
    sub: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20, lineHeight: 1.5 },
    dropzone: { border: `1.5px dashed ${COLORS.border}`, borderRadius: 10, padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s", background: COLORS.bg },
    dropzoneActive: { border: `1.5px dashed ${COLORS.primary}`, borderRadius: 10, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: COLORS.primaryLight },
    fileName: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#F0FDF4", borderRadius: 8, marginTop: 14, fontSize: 13, fontWeight: 600, color: "#166534" },
    uploadBtn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", marginTop: 16, transition: "opacity 0.2s" },
    successBox: { textAlign: "center", padding: "16px 0" },
    errText: { fontSize: 12, color: COLORS.danger, marginTop: 10, fontWeight: 600 },
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
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Prescription</div>
                <div style={rxModalStyles.title}>Upload Your Prescription</div>
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
                  <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.4 }}>↑</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Click to select file</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>JPG, PNG, or PDF (max 5MB)</div>
                </label>

                {rxFile && (
                  <div style={rxModalStyles.fileName}>
                    <span style={{ fontSize: 12 }}>✓</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rxFile.name}</span>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>{(rxFile.size / 1024).toFixed(0)} KB</span>
                  </div>
                )}

                {rxError && <div style={rxModalStyles.errText}>{rxError}</div>}

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
                <div style={{ width: 48, height: 48, borderRadius: 24, background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, margin: "0 auto 14px", fontWeight: 700 }}>✓</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Prescription Uploaded</div>
                <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                  Your prescription has been uploaded successfully. You can now browse our prescription medicines and add them to your cart.
                </div>
                <button
                  style={rxModalStyles.uploadBtn}
                  onClick={() => { closeRxModal(); setActiveCategory("All"); setPage("listing"); }}
                >
                  Browse Prescription Medicines
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
        <div style={s.heroBadge}>Free delivery on orders above ₹499</div>
        <h1 style={s.heroTitle}>Your Health,<br />Delivered Fast.</h1>
        <p style={s.heroSub}>Genuine medicines, vitamins & healthcare products delivered to your doorstep.</p>
        <div style={s.heroActions}>
          <button style={s.heroBtnPrimary} onClick={() => { setActiveCategory("All"); setPage("listing"); }}>Shop Medicines</button>
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
          <span style={{ fontSize: 13, color: COLORS.primary, cursor: "pointer", fontWeight: 600 }} onClick={() => { setActiveCategory("All"); setPage("listing"); }}>View all →</span>
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
                style={{ ...s.catCard, borderLeft: `3px solid ${style.color}` }}
                onClick={() => { setActiveCategory(cat.name); setPage("listing"); }}
              >
                <div style={{ ...s.catIcon, color: style.color }}>●</div>
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
          <span style={{ fontSize: 13, color: COLORS.primary, cursor: "pointer", fontWeight: 600 }} onClick={() => { setActiveCategory("All"); setPage("listing"); }}>View all →</span>
        </div>
        <p style={s.sectionSub}>Most purchased medicines this month</p>
        <div style={s.prodGrid}>
          {products.slice(0, 4).map(p => (
            <ProductCard key={p.id} product={p}
              onClick={() => { setSelectedProduct(p); setPage("detail"); }}
              onAddToCart={onAddToCart}
              isWishlisted={wishlist?.some(w => w.id === p.id)}
              onToggleWishlist={() => toggleWishlist(p)}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ ...s.sectionTitle, marginBottom: 4 }}>Why Choose MediStore?</h2>
        <p style={s.sectionSub}>We prioritize your health above everything else</p>
        <div style={s.trustRow}>
          {[
            { icon: "✓", title: "100% Genuine", desc: "All medicines are sourced directly from licensed manufacturers and distributors." },
            { icon: "→", title: "Fast Delivery", desc: "Get medicines delivered within 2–4 hours in select cities, same-day otherwise." },
            { icon: "+", title: "Pharmacist Support", desc: "Talk to a certified pharmacist anytime for advice on your prescriptions." },
            { icon: "◆", title: "Secure Checkout", desc: "Your data and payments are protected with bank-grade encryption." },
          ].map(t => (
            <div key={t.title} style={s.trustCard}>
              <div style={s.trustIcon}><span style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary }}>{t.icon}</span></div>
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
