declare global {
  type LanguageKey = "pt" | "en";

  type ProfileTranslations = {
    "xp-remaining-bg": string;
    "xp-label": string;
    "xp-label-btn": string;
  };

  type Translations = {
    Profile: ProfileTranslations;
    lang: string;
  };
}

export { };
