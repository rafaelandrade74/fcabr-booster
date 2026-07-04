import pt from "./pt";
import en from "./en";

/**
 * @typedef {"pt" | "en"} LanguageKey
 */

/**
 * @typedef {pt | en } Translations
 */
const translations = {
  pt,
  en,
};

/**
 * @param {string} [value]
 * @returns {LanguageKey | null}
 */
function getLanguageFromValue(value = "") {
  const normalized = String(value).toLowerCase();
  const match = normalized.match(/^\/(en|pt)(?:\/|$)/);

  if (match) {
    return /** @type {LanguageKey} */ (match[1]);
  }

  return null;
}

/**
 * @param {string} [pathname]
 * @param {string} [documentLang]
 * @returns {LanguageKey}
 */
export function resolveSelectedLanguage(pathname = "", documentLang = "") {
  return (
    getLanguageFromValue(pathname) ||
    getLanguageFromValue(documentLang) ||
    "pt"
  );
}
/**
 * @param {string} [pathname]
 * @param {string} [documentLang]
 * @returns {Translations}
 */
export function getTranslations(pathname = "", documentLang = "") {
  const language = resolveSelectedLanguage(pathname, documentLang);
  return getTranslationsByLanguage(language);
}

/**
 * @param {LanguageKey} language
 * @returns {Translations}
 */
export function getTranslationsByLanguage(language = "pt") {
  return translations[language] || translations.pt;
}
