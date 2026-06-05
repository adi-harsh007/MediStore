import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { s, COLORS, API } from '../utils/theme';

export default function AuthPage({ setPage, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google login failed");

      const userData = { ...data.user, token: data.token, isAdmin: data.user.role === "ADMIN" };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setPage(userData.isAdmin ? "admin" : "home");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // OTP verification state
  const [showOTP, setShowOTP] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      // Signup success → show OTP screen
      if (data.needsVerification) {
        setVerifyEmail(data.email || email);
        setShowOTP(true);
        setResendTimer(60);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || "Authentication failed");
      
      const userData = { ...data.user, token: data.token, isAdmin: data.user.role === "ADMIN" };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setPage(userData.isAdmin ? "admin" : "home");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setOtpMsg(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, code: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      // Success — user is logged in
      const userData = { ...data.user, token: data.token, isAdmin: data.user.role === "ADMIN" };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setPage("home");
    } catch (err) {
      setOtpMsg(err.message);
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setOtpMsg("");
    try {
      const res = await fetch(`${API}/api/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend");
      setOtpMsg("✓ New code sent to your email");
      setResendTimer(60);
      setOtpCode("");
    } catch (err) {
      setOtpMsg(err.message);
    }
  };

  // OTP Verification Screen
  if (showOTP) {
    return (
      <div style={s.authContainer}>
        <div style={s.authCard}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ marginBottom: 16, color: COLORS.primary }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <h1 style={s.authTitle}>Verify Your Email</h1>
            <p style={s.authSub}>We've sent a 6-digit code to</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary, margin: "4px 0 20px" }}>{verifyEmail}</p>
          </div>

          {otpMsg && (
            <div style={{
              fontSize: 14, marginBottom: 16, textAlign: "center", padding: "10px 12px", borderRadius: 10,
              background: otpMsg.startsWith("✓") ? "#ECFDF5" : "#FEF2F2",
              color: otpMsg.startsWith("✓") ? "#059669" : "#DC2626",
              border: `1px solid ${otpMsg.startsWith("✓") ? "#A7F3D0" : "#FECACA"}`
            }}>{otpMsg}</div>
          )}

          <div style={s.formGroup}>
            <label style={s.label}>Verification Code</label>
            <input
              style={{ ...s.input, boxSizing: "border-box", textAlign: "center", fontSize: 24, letterSpacing: 8, fontWeight: 800 }}
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
            />
          </div>

          <button
            style={{ ...s.authBtn, opacity: otpCode.length !== 6 || loading ? 0.6 : 1 }}
            onClick={handleVerifyOTP}
            disabled={otpCode.length !== 6 || loading}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            {resendTimer > 0 ? (
              <span style={{ fontSize: 14, color: COLORS.textMuted }}>Resend code in <strong>{resendTimer}s</strong></span>
            ) : (
              <span style={s.authToggleLink} onClick={handleResend}>Resend Code</span>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>Wrong email? </span>
            <span style={s.authToggleLink} onClick={() => { setShowOTP(false); setOtpCode(""); setOtpMsg(""); }}>Go back</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.authContainer}>
      <div style={s.authCard}>
        <h1 style={s.authTitle}>{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p style={s.authSub}>{isLogin ? "Log in to access your orders and prescriptions" : "Join MediStore for fast, reliable medicine delivery"}</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: COLORS.danger, fontSize: 14, marginBottom: 16, textAlign: "center", background: "#FEF2F2", padding: "10px 12px", borderRadius: 10, border: "1px solid #FECACA" }}>{error}</div>}
          {!isLogin && (
            <div style={s.formGroup}>
              <label style={s.label}>Full Name</label>
              <input style={{ ...s.input, boxSizing: "border-box" }} type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div style={s.formGroup}>
            <label style={s.label}>Email Address</label>
            <input style={{ ...s.input, boxSizing: "border-box" }} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Password</label>
            <input style={{ ...s.input, boxSizing: "border-box" }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            {!isLogin && <span style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, display: "block" }}>Minimum 8 characters</span>}
          </div>
          <button style={{ ...s.authBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>
        
        <div style={{ marginTop: 24, marginBottom: 24, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }}></div>
          <div style={{ padding: "0 10px", fontSize: 13, color: COLORS.textMuted, fontWeight: 600 }}>OR</div>
          <div style={{ flex: 1, height: 1, backgroundColor: COLORS.border }}></div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("Google Login Failed");
            }}
            useOneTap
            shape="rectangular"
            theme="outline"
            text={isLogin ? "signin_with" : "signup_with"}
          />
        </div>

        <div style={s.authToggle}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={s.authToggleLink} onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Sign up here" : "Log in here"}
          </span>
        </div>
      </div>
    </div>
  );
}
