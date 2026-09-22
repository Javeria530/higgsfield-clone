import React, { useState, useRef } from 'react';
import { voiceAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Mic, Loader2, Play, Pause, Download, Volume2, Music, Sparkles } from "lucide-react";

const VoiceoverModule = () => {
  const { colors, mode } = useTheme();
  const [script, setScript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleGenerate = async () => {
    if (!script.trim()) {
      alert("Please enter a script first.");
      return;
    }

    setLoading(true);
    setAudioUrl('');
    setIsPlaying(false);

    try {
      const res = await voiceAPI.generateVoice({ text: script });
      if (res.success && res.audio_url) {
        setAudioUrl(res.audio_url);
      } else {
        throw new Error(res.error || "Failed to generate audio.");
      }
    } catch (err) {
      console.error("Voiceover generation error:", err);
      alert("Voice Generation Failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `smartads-voiceover-${Date.now()}.mp3`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const animationStyles = `
    @keyframes voiceWave {
      0%, 100% { height: 10px; }
      50% { height: 30px; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        color: colors.text1,
        fontFamily: 'Poppins, Arial, sans-serif',
        animation: 'fadeIn 0.5s ease-out',
      }}
    >
      <style>{animationStyles}</style>

      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h2 style={{ fontWeight: 700, fontSize: '2.2rem', marginBottom: 8, color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Mic size={32} /> Voiceover Maker
        </h2>
        <p style={{ color: colors.text2, fontSize: '1.1rem', opacity: 0.8 }}>Professional AI voice narrations powered by Eleven Labs</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Upper Card: Audio Player / Placeholder */}
        <div style={{
          background: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
          borderRadius: 20,
          padding: '40px 20px',
          border: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
          {audioUrl ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <div key={i} style={{
                    width: 4,
                    background: colors.primary,
                    borderRadius: 2,
                    animation: isPlaying ? `voiceWave ${0.5 + Math.random()}s ease-in-out infinite` : 'none',
                    height: isPlaying ? 30 : 10,
                    opacity: 0.7 + (i * 0.03)
                  }} />
                ))}
              </div>
              
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)} 
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  onClick={togglePlayback}
                  style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: colors.primary, border: 'none',
                    color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 8px 20px ${colors.primary}40`
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                </button>

                <button
                  onClick={handleDownload}
                  style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                    border: 'none', color: colors.text1,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = mode === 'dark' ? 'rgba(255,255,255,0.2)' : '#CBD5E1'}
                  onMouseLeave={e => e.currentTarget.style.background = mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}
                >
                  <Download size={28} />
                </button>
              </div>
              <p style={{ fontSize: '0.9rem', color: colors.text2, fontWeight: 500 }}>Voiceover Ready</p>
            </div>
          ) : loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: colors.primary }} />
              <p style={{ fontSize: '1rem', color: colors.text2 }}>Generating natural voice narrations...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5, gap: 15 }}>
              <div style={{ position: 'relative' }}>
                <Volume2 size={64} color={colors.text2} />
                <Sparkles size={24} color={colors.primary} style={{ position: 'absolute', top: -5, right: -5 }} />
              </div>
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Your audio will appear here</p>
            </div>
          )}
        </div>

        {/* Script Input Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 600, fontSize: '1rem', color: colors.text1 }}>Enter Your Script</label>
            <span style={{ fontSize: '0.85rem', color: colors.text2, opacity: 0.7 }}>{script.length} / 5000 characters</span>
          </div>
          
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Type or paste the script you want the AI to read..."
            style={{
              width: '100%',
              minHeight: '180px',
              padding: '20px',
              borderRadius: 16,
              background: colors.bg2,
              border: `2px solid ${colors.border}`,
              color: colors.text1,
              fontSize: '1rem',
              lineHeight: '1.6',
              transition: 'all 0.3s ease',
              outline: 'none',
              resize: 'vertical'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary;
              e.target.style.boxShadow = `0 0 0 4px ${colors.primary}15`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !script.trim()}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: 16,
            background: loading || !script.trim() ? `${colors.primary}60` : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: (loading || !script.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: (loading || !script.trim()) ? 'none' : `0 10px 25px ${colors.primary}30`
          }}
          onMouseEnter={e => {
            if (!loading && script.trim()) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 15px 30px ${colors.primary}50`;
            }
          }}
          onMouseLeave={e => {
            if (!loading && script.trim()) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 10px 25px ${colors.primary}30`;
            }
          }}
        >
          {loading ? (
            <>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              Processing...
            </>
          ) : (
            <>
              <Music size={24} />
              Generate Voiceover
            </>
          )}
        </button>
        
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: colors.text2, opacity: 0.6, marginTop: 10 }}>
          Tip: Use punctuation like commas (,) and periods (.) for more natural pauses.
        </p>

      </div>
    </div>
  );
};

export default VoiceoverModule;
