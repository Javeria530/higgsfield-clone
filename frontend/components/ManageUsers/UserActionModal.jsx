import React from 'react';
import { XCircle, Lock, Unlock, Trash2 } from 'lucide-react';

const UserActionModal = ({ user, actionType, colors, onConfirm, onClose }) => {
  const getActionDetails = () => {
    switch (actionType) {
      case 'suspend':
        return { icon: Lock, title: 'Suspend User', message: `Are you sure you want to suspend ${user?.name}? They will lose access to all platform features.`, confirmText: 'Suspend', color: '#f59e0b' };
      case 'activate':
        return { icon: Unlock, title: 'Activate User', message: `Activate ${user?.name}? They will regain full access to the platform.`, confirmText: 'Activate', color: '#4ade80' };
      case 'deactivate':
        return { icon: Lock, title: 'Deactivate User', message: `Deactivate ${user?.name}? Their account will be marked as inactive.`, confirmText: 'Deactivate', color: '#facc15' };
      case 'delete':
        return { icon: Trash2, title: 'Delete User', message: `Are you sure you want to permanently delete ${user?.name}? This action cannot be undone.`, confirmText: 'Delete', color: '#ef4444' };
      default:
        return null;
    }
  };

  const details = getActionDetails();
  if (!details) return null;

  const Icon = details.icon;
  const isAdminSuspend = actionType === 'suspend' && user?.role === 'ADMIN';
  const cardStyle = { background: colors.cardBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' };
  const iconColor = isAdminSuspend ? '#ef4444' : details.color;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440, ...cardStyle, padding: '36px 32px', animation: 'slideIn 0.3s ease-out' }}>
        <style>{`@keyframes slideIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }`}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
            <Icon size={28} />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: 4 }}>
            <XCircle size={22} />
          </button>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.text1, marginBottom: 8, letterSpacing: '-0.02em' }}>
          {isAdminSuspend ? 'Cannot Suspend Admin' : details.title}
        </h2>

        <p style={{ color: colors.text2, fontSize: 14, lineHeight: 1.6, marginBottom: 24, opacity: 0.8 }}>
          {isAdminSuspend ? 'Admin users cannot be suspended. Only non-admin users can be suspended.' : details.message}
        </p>

        {actionType === 'delete' && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>⚠️ Warning: This action is irreversible. All user data will be permanently removed.</p>
          </div>
        )}

        {isAdminSuspend && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>ℹ️ Only BUSINESS_USER and HEAD_USER roles can be suspended.</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          {isAdminSuspend ? (
            <button onClick={onClose} style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.bg2, color: colors.text1, fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.2s' }}>
              Close
            </button>
          ) : (
            <>
              <button onClick={onClose} style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.bg2, color: colors.text2, fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.2s' }}>
                Cancel
              </button>
              <button onClick={onConfirm} style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: 'none', background: details.color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: `0 6px 20px ${details.color}40`, transition: 'all 0.2s' }}>
                {details.confirmText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActionModal;