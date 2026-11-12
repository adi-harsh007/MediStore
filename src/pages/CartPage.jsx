import React, { useState } from 'react';
import { s, COLORS, API } from '../utils/theme';
import MedicineArt from '../components/MedicineArt';

export default function CartPage({ cart, setCart, setPage, showToast }) {
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
      await fetch(`${API}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phone: phone.trim(), address: address.trim() })
      });

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
          theme: { color: '#2EE6C5' }
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

  if (showCheckout) {
    const cs = {
      wrapper: { maxWidth: 960, margin: "0 auto", padding: "2rem" },
      card: { background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, marginBottom: 20 },
      cardTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20, color: COLORS.text },
      fieldGroup: { marginBottom: 20 },
      label: { display: "block", fontSize: 11.5, fontWeight: 700, color: COLORS.textMuted, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" },
      input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.inputBg, color: COLORS.text, fontSize: 14.5, outline: "none", boxSizing: "border-box" },
      inputError: { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${COLORS.danger}`, background: COLORS.inputBg, color: COLORS.text, fontSize: 14.5, outline: "none", boxSizing: "border-box" },
      textarea: { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.inputBg, color: COLORS.text, fontSize: 14.5, outline: "none", boxSizing: "border-box", minHeight: 90, resize: "vertical" },
      textareaError: { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${COLORS.danger}`, background: COLORS.inputBg, color: COLORS.text, fontSize: 14.5, outline: "none", boxSizing: "border-box", minHeight: 90, resize: "vertical" },
      errText: { fontSize: 12, color: COLORS.danger, marginTop: 5, fontWeight: 600 },
      itemRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` },
      placeBtn: {
        background: "linear-gradient(135deg, #2EE6C5 0%, #14B8A6 100%)",
        color: COLORS.primaryInk, border: "none", borderRadius: 10, padding: "14px",
        fontSize: 15, fontWeight: 800, cursor: "pointer", width: "100%", marginTop: 8
      },
    };

    return (
      <div style={cs.wrapper}>
        <button style={{ ...s.backBtn, marginBottom: 16 }} onClick={() => setShowCheckout(false)}>← Back to Cart</button>
        <h1 style={{ ...s.sectionTitle, fontSize: 30, marginBottom: 4 }}>Checkout</h1>
        <p style={s.sectionSub}>Confirm delivery details and complete payment</p>

        <div className="ms-cart-grid">
          <div>
            <div style={cs.card}>
              <div style={cs.cardTitle}>Delivery Details</div>
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
                    style={{ ...cs.input, padding: "10px 12px" }}
                  />
                  {errors.prescription && <div style={cs.errText}>{errors.prescription}</div>}
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 5 }}>Required for Rx medicines in your cart (image or PDF).</div>
                </div>
              )}
            </div>

            <div style={cs.card}>
              <div style={cs.cardTitle}>Order Items ({cart.reduce((s, i) => s + i.qty, 0)})</div>
              {cart.map((item, i) => (
                <div key={item.id} style={{ ...cs.itemRow, borderBottom: i < cart.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <MedicineArt category={item.category} name={item.name} variant="thumb" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>Qty: {item.qty} × ₹{item.price}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 15, color: COLORS.text }}>
                    ₹{(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ ...cs.card, position: "sticky", top: 88 }}>
              <div style={cs.cardTitle}>Payment Summary</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 10, color: COLORS.textMuted }}>
                  <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span style={{ color: COLORS.text, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 10, color: COLORS.textMuted }}>
                  <span>Delivery</span>
                  <span style={{ color: delivery === 0 ? COLORS.success : COLORS.text, fontWeight: 700 }}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 10, color: COLORS.textMuted }}>
                  <span>Member Discount (5%)</span>
                  <span style={{ color: COLORS.success, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>−₹{discount.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: `1px solid ${COLORS.borderStrong}`, paddingTop: 14, marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: COLORS.text }}>
                  <span>Total</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.primary }}>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                className="ms-btn-primary"
                style={{ ...cs.placeBtn, opacity: placing ? 0.6 : 1 }}
                onClick={validateAndPlaceOrder}
                disabled={placing}
              >
                {placing ? "Processing..." : `Place Order — ₹${total.toLocaleString()}`}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 12, color: COLORS.textMuted }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Encrypted checkout via Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={{ ...s.sectionTitle, fontSize: 30, marginBottom: 4 }}>Your Cart</h1>
      <p style={s.sectionSub}>{cart.length} formulation{cart.length !== 1 ? "s" : ""} selected</p>
      {cart.length === 0 ? (
        <div style={s.emptyCart}>
          <div style={s.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: COLORS.text }}>Your cart is empty</div>
          <div style={{ marginBottom: 20 }}>Explore our formulary to add medicines</div>
          <button className="ms-btn-primary" style={{ ...s.addToCartBtn, width: "auto", padding: "12px 28px" }} onClick={() => setPage("listing")}>
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="ms-cart-grid">
          <div>
            {subtotal < 499 && (
              <div style={{ background: COLORS.warningBg, border: "1px solid rgba(251, 191, 36, 0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13.5, color: COLORS.warning, fontWeight: 600 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  Add ₹{499 - subtotal} more to unlock free express delivery
                </div>
              </div>
            )}
            {cart.map(item => (
              <div key={item.id} style={s.cartItem}>
                <MedicineArt category={item.category} name={item.name} variant="thumb" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.cartItemName}>{item.name}</div>
                  <div style={s.cartItemCat}>{item.category} · {item.manufacturer}</div>
                  <div style={s.cartItemPriceRow}>
                    <span style={s.cartItemPrice}>₹{(item.price * item.qty).toLocaleString()}</span>
                    <div style={s.cartQtyRow}>
                      <button style={s.cartQtyBtn} onClick={() => updateQty(item.id, -1)}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 14, minWidth: 22, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>{item.qty}</span>
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
              <div style={s.summaryRow}><span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span><span style={{ color: COLORS.text, fontFamily: "'JetBrains Mono', monospace" }}>₹{subtotal.toLocaleString()}</span></div>
              <div style={s.summaryRow}><span>Delivery</span><span style={{ color: delivery === 0 ? COLORS.success : COLORS.text, fontWeight: 700 }}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span></div>
              <div style={s.summaryRow}><span>Member Discount (5%)</span><span style={{ color: COLORS.success, fontFamily: "'JetBrains Mono', monospace" }}>−₹{discount.toLocaleString()}</span></div>
              <div style={s.summaryTotal}><span>Total</span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.primary }}>₹{total.toLocaleString()}</span></div>
              <button className="ms-btn-primary" style={s.checkoutBtn} onClick={handleProceedToCheckout}>Proceed to Checkout →</button>
              <button
                style={{ ...s.checkoutBtn, background: COLORS.inputBg, color: COLORS.text, marginTop: 10, border: `1px solid ${COLORS.border}` }}
                onClick={() => setPage("listing")}
              >
                Continue Shopping
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, fontSize: 12, color: COLORS.textMuted }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Encrypted checkout
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
