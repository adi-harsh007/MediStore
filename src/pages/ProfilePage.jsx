import React, { useState, useEffect } from 'react';
import { COLORS, API } from '../utils/theme';

export default function ProfilePage({ setPage, setUser }) {
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
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          createdAt: data.createdAt,
          orderCount: data._count?.orders || 0,
          role: data.role
        });
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
    if (passwords.newPassword.length < 8) {
      setPwMsg({ type: "error", text: "Password must be at least 8 characters" }); return;
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
    container: { maxWidth: 740, margin: "0 auto", padding: "2rem" },
    header: { display: "flex", alignItems: "center", gap: 20, marginBottom: 28 },
    avatarLg: {
      width: 72, height: 72, borderRadius: 18,
      background: "linear-gradient(135deg, #2EE6C5 0%, #0EA5E9 100%)",
      color: COLORS.primaryInk, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, fontWeight: 800, boxShadow: "0 10px 28px rgba(46, 230, 197, 0.25)"
    },
    tabs: { display: "flex", gap: 6, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 5, marginBottom: 24 },
    tab: (active) => ({
      flex: 1, padding: "10px 16px", borderRadius: 9, border: "none", fontSize: 13.5, fontWeight: 700,
      cursor: "pointer",
      background: active ? COLORS.primaryLight : "transparent",
      color: active ? COLORS.primary : COLORS.textMuted,
      transition: "all 0.2s"
    }),
    card: { background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "24px", marginBottom: 20 },
    cardTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20, color: COLORS.text },
    fieldGroup: { marginBottom: 18 },
    fieldLabel: { display: "block", fontSize: 11.5, fontWeight: 700, color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" },
    fieldInput: { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 14.5, outline: "none", boxSizing: "border-box", background: COLORS.inputBg, color: COLORS.text },
    fieldInputDisabled: { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, fontSize: 14.5, background: "rgba(6, 24, 26, 0.55)", color: COLORS.textLight, boxSizing: "border-box" },
    textarea: { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 14.5, outline: "none", boxSizing: "border-box", minHeight: 84, resize: "vertical", background: COLORS.inputBg, color: COLORS.text },
    saveBtn: {
      background: "linear-gradient(135deg, #2EE6C5 0%, #14B8A6 100%)",
      color: COLORS.primaryInk, border: "none", borderRadius: 10, padding: "12px 28px",
      fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: saving ? 0.7 : 1
    },
    msg: (type) => ({
      padding: "11px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, marginBottom: 16,
      background: type === "success" ? COLORS.successBg : COLORS.dangerBg,
      color: type === "success" ? COLORS.success : COLORS.danger,
      border: `1px solid ${type === "success" ? "rgba(52,211,153,0.3)" : "rgba(251,113,133,0.3)"}`
    }),
    statRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
    statCard: { background: COLORS.inputBg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "18px 14px", textAlign: "center" },
    statNum: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.primary, marginBottom: 4 },
    statLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: 600 },
  };

  if (loading) return (
    <div style={{ ...ps.container, textAlign: "center", paddingTop: 80 }}>
      <div style={{ color: COLORS.primary, marginBottom: 14 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      </div>
      <div style={{ fontSize: 15, color: COLORS.textMuted }}>Loading profile...</div>
    </div>
  );

  return (
    <div style={ps.container}>
      <div style={ps.header}>
        <div style={ps.avatarLg}>{profile.name?.charAt(0)?.toUpperCase() || "U"}</div>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, margin: "0 0 4px 0", color: COLORS.text }}>{profile.name}</h1>
          <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0 }}>
            {profile.email}
            {profile.role === "ADMIN" && (
              <span style={{
                background: COLORS.primaryLight, color: COLORS.primary,
                border: `1px solid ${COLORS.borderStrong}`, fontSize: 10, fontWeight: 700,
                padding: "2px 8px", borderRadius: 6, marginLeft: 10, fontFamily: "'JetBrains Mono', monospace"
              }}>ADMIN</span>
            )}
          </p>
        </div>
      </div>

      <div style={ps.tabs}>
        <button style={ps.tab(activeTab === "profile")} onClick={() => setActiveTab("profile")}>Profile</button>
        <button style={ps.tab(activeTab === "security")} onClick={() => setActiveTab("security")}>Security</button>
        <button style={ps.tab(activeTab === "account")} onClick={() => setActiveTab("account")}>Account</button>
      </div>

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
              <span style={{ fontSize: 11.5, color: COLORS.textLight, marginTop: 5, display: "block" }}>Primary account email cannot be changed</span>
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Phone Number</label>
              <input style={ps.fieldInput} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div style={ps.card}>
            <div style={ps.cardTitle}>Delivery Address</div>
            <div style={{ ...ps.fieldGroup, marginBottom: 0 }}>
              <label style={ps.fieldLabel}>Full Address</label>
              <textarea style={ps.textarea} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="House/Flat No, Street, Landmark, City, State - PIN Code" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="ms-btn-primary" style={ps.saveBtn} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </>
      )}

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
              <input style={ps.fieldInput} type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} placeholder="Enter new password (min 8 chars)" />
            </div>
            <div style={ps.fieldGroup}>
              <label style={ps.fieldLabel}>Confirm New Password</label>
              <input style={ps.fieldInput} type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Re-enter new password" />
            </div>
            <button className="ms-btn-primary" style={ps.saveBtn} onClick={handlePasswordChange}>Update Password</button>
          </div>
        </>
      )}

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
                <div style={ps.statNum}>{profile.role === "ADMIN" ? "Admin" : "Patient"}</div>
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
              <button style={{ ...ps.saveBtn, background: COLORS.inputBg, color: COLORS.text, border: `1px solid ${COLORS.borderStrong}` }} onClick={() => setPage("my-orders")}>View My Orders</button>
              <button style={{ ...ps.saveBtn, background: COLORS.inputBg, color: COLORS.primary, border: `1px solid ${COLORS.borderStrong}` }} onClick={() => setPage("listing")}>Browse Medicines</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
