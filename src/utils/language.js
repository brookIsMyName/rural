// src/utils/language.js
// Single source of truth for language — uses localStorage, defaults to "en"

const KEY = "rc_lang";

export function getLanguage() {
  return localStorage.getItem(KEY) || "en";
}

export function setLanguage(lang) {
  localStorage.setItem(KEY, lang);
  // Fire a custom event so every component can react
  window.dispatchEvent(new CustomEvent("rc:langchange", { detail: { lang } }));
}
