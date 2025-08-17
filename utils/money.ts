export const formatPrice = (price: number): string => {
    return `$${price}`;
  };
  
  export const formatPriceRange = (from: number, originalRetail?: number): string => {
    const formatted = formatPrice(from);
    if (originalRetail) {
      return `Rent from ${formatted} • Retail ${formatPrice(originalRetail)}`;
    }
    return `Rent from ${formatted}`;
  };