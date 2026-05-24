// src/utils/translate.js
import { getLanguage } from "./language";
import { translations } from "../data/translations";

export function t(key) {
  const lang = getLanguage();
  return translations?.[lang]?.[key] ?? translations?.en?.[key] ?? key;
}
