import React, { useState, useEffect } from 'react';
import { s, COLORS, API } from '../utils/theme';

const STATUS_STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];
const STATUS_LABELS = { PENDING: "Order Placed", PAID: "Payment Confirmed", SHIPPED: "Shipped", DELIVERED: "Delivered" };
const STATUS_ICONS = { 
  PENDING: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, 
  PAID: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>, 
  SHIPPED: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>, 
  DELIVERED: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> 
};
const STATUS_COLORS = { PENDING: "#F59E0B", PAID: "#3B82F6", SHIPPED: "#8B5CF6", DELIVERED: "#10B981" };

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
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setPage]);

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status);

  if (loading) return (
    <div style={{ ...s.page, textAlign: "center", paddingTop: 80 }}>
      <div style={{ color: COLORS.textMuted, marginBottom: 16 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      </div>
      <div style={{ fontSize: 16, color: COLORS.textMuted }}>Loading your orders...</div>
    </div>
  );

  return (
    <div style={s.page}>
      <h1 style={{ ...s.sectionTitle, fontSize: 28, marginBottom: 4 }}>My Orders</h1>
      <p style={s.sectionSub}>Track and manage your orders</p>

      {orders.length === 0 ? (
        <div style={s.emptyCart}>
          <div style={s.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No orders yet</div>
          <div style={{ marginBottom: 20, color: COLORS.textMuted }}>Start shopping to see your orders here</div>
          <button style={{ ...s.addToCartBtn, width: "auto", padding: "12px 28px", borderRadius: 12, fontSize: 15 }} onClick={() => setPage("listing")}>Browse Medicines</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(order => {
            const currentStep = getStepIndex(order.status);
            const isExpanded = expandedOrder === order.id;
            const orderDate = new Date(order.createdAt);
            return (
              <div key={order.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", transition: "box-shadow 0.2s" }}>
                {/* Order Header */}
                <div
                  style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: STATUS_COLORS[order.status] + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {STATUS_ICONS[order.status]}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Order #{order.id.slice(0, 8).toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                        {orderDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 17, fontWeight: 800 }}>₹{order.totalAmount?.toLocaleString()}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[order.status] }}>{STATUS_LABELS[order.status]}</div>
                    </div>
                    <span style={{ fontSize: 14, color: COLORS.textMuted, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>▼</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "20px 24px" }}>
                    {/* Status Tracker */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, padding: "0 8px" }}>
                      {STATUS_STEPS.map((step, i) => {
                        const isCompleted = i <= currentStep;
                        const isActive = i === currentStep;
                        return (
                          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STATUS_STEPS.length - 1 ? 1 : "none" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                background: isCompleted ? STATUS_COLORS[step] : COLORS.border,
                                color: isCompleted ? "#fff" : COLORS.textMuted,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700,
                                boxShadow: isActive ? `0 0 0 4px ${STATUS_COLORS[step]}30` : "none",
                                transition: "all 0.3s"
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
                                borderRadius: 2, transition: "background 0.3s"
                              }} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Items */}
                    <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: COLORS.textMuted, marginBottom: 12 }}>Items in this order</div>
                    {order.items?.map(item => (
                      <div key={item.id} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                        borderBottom: `1px solid ${COLORS.border}`
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: item.product?.color || "#F3F4F6",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0
                        }}>
                          {item.product?.icon || <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.product?.name || "Product"}</div>
                          <div style={{ fontSize: 12, color: COLORS.textMuted }}>Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>₹{(item.priceAtTime * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}

                    {/* Order Summary */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMuted }}>Total Paid</span>
                      <span style={{ fontSize: 18, fontWeight: 800 }}>₹{order.totalAmount?.toLocaleString()}</span>
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
