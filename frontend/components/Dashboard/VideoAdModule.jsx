import React, { useState, useRef } from 'react';
import { videoAdAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { hasVulgarity } from '../../utils/profanityFilter';
import { Video, Loader2, Download, Maximize2, X, Share2 } from "lucide-react";
import SocialMediaPublisher from './SocialMediaPublisher';

const initialProduct = {
  productName: '',
  productDescription: '',
  productPrice: '',
  productCategory: '',
  brandName: '',
  targetAudience: '',
  keyFeatures: '',
  callToAction: '',
};

const VideoAdModule = ({ initialData = null }) => {
  const { colors, mode } = useTheme();
  const [product, setProduct] = useState(initialData || initialProduct);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressPhase, setProgressPhase] = useState('');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const videoRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation rules
    if (name === 'productPrice') {
      // Price field: only numbers and decimal point
      if (!/^\d*\.?\d*$/.test(value)) {
        return; // Reject if contains non-numeric characters
      }
    } else if (['productName', 'productCategory', 'brandName', 'callToAction', 'targetAudience'].includes(name)) {
      // Text fields: reject if contains only numbers
      if (value && /^\d+$/.test(value)) {
        return; // Reject if field contains only digits
      }
    }

    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasVulgarity(product.productName) || hasVulgarity(product.productDescription) || hasVulgarity(product.keyFeatures)) {
      alert("Inappropriate language detected. Please remove offensive or vulgar words before generating.");
      return;
    }

    setLoading(true);
    setEnhancedPrompt('');
    setVideoUrl('');

    try {
      setProgressPhase('enhancing');
      const enhanceRes = await videoAdAPI.enhancePrompt(product);
      const prompt = enhanceRes.enhancedPrompt;
      setEnhancedPrompt(prompt);

      setProgressPhase('generating');
      const res = await videoAdAPI.generateVideo({ prompt });

      if (res.video_url) {
        setVideoUrl(res.video_url);
      } else {
        throw new Error('No video URL returned from the API.');
      }
    } catch (err) {
      console.error('Video generation error:', err);
      alert('Video Generation Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setProgressPhase('');
    }
  };

  const handleReset = () => {
    setVideoUrl('');
    setEnhancedPrompt('');
    setProduct(initialProduct);
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `smartads-video-${Date.now()}.mp4`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const animationStyles = `
    @keyframes veoSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes veoPulse {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 0.7; }
    }
    @keyframes veoFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <div
      style={{
        width: '100%',
        color: colors.text1,
        fontFamily: 'Poppins, Arial, sans-serif',
        animation: 'fadeIn 0.5s',
      }}
      className="custom-scrollbar"
    >
      <style>{animationStyles}</style>

      <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 24, color: colors.primary }}>Video Advertisement Module</h2>

      {/* Horizontal Layout Split */}
      <div style={{ display: 'flex', gap: 32, flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>

        {/* Left: Product Details Form */}
        <div style={{ flex: 1 }}>
          <form
            id="video-ad-form"
            onSubmit={handleSubmit}
            style={{
              borderRadius: 14,
              padding: '24px', background: mode === 'dark' ? 'rgba(0,0,83,0.18)' : '#F8FAFC',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <div style={{ color: colors.text2, fontSize: '0.95rem', marginBottom: 6 }}>
              Enter your product information. AI will craft a cinematic prompt and generate a professional video ad using <strong>Veo 3.1</strong>.
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Product Name * <span style={{ fontSize: '0.8rem', color: colors.text2, fontWeight: 400 }}>(Text only)</span></div>
                <input name="productName" placeholder="e.g., Wireless Headphones" value={product.productName} onChange={handleChange} required style={{ padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: '0.95rem', background: colors.bg2, color: colors.text1 }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Category * <span style={{ fontSize: '0.8rem', color: colors.text2, fontWeight: 400 }}>(Text only)</span></div>
                <input name="productCategory" placeholder="e.g., Electronics" value={product.productCategory} onChange={handleChange} required style={{ padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: '0.95rem', background: colors.bg2, color: colors.text1 }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Product Description * <span style={{ fontSize: '0.8rem', color: colors.text2, fontWeight: 400 }}>(Text only)</span></div>
              <textarea name="productDescription" placeholder="Describe in detail..." value={product.productDescription} onChange={handleChange} required style={{ padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: '0.95rem', minHeight: 60, resize: 'vertical', background: colors.bg2, color: colors.text1 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Key Features * <span style={{ fontSize: '0.8rem', color: colors.text2, fontWeight: 400 }}>(Text only)</span></div>
              <textarea name="keyFeatures" placeholder="Noise cancellation, 30-hour battery..." value={product.keyFeatures} onChange={handleChange} required style={{ padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: '0.95rem', minHeight: 50, resize: 'vertical', background: colors.bg2, color: colors.text1 }} />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Target Audience <span style={{ fontSize: '0.8rem', color: colors.text2, fontWeight: 400 }}>(Text only)</span></div>
                <input name="targetAudience" placeholder="e.g., Professionals" value={product.targetAudience} onChange={handleChange} style={{ padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.bg2, color: colors.text1 }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Price (Numbers only)</div>
                <input name="productPrice" placeholder="e.g., 199 or 199.99" value={product.productPrice} onChange={handleChange} inputMode="decimal" style={{ padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.bg2, color: colors.text1 }} />
                <small style={{ color: colors.text2, fontSize: '0.8rem' }}>Only numbers and decimal points allowed</small>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Brand Name <span style={{ fontSize: '0.8rem', color: colors.text2, fontWeight: 400 }}>(Text only)</span></div>
                <input name="brandName" placeholder="BrandX" value={product.brandName} onChange={handleChange} style={{ padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.bg2, color: colors.text1 }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>CTA Text <span style={{ fontSize: '0.8rem', color: colors.text2, fontWeight: 400 }}>(Text only)</span></div>
                <input name="callToAction" placeholder="Shop Now" value={product.callToAction} onChange={handleChange} style={{ padding: '10px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.bg2, color: colors.text1 }} />
              </div>
            </div>
          </form>
        </div>

        {/* Right: Preview & Action */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: mode === 'dark' ? 'rgba(0,0,83,0.12)' : '#F3F4F6',
            borderRadius: "12px",
            border: `2px dashed ${colors.border}`,
            minHeight: "450px",
            position: "relative",
            overflow: "hidden",
            padding: "20px"
          }}>
            {videoUrl ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                width: '100%', height: '100%', justifyContent: 'center', gap: 12,
                position: 'relative'
              }}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  style={{
                    maxWidth: "100%",
                    maxHeight: "380px",
                    borderRadius: "10px",
                    border: `3px solid ${colors.primary}`,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                  }}
                />
                {/* Maximize & Download overlay buttons */}
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  display: 'flex', gap: 8, zIndex: 10
                }}>
                  <button
                    onClick={() => setShowFullscreen(true)}
                    title="Maximize"
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                  >
                    <Maximize2 size={16} />
                  </button>
                  <button
                    onClick={handleDownload}
                    title="Download"
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                  >
                    <Download size={16} />
                  </button>
                </div>
                <div style={{
                  fontSize: '0.8rem', color: colors.text2,
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 4
                }}>
                  <span>🎬</span> Generated with Veo 3.1 — AI Cinematic Video
                </div>
              </div>
            ) : loading ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                color: colors.text2, textAlign: 'center', padding: '0 30px', gap: 18,
                animation: 'veoFadeIn 0.5s ease-out'
              }}>
                <Loader2 size={52} style={{ animation: 'veoSpin 1.5s linear infinite', color: colors.primary }} />

                {enhancedPrompt ? (
                  <p style={{
                    margin: 0, fontSize: "0.85rem", fontStyle: 'italic',
                    lineHeight: 1.6, maxWidth: 400,
                    animation: 'veoPulse 3s ease-in-out infinite',
                    color: colors.text2
                  }}>
                    "{enhancedPrompt}"
                  </p>
                ) : (
                  <p style={{
                    margin: 0, fontSize: "0.95rem", fontWeight: 500,
                    animation: 'veoPulse 2s ease-in-out infinite'
                  }}>
                    Crafting your cinematic prompt...
                  </p>
                )}

                {progressPhase === 'generating' && (
                  <p style={{
                    margin: 0, fontSize: "0.8rem", opacity: 0.5,
                  }}>
                    Veo 3.1 is rendering — typically 2-4 minutes
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: colors.text2, opacity: 0.6, textAlign: 'center', padding: '0 20px' }}>
                <Video size={64} style={{ marginBottom: "15px" }} />
                <p style={{ margin: 0, fontSize: "1.1rem" }}>Submit the form to generate a cinematic AI video ad powered by Veo 3.1.</p>
              </div>
            )}
          </div>

          {/* Action Buttons Below Placeholder */}
          {videoUrl ? (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownload}
                style={{
                  flex: 1, minWidth: '140px', padding: '16px', borderRadius: 12,
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                  color: '#fff', border: 'none',
                  fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: `0 6px 20px ${colors.primary}40`
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 30px ${colors.primary}60`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}40`; }}
              >
                <Download size={18} /> Download Video
              </button>
              <button
                onClick={() => setShowSocialMedia(true)}
                style={{
                  flex: 1, minWidth: '140px', padding: '16px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #0A66C2, #E4405F)',
                  color: '#fff', border: 'none',
                  fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 6px 20px rgba(228,64,95,0.3)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(228,64,95,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(228,64,95,0.3)'; }}
              >
                <Share2 size={18} /> Upload on Social Media
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1, minWidth: '140px', padding: '16px', borderRadius: 12,
                  background: 'transparent',
                  color: colors.text1,
                  border: `1px solid ${colors.border}`,
                  fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Create Another Ad
              </button>
            </div>
          ) : (
            <button
              type="submit"
              form="video-ad-form"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: loading ? "#a3a9d9" : colors.primary,
                border: "none",
                color: "white",
                fontSize: "1.1rem",
                borderRadius: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "AI Processing — Please Wait..." : "Generate Video"}
            </button>
          )}

        </div>
      </div>

      {/* ── Fullscreen Video Modal ── */}
      {showFullscreen && videoUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(20px)',
            padding: 24,
            animation: 'veoFadeIn 0.3s ease-out'
          }}
          onClick={() => setShowFullscreen(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowFullscreen(false)}
              style={{
                position: 'absolute', top: -16, right: -16, zIndex: 10,
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <X size={20} />
            </button>

            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              style={{
                maxWidth: '85vw',
                maxHeight: '80vh',
                borderRadius: 16,
                boxShadow: '0 25px 80px rgba(0,0,0,0.5)'
              }}
            />

            {/* Bottom actions in fullscreen */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={handleDownload}
                style={{
                  padding: '12px 24px', borderRadius: 12,
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                  color: '#fff', border: 'none', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: `0 6px 20px ${colors.primary}40`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Download size={16} /> Download Video
              </button>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                🎬 Veo 3.1 AI Video
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Publisher Modal */}
      {showSocialMedia && (
        <SocialMediaPublisher
          contentUrl={videoUrl}
          contentType="video"
          onClose={() => setShowSocialMedia(false)}
        />
      )}
    </div>
  );
};

export default VideoAdModule;