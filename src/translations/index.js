import pt from "./pt.json";
import en from "./en.json";

const translations = {
  pt,
  en,
};

function getLanguageFromValue(value = "") {
  const normalized = String(value).toLowerCase();
  const match = normalized.match(/^\/(en|pt)(?:\/|$)/);

  if (match) {
    return match[1];
  }

  return null;
}

export function resolveLanguage(value = "") {
  return getLanguageFromValue(value) || "pt";
}

export function resolveSelectedLanguage(pathname = "", documentLang = "") {
  return (
    getLanguageFromValue(pathname) ||
    getLanguageFromValue(documentLang) ||
    "pt"
  );
}

export function getTranslations(language = "pt") {
  return translations[language] || translations.pt;
}
