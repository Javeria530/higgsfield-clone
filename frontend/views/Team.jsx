import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Users, Plus, Mail } from "lucide-react";

const Team = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const { colors, mode } = useTheme();

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
        maxWidth: 1200,
        width: "100%",
        margin: "0 auto",
        padding: "60px 20px",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Team Collaboration</h1>
          <button style={{
            background: colors.primary,
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Plus size={18} />
            Invite Member
          </button>
        </div>

        {/* Team Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 24,
          marginBottom: 40,
        }}>
          <div style={{
            background: mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            borderRadius: 16,
            padding: 24,
          }}>
            <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>Team Members</p>
            <p style={{ fontSize: 28, fontWeight: 700 }}>1</p>
          </div>
          <div style={{
            background: mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            borderRadius: 16,
            padding: 24,
          }}>
            <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>Pending Invites</p>
            <p style={{ fontSize: 28, fontWeight: 700 }}>0</p>
          </div>
          <div style={{
            background: mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            borderRadius: 16,
            padding: 24,
          }}>
            <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>Active Projects</p>
            <p style={{ fontSize: 28, fontWeight: 700 }}>0</p>
          </div>
        </div>

        {/* Current User Card */}
        <div style={{
          background: mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 24,
              fontWeight: 600,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                {user?.name || "You"}
              </h3>
              <p style={{ fontSize: 14, opacity: 0.6 }}>
                {user?.email || "your@email.com"}
              </p>
              <p style={{ fontSize: 12, marginTop: 4, color: colors.primary }}>
                Owner
              </p>
            </div>
          </div>
        </div>

        {/* No Team Members */}
        <div style={{
          background: mode === "dark"
            ? "rgba(255, 255, 255, 0.03)"
            : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 16,
          padding: 60,
          textAlign: "center",
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Users size={64} style={{ marginBottom: 24, opacity: 0.3 }} />
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            Build Your Team
          </h3>
          <p style={{ opacity: 0.6, maxWidth: 400, marginBottom: 24 }}>
            Invite team members to collaborate on projects and share resources.
          </p>
          <button style={{
            background: colors.primary,
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Mail size={18} />
            Send First Invite
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Team;
