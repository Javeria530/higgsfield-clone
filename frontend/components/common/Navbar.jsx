import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { Rocket } from "lucide-react";

const Navbar = ({ onNavigate, showAuthButtons = true }) => {
  const [scrolled, setScrolled] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const { colors, mode } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const textColor = colors.text1;

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
      <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
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