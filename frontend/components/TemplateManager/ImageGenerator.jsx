import React, { useState, useEffect } from 'react';
import {
  Sparkles, Loader2, Download, Trash2, X,
  Image as ImageIcon, Clock, Grid3x3
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  generateMarketingImage,
  generateAndSaveImage,
  getImageGallery,
  deleteFromGallery,
  downloadImage
} from '../../services/aiService.js';

/**
 * ImageGenerator Component
 * Generates high-quality logos and posters using Gemini API
 */
const ImageGenerator = ({ onClose, initialPrompt = '' }) => {
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState(null); // 'logo' or 'poster'
  const [error, setError] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  // Load gallery on mount
  useEffect(() => {
    const savedGallery = getImageGallery();
    setGallery(savedGallery);
  }, []);

  const handleGenerate = async (type) => {
    if (!prompt.trim()) {
      setError('Please enter a description for your ' + type);
      return;
    }
    
    // Validate prompt - must contain meaningful text, not just numbers
    if (/^\d+$/.test(prompt.trim())) {
      setError('Please provide a meaningful description, not just numbers. Example: "Modern minimalist blue logo for a tech startup"');
      return;
    }
    
    // Validate minimum length
    if (prompt.trim().length < 10) {
      setError('Description too short. Please provide at least 10 characters with descriptive details.');
      return;
    }

    setIsGenerating(true);
    setGeneratingType(type);
    setError(null);

    try {
      const imageUrl = await generateMarketingImage(prompt, type);
      setGeneratedImage({ url: imageUrl, type, prompt });

      // Auto-save to gallery
      const imageEntry = await generateAndSaveImage(prompt, type);
      setGallery(prev => [imageEntry, ...prev]);
    } catch (err) {
      setError(`Failed to generate ${type}: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleDownload = () => {
    if (!generatedImage?.url) return;

    try {
      const filename = `smartads-${generatedImage.type}-${Date.now()}.png`;
      downloadImage(generatedImage.url, filename);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleDeleteFromGallery = (imageId) => {
    const updated = deleteFromGallery(imageId);
    setGallery(updated);
  };

  const cardStyle = {
    background: colors.cardBg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
  };

  const buttonStyle = {
    padding: '14px 24px',
    borderRadius: 12,
    border: 'none',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.3s',
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: 'rgba(255,255,255,0.03)',
    color: colors.text1,
    fontSize: 14,
    fontWeight: 600,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(20px)',
      padding: 24,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        ...cardStyle,
        width: '100%',
        maxWidth: 1200,
        maxHeight: '90vh',
        borderRadius: 24,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ color: colors.text1, fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>
                Smart Image Generator
              </h2>
              <p style={{ color: colors.text2, fontSize: 13, margin: 0, marginTop: 2 }}>
                Generate high-quality logos and posters with AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: 'transparent',
              color: colors.text2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = colors.text1; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text2; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }} className="custom-scrollbar">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0 }}>

            {/* Left: Preview */}
            <div style={{
              padding: 32,
              borderRight: `1px solid ${colors.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              overflowY: 'auto'
            }} className="custom-scrollbar">

              {/* Main Preview */}
              <div style={{
                borderRadius: 16,
                border: `2px dashed ${colors.border}`,
                aspectRatio: '1/1',
                overflow: 'hidden',
                position: 'relative',
                background: 'rgba(255,255,255,0.02)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isGenerating ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16
                  }}>
                    <Loader2 size={40} style={{
                      color: colors.primary,
                      animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.text2
                    }}>
                      Generating {generatingType}...
                    </p>
                  </div>
                ) : generatedImage?.url ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img
                      src={generatedImage.url}
                      alt="Generated"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        background: 'rgba(255,255,255,0.02)'
                      }}
                    />
                    <button
                      onClick={() => setGeneratedImage(null)}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'rgba(239,68,68,0.2)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', opacity: 0.3 }}>
                    <ImageIcon size={48} style={{ color: colors.text2, marginBottom: 12 }} />
                    <p style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: colors.text2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      Your image will appear here
                    </p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              {generatedImage?.url && (
                <button
                  onClick={handleDownload}
                  style={{
                    ...buttonStyle,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    color: '#fff',
                    width: '100%',
                    justifyContent: 'center',
                    boxShadow: `0 6px 20px ${colors.primary}40`
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 10px 30px ${colors.primary}60`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}40`;
                  }}
                >
                  <Download size={18} /> Download Asset
                </button>
              )}

              {/* Gallery Toggle */}
              <button
                onClick={() => setShowGallery(!showGallery)}
                style={{
                  ...buttonStyle,
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.text2,
                  width: '100%',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Grid3x3 size={18} /> View Gallery ({gallery.length})
              </button>

              {/* Gallery */}
              {showGallery && gallery.length > 0 && (
                <div style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  background: 'rgba(255,255,255,0.02)',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <h4 style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: colors.text2,
                    marginBottom: 12,
                    marginTop: 0
                  }}>
                    Recently Generated ({gallery.length})
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 10,
                    maxHeight: 300,
                    overflowY: 'auto'
                  }} className="custom-scrollbar">
                    {gallery.map(img => (
                      <div
                        key={img.id}
                        style={{
                          position: 'relative',
                          borderRadius: 8,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          aspectRatio: '1/1',
                          border: `1px solid ${colors.border}`,
                          opacity: 0.6,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                        onClick={() => setGeneratedImage({ url: img.url, type: img.type })}
                      >
                        <img
                          src={img.url}
                          alt={img.type}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteFromGallery(img.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            background: 'rgba(239,68,68,0.3)',
                            border: 'none',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: 0.7,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Controls */}
            <div style={{
              padding: 32,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }} className="custom-scrollbar">

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: 14,
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  marginBottom: 16,
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <p style={{
                    color: '#fca5a5',
                    fontSize: 13,
                    fontWeight: 600,
                    margin: 0
                  }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Prompt Input */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.text2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                  display: 'block'
                }}>
                  Describe Your Design
                </label>
                <textarea
                  style={{
                    ...inputStyle,
                    height: 120,
                    resize: 'vertical'
                  }}
                  placeholder="e.g., 'Modern minimalist logo for a coffee shop' or 'Summer sale poster with tropical leaves and vibrant colors'"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                <p style={{
                  fontSize: 11,
                  color: colors.text2,
                  opacity: 0.6,
                  margin: '8px 0 0 0'
                }}>
                  Be specific with colors, style, and mood for best results
                </p>
              </div>

              {/* Pro Tips */}
              <div style={{
                padding: 16,
                borderRadius: 12,
                background: `${colors.primary}08`,
                border: `1px solid ${colors.primary}15`,
                marginBottom: 24
              }}>
                <h4 style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.primary,
                  textTransform: 'uppercase',
                  margin: 0,
                  marginBottom: 8
                }}>
                  Pro Tips
                </h4>
                <ul style={{
                  fontSize: 12,
                  color: colors.text2,
                  margin: 0,
                  paddingLeft: 20,
                  lineHeight: 1.6
                }}>
                  <li>Include style (minimalist, luxurious, modern, etc.)</li>
                  <li>Mention color preferences</li>
                  <li>Specify mood and target audience</li>
                  <li>Logos work best with 1:1 aspect ratio</li>
                </ul>
              </div>

              {/* Generate Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, alignItems: 'flex-end' }}>
                <button
                  onClick={() => handleGenerate('logo')}
                  disabled={isGenerating || !prompt.trim()}
                  style={{
                    ...buttonStyle,
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    color: '#fff',
                    justifyContent: 'center',
                    height: 48,
                    cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
                    opacity: isGenerating || !prompt.trim() ? 0.4 : 1,
                    boxShadow: `0 6px 20px ${colors.primary}40`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (!isGenerating && prompt.trim()) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 10px 30px ${colors.primary}60`;
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}40`;
                  }}
                >
                  {isGenerating && generatingType === 'logo' ? (
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  Logo
                </button>
                <button
                  onClick={() => handleGenerate('poster')}
                  disabled={isGenerating || !prompt.trim()}
                  style={{
                    ...buttonStyle,
                    background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
                    color: '#fff',
                    justifyContent: 'center',
                    height: 48,
                    cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
                    opacity: isGenerating || !prompt.trim() ? 0.4 : 1,
                    boxShadow: `0 6px 20px ${colors.secondary}40`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (!isGenerating && prompt.trim()) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 10px 30px ${colors.secondary}60`;
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 6px 20px ${colors.secondary}40`;
                  }}
                >
                  {isGenerating && generatingType === 'poster' ? (
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  Poster
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
