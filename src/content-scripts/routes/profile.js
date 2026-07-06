import DOM from "../../lib/dom";
import ExperienceCard from "../../lib/experience-card";
import patentes from "../../data/patents";
import { initializeStoredValues } from "../../utils";
import { DEFAULT_SETTINGS } from "../../utils/settings";
import { getTranslations } from "../../translations";
import StorageService from "../../lib/storage-service";
import { RouteKeys } from "../../data/routekeys.js";

const SUPPORTED_PROFILE_PAGE_REGEX = /^\/(?:pt|en)\/profile\/?(?:\?.*)?$/;

export async function profilePage() {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const isSupportedProfilePage = SUPPORTED_PROFILE_PAGE_REGEX.test(currentPath);
    if (!isSupportedProfilePage) return;

    /**
     * @type {Translations}
     */
    const translations = getTranslations(
        window.location.pathname,
        document.documentElement.lang,
    );

    const storedSettings = await initializeStoredValues(DEFAULT_SETTINGS);
    const shouldShowNextPatent = Boolean(storedSettings.showNextPatent);

    if (!shouldShowNextPatent) {
        return;
    }

    // Aguardar até que o elemento de Experiência esteja presente na página.
    await DOM.waitUntil(() => DOM.byTextVisible("span", "Experiência"));
    /**
     * @param {Object} data
     * @param {Object} data.data
     * @param {string} data.data.patenteAtual
     * @param {number} data.data.exp
     * @param {number} data.data.expNecessario
     */
    const data = StorageService.get(RouteKeys.GoaRankStatus);
    console.log("data", data);
    const currentPatent = patentes.find((patent) => patent.name === data.data.patenteAtual);

    if (!currentPatent) {
        return;
    }

    const currentExperiencePoints = data.data.exp;
    const nextExperiencePoints = data.data.expNecessario;
    const baseExperiencePoints = currentPatent.targetXp;
    const remainingExperiencePoints = Math.max(0, nextExperiencePoints - currentExperiencePoints);

    const card = new ExperienceCard(translations);
    card.setBaseXp(baseExperiencePoints);
    card.setRemaining(remainingExperiencePoints);
    card.setNextXp(nextExperiencePoints);
    card.setProgress(currentExperiencePoints, baseExperiencePoints, nextExperiencePoints);
}
