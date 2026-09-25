import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { BarChart3, Calendar, Image, Layers, Rocket, Users, Video } from "lucide-react";

const Navbar = ({ onNavigate, showAuthButtons = true }) => {
  const [scrolled, setScrolled] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const { colors, mode } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const landingOptions = [
    { label: "Video", icon: Video, target: "login", feature: "AI Video Generator" },
    { label: "Design", icon: Image, target: "login", feature: "Logo & Poster Design" },
    { label: "Templates", icon: Layers, target: "login", feature: "Template Manager" },
    { label: "Analytics", icon: BarChart3, target: "login", feature: "Analytics Dashboard" },
    { label: "Team", icon: Users, target: "login", feature: "Team Collaboration" },
    { label: "Schedule", icon: Calendar, target: "login", feature: "Social Scheduler" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: scrolled
          ? mode === "dark" 
            ? "rgba(11, 14, 20, 0.85)" 
            : "rgba(255, 255, 255, 0.85)"
          : "transparent",
        padding: scrolled ? "1rem 3rem" : "1.5rem 3rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: scrolled ? `0 10px 40px rgba(0,0,0, ${mode === 'dark' ? '0.3' : '0.05'})` : "none",
        borderBottom: scrolled ? `1px solid ${colors.border}` : "none",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 1000,
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      {/* Logo */}
      <div
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 12, 
          cursor: "pointer" 
        }}
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
        onClick={() => onNavigate && onNavigate("dashboard")}
      >
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: logoHovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: logoHovered ? `0 0 20px ${colors.primary}44` : "none"
        }}>
          <img 
            src="/smartads-logo.jpeg" 
            alt="SmartAds Logo" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
        </div>
        <h2
          style={{
            fontWeight: "800",
            color: colors.text1,
            margin: 0,
            fontSize: "1.4rem",
            letterSpacing: "-0.02em",
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          SmartAds
        </h2>
      </div>

      {/* Navigation Buttons */}
      {/* Landing navigation options */}
      <div className="landing-nav-options" style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
        {landingOptions.map(({ label, icon, target, feature }) => (
          <button
            key={label}
            className="landing-option-button"
            title={label}
            aria-label={label}
            onClick={() => {
              localStorage.setItem("targetFeature", feature);
              onNavigate(target);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 10px",
              border: `1px solid ${colors.border}`,
              borderRadius: 9,
              background: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
              color: mode === "light" ? "#000" : colors.text1,
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {React.createElement(icon, { size: 15 })}
            <span>{label}</span>
          </button>
        ))}
        <ThemeToggle />
        {showAuthButtons && (
          <>
            <button
              onClick={() => onNavigate("login")}
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                border: "none",
                background: mode === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                color: colors.text1,
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s ease",
                fontSize: "0.95rem"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = mode === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = mode === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate("signup")}
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                background: colors.primary,
                color: mode === "dark" ? "#0B0E14" : "white",
                cursor: "pointer",
                border: "none",
                fontWeight: "700",
                transition: "all 0.3s ease",
                boxShadow: `0 4px 12px ${colors.primary}33`,
                fontSize: "0.95rem"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 16px ${colors.primary}44`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}33`;
              }}
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;