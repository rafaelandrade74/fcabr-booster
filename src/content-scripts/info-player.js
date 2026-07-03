import { initializeStoredValues } from "../utils";
import { getTranslations, resolveLanguage } from "../translations";

async function bootstrapInfoPlayer() {
  const pathname = window.location.pathname;
  const isSupportedProfilePage =
    pathname === "/pt/profile" ||
    pathname === "/pt/profile/" ||
    pathname.startsWith("/pt/profile?") ||
    pathname === "/en/profile" ||
    pathname === "/en/profile/" ||
    pathname.startsWith("/en/profile?");

  if (!isSupportedProfilePage) {
    return;
  }

  const language = resolveLanguage(document.documentElement.lang || pathname);
  const translations = getTranslations(language);

  await initializeStoredValues({
    language,
    featureFlags: {
      infoPlayer: true,
    },
  });

  document.documentElement.setAttribute("data-fcabr-language", language);
  document.documentElement.setAttribute("data-fcabr-feature", "info-player");

  console.info("[FCABR Booster] info-player initialized", {
    language,
    title: translations.infoPlayer.title,
  });
}

bootstrapInfoPlayer().catch((error) => {
  console.error("[FCABR Booster] info-player bootstrap failed", error);
});
