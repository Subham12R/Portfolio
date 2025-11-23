import { useTheme } from "../../contexts/ThemeContext";
import { useCallback, useEffect, useState } from "react";

export const useThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(theme === "dark");

  // Sync isDark state with theme
  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (typeof window === "undefined") return;

    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [theme, setTheme]);

  const setLightTheme = useCallback(() => {
    setIsDark(false);
    if (typeof window === "undefined") return;
    setTheme("light");
  }, [setTheme]);

  const setDarkTheme = useCallback(() => {
    setIsDark(true);
    if (typeof window === "undefined") return;
    setTheme("dark");
  }, [setTheme]);

  return {
    isDark,
    setIsDark,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  };
};

