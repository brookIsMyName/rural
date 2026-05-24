const KEY = "rc_language";

export function getLanguage() {
  return localStorage.getItem(KEY) || "en-US";
}

export function setLanguage(lang) {
  localStorage.setItem(KEY, lang);

  // 🔥 manual trigger for same-tab updates
  window.dispatchEvent(new Event("languagechange"));
}