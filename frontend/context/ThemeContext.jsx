import React, { useState, createContext } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    // Add mode property for easier use in Navbar
    mode: isDark ? "dark" : "light",
    toggleTheme,
    colors: isDark
      ? {
          primary: "#38BDF8", // Sky Blue Accent
          secondary: "#6366F1", // Electric Indigo
          accent: "#A855F7", // Purple Accent

          // NOIR SLATE PALETTE (Subtle & Professional)
          bg1: "#0B0E14", // Deep Charcoal Base
          bg2: "#161B22", // Slate Surface
          bg3: "#1C2128", // Lighter Surface
          bg4: "#21262D", // Contrast Surface

          cardBg: "rgba(22, 27, 34, 0.8)", // Semi-transparent Slate
          text1: "#E6EDF3", // Soft White
          text2: "#9198A1", // Subdued Gray
          border: "rgba(240, 246, 252, 0.1)", // Thinner, subtle borders
          
          success: "#3FB950",
          error: "#F85149",
        }
      : {
          primary: "#0284C7", // Professional Blue
          secondary: "#4F46E5", // Deep Indigo
          accent: "#9333EA", // Purple
          
          // SOFT MIST PALETTE
          bg1: "#F6F8FA", // Mist Base
          bg2: "#FFFFFF", // Pure White Surface
          bg3: "#EDF2F7", // Light Gray Surface
          bg4: "#E2E8F0", // Border shade
          
          cardBg: "rgba(255, 255, 255, 0.95)",
          text1: "#1F2328", // Deep Slate
          text2: "#656D76", // Medium Gray
          border: "rgba(31, 35, 40, 0.1)",
          
          success: "#1A7F37",
          error: "#D1242F",
        },
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);