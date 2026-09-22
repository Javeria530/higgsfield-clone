import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  Clock3,
  Download,
  Film,
  Grid2X2,
  Image as ImageIcon,
  Layers3,
  Menu,
  Mic2,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from 'lucide-react';
import { designAPI, templateAPI, videoAdAPI } from '../services/api.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
const galleryKey = 'higgsfield-creation-gallery';

const inspiration = [
  { title: 'Glass skin / liquid chrome', meta: 'Image · Editorial', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=85' },
  { title: 'The quiet luxury campaign', meta: 'Video · 16:9', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85' },
  { title: 'Neon after midnight', meta: 'Image · Concept', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85' },
  { title: 'Objects with a point of view', meta: 'Video · Product', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85' },
];

const templates = [
  { title: 'Product film', type: 'Video', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85' },
  { title: 'Material studies', type: 'Image', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85' },
  { title: 'Editorial portrait', type: 'Image', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=85' },
  { title: 'Motion type', type: 'Video', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85' },
];

const readGallery = () => {
  try {
    return JSON.parse(localStorage.getItem(galleryKey) || '[]');
  } catch {
    return [];
  }
};

const saveGallery = (items) => localStorage.setItem(galleryKey, JSON.stringify(items));

function Logo() {
  return <div className="brand"><span className="brand-mark"><Sparkles size={15} /></span><span>higgsfield</span></div>;
}

function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const items = [
    { id: 'explore', label: 'Explore', icon: Grid2X2 },
    { id: 'image', label: 'Image studio', icon: ImageIcon },
    { id: 'video', label: 'Video studio', icon: Film },
    { id: 'templates', label: 'Effects & templates', icon: WandSparkles },
    { id: 'history', label: 'My creations', icon: Clock3 },
  ];
  return <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <div className="sidebar-top"><Logo /><button className="icon-button sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle navigation"><Menu size={18} /></button></div>
    <div className="workspace-switch"><span className="workspace-avatar">J</span><span className="workspace-copy"><strong>Javeria's studio</strong><small>Personal workspace</small></span><ChevronDown size={15} /></div>
    <nav className="nav-list">{items.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}><Icon size={18} /><span>{label}</span></button>)}</nav>
    <div className="sidebar-spacer" />
    <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={16} /></div><strong>Make something impossible</strong><p>Unlock more generations and models.</p><button onClick={() => setPage('image')}>Explore plans <ArrowUpRight size={14} /></button></div>
    <div className="sidebar-footer"><button className="nav-item"><Settings2 size={18} /><span>Settings</span></button><div className="profile-row"><span className="profile-avatar">J</span><span className="profile-copy"><strong>Javeria</strong><small>Free plan</small></span><MoreHorizontal size={17} /></div></div>
  </aside>;
}

function Topbar({ page, onMenu }) {
  const labels = { explore: 'Explore', image: 'Image studio', video: 'Video studio', templates: 'Effects & templates', history: 'My creations' };
  return <header className="topbar"><button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open navigation"><Menu size={19} /></button><div><span className="eyebrow">Workspace</span><h1>{labels[page]}</h1></div><div className="topbar-actions"><button className="search-button"><Search size={17} /><span>Search</span><kbd>⌘ K</kbd></button><button className="credits"><Sparkles size={14} /> 120 credits</button><button className="avatar-button">J</button></div></header>;
}

function PromptComposer({ value, onChange, placeholder, onUpload, fileName, setFileName }) {
  return <div className="prompt-composer"><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} /><div className="prompt-toolbar"><label className="tool-button"><Upload size={16} /> Reference{fileName ? `: ${fileName}` : ''}<input type="file" accept="image/*,video/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setFileName(file.name); onUpload(file); } }} hidden /></label><button className="tool-button"><Mic2 size={16} /> Voice prompt</button><span className="prompt-count">{value.length}/2000</span></div></div>;
}

function SettingSelect({ label, value, options, onChange }) {
  return <label className="setting"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>;
}

function StudioHeader({ icon: Icon, title, description }) {
  return <div className="studio-header"><div className="studio-icon"><Icon size={20} /></div><div><h2>{title}</h2><p>{description}</p></div></div>;
}

function LoadingState({ type }) {
  return <div className="loading-state"><div className="loading-orbit"><Sparkles size={20} /></div><strong>Creating your {type}</strong><span>Good things take a moment. Keep this tab open.</span><div className="progress-line"><i /></div></div>;
}

function ResultPanel({ result, type, onDownload }) {
  if (!result) return <div className="empty-result"><div className="empty-glyph"><Sparkles size={25} /></div><strong>Your creation will appear here</strong><span>Describe a visual direction and let the studio take it from there.</span></div>;
  return <div className="result-panel"><div className="result-media">{type === 'video' ? <video src={result.url} controls autoPlay loop /> : <img src={result.url} alt="Generated creation" />}</div><div className="result-footer"><div><span className="result-label">Generated result</span><strong>{result.prompt?.slice(0, 60) || 'Untitled creation'}</strong></div><button className="primary-button small" onClick={() => onDownload(result.url)}><Download size={15} /> Download</button></div></div>;
}

function ImageStudio({ onSaved }) {
  const [prompt, setPrompt] = useState('A sculptural perfume bottle floating in a pool of deep cobalt water, soft studio light, premium fashion campaign');
  const [model, setModel] = useState('Imagen 4');
  const [ratio, setRatio] = useState('Portrait 3:4');
  const [style, setStyle] = useState('Cinematic');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [reference, setReference] = useState(null);
  const generate = async () => {
    if (!prompt.trim()) return setError('Write a prompt before generating.');
    setBusy(true); setError('');
    try {
      const response = await designAPI.generateDesign({ type: 'poster', brandName: 'Higgsfield Studio', description: prompt, style: `${style}, ${model}, ${ratio}`, colors: [] });
      const next = { id: crypto.randomUUID(), url: response.url, type: 'image', prompt, createdAt: new Date().toISOString() };
      setResult(next); const gallery = [next, ...readGallery()]; saveGallery(gallery); onSaved(gallery);
    } catch (generationError) { setError(generationError.message || 'Image generation failed. Check your backend connection.'); }
    finally { setBusy(false); }
  };
  return <div className="studio-page"><StudioHeader icon={ImageIcon} title="Image studio" description="Turn a thought into a visual world." /><div className="studio-grid"><section className="studio-controls"><PromptComposer value={prompt} onChange={setPrompt} placeholder="Describe the image you want to create..." onUpload={setReference} fileName={fileName} setFileName={setFileName} /><div className="reference-note">{reference ? <><Upload size={15} /> {fileName} is ready to guide the generation</> : <><Layers3 size={15} /> Add a reference to keep a look, object, or character consistent</>}</div><div className="settings-grid"><SettingSelect label="Model" value={model} onChange={setModel} options={['Imagen 4', 'Flux Pro', 'SmartAds image']} /><SettingSelect label="Format" value={ratio} onChange={setRatio} options={['Portrait 3:4', 'Square 1:1', 'Landscape 16:9']} /><SettingSelect label="Look" value={style} onChange={setStyle} options={['Cinematic', 'Editorial', 'Dreamy', 'Minimal']} /></div>{error && <div className="error-banner"><X size={16} />{error}</div>}<button className="generate-button" onClick={generate} disabled={busy}>{busy ? <><span className="button-spinner" /> Creating image...</> : <><Sparkles size={17} /> Generate image</>}</button><div className="tip-row"><span>Tip</span> Be specific about light, material, lens, and mood.</div></section><section className="result-column">{busy ? <LoadingState type="image" /> : <ResultPanel result={result} type="image" onDownload={(url) => window.open(url, '_blank', 'noopener,noreferrer')} />}</section></div></div>;
}

function VideoStudio({ onSaved }) {
  const [prompt, setPrompt] = useState('A chrome sports car driving through a rain-soaked Tokyo street at night, cinematic camera movement, reflections and neon');
  const [model, setModel] = useState('Veo 3.1');
  const [ratio, setRatio] = useState('Landscape 16:9');
  const [motion, setMotion] = useState('Cinematic');
  const [result, setResult] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [fileName, setFileName] = useState('');
  const generate = async () => { if (!prompt.trim()) return setError('Write a prompt before generating.'); setBusy(true); setError(''); try { const response = await videoAdAPI.generateVideo({ prompt }); const next = { id: crypto.randomUUID(), url: response.url || response.videoUrl || response.cloudinaryUrl, type: 'video', prompt, createdAt: new Date().toISOString() }; if (!next.url) throw new Error('The backend returned no video URL.'); setResult(next); const gallery = [next, ...readGallery()]; saveGallery(gallery); onSaved(gallery); } catch (generationError) { setError(generationError.message || 'Video generation failed.'); } finally { setBusy(false); } };
  return <div className="studio-page"><StudioHeader icon={Film} title="Video studio" description="Give your ideas movement, atmosphere, and a point of view." /><div className="studio-grid"><section className="studio-controls"><PromptComposer value={prompt} onChange={setPrompt} placeholder="Describe the story, camera, movement, and mood..." onUpload={() => {}} fileName={fileName} setFileName={setFileName} /><div className="enhance-row"><button className="secondary-button" onClick={async () => { try { const data = await videoAdAPI.enhancePrompt({ productName: 'Creative concept', productDescription: prompt, productCategory: 'Editorial', keyFeatures: motion }); setPrompt(data.enhancedPrompt || prompt); } catch (enhanceError) { setError(enhanceError.message || 'Prompt enhancement failed.'); } }}><WandSparkles size={15} /> Enhance prompt</button><span>{fileName || 'Veo generation can take a few minutes'}</span></div><div className="settings-grid"><SettingSelect label="Model" value={model} onChange={setModel} options={['Veo 3.1', 'Veo fast', 'SmartAds video']} /><SettingSelect label="Format" value={ratio} onChange={setRatio} options={['Landscape 16:9', 'Portrait 9:16', 'Square 1:1']} /><SettingSelect label="Motion" value={motion} onChange={setMotion} options={['Cinematic', 'Product reveal', 'Handheld', 'Slow motion']} /></div>{error && <div className="error-banner"><X size={16} />{error}</div>}<button className="generate-button" onClick={generate} disabled={busy}>{busy ? <><span className="button-spinner" /> Rendering video...</> : <><Film size={17} /> Generate video</>}</button><div className="tip-row"><span>Tip</span> Describe the camera movement and the feeling of the final frame.</div></section><section className="result-column">{busy ? <LoadingState type="video" /> : <ResultPanel result={result} type="video" onDownload={(url) => window.open(url, '_blank', 'noopener,noreferrer')} />}</section></div></div>;
}

function Explore({ setPage }) {
  return <div className="page-content"><div className="hero-banner"><div><span className="eyebrow accent">THE NEW CREATIVE SPACE</span><h2>Make images that<br /><em>feel like something.</em></h2><p>Explore a world of visual possibilities, then make one of your own.</p><button className="primary-button" onClick={() => setPage('image')}>Start creating <ArrowUpRight size={16} /></button></div><div className="hero-art"><div className="hero-orb" /><span>01 / 04</span></div></div><div className="section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Find your next direction</h2></div><button className="text-button">View all <ArrowUpRight size={15} /></button></div><div className="inspiration-grid">{inspiration.map((item) => <article className="inspiration-card" key={item.title}><img src={item.image} alt="" /><div className="card-shade" /><div className="card-copy"><span>{item.meta}</span><strong>{item.title}</strong></div><button className="card-action" onClick={() => setPage(item.meta.startsWith('Video') ? 'video' : 'image')} aria-label={`Use ${item.title}`}><ArrowUpRight size={17} /></button></article>)}</div><div className="section-heading compact"><div><span className="eyebrow">QUICK START</span><h2>Start with a template</h2></div><button className="text-button" onClick={() => setPage('templates')}>Browse templates <ArrowUpRight size={15} /></button></div><div className="template-strip">{templates.slice(0, 3).map((item) => <button className="template-mini" key={item.title} onClick={() => setPage(item.type === 'Video' ? 'video' : 'image')}><img src={item.image} alt="" /><span><small>{item.type}</small><strong>{item.title}</strong></span><ArrowUpRight size={15} /></button>)}</div></div>;
}

function Templates({ setPage }) {
  const [remote, setRemote] = useState([]); const [error, setError] = useState('');
  useEffect(() => { templateAPI.getAll().then((items) => setRemote(Array.isArray(items) ? items : [])).catch(() => setError('Showing curated templates. Connect the backend to load your library.')); }, []);
  return <div className="page-content"><div className="page-intro"><div><span className="eyebrow accent">CREATIVE TOOLS</span><h2>Effects & templates</h2><p>Start with a strong point of view, then make it yours.</p></div><button className="primary-button" onClick={() => setPage('image')}><Plus size={16} /> New creation</button></div>{error && <div className="notice-banner">{error}</div>}<div className="template-gallery">{templates.map((item) => <article className="gallery-card" key={item.title}><img src={item.image} alt="" /><div className="gallery-card-copy"><span>{item.type}</span><strong>{item.title}</strong><button className="secondary-button" onClick={() => setPage(item.type === 'Video' ? 'video' : 'image')}>Use template <ArrowUpRight size={14} /></button></div></article>)}{remote.slice(0, 4).map((item, index) => <article className="gallery-card" key={item._id || index}><img src={item.previewUrl || item.cloudinaryUrl || templates[index % templates.length].image} alt="" /><div className="gallery-card-copy"><span>Library</span><strong>{item.name || item.title || 'Saved template'}</strong><button className="secondary-button" onClick={() => setPage('image')}>Use template <ArrowUpRight size={14} /></button></div></article>)}</div></div>;
}

function History({ gallery, setPage }) {
  return <div className="page-content"><div className="page-intro"><div><span className="eyebrow accent">YOUR WORK</span><h2>My creations</h2><p>Everything you make, ready to revisit.</p></div><button className="primary-button" onClick={() => setPage('image')}><Plus size={16} /> New creation</button></div>{gallery.length ? <div className="history-grid">{gallery.map((item) => <article className="history-card" key={item.id}><div className="history-media">{item.type === 'video' ? <video src={item.url} muted /> : <img src={item.url} alt="" />}</div><div className="history-copy"><span>{item.type} · {new Date(item.createdAt).toLocaleDateString()}</span><strong>{item.prompt?.slice(0, 48) || 'Untitled creation'}</strong><button className="icon-button"><MoreHorizontal size={17} /></button></div></article>)}</div> : <div className="large-empty"><Clock3 size={25} /><h3>Your gallery is waiting</h3><p>Generate an image or video and it will be saved here automatically.</p><button className="secondary-button" onClick={() => setPage('image')}>Create your first piece <ArrowUpRight size={15} /></button></div>}</div>;
}

export default function HiggsfieldApp() {
  const [page, setPage] = useState('explore'); const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false); const [gallery, setGallery] = useState(readGallery);
  const go = (next) => { setPage(next); setMobileOpen(false); };
  return <div className="app-shell"><div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}><Sidebar page={page} setPage={go} collapsed={false} setCollapsed={() => setMobileOpen(false)} /></div><Sidebar page={page} setPage={go} collapsed={collapsed} setCollapsed={setCollapsed} /><main className="main-area"><Topbar page={page} onMenu={() => setMobileOpen(true)} />{page === 'explore' && <Explore setPage={go} />}{page === 'image' && <ImageStudio onSaved={setGallery} />}{page === 'video' && <VideoStudio onSaved={setGallery} />}{page === 'templates' && <Templates setPage={go} />}{page === 'history' && <History gallery={gallery} setPage={go} />}</main></div>;
}