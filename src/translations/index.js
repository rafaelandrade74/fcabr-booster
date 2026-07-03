import pt from "./pt.json";
import en from "./en.json";

const translations = {
  pt,
  en,
};

export function resolveLanguage(value = "") {
  const normalized = String(value).toLowerCase();

  if (normalized.startsWith("en")) {
    return "en";
  }

  return "pt";
}

export function getTranslations(language = "pt") {
  return translations[language] || translations.pt;
}
