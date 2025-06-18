import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeProvider() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored && (stored === 'light' || stored === 'dark')) {
        return stored;
      }
      // Default to dark theme
      return 'dark';
    }
    return 'dark';
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('primaryColor') || '#8b5cf6';
    }
    return '#8b5cf6';
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Store theme in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply custom primary color as CSS variables
    const root = window.document.documentElement;
    
    // Convert hex to HSL for better color manipulation
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    };

    const [h, s, l] = hexToHsl(primaryColor);
    
    root.style.setProperty('--primary', `${h} ${s}% ${l}%`);
    root.style.setProperty('--primary-foreground', l > 50 ? '0 0% 0%' : '0 0% 100%');
    
    // Store color in localStorage
    localStorage.setItem('primaryColor', primaryColor);
  }, [primaryColor]);

  return {
    theme,
    toggleTheme,
    primaryColor,
    setPrimaryColor
  };
}