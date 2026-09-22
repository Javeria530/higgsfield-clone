import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  ArrowLeft, Search, Plus, Trash2, Edit3, X,
  Filter, Layout, Video, Film, Sparkles, Image as ImageIcon,
  Clock, ExternalLink, Activity,
  AlertCircle, BrainCircuit, Play, Pause,
  ShieldAlert, Loader2, Wand2, RefreshCw, Maximize2
} from 'lucide-react';
import { TemplateCategory, MediaType, TemplateStatus, BrandTone, AudioTracks } from '../../types.js';
import {
  generateVisualAsset,
  generateVideoAsset,
  refineMarketingVision,
  editVisualAsset,
  validateMarketingPrompt
} from '../../services/aiService.js';
import VideoAdModule from '../Dashboard/VideoAdModule.jsx';
import ImageGenerator from './ImageGenerator.jsx';

/* ─────────────────────────── INITIAL DATA ─────────────────────────── */

const FIXED_IMAGE_TEMPLATES = [
  {
    id: 'ft-tech-logo-1',
    name: 'Elite Tech AI Branding',
    mediaType: MediaType.POSTER,
    category: TemplateCategory.BRAND_AWARENESS,
    description: 'Sleek, minimalist branding for artificial intelligence and tech startups.',
    prompt: 'Professional minimalist logo for an AI startup, sleek futuristic symbol, blue and white neon color palette, 8k resolution, cinematic lighting, ultra-modern tech aesthetic.',
    previewUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4628c9757?q=80&w=800'
  },
  {
    id: 'ft-food-poster-1',
    name: 'Signature Burger Reveal',
    mediaType: MediaType.POSTER,
    category: TemplateCategory.PROMOTIONAL,
    description: 'High-end commercial photography style for premium food branding.',
    prompt: 'Mouth-watering photography of a triple-decker beef burger, gourmet style, dark textured background, cinematic warm lighting, steam rising, high detail, commercial food photography.',
    previewUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800'
  }
];

const FIXED_VIDEO_TEMPLATES = [
  {
    id: 'ft-villa-video-1',
    name: 'Horizon Luxury Villa',
    mediaType: MediaType.VIDEO,
    category: TemplateCategory.BRAND_AWARENESS,
    description: 'Cinematic real estate overview for luxury properties and holiday rentals.',
    previewUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800',
    productData: {
      productName: "Horizon Villa",
      productCategory: "Real Estate",
      productDescription: "Stunning modern villa with panoramic sea views and private infinity pool.",
      keyFeatures: "5 Bedrooms, Infinity Pool, Smart Home Tech, 24/7 Security",
      brandName: "Elite Estates",
      targetAudience: "Luxury buyers & investors",
      callToAction: "Schedule a Private Tour",
      productPrice: "$2.5M+"
    }
  }
];

/* ─────────────────────────── VIDEO PLAYER ─────────────────────────── */

