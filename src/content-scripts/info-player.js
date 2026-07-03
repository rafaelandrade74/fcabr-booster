import { initializeStoredValues } from "../utils";
import { getTranslations, resolveSelectedLanguage } from "../translations";

const SUPPORTED_PROFILE_PAGE_REGEX = /^\/(?:pt|en)\/profile\/?(?:\?.*)?$/;

async function bootstrapInfoPlayer() {
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const isSupportedProfilePage = SUPPORTED_PROFILE_PAGE_REGEX.test(currentPath);

  if (!isSupportedProfilePage) {
    return;
  }

  const language = resolveSelectedLanguage(
    window.location.pathname,
    document.documentElement.lang,
  );
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
