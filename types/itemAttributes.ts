export interface ItemAttributes {
  // Color palette (0-1 scores for primary colors)
  colors: {
    black: number;
    white: number;
    red: number;
    blue: number;
    green: number;
    yellow: number;
    pink: number;
    brown: number;
    neutral: number;
  };
  
  // Style vibes (0-1 scores)
  vibes: {
    casual: number;
    formal: number;
    bohemian: number;
    minimalist: number;
    vintage: number;
    streetwear: number;
    romantic: number;
    edgy: number;
  };
  
  // Occasion scores
  occasions: {
    work: number;
    party: number;
    date: number;
    casual: number;
    formal: number;
    vacation: number;
  };
  
  // Additional attributes
  seasonality: {
    spring: number;
    summer: number;
    fall: number;
    winter: number;
  };
}

export interface ItemData {
  id?: string;
  title: string;
  description: string;
  rentPrice: number;
  securityDeposit: number;
  ownerId: string;
  ownerUsername: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Include attributes directly in the item document
  attributes: ItemAttributes;
  embedding: number[]; // Flattened vector for quick similarity search
  // Additional fields for UI
  brand?: string;
  originalRetail?: number;
  liked?: boolean;
}