const VideoPlayer = ({ url, caption, duration, isAutoPlay = false, isMuted = false }) => {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(Number(duration) || 0);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    setHasError(false);
    if (videoRef.current && url) {
      if (isAutoPlay) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [url, isAutoPlay]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (hasError) return;
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTo = pos * totalDuration;
    if (isFinite(seekTo)) videoRef.current.currentTime = seekTo;
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', background: '#0f172a', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      onClick={togglePlay}
    >
      {hasError ? (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', color: '#94a3b8', textAlign: 'center' }}>
          <AlertCircle size={24} style={{ marginBottom: 8, color: 'rgba(239,68,68,0.5)' }} />
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Media Unavailable</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={url}
            style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', objectFit: 'cover' }}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onLoadedMetadata={() => { setTotalDuration(videoRef.current?.duration || Number(duration)); setIsBuffering(false); }}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => { setIsBuffering(false); setIsPlaying(true); }}
            onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setHasError(true)}
            muted={isMuted}
            playsInline
            loop
          />

          {isBuffering && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
              <Loader2 size={48} style={{ color: colors.primary, animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {!isPlaying && !isBuffering && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
              <div style={{ width: 64, height: 64, background: colors.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 8px 32px ${colors.primary}60` }}>
                <Play size={28} fill="currentColor" style={{ marginLeft: 3 }} />
              </div>
            </div>
          )}
        </>
      )}

      {!hasError && caption && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 16, zIndex: 20, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3em', padding: '6px 16px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)' }}>
            {caption}
          </p>
        </div>
      )}

      {!hasError && (
        <div
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: 16, opacity: isPlaying ? 0 : 1, transition: 'opacity 0.3s' }}
          onClick={e => e.stopPropagation()}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => { if (isPlaying) e.currentTarget.style.opacity = 0; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={togglePlay}
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.primary, borderRadius: '50%', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: `0 0 20px ${colors.primary}50` }}
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: 1 }} />}
              </button>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>
            <button style={{ padding: 4, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Maximize2 size={16} />
            </button>
          </div>
          <div
            ref={progressRef}
            onClick={handleSeek}
            style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
          >
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, background: colors.primary, transition: 'width 0.1s', boxShadow: `0 0 10px ${colors.primary}`, width: `${(currentTime / (totalDuration || 1)) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */

const TemplateManager = ({ onBack }) => {
  const { user, hasFeatureAccess } = useAuth();
  const { colors } = useTheme();

  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // States for prefilling generators
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const [prefilledVideoData, setPrefilledVideoData] = useState(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [prefilledImageData, setPrefilledImageData] = useState(null);

  const [customTemplates, setCustomTemplates] = useState(() => {
    const saved = localStorage.getItem('smartads_custom_templates');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Access Control
  const isHeadUser = user?.isHeadUser;
  const hasAccess = hasFeatureAccess ? hasFeatureAccess(user?.id, 'templates') : true;
  const canAdd = isHeadUser;
  const canDelete = isHeadUser;
  const canEdit = isHeadUser || hasAccess;

  const [templates, setTemplates] = useState([...FIXED_IMAGE_TEMPLATES, ...FIXED_VIDEO_TEMPLATES]);

  const handleSaveTemplate = (data) => {
    if (!canEdit) return;
    if (editingTemplate && editingTemplate.id) {
      setTemplates(prev => prev.map(t =>
        t.id === editingTemplate.id ? { ...t, ...data, lastUpdated: new Date().toLocaleDateString() } : t
      ));
    } else {
      if (!canAdd) return;
      setTemplates(prev => [...prev, {
        ...data,
        id: `t-${Math.random().toString(36).substr(2, 8)}`,
        lastUpdated: new Date().toLocaleDateString(),
        status: TemplateStatus.APPROVED,
        audioTracks: data.audioTracks || []
      }]);
    }
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!canDelete) return;
    if (window.confirm("Are you sure you want to delete this template?")) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditFromViewer = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
    setViewingTemplate(null);
  };

  const handleUseFixedTemplate = (template) => {
    if (template.mediaType === MediaType.VIDEO) {
      setPrefilledVideoData(template.productData);
      setShowVideoGenerator(true);
    } else {
      setPrefilledImageData(template.prompt);
      setShowImageGenerator(true);
    }
    setViewingTemplate(null);
  };

  /* ── Shared Styles ── */

  const cardStyle = {
    background: colors.cardBg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
  };

  const pillStyle = {
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: 'rgba(255,255,255,0.03)',
    color: colors.text1,
    fontSize: 14,
    fontWeight: 600,
    outline: 'none',
    transition: 'border-color 0.2s',
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100, paddingBottom: 60, background: colors.bg1, transition: 'background 0.3s' }}>

      {/* ── Header ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', marginBottom: 32 }}>
        <div style={{ ...cardStyle, padding: '32px 40px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              onClick={onBack}
              style={{ width: 48, height: 48, borderRadius: 14, border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.05)', color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${colors.primary}15`; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 style={{ color: colors.text1, fontSize: '2rem', fontWeight: 'bold', margin: 0, lineHeight: 1.2 }}>
                Template Manager
              </h1>
              <p style={{ color: colors.text2, fontSize: '0.95rem', margin: 0, marginTop: 4 }}>
                {templates.length} templates &bull; Create, manage & deploy marketing assets
              </p>
            </div>
          </div>
          {canAdd && (
            <button
              onClick={() => { setEditingTemplate(null); setShowEditor(true); }}
              style={{ padding: '14px 28px', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 8px 25px ${colors.primary}40`, transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 35px ${colors.primary}60`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 25px ${colors.primary}40`; }}
            >
              <Plus size={18} /> New Template
            </button>
          )}
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
          {/* Search */}
          <div style={{ ...cardStyle, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Search size={18} style={{ color: colors.primary, flexShrink: 0 }} />
            <input
              style={{ width: '100%', border: 'none', padding: 0, background: 'transparent', color: colors.text1, fontSize: 14, fontWeight: 600, outline: 'none' }}
              placeholder="Search templates..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Type Filter */}
          <div style={{ ...cardStyle, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Filter size={18} style={{ color: colors.primary, flexShrink: 0 }} />
            <select style={{ ...selectStyle, border: 'none', padding: 0, paddingRight: 28, background: 'transparent' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Formats</option>
              {Object.values(MediaType).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
            </select>
          </div>
          {/* Category Filter */}
          <div style={{ ...cardStyle, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Layout size={18} style={{ color: colors.primary, flexShrink: 0 }} />
            <select style={{ ...selectStyle, border: 'none', padding: 0, paddingRight: 28, background: 'transparent' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {Object.values(TemplateCategory).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1).replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>
      {/* ── Categorized Templates ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', display: 'flex', flexDirection: 'column', gap: 64, animation: 'fadeIn 0.5s ease-out 0.2s both', paddingBottom: 80 }}>
        
        {/* Image Templates Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${colors.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
              <ImageIcon size={20} />
            </div>
            <h3 style={{ color: colors.text1, fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Logo & Poster Templates</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 32 }}>
            {FIXED_IMAGE_TEMPLATES.map((t, i) => (
              <TemplateCard key={t.id} template={t} index={i} colors={colors} onView={() => setViewingTemplate(t)} />
            ))}
          </div>
        </section>

        {/* Video Templates Section */}
        <section style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${colors.secondary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.secondary }}>
              <Video size={20} />
            </div>
            <h3 style={{ color: colors.text1, fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Video Generation Templates</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 32 }}>
            {FIXED_VIDEO_TEMPLATES.map((t, i) => (
              <TemplateCard key={t.id} template={t} index={i} colors={colors} onView={() => setViewingTemplate(t)} />
            ))}
          </div>
        </section>
      </div>

      {/* ── View Modal ── */}
      {viewingTemplate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', padding: 24, animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ width: '100%', maxWidth: 1100, height: '100%', maxHeight: '85vh', ...cardStyle, borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'row', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>
            {/* Preview Side */}
            <div style={{ flex: 1, background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${colors.border}`, minHeight: 300 }}>
              {viewingTemplate.mediaType === MediaType.VIDEO ? (
                <VideoPlayer url={viewingTemplate.previewUrl} caption={viewingTemplate.caption} duration={viewingTemplate.duration} isAutoPlay={true} isMuted={false} />
              ) : (
                <img src={viewingTemplate.previewUrl} alt={viewingTemplate.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 24 }} />
              )}
              <button
                onClick={() => setViewingTemplate(null)}
                style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 50, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={22} />
              </button>
            </div>

            {/* Details Side */}
            <div style={{ width: 420, padding: 36, display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="custom-scrollbar">
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: colors.primary, marginBottom: 8 }}>
                {viewingTemplate.category?.replace('_', ' ')}
              </span>
              <h2 style={{ color: colors.text1, fontSize: '1.8rem', fontWeight: 'bold', margin: 0, marginBottom: 24, lineHeight: 1.2 }}>
                {viewingTemplate.name}
              </h2>

              {/* Meta Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                <span style={{ ...pillStyle, background: 'rgba(255,255,255,0.05)', color: colors.text2, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Film size={14} /> {viewingTemplate.mediaType}
                </span>
                {viewingTemplate.mediaType === MediaType.VIDEO && (
                  <span style={{ ...pillStyle, background: 'rgba(255,255,255,0.05)', color: colors.text2, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} /> {viewingTemplate.duration}s
                  </span>
                )}
                <span style={{ ...pillStyle, background: 'rgba(255,255,255,0.05)', color: colors.text2, border: `1px solid ${colors.border}` }}>
                  {viewingTemplate.brandTone}
                </span>
              </div>

              {/* Description */}
              <div style={{ flex: 1 }}>
                <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border}`, marginBottom: 16 }}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.text2, opacity: 0.5, margin: 0, marginBottom: 10 }}>Description</h4>
                  <p style={{ color: colors.text2, fontSize: 14, lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{viewingTemplate.description}</p>
                </div>
                {viewingTemplate.prompt && (
                  <div style={{ padding: 20, borderRadius: 16, background: `${colors.primary}08`, border: `1px solid ${colors.primary}15` }}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.primary, margin: 0, marginBottom: 10 }}>AI Prompt</h4>
                    <p style={{ color: `${colors.primary}cc`, fontSize: 13, lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic', margin: 0 }}>"{viewingTemplate.prompt}"</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 }}>
                <button
                  onClick={() => handleEditFromViewer(viewingTemplate)}
                  style={{ padding: '16px 20px', borderRadius: 14, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.text1, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Edit3 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleUseFixedTemplate(viewingTemplate)}
                  style={{ padding: '16px 20px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 6px 20px ${colors.primary}40`, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 30px ${colors.primary}60`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}40`; }}
                >
                  <ExternalLink size={16} /> Use Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Editor Modal ── */}
      {showEditor && (
        <TemplateEditorModal
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => { setShowEditor(false); setEditingTemplate(null); }}
        />
      )}

      {/* ── Video Generator Modal ── */}
      {showVideoGenerator && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 2000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', padding: 24 
        }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: 1200, maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: 40, borderRadius: 24 }}>
            <button 
              onClick={() => { setShowVideoGenerator(false); setPrefilledVideoData(null); }}
              style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: colors.text2, border: 'none', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={20} />
            </button>
            <VideoAdModule initialData={prefilledVideoData} />
          </div>
        </div>
      )}

      {/* ── Image Generator Modal ── */}
      {showImageGenerator && (
        <ImageGenerator 
          initialPrompt={prefilledImageData} 
          onClose={() => { setShowImageGenerator(false); setPrefilledImageData(null); }} 
        />
      )}
    </div>
  );
};

/* ─────────────────────────── HELPER COMPONENTS ─────────────────────────── */

const TemplateCard = ({ template, index, colors, onView }) => {
  const t = template;
  return (
    <div
      onClick={onView}
      style={{ 
        background: colors.cardBg, 
        border: `1px solid ${colors.border}`, 
        borderRadius: 20,
        overflow: 'hidden', 
        cursor: 'pointer', 
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', 
        animation: `fadeIn 0.5s ease-out ${0.05 * index}s both` 
      }}
      onMouseEnter={e => { 
        e.currentTarget.style.transform = 'translateY(-8px)'; 
        e.currentTarget.style.boxShadow = `0 20px 50px ${colors.primary}20`; 
        e.currentTarget.style.borderColor = colors.primary; 
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.boxShadow = 'none'; 
        e.currentTarget.style.borderColor = colors.border; 
      }}
    >
      <div style={{ height: 220, position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
        <img
          src={t.previewUrl}
          alt={t.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
            {t.mediaType}
          </span>
        </div>
      </div>
      <div style={{ padding: 24 }}>
        <h3 style={{ color: colors.text1, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px 0' }}>{t.name}</h3>
        <p style={{ color: colors.text2, fontSize: 13, lineHeight: 1.5, margin: '0 0 20px 0', height: 40, overflow: 'hidden' }}>{t.description}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: 12, 
            border: 'none', 
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: 14, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <Sparkles size={16} /> View Template
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────── EDITOR MODAL ─────────────────────────── */

const TemplateEditorModal = ({ template, onSave, onClose }) => {
  const { colors } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [objective, setObjective] = useState(template?.objective || 'Direct Response');
  const [visualStyle, setVisualStyle] = useState(template?.visualStyle || 'Modern Minimalism');
  const [validationError, setValidationError] = useState(null);
  const [quotaError, setQuotaError] = useState(null);
  const [evolutionPrompt, setEvolutionPrompt] = useState('');
  const [generateProgress, setGenerateProgress] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: TemplateCategory.PROMOTIONAL,
    mediaType: MediaType.POSTER,
    brandTone: BrandTone.PROFESSIONAL,
    description: '',
    previewUrl: '',
    prompt: '',
    duration: '10',
    audioTracks: [],
    caption: '',
    animationStyle: 'Dynamic Flow',
    ...template
  });

  const cardStyle = {
    background: colors.cardBg,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
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

  const selectInputStyle = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 700,
    color: colors.text2,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 8,
    display: 'block',
  };

  const isQuotaErr = (msg) => /quota|rate.?limit|429|resource.?exhausted|exceeded/i.test(msg || '');

  const handleGenerate = async () => {
    if (!formData.prompt) return alert("Please enter a prompt to generate the asset.");
    setIsGenerating(true);
    setQuotaError(null);
    setGenerateProgress('Validating prompt...');
    try {
      const validation = await validateMarketingPrompt(formData.prompt);
      if (!validation.isValid) {
        setValidationError(validation.reason);
        setIsGenerating(false);
        setGenerateProgress('');
        return;
      }

      setGenerateProgress('Refining creative vision...');
      const refined = await refineMarketingVision(formData.prompt, objective, visualStyle, formData.mediaType);

      setFormData(prev => ({
        ...prev,
        name: prev.name || refined.suggestedTitle,
        description: refined.marketingRationale,
        caption: refined.suggestedCaption,
        category: refined.suggestedCategory,
        prompt: refined.visualPrompt
      }));

      // Show message if using fallback
      if (refined.usingFallback) {
        console.warn("⚠️ Vision refinement using fallback:", refined.message);
      }

      setGenerateProgress(formData.mediaType === MediaType.VIDEO ? 'Generating video (this may take a minute)...' : 'Generating visual asset...');

      let resultUrl = '';
      if (formData.mediaType === MediaType.VIDEO) {
        resultUrl = await generateVideoAsset(refined.visualPrompt, refined.suggestedCaption, formData.animationStyle, formData.audioTracks);
      } else {
        resultUrl = await generateVisualAsset(formData.name || refined.suggestedTitle, refined.visualPrompt, formData.mediaType);
      }
      setFormData(prev => ({ ...prev, previewUrl: resultUrl }));
    } catch (e) {
      if (isQuotaErr(e.message)) {
        setQuotaError("Design generation service is temporarily unavailable. Please try again in a few moments, or upgrade your API plan.");
      } else {
        alert("Generation failed: " + e.message);
      }
    } finally {
      setIsGenerating(false);
      setGenerateProgress('');
    }
  };

  const handleEvolve = async () => {
    if (!formData.previewUrl) return alert("Generate an asset first before evolving.");
    if (!evolutionPrompt) return alert("Please enter instructions for the edit.");
    if (formData.mediaType === MediaType.VIDEO) return alert("Video editing is not supported yet. Re-generate with updated prompt instead.");

    setIsEvolving(true);
    setQuotaError(null);
    try {
      const evolvedUrl = await editVisualAsset(formData.previewUrl, evolutionPrompt);
      setFormData(prev => ({ ...prev, previewUrl: evolvedUrl }));
      setEvolutionPrompt('');
    } catch (e) {
      if (isQuotaErr(e.message)) {
        setQuotaError(e.message);
      } else {
        alert("Edit failed: " + e.message);
      }
    } finally {
      setIsEvolving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', padding: 24, animation: 'fadeIn 0.3s ease-out' }}>

      {/* Validation Error Overlay */}
      {validationError && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.4)', padding: 40, borderRadius: 20, maxWidth: 420, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <ShieldAlert size={48} style={{ color: '#ef4444', marginBottom: 20 }} />
            <h3 style={{ color: colors.text1, fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Content Blocked</h3>
            <p style={{ color: '#f87171', fontSize: 14, fontWeight: 500, marginBottom: 28, lineHeight: 1.5 }}>{validationError}</p>
            <button
              onClick={() => setValidationError(null)}
              style={{ padding: '12px 32px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              OK, Update Prompt
            </button>
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div style={{ ...cardStyle, width: '100%', maxWidth: 1200, maxHeight: '92vh', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>

        {/* Editor Header */}
        <div style={{ padding: '24px 32px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 style={{ color: colors.text1, fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>
                {template?.id ? 'Edit Template' : 'Create New Template'}
              </h2>
              <p style={{ color: colors.text2, fontSize: 13, margin: 0, marginTop: 2 }}>
                AI-powered asset generation
                {template?.category === TemplateCategory.CULTURAL && (
                  <span style={{ marginLeft: 10, padding: '2px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>Cultural Template</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.text2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = colors.text1; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.text2; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quota Error Banner */}
        {quotaError && (
          <div style={{ padding: '14px 32px', background: 'rgba(245,158,11,0.1)', borderBottom: `1px solid rgba(245,158,11,0.3)`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, animation: 'fadeIn 0.3s ease-out' }}>
            <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <p style={{ color: '#fbbf24', fontSize: 13, fontWeight: 600, margin: 0, flex: 1 }}>{quotaError}</p>
            <button
              onClick={() => setQuotaError(null)}
              style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)', background: 'transparent', color: '#fbbf24', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Editor Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }} className="custom-scrollbar">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0 }}>

            {/* ── Left: Preview & AI Controls ── */}
            <div style={{ padding: 32, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }} className="custom-scrollbar">

              {/* Preview */}
              <div style={{ borderRadius: 16, border: `1px solid ${colors.border}`, aspectRatio: '16/10', overflow: 'hidden', position: 'relative', background: '#0f172a', flexShrink: 0 }}>
                {isGenerating || isEvolving ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <Activity size={40} style={{ color: colors.primary, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: colors.text2 }}>{generateProgress || (isEvolving ? 'Applying edits...' : 'Generating...')}</p>
                  </div>
                ) : formData.previewUrl ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {formData.mediaType === MediaType.VIDEO ? (
                      <VideoPlayer url={formData.previewUrl} caption={formData.caption} duration={formData.duration} isAutoPlay={true} />
                    ) : (
                      <img src={formData.previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'rgba(255,255,255,0.02)' }} />
                    )}
                    {/* Remove preview button */}
                    <button
                      onClick={() => setFormData({ ...formData, previewUrl: '' })}
                      style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                    <ImageIcon size={48} style={{ color: colors.text2, marginBottom: 12 }} />
                    <p style={{ fontSize: 12, fontWeight: 600, color: colors.text2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No preview yet</p>
                  </div>
                )}
              </div>

              {/* Evolution (only for images with preview) */}
              {formData.previewUrl && formData.mediaType !== MediaType.VIDEO && (
                <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border}`, animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Wand2 size={16} style={{ color: colors.primary }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit with AI</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={evolutionPrompt}
                      onChange={e => setEvolutionPrompt(e.target.value)}
                      placeholder="e.g., Make the colors warmer..."
                    />
                    <button
                      onClick={handleEvolve}
                      disabled={isEvolving || !evolutionPrompt}
                      style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: colors.primary, color: '#fff', fontWeight: 700, fontSize: 13, cursor: isEvolving || !evolutionPrompt ? 'not-allowed' : 'pointer', opacity: isEvolving || !evolutionPrompt ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                    >
                      {isEvolving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Objective & Style */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Objective</label>
                  <select style={selectInputStyle} value={objective} onChange={e => setObjective(e.target.value)}>
                    <option value="Direct Response">Direct Response (Sales)</option>
                    <option value="Brand Awareness">Brand Awareness</option>
                    <option value="Social Engagement">Social Engagement</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Visual Style</label>
                  <select style={selectInputStyle} value={visualStyle} onChange={e => setVisualStyle(e.target.value)}>
                    <option value="Modern Minimalism">Modern Minimalism</option>
                    <option value="Cyberpunk Tech">Cyberpunk Tech (Neon)</option>
                    <option value="Luxury Organic">Luxury Organic (Gold)</option>
                    <option value="Vibrant Retro">Vibrant Retro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Right: Form Fields ── */}
            <div style={{ padding: 32, overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="custom-scrollbar">
              <form onSubmit={e => { e.preventDefault(); onSave({ ...formData, objective, visualStyle }); }} style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

                {/* Template Name */}
                <div>
                  <label style={labelStyle}>Template Name</label>
                  <input
                    required
                    style={{ ...inputStyle, fontSize: 18, fontWeight: 700, padding: '14px 16px' }}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter template name..."
                  />
                </div>

                {/* Type + Caption Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Media Type</label>
                    <select style={selectInputStyle} value={formData.mediaType} onChange={e => setFormData({ ...formData, mediaType: e.target.value })}>
                      {Object.values(MediaType).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Caption / CTA</label>
                    <input
                      style={inputStyle}
                      value={formData.caption}
                      onChange={e => setFormData({ ...formData, caption: e.target.value })}
                      placeholder="e.g., Shop Now"
                    />
                  </div>
                </div>

                {/* Video-specific fields */}
                {formData.mediaType === MediaType.VIDEO && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, animation: 'fadeIn 0.3s ease-out' }}>
                    <div>
                      <label style={labelStyle}>Duration (sec)</label>
                      <input
                        type="number"
                        style={inputStyle}
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Animation Style</label>
                      <select style={selectInputStyle} value={formData.animationStyle} onChange={e => setFormData({ ...formData, animationStyle: e.target.value })}>
                        <option value="Dynamic Flow">Dynamic Flow</option>
                        <option value="Macro Rotation">Macro Rotation</option>
                        <option value="Cinematic Pan">Cinematic Pan</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Category + Tone Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={selectInputStyle} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      {Object.values(TemplateCategory).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1).replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Brand Tone</label>
                    <select style={selectInputStyle} value={formData.brandTone} onChange={e => setFormData({ ...formData, brandTone: e.target.value })}>
                      {Object.values(BrandTone).map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    required
                    style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the purpose of this template..."
                  />
                </div>

                {/* AI Prompt + Generate */}
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} style={{ color: colors.primary }} /> AI Generation Prompt
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <textarea
                      style={{ ...inputStyle, flex: 1, height: 100, resize: 'vertical' }}
                      value={formData.prompt}
                      onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                      placeholder="Describe the visual asset you want to generate..."
                    />
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating || !formData.prompt}
                      style={{ width: 80, borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: isGenerating || !formData.prompt ? 'not-allowed' : 'pointer', opacity: isGenerating || !formData.prompt ? 0.4 : 1, boxShadow: `0 6px 20px ${colors.primary}40`, transition: 'all 0.2s' }}
                    >
                      {isGenerating ? <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={24} />}
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Generate</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{ flex: 1, padding: '16px 20px', borderRadius: 14, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.text2, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 2, padding: '16px 20px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: `0 6px 20px ${colors.primary}40`, transition: 'all 0.3s', letterSpacing: '0.02em' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 30px ${colors.primary}60`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}40`; }}
                  >
                    {template?.id ? 'Save Changes' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
