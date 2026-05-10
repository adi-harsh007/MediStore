import { useState, useRef, useEffect } from "react";

const C = {
  sidebar: "#0F172A", sidebarHover: "#1E293B", sidebarActive: "#0D9488",
  primary: "#0D9488", primaryDark: "#0F766E", primaryLight: "#CCFBF1",
  bg: "#F1F5F9", white: "#FFFFFF", text: "#0F172A", textMuted: "#64748B",
  textLight: "#94A3B8", border: "#E2E8F0", borderDark: "#CBD5E1",
  success: "#10B981", successBg: "#ECFDF5", successText: "#065F46",
  warning: "#F59E0B", warningBg: "#FFFBEB", warningText: "#92400E",
  danger: "#EF4444", dangerBg: "#FEF2F2", dangerText: "#991B1B",
  info: "#3B82F6", infoBg: "#EFF6FF", infoText: "#1E40AF",
  purple: "#8B5CF6", purpleBg: "#F5F3FF", purpleText: "#4C1D95",
};

const INIT_PRODUCTS = [];

const INIT_ORDERS = [];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getRevenueData(orders) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), m: d.getMonth(), revenue: 0 });
  }
  orders.filter(o => o.status !== "cancelled").forEach(o => {
    const od = new Date(o.rawDate || o.date);
    const slot = months.find(m => m.m === od.getMonth() && m.year === od.getFullYear());
    if (slot) slot.revenue += o.total;
  });
  return months;
}

const CATEGORIES = ["Pain Relief", "Vitamins", "Antibiotics", "Digestive", "Allergy", "Diabetes", "Cholesterol"];
const MANUFACTURERS = ["Sun Pharma", "HealthKart", "Cipla", "Dr. Reddy's", "Mankind Pharma", "USV Pharma", "Zydus Cadila", "Revital", "Pfizer India", "Abbott India", "Alkem Labs", "Carbamide Forte"];

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: C.warningBg, color: C.warningText, dot: C.warning },
  processing: { label: "Processing", bg: C.infoBg, color: C.infoText, dot: C.info },
  shipped: { label: "Shipped", bg: C.purpleBg, color: C.purpleText, dot: C.purple },
  delivered: { label: "Delivered", bg: C.successBg, color: C.successText, dot: C.success },
  cancelled: { label: "Cancelled", bg: C.dangerBg, color: C.dangerText, dot: C.danger },
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "products", label: "Products", icon: "💊" },
  { id: "orders", label: "Orders", icon: "📦" },
  { id: "inventory", label: "Inventory", icon: "🗄" },
];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

