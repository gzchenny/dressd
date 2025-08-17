import { ItemAttributes } from '@/types/itemAttributes';

export const generateItemAttributes = (title: string, description: string): ItemAttributes => {
  const text = `${title} ${description}`.toLowerCase();
  
  return {
    colors: {
      black: calculateScore(text, ['black', 'noir', 'dark', 'charcoal']),
      white: calculateScore(text, ['white', 'cream', 'ivory', 'off-white']),
      red: calculateScore(text, ['red', 'crimson', 'burgundy', 'wine']),
      blue: calculateScore(text, ['blue', 'navy', 'denim', 'royal']),
      green: calculateScore(text, ['green', 'olive', 'forest', 'emerald']),
      yellow: calculateScore(text, ['yellow', 'gold', 'mustard', 'sunshine']),
      pink: calculateScore(text, ['pink', 'rose', 'blush', 'coral']),
      brown: calculateScore(text, ['brown', 'tan', 'beige', 'camel']),
      neutral: calculateScore(text, ['neutral', 'beige', 'taupe', 'khaki']),
    },
    vibes: {
      casual: calculateScore(text, ['casual', 'relaxed', 'comfortable', 'everyday', 'laid-back']),
      formal: calculateScore(text, ['formal', 'elegant', 'sophisticated', 'dressy', 'professional']),
      bohemian: calculateScore(text, ['boho', 'bohemian', 'free-spirited', 'flowy', 'hippie']),
      minimalist: calculateScore(text, ['minimal', 'clean', 'simple', 'sleek', 'modern']),
      vintage: calculateScore(text, ['vintage', 'retro', 'classic', 'timeless', 'throwback']),
      streetwear: calculateScore(text, ['street', 'urban', 'cool', 'trendy', 'edgy']),
      romantic: calculateScore(text, ['romantic', 'feminine', 'soft', 'delicate', 'pretty']),
      edgy: calculateScore(text, ['edgy', 'bold', 'statement', 'dramatic', 'fierce']),
    },
    occasions: {
      work: calculateScore(text, ['work', 'office', 'professional', 'business', 'meeting']),
      party: calculateScore(text, ['party', 'night out', 'celebration', 'clubbing', 'dancing']),
      date: calculateScore(text, ['date', 'romantic', 'dinner', 'special', 'intimate']),
      casual: calculateScore(text, ['casual', 'everyday', 'weekend', 'errands', 'hanging out']),
      formal: calculateScore(text, ['formal', 'gala', 'event', 'ceremony', 'black tie']),
      vacation: calculateScore(text, ['vacation', 'travel', 'beach', 'resort', 'holiday']),
    },
    seasonality: {
      spring: calculateScore(text, ['spring', 'light', 'fresh', 'blooming', 'pastel']),
      summer: calculateScore(text, ['summer', 'hot', 'sunny', 'bright', 'breezy']),
      fall: calculateScore(text, ['fall', 'autumn', 'cozy', 'warm', 'layered']),
      winter: calculateScore(text, ['winter', 'cold', 'warm', 'thick', 'heavy']),
    }
  };
};

const calculateScore = (text: string, keywords: string[]): number => {
  if (!text || !keywords) return 0;
  
  const matches = keywords.filter(keyword => text.includes(keyword)).length;
  // Return a score between 0 and 1, with some randomness for demo variety
  const baseScore = Math.min(matches * 0.3, 1);
  const randomBoost = Math.random() * 0.2; // Add some variety for demo
  return Math.min(baseScore + randomBoost, 1);
};

// Helper to flatten attributes into a vector for similarity calculations
export const flattenAttributes = (attributes: ItemAttributes): number[] => {
  return [
    ...Object.values(attributes.colors),
    ...Object.values(attributes.vibes),
    ...Object.values(attributes.occasions),
    ...Object.values(attributes.seasonality),
  ];
};