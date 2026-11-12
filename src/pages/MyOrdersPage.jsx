import React, { useState, useEffect } from 'react';
import { s, COLORS, API } from '../utils/theme';
import MedicineArt from '../components/MedicineArt';

const STATUS_STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];
const STATUS_LABELS = { PENDING: "Order Placed", PROCESSING: "Processing", PAID: "Payment Confirmed", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled" };
const STATUS_ICONS = {
  PENDING: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  PROCESSING: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  PAID: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  SHIPPED: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  DELIVERED: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  CANCELLED: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
};
const STATUS_COLORS = { PENDING: "#FBBF24", PROCESSING: "#38BDF8", PAID: "#38BDF8", SHIPPED: "#C084FC", DELIVERED: "#34D399", CANCELLED: "#FB7185" };

export default function MyOrdersPage({ setPage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setPage("auth"); return; }
    fetch(`${API}/api/orders/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setPage]);

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status);

  if (loading) return (
    <div style={{ ...s.page, textAlign: "center", paddingTop: 80 }}>
      <div style={{ color: COLORS.primary, marginBottom: 14 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      </div>
      <div style={{ fontSize: 15, color: COLORS.textMuted }}>Loading your orders...</div>
    </div>
  );

  return (
    <div style={s.page}>
      <h1 style={{ ...s.sectionTitle, fontSize: 30, marginBottom: 4 }}>My Orders</h1>
      <p style={s.sectionSub}>Track prescription fulfillment and delivery status</p>

      {orders.length === 0 ? (
        <div style={s.emptyCart}>
          <div style={s.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: COLORS.text }}>No orders yet</div>
          <div style={{ marginBottom: 20, color: COLORS.textMuted }}>Place an order to track your medicines here</div>
          <button className="ms-btn-primary" style={{ ...s.addToCartBtn, width: "auto", padding: "12px 28px" }} onClick={() => setPage("listing")}>
            Browse Medicines
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(order => {
            const currentStep = getStepIndex(order.status);
            const isExpanded = expandedOrder === order.id;
            const orderDate = new Date(order.createdAt);
            const statusCol = STATUS_COLORS[order.status] || COLORS.primary;
            return (
              <div key={order.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
                <div
                  style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 12,
                      background: `${statusCol}1E`, border: `1px solid ${statusCol}44`,
                      color: statusCol, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {STATUS_ICONS[order.status] || STATUS_ICONS.PENDING}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, marginBottom: 3, color: COLORS.text }}>
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>
                        {orderDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 800, color: COLORS.text }}>₹{order.totalAmount?.toLocaleString()}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: statusCol }}>{STATUS_LABELS[order.status] || order.status}</div>
                    </div>
                    <span style={{ fontSize: 13, color: COLORS.textMuted, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>▼</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "22px 24px", background: COLORS.inputBg }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, padding: "0 8px" }}>
                      {STATUS_STEPS.map((step, i) => {
                        const isCompleted = i <= currentStep;
                        const isActive = i === currentStep;
                        return (
                          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STATUS_STEPS.length - 1 ? 1 : "none" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                background: isCompleted ? STATUS_COLORS[step] : COLORS.surface,
                                border: `1px solid ${isCompleted ? STATUS_COLORS[step] : COLORS.borderStrong}`,
                                color: isCompleted ? COLORS.primaryInk : COLORS.textMuted,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, fontWeight: 800,
                                boxShadow: isActive ? `0 0 0 4px ${STATUS_COLORS[step]}30` : "none",
                              }}>
                                {isCompleted ? "✓" : i + 1}
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, color: isCompleted ? COLORS.text : COLORS.textMuted, whiteSpace: "nowrap" }}>
                                {STATUS_LABELS[step]}
                              </span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div style={{
                                flex: 1, height: 3, margin: "0 8px", marginBottom: 20,
                                background: i < currentStep ? STATUS_COLORS[STATUS_STEPS[i + 1]] : COLORS.border,
                                borderRadius: 2
                              }} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.textMuted, marginBottom: 12 }}>
                      Items in this order
                    </div>
                    {order.items?.map(item => (
                      <div key={item.id} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                        borderBottom: `1px solid ${COLORS.border}`
                      }}>
                        <MedicineArt category={item.product?.category} name={item.product?.name} variant="thumb" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{item.product?.name || "Product"}</div>
                          <div style={{ fontSize: 12, color: COLORS.textMuted }}>Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: COLORS.text }}>
                          ₹{(item.priceAtTime * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Total Paid</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: COLORS.primary }}>
                        ₹{order.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
