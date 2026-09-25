import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/common/Navbar";
import { Eye, EyeOff, Mail, Lock, Rocket } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { API_BASE_URL, ALL_FEATURES } from "../utils/constants";

const LoginPage = ({ onNavigate }) => {
  const { login, registerGoogleUser } = useAuth();
  const { colors, mode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Google Login Hook
  let googleLogin;
  try {
    googleLogin = useGoogleLogin({
      flow: 'implicit',
      onSuccess: async (tokenResponse) => {
        setLoading(true);
        setError("");
        try {
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          });
          if (!userInfoRes.ok) throw new Error('Failed to get user info from Google');
          const userInfo = await userInfoRes.json();
          const res = await fetch(`${API_BASE_URL}/api/google-signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userInfo.email,
              name: userInfo.name,
              googleId: userInfo.id,
              picture: userInfo.picture
            })
          });
          const data = await res.json();
          if (data.success) {
            const googleUser = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.fullName,
              role: data.user.role,
              picture: userInfo.picture,
              isHeadUser: true,
              allowedFeatures: ALL_FEATURES.map(f => f.id)
            };
            registerGoogleUser(googleUser);

            // Get the target feature from localStorage
            const targetFeature = localStorage.getItem('targetFeature');
            localStorage.removeItem('targetFeature');

            // Navigate to dashboard with selected feature tab
            if (targetFeature === "AI Video Generator") {
              onNavigate && onNavigate("dashboard", { tab: "video" });
            } else if (targetFeature === "Logo & Poster Design") {
              onNavigate && onNavigate("dashboard", { tab: "image" });
            } else {
              onNavigate && onNavigate('dashboard');
            }
          } else {
            throw new Error(data.error || 'Google login failed');
          }
        } catch (err) {
          setError(err.message || 'Google sign-in failed');
        } finally {
          setLoading(false);
        }
      },
      onError: () => {
        setError('Google sign-in failed');
        setLoading(false);
      }
    });
  } catch (err) {
    googleLogin = null;
  }

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });

      // Get the target feature from localStorage
      const targetFeature = localStorage.getItem('targetFeature');
      localStorage.removeItem('targetFeature');

      // Navigate to dashboard with selected feature tab
      if (targetFeature === "AI Video Generator") {
        onNavigate && onNavigate("dashboard", { tab: "video" });
      } else if (targetFeature === "Logo & Poster Design") {
        onNavigate && onNavigate("dashboard", { tab: "image" });
      } else {
        onNavigate && onNavigate("dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg1,
      color: colors.text1,
      display: "flex",
      flexDirection: "column"
    }}>
      <Navbar onNavigate={onNavigate} />

      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: 440,
          padding: 48,
          borderRadius: 32,
          background: colors.bg2,
          border: `1px solid ${colors.border}`,
          boxShadow: `0 24px 48px -12px rgba(0, 0, 0, ${mode === 'dark' ? '0.5' : '0.1'})`,
        }}>
          {/* Feature Highlight Banner */}
          {localStorage.getItem('targetFeature') && (
            <div style={{
              background: `${colors.primary}15`,
              border: `1px solid ${colors.primary}33`,
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              fontSize: "0.85rem",
              color: colors.primary,
              fontWeight: 500,
              textAlign: "center"
            }}>
              ✨ You're about to access <strong>{localStorage.getItem('targetFeature')}</strong>
            </div>
          )}
          {/* Logo Icon */}
          <div style={{
            width: 64,
            height: 64,
            background: colors.primary,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            boxShadow: `0 8px 16px ${colors.primary}33`
          }}>
            <Rocket size={32} color={mode === "dark" ? "#0B0E14" : "white"} />
          </div>

          <h2 style={{
            fontSize: "2rem",
            textAlign: "center",
            marginBottom: 8,
            fontWeight: "700",
            letterSpacing: "-0.01em"
          }}>
            Welcome Back
          </h2>
          <p style={{
            textAlign: "center",
            color: colors.text2,
            marginBottom: 32,
            fontSize: "0.95rem"
          }}>
            Simplify your marketing with AI.
          </p>

          {error && (
            <div style={{
              background: colors.error + "15",
              border: `1px solid ${colors.error}33`,
              color: colors.error,
              padding: "12px",
              borderRadius: 12,
              marginBottom: 24,
              textAlign: "center",
              fontSize: "0.85rem"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{
                color: colors.text2,
                display: "block",
                marginBottom: 8,
                fontWeight: "500",
                fontSize: "0.9rem"
              }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: colors.text2
                }} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 14px 14px 44px",
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    background: mode === 'dark' ? "rgba(0,0,0,0.2)" : "white",
                    color: colors.text1,
                    outline: "none",
                    fontSize: "0.95rem",
                    transition: "border-color 0.2s ease"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{
                color: colors.text2,
                display: "block",
                marginBottom: 8,
                fontWeight: "500",
                fontSize: "0.9rem"
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: colors.text2
                }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 50px 14px 44px",
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    background: mode === 'dark' ? "rgba(0,0,0,0.2)" : "white",
                    color: colors.text1,
                    outline: "none",
                    fontSize: "0.95rem"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: colors.text2,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              style={{
                width: "100%",
                padding: 16,
                background: colors.primary,
                borderRadius: 12,
                border: "none",
                color: mode === "dark" ? "#0B0E14" : "white",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>

            {/* Google Logic */}
            {googleLogin && (
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: mode === 'dark' ? colors.bg3 : "white",
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  color: colors.text1,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  transition: "all 0.2s ease",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            )}
          </form>

          <p style={{
            marginTop: 32,
            color: colors.text2,
            textAlign: "center",
            fontSize: "0.9rem"
          }}>
            New to SmartAds?{" "}
            <span
              onClick={() => onNavigate && onNavigate("signup")}
              style={{
                color: colors.primary,
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Create an account
            </span>
          </p>

          <div style={{
            marginTop: 32,
            padding: 16,
            background: mode === 'dark' ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            borderRadius: 16,
            fontSize: "0.8rem",
            color: colors.text2,
            border: `1px dashed ${colors.border}`
          }}>
            <p style={{ marginBottom: 8, fontWeight: "600", color: colors.text1 }}>Demo Account</p>
            <p>Email: admin@smartads.com</p>
            <p>Password: Admin@123</p>
          </div>

          <button
            onClick={() => onNavigate && onNavigate("landing")}
            style={{
              marginTop: 24,
              width: "100%",
              padding: 14,
              background: "transparent",
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              color: colors.text1,
              fontSize: "0.95rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mode === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;