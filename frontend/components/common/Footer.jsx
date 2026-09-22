import React from "react";
import { useTheme } from "../../context/ThemeContext";

const Footer = () => {
  const { colors, mode } = useTheme();

  return (
    <footer style={{
      padding: "80px 40px 40px",
      background: mode === "dark" ? "#0B0E14" : "#F8FAFC",
      borderTop: `1px solid ${colors.border}`,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 60,
        marginBottom: 80,
      }}>
        {/* Branding */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <img 
                src="/smartads-logo.jpeg" 
                alt="SmartAds Logo" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>
            <span style={{ 
              fontSize: "1.5rem", 
              fontWeight: "800", 
              color: colors.text1, 
              letterSpacing: "-0.02em", 
              fontFamily: "'Outfit', sans-serif" 
            }}>
              SmartAds
            </span>
          </div>
          <p style={{ color: colors.text2, lineHeight: 1.6, fontSize: "0.95rem" }}>
            The future of digital marketing is here. AI-enabled creativity for everyone.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ fontWeight: "700", marginBottom: 24, fontSize: "1rem", color: colors.text1, textTransform: "uppercase", letterSpacing: "0.05em" }}>Platform</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, color: colors.text2, fontSize: "0.95rem", padding: 0 }}>
            <li style={{ cursor: "pointer" }}>AI Video</li>
            <li style={{ cursor: "pointer" }}>Voice Generator</li>
            <li style={{ cursor: "pointer" }}>Posters & Design</li>
            <li style={{ cursor: "pointer" }}>Analytics</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: "700", marginBottom: 24, fontSize: "1rem", color: colors.text1, textTransform: "uppercase", letterSpacing: "0.05em" }}>Company</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, color: colors.text2, fontSize: "0.95rem", padding: 0 }}>
            <li style={{ cursor: "pointer" }}>About Us</li>
            <li style={{ cursor: "pointer" }}>Careers</li>
            <li style={{ cursor: "pointer" }}>Privacy Policy</li>
            <li style={{ cursor: "pointer" }}>Terms of Service</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontWeight: "700", marginBottom: 24, fontSize: "1rem", color: colors.text1, textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact</h4>
          <p style={{ color: colors.text2, fontSize: "0.95rem", lineHeight: 1.6 }}>
            nakhalsheikh4@gmail.com<br />
            NUCES Chiniot, Pakistan<br />
            +92 303 1233445
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        paddingTop: 40,
        borderTop: `1px solid ${colors.border}`,
        textAlign: "center",
        color: colors.text2,
        fontSize: "0.9rem",
      }}>
        © {new Date().getFullYear()} SmartAds Platform. Precision made for creators.
      </div>
    </footer>
  );
};

export default Footer;
