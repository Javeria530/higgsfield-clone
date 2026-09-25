import { designAPI, videoAdAPI } from './api.js';

const GALLERY_KEY = 'higgsfield-creation-gallery';

const readGallery = () => {
  try {
    return JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeGallery = (items) => {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
};

export const validateMarketingPrompt = async (prompt) => ({
  isValid: Boolean(prompt?.trim()),
  reason: prompt?.trim() ? '' : 'Add a little more detail to your prompt.',
});

export const refineMarketingVision = async (prompt, objective = 'Promotion', visualStyle = 'Cinematic', mediaType = 'poster') => ({
  visualPrompt: `${visualStyle} ${mediaType} for ${objective}: ${prompt}`,
  suggestedTitle: prompt?.split(/\s+/).slice(0, 5).join(' ') || 'New creation',
  marketingRationale: 'A focused creative direction ready for generation.',
  suggestedCaption: 'Made for the next idea.',
  suggestedCategory: 'Promotional',
});

export const generateVisualAsset = async (name, description, mediaType = 'poster', options = {}) => {
  const result = await designAPI.generateDesign({
    type: mediaType === 'image' ? 'poster' : mediaType,
    brandName: options.brandName || name || 'Creative Studio',
    tagline: options.tagline || '',
    style: options.style || 'cinematic, premium, editorial',
    description,
    colors: options.colors || [],
  });
  return result.url;
};

export const generateMarketingImage = (prompt, type = 'poster', options = {}) =>
  generateVisualAsset(options.brandName || 'Creative Studio', prompt, type, options);

export const generateEnhancedImage = (prompt, type = 'poster', options = {}) =>
  generateMarketingImage(prompt, type, options);

export const editVisualAsset = (_sourceUrl, evolutionPrompt) =>
  generateMarketingImage(evolutionPrompt, 'poster');

export const generateVideoAsset = async (prompt) => {
  const result = await videoAdAPI.generateVideo({ prompt });
  return result.url || result.videoUrl || result.cloudinaryUrl;
};

export const generateAndSaveImage = async (prompt, type = 'poster', options = {}) => {
  const url = await generateMarketingImage(prompt, type, options);
  return saveGeneratedImage(url, prompt, type);
};

export const saveGeneratedImage = (url, prompt, type = 'poster') => {
  const entry = {
    id: crypto.randomUUID(),
    url,
    type,
    prompt,
    createdAt: new Date().toISOString(),
  };
  writeGallery([entry, ...readGallery()]);
  return entry;
};

export const getImageGallery = () => readGallery();

export const deleteFromGallery = (id) => {
  const next = readGallery().filter((item) => item.id !== id);
  writeGallery(next);
  return next;
};

export const downloadImage = (url, filename = 'creation.png') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.click();
};