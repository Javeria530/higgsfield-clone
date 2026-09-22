// Template Category Types
export const TemplateCategory = {
  SEASONAL: 'seasonal',
  BRAND_AWARENESS: 'brand_awareness',
  EVENT_BASED: 'event_based',
  PRODUCT_LAUNCH: 'product_launch',
  PROMOTIONAL: 'promotional',
  EDUCATIONAL: 'educational',
  ENTERTAINMENT: 'entertainment',
  CULTURAL: 'cultural',
};

// Media Type
export const MediaType = {
  VIDEO: 'video',
  POSTER: 'poster',
  IMAGE: 'image',
  LOGO: 'logo',
  ANIMATION: 'animation',
  CAROUSEL: 'carousel',
};

// Template Status
export const TemplateStatus = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
  DRAFT: 'draft',
};

// Brand Tone
export const BrandTone = {
  BOLD: 'bold',
  ELEGANT: 'elegant',
  DYNAMIC: 'dynamic',
  PLAYFUL: 'playful',
  PROFESSIONAL: 'professional',
  CREATIVE: 'creative',
  MINIMAL: 'minimal',
  LUXURY: 'luxury',
};

// Audio Tracks
export const AudioTracks = [
  'energetic',
  'nature',
  'cinematic',
  'ambient',
  'upbeat',
  'calm',
  'dramatic',
  'epic',
  'soft',
  'intense',
];

// Export all types as a default object for convenience
export default {
  TemplateCategory,
  MediaType,
  TemplateStatus,
  BrandTone,
  AudioTracks,
};
