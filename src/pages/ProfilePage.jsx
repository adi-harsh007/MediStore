import React, { useState, useEffect } from 'react';
import { s, COLORS, API } from '../utils/theme';

export default function ProfilePage({ setPage, user, setUser }) {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setPage("auth"); return; }
    fetch(`${API}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setProfile({ name: data.name || "", email: data.email || "", phone: data.phone || "", address: data.address || "", createdAt: data.createdAt, orderCount: data._count?.orders || 0, role: data.role });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setPage]);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name, phone: profile.phone, address: profile.address })
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      // Update localStorage user
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const newUser = { ...storedUser, name: updated.name };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPwMsg(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords don't match" }); return;
    }
    if (passwords.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters" }); return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/user/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setPwMsg({ type: "error", text: e.message });
    }
  };

  const ps = {
    container: { maxWidth: 720, margin: "0 auto", padding: "2rem" },
    header: { display: "flex", alignItems: "center", gap: 20, marginBottom: 32 },
    avatarLg: { width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800 },
    tabs: { display: "flex", gap: 4, background: COLORS.bg, borderRadius: 12, padding: 4, marginBottom: 28 },
    tab: (active) => ({ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", background: active ? COLORS.white : "transparent", color: active ? COLORS.text : COLORS.textMuted, boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }),
    card: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "24px", marginBottom: 20 },
    cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 },
    fieldGroup: { marginBottom: 20 },
    fieldLabel: { display: "block", fontSize: 13, fontWeight: 700, color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" },
    fieldInput: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", background: COLORS.white },
    fieldInputDisabled: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, background: COLORS.bg, color: COLORS.textMuted, boxSizing: "border-box" },
    textarea: { width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", minHeight: 80, resize: "vertical", fontFamily: "inherit" },
    saveBtn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 },
    msg: (type) => ({ padding: "10px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, marginBottom: 16, background: type === "success" ? "#ECFDF5" : "#FEF2F2", color: type === "success" ? "#059669" : "#DC2626", border: `1px solid ${type === "success" ? "#A7F3D0" : "#FECACA"}` }),
    statRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 4 },
    statCard: { background: COLORS.bg, borderRadius: 12, padding: "16px", textAlign: "center" },
    statNum: { fontSize: 22, fontWeight: 800, color: COLORS.primary, marginBottom: 2 },
    statLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: 600 },
  };

  if (loading) return (
    <div style={{ ...ps.container, textAlign: "center", paddingTop: 80 }}>
      <div style={{ color: COLORS.textMuted, marginBottom: 16 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      </div>
      <div style={{ fontSize: 16, color: COLORS.textMuted }}>Loading profile...</div>
    </div>
  );

  return (
    <div style={ps.container}>
      {/* Header */}
      <div style={ps.header}>
        <div style={ps.avatarLg}>{profile.name?.charAt(0)?.toUpperCase() || "U"}</div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 2 }}>{profile.name}</h1>
          <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>{profile.email} {profile.role === "ADMIN" && <span style={{ background: COLORS.primary, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, marginLeft: 8 }}>ADMIN</span>}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={ps.tabs}>
        <button style={ps.tab(activeTab === "profile")} onClick={() => setActiveTab("profile")}>Profile</button>
        <button style={ps.tab(activeTab === "security")} onClick={() => setActiveTab("security")}>Security</button>
        <button style={ps.tab(activeTab === "account")} onClick={() => setActiveTab("account")}>Account</button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <>
          {msg && <div style={ps.msg(msg.type)}>{msg.type === "success" ? "✓ " : "✕ "}{msg.text}</div>}
          <div style={ps.card}>
            <div style={ps.cardTitle}>Personal Information</div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Full Name</label>
              <input style={ps.fieldInput} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Email Address</label>
              <input style={ps.fieldInputDisabled} value={profile.email} disabled />
              <span style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, display: "block" }}>Email cannot be changed</span>
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Phone Number</label>
              <input style={ps.fieldInput} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div style={ps.card}>
            <div style={ps.cardTitle}>Delivery Address</div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Full Address</label>
              <textarea style={ps.textarea} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="House/Flat No, Street, Landmark, City, State - PIN Code" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={ps.saveBtn} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <>
          {pwMsg && <div style={ps.msg(pwMsg.type)}>{pwMsg.type === "success" ? "✓ " : "✕ "}{pwMsg.text}</div>}
          <div style={ps.card}>
            <div style={ps.cardTitle}>Change Password</div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Current Password</label>
              <input style={ps.fieldInput} type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" />
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>New Password</label>
              <input style={ps.fieldInput} type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} placeholder="Enter new password (min 6 chars)" />
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Confirm New Password</label>
              <input style={ps.fieldInput} type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Re-enter new password" />
            </div>
            <button style={ps.saveBtn} onClick={handlePasswordChange}>Update Password</button>
          </div>
        </>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <>
          <div style={ps.card}>
            <div style={ps.cardTitle}>Account Overview</div>
            <div style={ps.statRow}>
              <div style={ps.statCard}>
                <div style={ps.statNum}>{profile.orderCount}</div>
                <div style={ps.statLabel}>Total Orders</div>
              </div>
              <div style={ps.statCard}>
                <div style={ps.statNum}>{profile.role === "ADMIN" ? "Admin" : "User"}</div>
                <div style={ps.statLabel}>Account Type</div>
              </div>
              <div style={ps.statCard}>
                <div style={ps.statNum}>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "-"}</div>
                <div style={ps.statLabel}>Member Since</div>
              </div>
            </div>
          </div>
          <div style={ps.card}>
            <div style={ps.cardTitle}>Quick Actions</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button style={{ ...ps.saveBtn, background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}` }} onClick={() => setPage("my-orders")}>View My Orders</button>
              <button style={{ ...ps.saveBtn, background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}` }} onClick={() => setPage("listing")}>Browse Medicines</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
