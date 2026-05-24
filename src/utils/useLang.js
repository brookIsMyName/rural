// src/utils/useLang.js
// Custom hook — call this in any component that needs to re-render on language change
import { useState, useEffect } from "react";
import { getLanguage, setLanguage } from "./language";

export function useLang() {
  const [lang, setLang] = useState(getLanguage);

  useEffect(() => {
    const handler = (e) => setLang(e.detail.lang);
    window.addEventListener("rc:langchange", handler);
    return () => window.removeEventListener("rc:langchange", handler);
  }, []);

  const changeLang = (code) => {
    setLanguage(code);
    setLang(code);
  };

  return { lang, changeLang };
}
