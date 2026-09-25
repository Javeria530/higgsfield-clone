import { createElement, useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  Clock3,
  Download,
  Film,
  Grid2X2,
  Image as ImageIcon,
  Layers3,
  Mic2,
  MoreHorizontal,
  Plus,
  Sparkles,
  Sun,
  Upload,
  WandSparkles,
  X,
  Moon,
} from 'lucide-react';
import { designAPI, templateAPI, videoAdAPI } from '../services/api.js';
import Footer from './common/Footer.jsx';

function Logo() {
  return <div className="brand"><span className="brand-mark"><Sparkles size={15} /></span><span>Javeria's studio</span></div>;
}

function Topbar({ page, onNavigate, isDark, onToggleTheme }) {
  const labels = { explore: 'Explore', image: 'Image studio', video: 'Video studio', templates: 'Effects & templates', history: 'My creations' };
  const navItems = [
    { id: 'explore', label: 'Explore', icon: Grid2X2 },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: Film },
    { id: 'templates', label: 'Templates', icon: WandSparkles },
    { id: 'history', label: 'Library', icon: Clock3 },
  ];
  return <header className="topbar"><div className="topbar-brand"><Logo /><div className="topbar-title"><span className="eyebrow">Javeria / workspace</span><h1>{labels[page]}</h1></div></div><nav className="topbar-nav" aria-label="Workspace navigation">{navItems.map((item) => <button key={item.id} className={`topbar-nav-item ${page === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)} title={item.label} aria-label={item.label}>{createElement(item.icon, { size: 16 })}<span>{item.label}</span></button>)}</nav><div className="topbar-actions"><button className="theme-toggle" onClick={onToggleTheme} aria-label={isDark ? 'Use light mode' : 'Use dark mode'}>{isDark ? <Sun size={17} /> : <Moon size={17} />}</button><button className="avatar-button">J</button></div></header>;
}

function PromptComposer({ value, onChange, placeholder, onUpload, fileName, setFileName }) {
  return <div className="prompt-composer"><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} /><div className="prompt-toolbar"><label className="tool-button"><Upload size={16} /> Reference{fileName ? `: ${fileName}` : ''}<input type="file" accept="image/*,video/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setFileName(file.name); onUpload(file); } }} hidden /></label><button className="tool-button"><Mic2 size={16} /> Voice prompt</button><span className="prompt-count">{value.length}/2000</span></div></div>;
}

function SettingSelect({ label, value, options, onChange }) {
  return <label className="setting"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>;
}

function StudioHeader({ icon, title, description }) {
  return <div className="studio-header"><div className="studio-icon">{createElement(icon, { size: 20 })}</div><div><h2>{title}</h2><p>{description}</p></div></div>;
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
      setResult(next); onSaved(next);
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
  const generate = async () => { if (!prompt.trim()) return setError('Write a prompt before generating.'); setBusy(true); setError(''); try { const response = await videoAdAPI.generateVideo({ prompt }); const next = { id: crypto.randomUUID(), url: response.url || response.videoUrl || response.cloudinaryUrl, type: 'video', prompt, createdAt: new Date().toISOString() }; if (!next.url) throw new Error('The backend returned no video URL.'); setResult(next); onSaved(next); } catch (generationError) { setError(generationError.message || 'Video generation failed.'); } finally { setBusy(false); } };
  return <div className="studio-page"><StudioHeader icon={Film} title="Video studio" description="Give your ideas movement, atmosphere, and a point of view." /><div className="studio-grid"><section className="studio-controls"><PromptComposer value={prompt} onChange={setPrompt} placeholder="Describe the story, camera, movement, and mood..." onUpload={() => {}} fileName={fileName} setFileName={setFileName} /><div className="enhance-row"><button className="secondary-button" onClick={async () => { try { const data = await videoAdAPI.enhancePrompt({ productName: 'Creative concept', productDescription: prompt, productCategory: 'Editorial', keyFeatures: motion }); setPrompt(data.enhancedPrompt || prompt); } catch (enhanceError) { setError(enhanceError.message || 'Prompt enhancement failed.'); } }}><WandSparkles size={15} /> Enhance prompt</button><span>{fileName || 'Veo generation can take a few minutes'}</span></div><div className="settings-grid"><SettingSelect label="Model" value={model} onChange={setModel} options={['Veo 3.1', 'Veo fast', 'SmartAds video']} /><SettingSelect label="Format" value={ratio} onChange={setRatio} options={['Landscape 16:9', 'Portrait 9:16', 'Square 1:1']} /><SettingSelect label="Motion" value={motion} onChange={setMotion} options={['Cinematic', 'Product reveal', 'Handheld', 'Slow motion']} /></div>{error && <div className="error-banner"><X size={16} />{error}</div>}<button className="generate-button" onClick={generate} disabled={busy}>{busy ? <><span className="button-spinner" /> Rendering video...</> : <><Film size={17} /> Generate video</>}</button><div className="tip-row"><span>Tip</span> Describe the camera movement and the feeling of the final frame.</div></section><section className="result-column">{busy ? <LoadingState type="video" /> : <ResultPanel result={result} type="video" onDownload={(url) => window.open(url, '_blank', 'noopener,noreferrer')} />}</section></div></div>;
}

function Explore({ setPage }) {
  const workspaceOptions = [
    { id: 'image', label: 'Image studio', description: 'Create logos, posters, and campaign visuals.', icon: ImageIcon },
    { id: 'video', label: 'Video studio', description: 'Turn a product direction into motion.', icon: Film },
    { id: 'templates', label: 'Templates', description: 'Browse reusable directions from MongoDB.', icon: WandSparkles },
    { id: 'history', label: 'Library', description: 'Revisit designs saved by the backend.', icon: Clock3 },
  ];
  return <div className="page-content"><div className="hero-banner"><div className="hero-copy"><span className="eyebrow accent">A QUIET PLACE TO MAKE</span><h2>Build the visual<br /><em>before the meeting.</em></h2><p>Javeria's studio turns a rough direction into a useful creative asset. Every generated design is saved through the connected API.</p><div className="hero-signal" aria-hidden="true"><span /><span /><span /><span /><span /></div></div></div><section className="workspace-options" aria-labelledby="workspace-options-title"><div className="section-heading"><div><span className="eyebrow">YOUR TOOLKIT</span><h2 id="workspace-options-title">Choose a workspace</h2></div><span className="workspace-status">API connected · MongoDB library</span></div><div className="workspace-option-grid">{workspaceOptions.map(({ id, label, description, icon }) => <button className="workspace-option-card landing-feature-card" key={id} onClick={() => setPage(id)}><span className="workspace-option-icon">{createElement(icon, { size: 22 })}</span><span className="workspace-option-copy"><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={17} className="workspace-option-arrow" /></button>)}</div></section></div>;
}

function Templates({ setPage }) {
  const [remote, setRemote] = useState([]); const [error, setError] = useState('');
  useEffect(() => { templateAPI.getAll().then(setRemote).catch((templateError) => setError(templateError.message || 'Unable to load templates from the backend.')); }, []);
  return <div className="page-content"><div className="page-intro"><div><span className="eyebrow accent">CONNECTED LIBRARY</span><h2>Templates from MongoDB</h2><p>Use a saved direction as the starting point for your next asset.</p></div><button className="primary-button" onClick={() => setPage('image')}><Plus size={16} /> New creation</button></div>{error && <div className="notice-banner">{error}</div>}{remote.length ? <div className="template-gallery">{remote.map((item) => <article className="gallery-card" key={item.id}><img src={item.previewUrl} alt={item.name || 'Saved template'} /><div className="gallery-card-copy"><span>{item.mediaType || 'template'} · {item.category || 'general'}</span><strong>{item.name || 'Saved template'}</strong><button className="secondary-button" onClick={() => setPage('image')}>Use template <ArrowUpRight size={14} /></button></div></article>)}</div> : !error && <div className="large-empty"><Layers3 size={25} /><h3>No templates yet</h3><p>Seed or create templates through the Flask API to see them here.</p></div>}</div>;
}

function History({ designs, setPage }) {
  return <div className="page-content"><div className="page-intro"><div><span className="eyebrow accent">MONGODB LIBRARY</span><h2>Saved designs</h2><p>These assets are loaded from the backend, not browser mock data.</p></div><button className="primary-button" onClick={() => setPage('image')}><Plus size={16} /> New creation</button></div>{designs.length ? <div className="history-grid">{designs.map((item) => <article className="history-card" key={item._id || item.id}><div className="history-media"><img src={item.cloudinaryUrl || item.url} alt={item.brandName || 'Generated design'} /></div><div className="history-copy"><span>{item.type || 'design'} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'recent'}</span><strong>{item.brandName || item.prompt?.slice(0, 48) || 'Untitled design'}</strong><button className="icon-button" aria-label="Saved design"><MoreHorizontal size={17} /></button></div></article>)}</div> : <div className="large-empty"><Clock3 size={25} /><h3>Your library is waiting</h3><p>Generate a design and it will be saved to MongoDB through the Flask API.</p><button className="secondary-button" onClick={() => setPage('image')}>Create your first piece <ArrowUpRight size={15} /></button></div>}</div>;
}

export default function HiggsfieldApp() {
  const [page, setPage] = useState('explore'); const [designs, setDesigns] = useState([]); const [loadError, setLoadError] = useState(''); const [isDark, setIsDark] = useState(false);
  useEffect(() => { designAPI.getDesigns().then(setDesigns).catch((designError) => setLoadError(designError.message || 'Backend is unavailable.')); }, []);
  const go = (next) => setPage(next);
  const handleSavedDesign = async () => {
    try {
      setDesigns(await designAPI.getDesigns());
    } catch (designError) {
      setLoadError(designError.message || 'The design was generated, but the library could not refresh.');
    }
  };
  return <div className={`app-shell ${isDark ? 'theme-dark' : 'theme-light'}`}><main className="main-area"><Topbar page={page} onNavigate={go} isDark={isDark} onToggleTheme={() => setIsDark((current) => !current)} />{loadError && <div className="notice-banner global-notice">{loadError}</div>}{page === 'explore' && <Explore setPage={go} />}{page === 'image' && <ImageStudio onSaved={handleSavedDesign} />}{page === 'video' && <VideoStudio onSaved={() => {}} />}{page === 'templates' && <Templates setPage={go} />}{page === 'history' && <History designs={designs} setPage={go} />}</main><Footer /></div>;
}
