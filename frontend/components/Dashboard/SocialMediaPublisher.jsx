import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { socialMediaAPI } from '../../services/api';
import { X, ExternalLink, CheckCircle, AlertCircle, Loader2, Send, Unlink } from 'lucide-react';

const PLATFORMS = [
    {
        id: 'linkedin',
        name: 'LinkedIn',
        color: '#0A66C2',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        id: 'instagram',
        name: 'Instagram',
        color: '#E4405F',
        gradient: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
            </svg>
        ),
    },
    {
        id: 'facebook',
        name: 'Facebook',
        color: '#1877F2',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
];

const SocialMediaPublisher = ({ contentUrl, contentType = 'image', onClose }) => {
    const { colors, mode } = useTheme();
    const { user } = useAuth();
    const [platformStatus, setPlatformStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState({});
    const [caption, setCaption] = useState('Created with SmartAds ✨');
    const [publishResults, setPublishResults] = useState({});
    const [connectingPlatform, setConnectingPlatform] = useState(null);

    // Load connection status on mount
    useEffect(() => {
        loadStatus();

        // Listen for success messages from the OAuth popup
        const handleMessage = (event) => {
            if (event.data?.type === 'social-media-oauth-success') {
                // Backend already exchanged the code and stored the token
                setConnectingPlatform(null);
                loadStatus();
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const loadStatus = async () => {
        try {
            setLoading(true);
            const data = await socialMediaAPI.getStatus(user?.id || user?.email);
            setPlatformStatus(data.platforms || {});
        } catch (err) {
            console.error('Failed to load social media status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (platform) => {
        try {
            setConnectingPlatform(platform);
            const userId = user?.id || user?.email;
            // Backend handles redirect_uri internally
            const data = await socialMediaAPI.getAuthUrl(platform, userId);

            // Open OAuth in a popup
            const width = 600, height = 700;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;
            const popup = window.open(
                data.auth_url,
                `${platform}_oauth`,
                `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
            );

            // Poll for popup close
            const timer = setInterval(() => {
                if (popup && popup.closed) {
                    clearInterval(timer);
                    setConnectingPlatform(null);
                    loadStatus();
                }
            }, 500);
        } catch (err) {
            alert('Failed to start OAuth: ' + err.message);
            setConnectingPlatform(null);
        }
    };

    const handleDisconnect = async (platform) => {
        try {
            await socialMediaAPI.disconnect(platform, user?.id || user?.email);
            setPlatformStatus(prev => ({
                ...prev,
                [platform]: { connected: false },
            }));
        } catch (err) {
            alert('Failed to disconnect: ' + err.message);
        }
    };

    const handlePublish = async (platform) => {
        try {
            setPublishing(prev => ({ ...prev, [platform]: true }));
            setPublishResults(prev => ({ ...prev, [platform]: null }));

            const result = await socialMediaAPI.publish(
                platform,
                user?.id || user?.email,
                contentUrl,
                contentType,
                caption
            );

            // If backend returns a share_url, open it (fallback for personal accounts)
            if (result.result?.share_url) {
                window.open(result.result.share_url, '_blank', 'width=600,height=500');
                setPublishResults(prev => ({
                    ...prev,
                    [platform]: { success: true, message: `Share dialog opened for ${platform}!` },
                }));
            } else {
                setPublishResults(prev => ({
                    ...prev,
                    [platform]: { success: true, message: `Published to ${platform} successfully!` },
                }));
            }
        } catch (err) {
            setPublishResults(prev => ({
                ...prev,
                [platform]: { success: false, message: err.message || 'Publishing failed' },
            }));
        } finally {
            setPublishing(prev => ({ ...prev, [platform]: false }));
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out',
        }}>
            <style>{`
        @keyframes smSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes smPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
        }
      `}</style>

            <div style={{
                width: '95%', maxWidth: 720, maxHeight: '90vh', overflow: 'auto',
                background: colors.bg2, borderRadius: 28,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 32px 80px rgba(0,0,0,0.5)`,
                padding: '40px 36px', position: 'relative',
                animation: 'smSlideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
            }}>

                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 20, right: 20,
                        width: 40, height: 40, borderRadius: '50%',
                        background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        border: 'none', cursor: 'pointer', color: colors.text2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: '1.8rem', fontWeight: 800, color: colors.text1,
                        margin: 0, letterSpacing: '-0.02em',
                    }}>
                        Upload on Social Media
                    </h2>
                    <p style={{
                        color: colors.text2, fontSize: '0.95rem', margin: '8px 0 0',
                    }}>
                        Connect your accounts and publish your {contentType === 'video' ? 'video' : 'design'} directly
                    </p>
                </div>

                {/* Content preview */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: 16, borderRadius: 16,
                    background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${colors.border}`,
                    marginBottom: 24,
                }}>
                    {contentType === 'video' ? (
                        <video src={contentUrl} style={{
                            width: 80, height: 80, borderRadius: 12, objectFit: 'cover',
                            border: `2px solid ${colors.border}`,
                        }} muted />
                    ) : (
                        <img src={contentUrl} alt="Content preview" style={{
                            width: 80, height: 80, borderRadius: 12, objectFit: 'cover',
                            border: `2px solid ${colors.border}`,
                        }} />
                    )}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: colors.text1, fontSize: '0.95rem', marginBottom: 4 }}>
                            {contentType === 'video' ? '🎬 Video Ad' : '🎨 Generated Design'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: colors.text2 }}>
                            Ready to publish
                        </div>
                    </div>
                </div>

                {/* Caption input */}
                <div style={{ marginBottom: 28 }}>
                    <label style={{
                        display: 'block', fontWeight: 600, fontSize: '0.9rem',
                        color: colors.text1, marginBottom: 8,
                    }}>
                        Caption
                    </label>
                    <textarea
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        placeholder="Write a caption for your post..."
                        style={{
                            width: '100%', padding: '14px 16px', borderRadius: 14,
                            border: `1px solid ${colors.border}`,
                            background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                            color: colors.text1, fontSize: '0.95rem',
                            resize: 'vertical', minHeight: 70, outline: 'none',
                            fontFamily: 'inherit', boxSizing: 'border-box',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = colors.primary}
                        onBlur={e => e.target.style.borderColor = colors.border}
                    />
                </div>

                {/* Platform cards */}
                {loading ? (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 40, color: colors.text2,
                    }}>
                        <Loader2 size={28} style={{ animation: 'veoSpin 1s linear infinite', marginRight: 12 }} />
                        Loading platforms...
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {PLATFORMS.map((platform) => {
                            const status = platformStatus[platform.id] || {};
                            const isConnected = status.connected;
                            const isPublishing = publishing[platform.id];
                            const result = publishResults[platform.id];
                            const isConnecting = connectingPlatform === platform.id;

                            return (
                                <div
                                    key={platform.id}
                                    style={{
                                        padding: '20px 24px', borderRadius: 20,
                                        background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
                                        border: `1px solid ${isConnected ? platform.color + '44' : colors.border}`,
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 16, marginBottom: result ? 12 : 0,
                                    }}>
                                        {/* Platform icon */}
                                        <div style={{
                                            width: 52, height: 52, borderRadius: 14,
                                            background: platform.gradient || platform.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', flexShrink: 0,
                                            boxShadow: `0 4px 16px ${platform.color}33`,
                                        }}>
                                            {platform.icon}
                                        </div>

                                        {/* Platform info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: 700, fontSize: '1.05rem', color: colors.text1,
                                                display: 'flex', alignItems: 'center', gap: 8,
                                            }}>
                                                {platform.name}
                                                {isConnected && (
                                                    <span style={{
                                                        fontSize: '0.7rem', fontWeight: 600,
                                                        color: '#10B981', background: '#10B98118',
                                                        padding: '3px 8px', borderRadius: 100,
                                                        animation: 'smPulse 2s ease-in-out infinite',
                                                    }}>
                                                        Connected
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: colors.text2, marginTop: 2 }}>
                                                {isConnected
                                                    ? `Ready to publish ${contentType === 'video' ? 'videos' : 'images'}`
                                                    : 'Click connect to link your account'}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                            {isConnected ? (
                                                <>
                                                    <button
                                                        onClick={() => handlePublish(platform.id)}
                                                        disabled={isPublishing}
                                                        style={{
                                                            padding: '10px 20px', borderRadius: 12,
                                                            background: platform.gradient || platform.color,
                                                            color: '#fff', border: 'none',
                                                            fontWeight: 600, fontSize: '0.85rem',
                                                            cursor: isPublishing ? 'not-allowed' : 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: 6,
                                                            opacity: isPublishing ? 0.7 : 1,
                                                            transition: 'all 0.2s',
                                                            boxShadow: `0 4px 12px ${platform.color}40`,
                                                        }}
                                                        onMouseEnter={e => { if (!isPublishing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                    >
                                                        {isPublishing ? (
                                                            <><Loader2 size={14} style={{ animation: 'veoSpin 1s linear infinite' }} /> Publishing...</>
                                                        ) : (
                                                            <><Send size={14} /> Publish</>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDisconnect(platform.id)}
                                                        title="Disconnect"
                                                        style={{
                                                            padding: '10px', borderRadius: 12,
                                                            background: 'transparent',
                                                            border: `1px solid ${colors.border}`,
                                                            color: colors.text2, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'all 0.2s',
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.borderColor = '#EF4444';
                                                            e.currentTarget.style.color = '#EF4444';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.borderColor = colors.border;
                                                            e.currentTarget.style.color = colors.text2;
                                                        }}
                                                    >
                                                        <Unlink size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleConnect(platform.id)}
                                                    disabled={isConnecting}
                                                    style={{
                                                        padding: '10px 20px', borderRadius: 12,
                                                        background: 'transparent',
                                                        border: `1px solid ${platform.color}66`,
                                                        color: platform.color,
                                                        fontWeight: 600, fontSize: '0.85rem',
                                                        cursor: isConnecting ? 'not-allowed' : 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => {
                                                        if (!isConnecting) {
                                                            e.currentTarget.style.background = `${platform.color}11`;
                                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                                        }
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    {isConnecting ? (
                                                        <><Loader2 size={14} style={{ animation: 'veoSpin 1s linear infinite' }} /> Connecting...</>
                                                    ) : (
                                                        <><ExternalLink size={14} /> Connect</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Publish result message */}
                                    {result && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '10px 14px', borderRadius: 12,
                                            background: result.success ? '#10B98115' : '#EF444415',
                                            border: `1px solid ${result.success ? '#10B98133' : '#EF444433'}`,
                                            color: result.success ? '#10B981' : '#EF4444',
                                            fontSize: '0.85rem', fontWeight: 500,
                                            animation: 'fadeIn 0.3s ease-out',
                                        }}>
                                            {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                            {result.message}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialMediaPublisher;
