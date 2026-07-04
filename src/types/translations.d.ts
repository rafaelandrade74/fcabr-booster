declare global {
  type LanguageKey = "pt" | "en";

  type ProfileTranslations = {
    "xp-remaining-bg": string;
    "xp-label": string;
  };

  type Translations = {
    Profile: ProfileTranslations;
    lang: string;
  };
}

export {};
