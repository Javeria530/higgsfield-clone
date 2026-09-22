import React, { useState } from "react";
import { Video, Image, Zap, Calendar, BarChart3, ArrowRight, Rocket, Layers, Users } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const LandingPage = ({ onNavigate }) => {
  const [hovered, setHovered] = useState(null);
  const { colors, mode } = useTheme();

  const features = [
    { icon: Video, title: "AI Video Generator", desc: "Create professional videos automatically from your product descriptions.", color: colors.primary },
    { icon: Image, title: "Logo & Poster Design", desc: "Generate stunning marketing assets and brand identities instantly.", color: colors.secondary },
    { icon: Zap, title: "Voiceover Creator", desc: "Natural-sounding voiceovers with various accents and tones.", color: colors.accent },
    { icon: Calendar, title: "Social Scheduler", desc: "Plan and post your content directly to all social platforms.", color: "#10B981" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Track conversions and performance metrics in real-time.", color: "#F59E0B" },
    { icon: Users, title: "Team Collaboration", desc: "Invite members and manage permissions across projects.", color: "#3B82F6" },
  ];

  return (
    <div style={{ 
      background: colors.bg1, 
      color: colors.text1, 
      minHeight: "100vh",
      transition: "background 0.3s ease",
      fontFamily: "'Inter', sans-serif"
    }}>
      <Navbar onNavigate={onNavigate} />

      {/* HERO SECTION */}
      <section style={{
        padding: "200px 20px 140px",
        textAlign: "center",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {/* Label Badge */}
        <div className="animate-fadeIn" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: "100px",
          background: mode === "dark" ? "rgba(56, 189, 248, 0.1)" : "rgba(2, 132, 199, 0.05)",
          border: `1px solid ${colors.primary}33`,
          marginBottom: 32,
        }}>
          <Rocket size={14} color={colors.primary} />
          <span style={{ 
            color: colors.primary, 
            fontSize: "0.85rem", 
            fontWeight: "600", 
            letterSpacing: "0.05em",
            textTransform: "uppercase"
          }}>
            Next-Gen AI Marketing
          </span>
        </div>

        <h1 className="animate-slideUp" style={{
          fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
          fontWeight: "800",
          lineHeight: 1.1,
          marginBottom: 24,
          maxWidth: 900,
          fontFamily: "'Outfit', sans-serif",
          color: colors.text1
        }}>
          Elevate Your Brand <br /> with AI Intelligence
        </h1>

        <p className="animate-slideUp" style={{
          fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
          color: colors.text2,
          maxWidth: 650,
          lineHeight: 1.6,
          marginBottom: 48,
        }}>
          SmartAds empowers your team to generate high-converting videos, logos, and voiceovers in seconds. Professional design, accessible to everyone.
        </p>

        <div className="animate-slideUp" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => onNavigate("signup")}
            style={{
              padding: "16px 40px",
              background: colors.primary,
              color: mode === "dark" ? "#0B0E14" : "white",
              borderRadius: 12,
              border: "none",
              fontSize: "1.1rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: `0 8px 30px ${colors.primary}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 12px 40px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 8px 30px ${colors.primary}40`;
            }}
          >
            Get Started Free
          </button>
          
          <button
            onClick={() => onNavigate("login")}
            style={{
              padding: "16px 40px",
              background: "transparent",
              color: colors.text1,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Live Demo
          </button>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ 
        padding: "100px 20px", 
        maxWidth: 1240, 
        margin: "0 auto",
        background: colors.bg1,
      }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 style={{ fontSize: "2.8rem", fontWeight: "700", marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
            Unified Creative Platform
          </h2>
          <p style={{ color: colors.text2, fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
            Everything you need to scale your digital presence, powered by world-class AI models.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 32,
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              onClick={() => {
                // Store the feature being accessed for post-login redirect
                localStorage.setItem('targetFeature', f.title);
                onNavigate('login');
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: 40,
                borderRadius: 24,
                background: colors.bg2,
                border: `1px solid ${hovered === i ? colors.primary + "44" : colors.border}`,
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: "pointer",
                transform: hovered === i ? "translateY(-8px)" : "translateY(0)",
                boxShadow: hovered === i ? `0 20px 40px rgba(0,0,0, ${mode === 'dark' ? '0.4' : '0.05'})` : "none",
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                border: `1px solid ${colors.border}`,
              }}>
                <f.icon size={24} color={f.color} />
              </div>

              <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: 12, color: colors.text1, fontFamily: "'Outfit', sans-serif" }}>
                {f.title}
              </h3>

              <p style={{ color: colors.text2, lineHeight: 1.7, fontSize: "1rem", marginBottom: 16 }}>
                {f.desc}
              </p>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: colors.primary,
                fontWeight: 600,
                fontSize: "0.95rem",
                marginTop: "auto",
                opacity: hovered === i ? 1 : 0.7,
                transition: "opacity 0.3s ease",
              }}>
                Explore <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section style={{
        padding: "100px 20px",
        textAlign: "center",
        background: mode === "dark" ? "#161B22" : "#F1F5F9",
        margin: "100px 40px",
        borderRadius: 40,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: 24, fontFamily: "'Outfit', sans-serif" }}>
            Ready to Automate Your Ad Strategy?
          </h2>
          <p style={{ fontSize: "1.2rem", color: colors.text2, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            Join forward-thinking brands and start creating professional content today.
          </p>
          <button
            onClick={() => onNavigate("signup")}
            style={{
              padding: "18px 50px",
              background: colors.text1,
              color: colors.bg1,
              borderRadius: 14,
              border: "none",
              fontSize: "1.1rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Start Building Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
