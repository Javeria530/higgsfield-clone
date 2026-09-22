import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Navbar from '../components/Navbar.jsx';
import { BrandTone } from '../types.js';

const ManageProfile = ({ onBack, onNavigate }) => {
  const { user, users, updateProfile } = useAuth();
  const { colors, mode } = useTheme();

  // Access control: require authenticated user; deny head/admin users — they should use Team Management instead
  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-6 md:px-12 pb-20" style={{ backgroundColor: colors.bg1 }}>
        <Navbar onNavigate={onNavigate} />
        <div className="max-w-4xl mx-auto mt-8 text-center py-20" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, padding: 40, borderRadius: 20 }}>
          <h2 className="text-2xl font-black mb-2" style={{ color: colors.text1 }}>Access Denied</h2>
          <p style={{ color: colors.text2 }}>Please sign in to manage your profile.</p>
          <button onClick={onBack} className="mt-6 px-6 py-3 rounded-xl font-black" style={{ backgroundColor: colors.primary, color: '#fff' }}>Go Back</button>
        </div>
      </div>
    );
  }

  // Deny head users — guide them to Team Management
  if (user?.isHeadUser) {
    return (
      <div className="min-h-screen pt-24 px-6 md:px-12 pb-20" style={{ backgroundColor: colors.bg1 }}>
        <Navbar onNavigate={onNavigate} />
        <div className="max-w-4xl mx-auto mt-8 text-center py-20" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, padding: 40, borderRadius: 20 }}>
          <h2 className="text-2xl font-black mb-2" style={{ color: colors.text1 }}>Access Denied</h2>
          <p style={{ color: colors.text2 }}>Profile management is not available for admin/head users. Please use Team Management to manage user profiles and team settings.</p>
          <div className="mt-6" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => onNavigate && onNavigate('manage-users')} className="px-6 py-3 rounded-xl font-black" style={{ backgroundColor: colors.primary, color: '#fff' }}>Open Team Management</button>
            <button onClick={onBack} className="px-6 py-3 rounded-xl font-black" style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: colors.text1 }}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const [profile, setProfile] = useState(() => ({
    brandName: user?.organizationName || '',
    brandLogo: user?.brandLogo || '',
    contactEmail: user?.email || '',
    phone: user?.phone || '',
    brandColor: user?.brandColor || '#0ea5e9',
    preferredTone: user?.preferredTone || BrandTone.PROFESSIONAL,
    defaultCTA: user?.defaultCTA || 'Shop Now',
  }));

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Refresh local profile when global user object changes (e.g., admin updated)
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      brandName: user?.organizationName || prev.brandName,
      brandLogo: user?.brandLogo || prev.brandLogo,
      contactEmail: user?.email || prev.contactEmail,
      phone: user?.phone || prev.phone,
      brandColor: user?.brandColor || prev.brandColor,
      preferredTone: user?.preferredTone || prev.preferredTone,
      defaultCTA: user?.defaultCTA || prev.defaultCTA,
    }));
  }, [user, users]);

  const validate = () => {
    const errs = {};
    if (!profile.brandName || profile.brandName.trim().length < 2) errs.brandName = 'Brand name required';
    if (!profile.contactEmail || !/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(profile.contactEmail)) errs.contactEmail = 'Valid email required';
    if (errors.brandLogo) errs.brandLogo = errors.brandLogo;
    return errs;
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Valid image types only (no PDFs)
    const validImageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    const invalidTypes = ['application/pdf'];
    
    // Check if it's a PDF
    if (invalidTypes.includes(f.type) || f.name?.toLowerCase().endsWith('.pdf')) {
      setErrors(prev => ({ ...prev, brandLogo: 'PDF files are not allowed. Please use PNG, JPEG, WebP, or SVG images.' }));
      return;
    }
    
    // Validate type
    if (!validImageTypes.includes(f.type)) {
      setErrors(prev => ({ ...prev, brandLogo: 'Only image files (PNG/JPEG/WebP/SVG) are allowed. PDFs and other file types are not supported.' }));
      return;
    }
    
    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      setErrors(prev => ({ ...prev, brandLogo: 'Image must be smaller than 5MB' }));
      return;
    }
    
    // Clear previous logo error
    setErrors(prev => ({ ...prev, brandLogo: undefined }));

    const reader = new FileReader();
    reader.onloadend = () => setProfile(p => ({ ...p, brandLogo: reader.result }));
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSaving(true);
    try {
      // Map our fields to persisted user shape
      const payload = {
        organizationName: profile.brandName,
        brandLogo: profile.brandLogo,
        phone: profile.phone,
        brandColor: profile.brandColor,
        preferredTone: profile.preferredTone,
        defaultCTA: profile.defaultCTA,
        // contact email is primary email; changing email is allowed here for convenience
        email: profile.contactEmail,
      };
      // updateProfile is synchronous in the context, but wrap in Promise.resolve to handle future async
      await Promise.resolve(updateProfile(user.id, payload));
      setMessage('Profile updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Save failed: ' + (e.message || String(e)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 pb-20 transition-all duration-500" style={{ backgroundColor: colors.bg1 }}>
      <Navbar onNavigate={onNavigate} />

      <div className="max-w-4xl mx-auto mt-8" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, padding: 20, borderRadius: 20 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black" style={{ color: colors.text1 }}>Manage Profile</h1>
            <p style={{ color: colors.text2 }}>Keep your brand identity consistent across all SmartAds generation tools.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="px-4 py-2 rounded-xl" style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text1 }}>Back</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-3 rounded-xl font-black" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.tertiary})`, color: '#fff' }}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-sm font-bold uppercase" style={{ color: colors.text1 }}>Brand Name</label>
            <input value={profile.brandName} onChange={e => setProfile(p => ({ ...p, brandName: e.target.value }))} className="w-full p-4 rounded-xl mt-2" style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: colors.text1 }} />
            {errors.brandName && <p className="text-sm text-red-400 mt-2">{errors.brandName}</p>}

            <label className="text-sm font-bold uppercase" style={{ color: colors.text1 }}>Contact Email</label>
            <input value={profile.contactEmail} onChange={e => setProfile(p => ({ ...p, contactEmail: e.target.value }))} className="w-full p-4 rounded-xl mt-2" style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: colors.text1 }} />
            {errors.contactEmail && <p className="text-sm text-red-400 mt-2">{errors.contactEmail}</p>}

            <label className="text-sm font-bold uppercase mt-4 block" style={{ color: colors.text1 }}>Phone</label>
            <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full p-4 rounded-xl mt-2" style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: colors.text1 }} />

            <label className="text-sm font-bold uppercase mt-4 block" style={{ color: colors.text1 }}>Preferred Tone</label>
            <select value={profile.preferredTone} onChange={e => setProfile(p => ({ ...p, preferredTone: e.target.value }))} className="w-full p-4 rounded-xl mt-2" style={{ backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${colors.border}`, color: colors.text1 }}>
              {Object.values(BrandTone).map(bt => <option key={bt} value={bt} style={{ backgroundColor: mode === 'dark' ? '#1a1a2e' : '#fff', color: mode === 'dark' ? '#fff' : '#000' }}>{bt}</option>)}
            </select>

            <label className="text-sm font-bold uppercase mt-4 block" style={{ color: colors.text1 }}>Default CTA</label>
            <input value={profile.defaultCTA} onChange={e => setProfile(p => ({ ...p, defaultCTA: e.target.value }))} className="w-full p-4 rounded-xl mt-2" style={{ backgroundColor: 'transparent', border: `1px solid ${colors.border}`, color: colors.text1 }} />

            <label className="text-sm font-bold uppercase mt-4 block" style={{ color: colors.text1 }}>Brand Color</label>
            <input type="color" value={profile.brandColor} onChange={e => setProfile(p => ({ ...p, brandColor: e.target.value }))} className="mt-2 rounded-xl p-2" />
          </div>

          <div>
            <label className="text-sm font-bold uppercase" style={{ color: colors.text1 }}>Brand Logo</label>
            <div className="mt-2 rounded-2xl border p-4 flex items-center gap-4" style={{ border: `1px dashed ${colors.border}` }}>
              <div style={{ width: 120, height: 120, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                {profile.brandLogo ? <img src={profile.brandLogo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.text2 }}>No Logo</div>}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" onChange={handleFile} />
                {errors.brandLogo && <p className="text-sm text-red-400 mt-2">{errors.brandLogo}</p>}
                <p className="text-sm opacity-50 mt-2" style={{ color: colors.text2 }}>PNG or JPEG recommended. Uploaded image will be used as brand emblem across generated assets. Max 5MB.</p>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-black" style={{ color: colors.text1 }}>Preview</h4>
              <div className="mt-4 p-6 rounded-xl" style={{ background: `linear-gradient(135deg, ${profile.brandColor}22, ${colors.cardBg})`, border: `1px solid ${colors.border}`, color: colors.text1 }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', background: '#fff' }}>{profile.brandLogo ? <img src={profile.brandLogo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : null}</div>
                  <div>
                    <div className="font-black text-lg" style={{ color: colors.text1 }}>{profile.brandName || 'Your Brand'}</div>
                    <div className="text-sm" style={{ color: colors.text2 }}>{profile.defaultCTA || 'Shop Now'}</div>
                  </div>
                </div>
              </div>
            </div>

            {message && <p className="mt-4 font-bold" style={{ color: colors.success }}>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProfile;