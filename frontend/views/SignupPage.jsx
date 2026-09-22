import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import { User, Lock, Eye, EyeOff, Rocket, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL, ALL_FEATURES } from "../utils/constants";
import { useGoogleLogin } from "@react-oauth/google";

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|edu|pk|net|org|gov|edu\.pk|com\.pk|net\.pk|org\.pk)$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const requirements = [
    { key: "minLength", label: "8+ characters", test: (p) => p.length >= 8 },
    { key: "hasUpperCase", label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
    { key: "hasLowerCase", label: "Lowercase", test: (p) => /[a-z]/.test(p) },
    { key: "hasNumber", label: "Number", test: (p) => /[0-9]/.test(p) },
    { key: "hasSpecialChar", label: "Special", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];
  const results = requirements.map(r => ({ ...r, met: r.test(password) }));
  return { results, isValid: results.every(r => r.met) };
};

const SignupPage = ({ onNavigate }) => {
  const { registerUser, registerGoogleUser } = useAuth(); 
  const { colors, mode } = useTheme();

  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const pwData = validatePassword(formData.password);

  const handleGoogleSignup = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await userInfoRes.json();
        const res = await fetch(`${API_BASE_URL}/api/google-signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userInfo.email, name: userInfo.name, googleId: userInfo.id, picture: userInfo.picture })
        });
        const data = await res.json();
        if (data.success) {
          registerGoogleUser({ id: data.user.id, email: data.user.email, name: data.user.fullName, role: data.user.role, picture: userInfo.picture, isHeadUser: true, allowedFeatures: ALL_FEATURES.map(f => f.id) });
          onNavigate && onNavigate('dashboard');
        }
      } catch (err) {
        setErrors({ submit: "Google signup failed" });
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!validateEmail(formData.email)) newErrors.email = "Valid email is required";
    if (!pwData.isValid) newErrors.password = "Password doesn't meet requirements";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords match required";
    
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: formData.fullName, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword, role: "User" }),
      });
      const data = await response.json();
      if (data.success) onNavigate && onNavigate("login");
      else throw new Error(data.error);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg1, color: colors.text1, display: "flex", flexDirection: "column" }}>
      <Navbar onNavigate={onNavigate} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{
          background: colors.bg2,
          border: `1px solid ${colors.border}`,
          borderRadius: 32,
          boxShadow: `0 24px 48px -12px rgba(0, 0, 0, ${mode === 'dark' ? '0.5' : '0.1'})`,
          padding: 48,
          maxWidth: 480,
          width: "100%",
        }}>
          <div style={{
            width: 56, height: 56,
            background: colors.primary,
            borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: `0 8px 16px ${colors.primary}33`
          }}>
            <Rocket size={28} color={mode === "dark" ? "#0B0E14" : "white"} />
          </div>

          <h2 style={{ fontSize: "1.8rem", fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
            Create Your Account
          </h2>
          <p style={{ textAlign: "center", color: colors.text2, marginBottom: 32, fontSize: "0.95rem" }}>
            Start generating professional ads today.
          </p>

          {errors.submit && (
            <div style={{ background: colors.error + "15", color: colors.error, padding: 12, borderRadius: 12, marginBottom: 20, textAlign: "center", fontSize: "0.85rem" }}>
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <div>
                <label style={{ color: colors.text2, display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: "600" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", top: 14, left: 14, color: colors.text2 }} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: 10, border: `1px solid ${colors.border}`, background: mode==='dark' ? "rgba(0,0,0,0.2)":"white", color: colors.text1, fontSize: "0.9rem", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: colors.text2, display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: "600" }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", top: 14, left: 14, color: colors.text2 }} />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: 10, border: `1px solid ${colors.border}`, background: mode==='dark' ? "rgba(0,0,0,0.2)":"white", color: colors.text1, fontSize: "0.9rem", outline: "none" }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ color: colors.text2, display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: "600" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", top: 14, left: 14, color: colors.text2 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: "100%", padding: "12px 44px 12px 40px", borderRadius: 10, border: `1px solid ${colors.border}`, background: mode==='dark' ? "rgba(0,0,0,0.2)":"white", color: colors.text1, fontSize: "0.9rem", outline: "none" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: 12, background: "none", border: "none", color: colors.text2, cursor: "pointer" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {formData.password && (
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: 6 }}>
                  {pwData.results.map(r => (
                    <div key={r.key} style={{ fontSize: "0.7rem", color: r.met ? colors.success : colors.text2, display: "flex", alignItems: "center", gap: 4 }}>
                      {r.met ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ color: colors.text2, display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: "600" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", top: 14, left: 14, color: colors.text2 }} />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: 10, border: `1px solid ${colors.border}`, background: mode==='dark' ? "rgba(0,0,0,0.2)":"white", color: colors.text1, fontSize: "0.9rem", outline: "none" }}
                />
              </div>
            </div>

            <button
              disabled={loading}
              style={{
                width: "100%", padding: 16, background: colors.primary, color: mode === "dark" ? "#0B0E14" : "white",
                border: "none", borderRadius: 12, fontSize: "1rem", fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s ease", marginTop: 8
              }}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <button type="button" onClick={() => handleGoogleSignup()} style={{ width: "100%", padding: 14, background: mode==='dark' ? colors.bg3 : "white", border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, color: colors.text1, cursor: "pointer", fontWeight: "600" }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign Up with Google
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 32, color: colors.text2, fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <span onClick={() => onNavigate("login")} style={{ color: colors.primary, cursor: "pointer", fontWeight: "600" }}>Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;