function KpiCard({ icon, label, value, sub, subColor, bg }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px", display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: bg || C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", color: C.text, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, marginTop: 5, fontWeight: 600, color: subColor || C.success }}>{sub}</div>}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 20, width: wide ? 680 : 480, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.textMuted, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>{label}{required && <span style={{ color: C.danger }}>*</span>}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", color: C.text, background: C.white, boxSizing: "border-box", fontFamily: "inherit" };

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: "", category: "Pain Relief", price: "", stock: "", manufacturer: MANUFACTURERS[0], prescription: false, status: "active", icon: "💊", color: "#FEF3C7" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FormField label="Product Name" required>
          <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Paracetamol 500mg" />
        </FormField>
        <FormField label="Category" required>
          <select style={inputStyle} value={form.category} onChange={e => set("category", e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Price (₹)" required>
          <input style={inputStyle} type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0" />
        </FormField>
        <FormField label="Stock Quantity" required>
          <input style={inputStyle} type="number" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" />
        </FormField>
        <FormField label="Manufacturer" required>
          <select style={inputStyle} value={form.manufacturer} onChange={e => set("manufacturer", e.target.value)}>
            {MANUFACTURERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </FormField>
        <FormField label="Status">
          <select style={inputStyle} value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormField>
      </div>
      <FormField label="Prescription Required">
        <div style={{ display: "flex", gap: 20 }}>
          {[false, true].map(v => (
            <label key={String(v)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
              <input type="radio" checked={form.prescription === v} onChange={() => set("prescription", v)} />
              {v ? "Yes (Rx)" : "No (OTC)"}
            </label>
          ))}
        </div>
      </FormField>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onCancel} style={{ border: `1.5px solid ${C.border}`, background: C.white, borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: C.text }}>Cancel</button>
        <button onClick={() => onSave(form)} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          {initial ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </div>
  );
}

function Sidebar({ active, setActive }) {
  return (
    <div style={{ width: 240, background: C.sidebar, display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" }}>
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: C.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff" }}>M</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "-0.3px" }}>MediStore</div>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Admin Panel</div>
          </div>
        </div>
      </div>
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.8px", textTransform: "uppercase", padding: "0 8px 8px" }}>Menu</div>
        {NAV_ITEMS.map(item => (
          <div key={item.id}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 2, background: active === item.id ? "rgba(13,148,136,0.15)" : "transparent", color: active === item.id ? C.primary : "#94A3B8", fontWeight: active === item.id ? 700 : 500, fontSize: 14, transition: "all 0.15s", borderLeft: active === item.id ? `3px solid ${C.primary}` : "3px solid transparent" }}
            onClick={() => setActive(item.id)}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>A</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Admin User</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>admin@medistore.in</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ products, orders }) {
  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const deliveredRevenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 30).length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const revenueData = getRevenueData(orders);
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
  const lastMonth = revenueData[revenueData.length - 1]?.revenue || 0;
  const prevMonth = revenueData[revenueData.length - 2]?.revenue || 0;
  const growthPct = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;
  const recentOrders = orders.slice(0, 6);
  const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Dashboard</h1>
        <p style={{ color: C.textMuted, fontSize: 14, margin: "4px 0 0" }}>Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard icon="💰" label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} sub={`₹${deliveredRevenue.toLocaleString()} delivered`} bg="#ECFDF5" />
        <KpiCard icon="📦" label="Total Orders" value={totalOrders} sub={`${deliveredOrders} delivered`} bg="#EFF6FF" subColor={C.info} />
        <KpiCard icon="💊" label="Products" value={products.length} sub={`${products.filter(p => p.status === "active").length} active`} bg="#F5F3FF" subColor={C.purple} />
        <KpiCard icon="⚠️" label="Low Stock Alerts" value={lowStock} sub={`${pendingOrders} orders pending`} bg="#FEF2F2" subColor={C.danger} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 20 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Revenue Overview</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Last 6 months</div>
            </div>
            {growthPct !== 0 && <span style={{ background: growthPct > 0 ? C.successBg : C.dangerBg, color: growthPct > 0 ? C.successText : C.dangerText, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>{growthPct > 0 ? "↑" : "↓"} {Math.abs(growthPct)}% growth</span>}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
            {revenueData.map((d, i) => (
              <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>{d.revenue > 0 ? `₹${Math.round(d.revenue / 1000)}k` : "₹0"}</div>
                <div style={{ width: "100%", background: C.primary, borderRadius: "6px 6px 0 0", height: Math.max(4, Math.round((d.revenue / maxRevenue) * 120)), opacity: i === revenueData.length - 1 ? 1 : 0.55, transition: "opacity 0.2s" }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Order Status</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 18 }}>Current breakdown</div>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = orders.filter(o => o.status === key).length;
            const pct = Math.round((count / orders.length) * 100);
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{cfg.label}</span>
                  <span style={{ color: C.textMuted }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: C.bg, borderRadius: 99 }}>
                  <div style={{ height: "100%", borderRadius: 99, background: cfg.dot, width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Recent Orders</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["Order ID", "Customer", "Total", "Status", "Date"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0 12px 10px", fontSize: 12, fontWeight: 700, color: C.textMuted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px", fontWeight: 700, color: C.primary }}>{o.id}</td>
                  <td style={{ padding: "12px" }}>{o.customer}</td>
                  <td style={{ padding: "12px", fontWeight: 700 }}>₹{o.total}</td>
                  <td style={{ padding: "12px" }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: "12px", color: C.textMuted, fontSize: 12 }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Top Products</div>
          {topProducts.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{p.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{p.sold.toLocaleString()} sold</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text, flexShrink: 0 }}>₹{p.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Products({ products, setProducts }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const nextId = useRef(Math.max(...products.map(p => p.id)) + 1);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  const filtered = products.filter(p => {
    if (catFilter !== "All" && p.category !== catFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = async (form) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name, category: form.category, price: Number(form.price), originalPrice: Number(form.price),
          icon: form.icon, color: form.color, description: "New product", dosage: "Standard",
          prescriptionRequired: form.prescription, manufacturer: form.manufacturer, inStock: Number(form.stock) > 0, stock: Number(form.stock), isActive: true
        })
      });
      if (!res.ok) throw new Error("Failed to add");
      const p = await res.json();
      const newP = { ...p, prescription: p.prescriptionRequired, stock: p.inStock ? Number(form.stock) : 0, sold: 0, status: "active" };
      setProducts(prev => [newP, ...prev]);
      setShowAdd(false);
      showToast("Product added successfully!");
    } catch (e) {
      showToast("Error adding product", "danger");
    }
  };

  const handleEdit = async (form) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name, category: form.category, price: Number(form.price), originalPrice: Number(form.price),
          prescriptionRequired: form.prescription, manufacturer: form.manufacturer, inStock: Number(form.stock) > 0, stock: Number(form.stock)
        })
      });
      if (!res.ok) throw new Error("Failed to edit");
      const p = await res.json();
      setProducts(prev => prev.map(item => item.id === p.id ? { ...item, ...form, price: Number(form.price), stock: Number(form.stock) } : item));
      setEditProduct(null);
      showToast("Product updated successfully!");
    } catch (e) {
      showToast("Error updating product", "danger");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${deleteProduct.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      setProducts(prev => prev.filter(p => p.id !== deleteProduct.id));
      setDeleteProduct(null);
      showToast("Product deleted.", "danger");
    } catch (e) {
      showToast("Error deleting product", "danger");
    }
  };

  const toggleStatus = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newStatus = product.status === "active" ? "inactive" : "active";
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ isActive: newStatus === "active" })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      showToast(`Product is now ${newStatus}`);
    } catch (e) {
      showToast("Error updating status", "danger");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Products</h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: "4px 0 0" }}>{products.length} total products</p>
        </div>
        <button style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 12, padding: "11px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => setShowAdd(true)}>+ Add Product</button>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 200 }}>
            <span style={{ color: C.textMuted }}>🔍</span>
            <input style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, flex: 1, color: C.text, fontFamily: "inherit" }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={{ ...inputStyle, width: 160 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["Product", "Category", "Price", "Stock", "Sold", "Prescription", "Status", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: C.textMuted, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{p.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>{p.manufacturer}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}><span style={{ background: C.bg, color: C.textMuted, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{p.category}</span></td>
                  <td style={{ padding: "14px 16px", fontWeight: 700 }}>₹{p.price}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontWeight: 600, color: p.stock === 0 ? C.danger : p.stock < 30 ? C.warning : C.text }}>
                      {p.stock === 0 ? "Out of Stock" : p.stock}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: C.textMuted }}>{p.sold?.toLocaleString()}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: p.prescription ? "#FEF2F2" : C.successBg, color: p.prescription ? C.dangerText : C.successText, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{p.prescription ? "Rx" : "OTC"}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div onClick={() => toggleStatus(p.id)} style={{ width: 36, height: 20, borderRadius: 99, background: p.status === "active" ? C.primary : C.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                        <div style={{ position: "absolute", width: 14, height: 14, borderRadius: "50%", background: "#fff", top: 3, left: p.status === "active" ? 19 : 3, transition: "left 0.2s" }} />
                      </div>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{p.status === "active" ? "Active" : "Inactive"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setEditProduct(p)} style={{ background: C.infoBg, color: C.infoText, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                      <button onClick={() => setDeleteProduct(p)} style={{ background: C.dangerBg, color: C.dangerText, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>No products found</div>}
        </div>
      </div>

      {showAdd && <Modal title="Add New Product" onClose={() => setShowAdd(false)} wide><ProductForm onSave={handleAdd} onCancel={() => setShowAdd(false)} /></Modal>}
      {editProduct && <Modal title="Edit Product" onClose={() => setEditProduct(null)} wide><ProductForm initial={editProduct} onSave={handleEdit} onCancel={() => setEditProduct(null)} /></Modal>}
      {deleteProduct && (
        <Modal title="Delete Product" onClose={() => setDeleteProduct(null)}>
          <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <p style={{ fontSize: 15, color: C.text, marginBottom: 6 }}>Are you sure you want to delete</p>
            <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 20, color: C.text }}>{deleteProduct.name}?</p>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDeleteProduct(null)} style={{ border: `1.5px solid ${C.border}`, background: C.white, borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleDelete} style={{ background: C.danger, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Yes, Delete</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "danger" ? C.danger : "#1E293B", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 9999, display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "danger" ? "🗑️" : "✅"} {toast.msg}
        </div>
      )}
    </div>
  );
}

function Orders({ orders, setOrders }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder, setViewOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const filtered = orders.filter(o => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: status.toUpperCase() })
      });
      if (!res.ok) throw new Error("Failed to update");
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      showToast("Order status updated!");
      if (viewOrder?.id === id) setViewOrder(v => ({ ...v, status }));
    } catch (e) {
      showToast("Error updating status");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Orders</h1>
        <p style={{ color: C.textMuted, fontSize: 14, margin: "4px 0 0" }}>{orders.length} total orders</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", ...Object.keys(STATUS_CONFIG)].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ border: `1.5px solid ${statusFilter === s ? C.primary : C.border}`, background: statusFilter === s ? C.primaryLight : C.white, color: statusFilter === s ? C.primaryDark : C.textMuted, borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {s === "all" ? "All Orders" : STATUS_CONFIG[s].label} {s !== "all" && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", maxWidth: 320 }}>
            <span>🔍</span>
            <input style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, flex: 1, color: C.text, fontFamily: "inherit" }} placeholder="Search order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: C.primary }}>{o.id}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600 }}>{o.customer}</div>
                    <div style={{ fontSize: 12, color: C.textMuted }}>{o.phone}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: C.textMuted }}>{o.items.length} item{o.items.length > 1 ? "s" : ""}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700 }}>₹{o.total}</td>
                  <td style={{ padding: "14px 16px" }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: "14px 16px", color: C.textMuted, fontSize: 13 }}>{o.date}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setViewOrder(o)} style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>No orders found</div>}
        </div>
      </div>

      {viewOrder && (
        <Modal title={`Order ${viewOrder.id}`} onClose={() => setViewOrder(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div style={{ background: C.bg, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Info</div>
              {[["Name", viewOrder.customer], ["Email", viewOrder.email], ["Phone", viewOrder.phone], ["Address", viewOrder.address]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: C.textMuted, minWidth: 70, fontWeight: 500 }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: C.bg, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Order Info</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Date</div>
                <div style={{ fontWeight: 600 }}>{viewOrder.date}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Update Status</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button key={key} onClick={() => updateStatus(viewOrder.id, key)}
                      style={{ border: `1.5px solid ${viewOrder.status === key ? cfg.dot : C.border}`, background: viewOrder.status === key ? cfg.bg : C.white, color: viewOrder.status === key ? cfg.color : C.textMuted, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: C.bg, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Order Items</div>
            {viewOrder.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, marginBottom: 10, borderBottom: i < viewOrder.items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Qty: {item.qty} × ₹{item.price}</div>
                </div>
                <div style={{ fontWeight: 700 }}>₹{item.qty * item.price}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, paddingTop: 8, borderTop: `2px solid ${C.borderDark}` }}>
              <span>Total</span>
              <span>₹{viewOrder.total}</span>
            </div>
          </div>
        </Modal>
      )}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1E293B", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 9999 }}>✅ {toast}</div>}
    </div>
  );
}

function Inventory({ products, setProducts }) {
  const [editStock, setEditStock] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [toast, setToast] = useState(null);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const lowStock = products.filter(p => p.stock > 0 && p.stock < 30);
  const outOfStock = products.filter(p => p.stock === 0);
  const healthy = products.filter(p => p.stock >= 30);

  const saveStock = async () => {
    const val = parseInt(newStock);
    if (isNaN(val) || val < 0) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${editStock.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ stock: val, inStock: val > 0 })
      });
      if (!res.ok) throw new Error("Failed to update stock");
      setProducts(prev => prev.map(p => p.id === editStock.id ? { ...p, stock: val } : p));
      setEditStock(null);
      setNewStock("");
      showToast("Stock updated!");
    } catch (e) {
      showToast("Error updating stock");
    }
  };

  const StockRow = ({ p }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{p.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
        <div style={{ fontSize: 12, color: C.textMuted }}>{p.category} · {p.manufacturer}</div>
      </div>
      <div style={{ textAlign: "center", minWidth: 80 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: p.stock === 0 ? C.danger : p.stock < 30 ? C.warning : C.success }}>{p.stock}</div>
        <div style={{ fontSize: 11, color: C.textMuted }}>units</div>
      </div>
      <div style={{ minWidth: 140 }}>
        <div style={{ height: 6, background: C.bg, borderRadius: 99, marginBottom: 4 }}>
          <div style={{ height: "100%", borderRadius: 99, background: p.stock === 0 ? C.danger : p.stock < 30 ? C.warning : C.success, width: `${Math.min(100, (p.stock / 1000) * 100)}%` }} />
        </div>
        <div style={{ fontSize: 11, color: C.textMuted }}>{p.stock === 0 ? "Out of stock" : p.stock < 30 ? "Low stock" : "Healthy"}</div>
      </div>
      <button onClick={() => { setEditStock(p); setNewStock(String(p.stock)); }}
        style={{ background: C.primaryLight, color: C.primaryDark, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        Update Stock
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Inventory</h1>
        <p style={{ color: C.textMuted, fontSize: 14, margin: "4px 0 0" }}>Monitor and manage your stock levels</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: C.successBg, border: `1px solid ${C.success}30`, borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 28 }}>✅</div>
          <div><div style={{ fontSize: 26, fontWeight: 800, color: C.successText }}>{healthy.length}</div><div style={{ fontSize: 13, color: C.successText, fontWeight: 500 }}>Healthy Stock</div></div>
        </div>
        <div style={{ background: C.warningBg, border: `1px solid ${C.warning}30`, borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 28 }}>⚠️</div>
          <div><div style={{ fontSize: 26, fontWeight: 800, color: C.warningText }}>{lowStock.length}</div><div style={{ fontSize: 13, color: C.warningText, fontWeight: 500 }}>Low Stock (under 30)</div></div>
        </div>
        <div style={{ background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 28 }}>🚫</div>
          <div><div style={{ fontSize: 26, fontWeight: 800, color: C.dangerText }}>{outOfStock.length}</div><div style={{ fontSize: 13, color: C.dangerText, fontWeight: 500 }}>Out of Stock</div></div>
        </div>
      </div>

      {outOfStock.length > 0 && (
        <div style={{ background: C.white, border: `1.5px solid ${C.danger}40`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", background: C.dangerBg, borderBottom: `1px solid ${C.danger}30`, fontSize: 14, fontWeight: 700, color: C.dangerText, display: "flex", alignItems: "center", gap: 8 }}>🚫 Out of Stock — Restock Immediately</div>
          {outOfStock.map(p => <StockRow key={p.id} p={p} />)}
        </div>
      )}

      {lowStock.length > 0 && (
        <div style={{ background: C.white, border: `1.5px solid ${C.warning}40`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "14px 20px", background: C.warningBg, borderBottom: `1px solid ${C.warning}30`, fontSize: 14, fontWeight: 700, color: C.warningText, display: "flex", alignItems: "center", gap: 8 }}>⚠️ Low Stock — Order Soon</div>
          {lowStock.map(p => <StockRow key={p.id} p={p} />)}
        </div>
      )}

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>✅ All Products</div>
        {[...outOfStock, ...lowStock, ...healthy].map(p => <StockRow key={p.id} p={p} />)}
      </div>

      {editStock && (
        <Modal title={`Update Stock — ${editStock.name}`} onClose={() => setEditStock(null)}>
          <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 6 }}>{editStock.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{editStock.name}</div>
            <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 24 }}>Current stock: <strong>{editStock.stock} units</strong></div>
            <FormField label="New Stock Quantity">
              <input style={{ ...inputStyle, textAlign: "center", fontSize: 22, fontWeight: 700, padding: "14px" }} type="number" value={newStock} onChange={e => setNewStock(e.target.value)} min="0" autoFocus />
            </FormField>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
              <button onClick={() => setEditStock(null)} style={{ border: `1.5px solid ${C.border}`, background: C.white, borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={saveStock} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Save Stock</button>
            </div>
          </div>
        </Modal>
      )}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1E293B", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 9999 }}>✅ {toast}</div>}
    </div>
  );
}

export default function Admin() {
  const [page, setPage] = useState("dashboard");
  const [products, setProducts] = useState(INIT_PRODUCTS);
  const [orders, setOrders] = useState(INIT_ORDERS);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    fetch("http://localhost:5000/api/products?limit=1000")
      .then(res => res.json())
      .then(data => {
        setProducts((data.products || []).map(p => ({
          ...p,
          prescription: p.prescriptionRequired,
          stock: p.stock ?? (p.inStock ? 100 : 0),
          sold: p.reviews * 10,
          status: (p.isActive !== false) ? 'active' : 'inactive'
        })));
      })
      .catch(console.error);

    fetch("http://localhost:5000/api/admin/orders", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.map(o => ({
          id: o.id,
          customer: o.user?.name || 'Unknown',
          email: o.user?.email || 'N/A',
          phone: o.user?.phone || 'N/A',
          items: (o.items || []).map(item => ({
            name: item.product?.name || 'Unknown Product',
            qty: item.quantity,
            price: item.priceAtTime,
            icon: item.product?.icon || '💊',
          })),
          total: o.totalAmount,
          status: o.status.toLowerCase(),
          date: new Date(o.createdAt).toLocaleDateString(),
          rawDate: o.createdAt,
          address: o.user?.address || 'N/A'
        })));
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", minHeight: "100vh", background: C.bg, color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <Sidebar active={page} setActive={setPage} />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto", minHeight: "100vh" }}>
        {page === "dashboard" && <Dashboard products={products} orders={orders} />}
        {page === "products" && <Products products={products} setProducts={setProducts} />}
        {page === "orders" && <Orders orders={orders} setOrders={setOrders} />}
        {page === "inventory" && <Inventory products={products} setProducts={setProducts} />}
      </main>
    </div>
  );
}