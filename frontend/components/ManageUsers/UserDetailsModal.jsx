import React, { useState } from 'react';
import { XCircle, Mail, Shield, Calendar, Lock, Copy, CheckCircle } from 'lucide-react';

const UserDetailsModal = ({ user, colors, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardStyle = {
    background: colors.cardBg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.border}`,
    borderRadius: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  };

  const infoCard = {
    padding: '20px 22px',
    borderRadius: 16,
    backgroundColor: colors.bg2,
    border: `1px solid ${colors.border}`,
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: colors.text2,
    opacity: 0.6,
  };

  const valueStyle = {
    fontWeight: 700,
    fontSize: 16,
    color: colors.text1,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 600, ...cardStyle, padding: '36px 32px', maxHeight: '90vh', overflowY: 'auto', animation: 'slideIn 0.3s ease-out' }}>
        <style>{`@keyframes slideIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }`}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: colors.text1, letterSpacing: '-0.02em', margin: 0 }}>
            User Details
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: 4 }}>
            <XCircle size={24} />
          </button>
        </div>

        {/* User Profile Header */}
        <div style={{ marginBottom: 24, padding: '24px 24px', borderRadius: 18, background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary || '#7C3AED'}08)`, border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary || '#7C3AED'}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: colors.primary }}>{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: colors.text1, margin: 0 }}>{user?.name}</h3>
              <p style={{ fontSize: 12, color: colors.text2, opacity: 0.5, marginTop: 2 }}>ID: {user?.id}</p>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
          {/* Email */}
          <div style={infoCard}>
            <div style={labelStyle}>
              <Mail size={14} /> Email
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ ...valueStyle, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{user?.email}</p>
              <button onClick={() => copyToClipboard(user?.email)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: colors.text2, transition: 'all 0.2s', flexShrink: 0 }}>
                {copied ? <CheckCircle size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div style={infoCard}>
            <div style={labelStyle}>
              <Shield size={14} /> Role
            </div>
            <p style={{ ...valueStyle, color: colors.primary, margin: 0 }}>{user?.role}</p>
          </div>

          {/* Status */}
          <div style={infoCard}>
            <div style={labelStyle}>
              <Lock size={14} /> Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: user?.status === 'ACTIVE' ? colors.success : user?.status === 'SUSPENDED' ? (colors.accent || '#f59e0b') : colors.error }} />
              <p style={{ ...valueStyle, margin: 0 }}>{user?.status}</p>
            </div>
          </div>

          {/* Organization */}
          <div style={infoCard}>
            <div style={labelStyle}>
              <Shield size={14} /> Organization
            </div>
            <p style={{ ...valueStyle, margin: 0 }}>{user?.organizationName || 'N/A'}</p>
          </div>

          {/* Created Date */}
          <div style={infoCard}>
            <div style={labelStyle}>
              <Calendar size={14} /> Joined Date
            </div>
            <p style={{ ...valueStyle, margin: 0 }}>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>

          {/* Last Active */}
          <div style={infoCard}>
            <div style={labelStyle}>
              <Calendar size={14} /> Last Active
            </div>
            <p style={{ ...valueStyle, margin: 0 }}>{user?.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</p>
          </div>
        </div>

        {/* Features Access */}
        {user?.allowedFeatures && user.allowedFeatures.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.text2, marginBottom: 10, opacity: 0.6 }}>
              Allowed Features
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {user.allowedFeatures.map(feature => (
                <span key={feature} style={{ padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', backgroundColor: `${colors.primary}15`, color: colors.primary, border: `1px solid ${colors.border}` }}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div style={{ ...infoCard, marginBottom: 24 }}>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.text2, marginBottom: 14, opacity: 0.6 }}>
            Account Information
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Head User', value: user?.isHeadUser ? '✓ Yes' : '✗ No' },
              { label: 'Account Type', value: user?.role || 'Standard' },
              { label: 'Password Set', value: user?.password ? '✓ Yes' : '✗ No' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                <span style={{ color: colors.text2 }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: colors.text1 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button onClick={onClose} style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || '#7C3AED'})`, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: `0 6px 20px ${colors.primary}40`, transition: 'all 0.3s' }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default UserDetailsModal;