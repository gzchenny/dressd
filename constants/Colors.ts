/**
 * App color system: primary & background are white; purple is the accent.
 */
const primary = '#FFFFFF';       // base / primary surface
const accent = '#653A79';        // purple accent
const lightText = '#2B1F31';

export const Colors = {
  light: {
    text: '#2B1F31',
    background: '#FFFFFF',
    tint: '#653A79',        // This controls active tab color
    icon: '#666666',        // This controls inactive tab color
    tabIconDefault: '#B8A4C4',
    tabIconSelected: '#653A79',
  },
  dark: {
    text: '#FFFFFF',        // Fix: was black, should be white for dark mode
    background: '#000000',  // Fix: was white, should be black for dark mode
    tint: '#653A79',
    icon: '#999999',
    tabIconDefault: '#B8A4C4',
    tabIconSelected: '#653A79',
  },
};

export { primary, accent };