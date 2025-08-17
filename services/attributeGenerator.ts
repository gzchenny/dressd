export const generateItemAttributes = (title: string, description: string) => {
  const text = `${title} ${description}`.toLowerCase();
  
  const attributes = {
    categories: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    brands: [] as string[],
    occasions: [] as string[],
    styles: [] as string[]
  };

  // Categories
  if (text.includes('dress')) attributes.categories.push('dress');
  if (text.includes('top') || text.includes('blouse') || text.includes('shirt')) attributes.categories.push('top');
  if (text.includes('skirt')) attributes.categories.push('skirt');
  if (text.includes('pants') || text.includes('trousers')) attributes.categories.push('pants');
  if (text.includes('jacket') || text.includes('blazer')) attributes.categories.push('jacket');
  if (text.includes('shoes')) attributes.categories.push('shoes');

  // Colors
  const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'navy'];
  colors.forEach(color => {
    if (text.includes(color)) attributes.colors.push(color);
  });

  // Sizes
  const sizes = ['xs', 'small', 'medium', 'large', 'xl', 'xxl', 's', 'm', 'l'];
  sizes.forEach(size => {
    if (text.includes(size)) attributes.sizes.push(size);
  });

  // Brands
  const brands = ['zara', 'h&m', 'nike', 'adidas', 'gucci', 'prada', 'chanel'];
  brands.forEach(brand => {
    if (text.includes(brand)) attributes.brands.push(brand);
  });

  // If no categories found, default to 'clothing'
  if (attributes.categories.length === 0) {
    attributes.categories.push('clothing');
  }

  return attributes;
};

export const createEmbeddingFromAttributes = (
  attributes: any, 
  title: string, 
  description: string
): number[] => {
  const embedding = new Array(512).fill(0);
  
  // Use text analysis to create meaningful embeddings
  const text = `${title} ${description}`.toLowerCase();
  const words = text.split(' ');
  
  // Map categories to embedding dimensions (0-50)
  const categoryMap: { [key: string]: number } = {
    'dress': 0.9,
    'top': 0.8,
    'shirt': 0.7,
    'pants': 0.6,
    'skirt': 0.5,
    'jacket': 0.4,
    'shoes': 0.3,
    'clothing': 0.2
  };
  
  attributes.categories.forEach((cat: string, index: number) => {
    if (index < 50) {
      embedding[index] = categoryMap[cat] || 0.1;
    }
  });
  
  // Map colors to embedding dimensions (50-100)
  const colorMap: { [key: string]: number } = {
    'black': 0.9, 'white': 0.8, 'red': 0.7, 'blue': 0.6,
    'green': 0.5, 'yellow': 0.4, 'pink': 0.3, 'purple': 0.2
  };
  
  attributes.colors.forEach((color: string, index: number) => {
    if (index < 50) {
      embedding[50 + index] = colorMap[color] || 0.1;
    }
  });
  
  // Use word frequency for remaining dimensions (100-200)
  words.forEach((word, index) => {
    if (index < 100 && word.length > 2) {
      const charSum = word.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      embedding[100 + index] = (charSum % 100) / 100;
    }
  });
  
  // Fill remaining dimensions with normalized values
  for (let i = 200; i < 512; i++) {
    embedding[i] = Math.random() * 0.1;
  }
  
  return embedding;
};

// Add this alias for backwards compatibility if needed
export const flattenAttributes = createEmbeddingFromAttributes;