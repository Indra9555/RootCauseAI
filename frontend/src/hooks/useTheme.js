import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "rootcauseai-theme";
const ORDER = ["auto", "light", "dark"];

function readStored() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return ORDER.includes(value) ? value : "auto";
  } catch {
    return "auto";
  }
}

export default function useTheme() {
  const [theme, setTheme] = useState(readStored);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "auto") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies.
    }
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme(
      (current) =>
        ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]
    );
  }, []);

  return { theme, cycle };
}
