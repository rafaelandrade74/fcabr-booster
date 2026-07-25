import DOM from "../../lib/dom";
import ExperienceCard from "../../lib/experience-card";
import FireteamCard, { CONTAINER_ATTR as FIRETEAM_CONTAINER_ATTR } from "../../lib/fireteam-card";
import patentes from "../../data/patents";
import { initializeStoredValues } from "../../utils";
import { DEFAULT_SETTINGS } from "../../utils/settings";
import { getTranslations } from "../../translations";
import StorageService from "../../lib/storage-service";
import { RouteKeys } from "../../data/routekeys.js";
import { RouteKeyProfile, FALLBACK_OID_USER_KEY } from "../../data/api-route-keys.js";

const SNAPSHOT_KEY_XP = "xp-card-footer";

/**
 * Retorna o tipo da página de perfil.
 *
 * PF  = /pt/profile/NomeDoJogador
 * PFP = /pt/profile
 *
 * @param {string} pathname
 * @returns {string}
 */
function getProfilePageType(pathname = window.location.pathname) {
    const match = pathname.match(/^\/[a-z]{2}\/profile(?:\/([^/]+))?$/);

    if (!match) {
        return null;
    }

    return match;
}

export async function profilePage() {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const mathUrl = getProfilePageType(currentPath);

    if (!mathUrl) return;
    const playerName = mathUrl[1];
    const tipoPagina = playerName ? "PF" : "PFP";
    if (!tipoPagina)
        return;

    const routeKeyProfile = tipoPagina === "PF" ? RouteKeyProfile(playerName) : RouteKeyProfile();
    
    /**
     * @param {Object} data
     * @param {Object} data.data
     * @param {string} data.data.patenteAtual
     * @param {number} data.data.exp
     * @param {number} data.data.expNecessario
     */
    const data = StorageService.get(routeKeyProfile);
    
    if (!data)
        return;

    // só renderiza se for os dados do proprio boneco
    if (tipoPagina === "PF" && data.data.nickname !== playerName) return;

    // PFP = perfil do próprio usuário logado: usar como fallback para oidUser
    // quando o site não gravou "selected-profile-*" no localStorage.
    if (tipoPagina === "PFP" && data.data.oidUser) {
        localStorage.setItem(FALLBACK_OID_USER_KEY, String(data.data.oidUser));
    }

    /**
     * @type {Translations}
     */
    const translations = getTranslations(
        window.location.pathname,
        document.documentElement.lang,
    );

    const storedSettings = await initializeStoredValues(DEFAULT_SETTINGS);
    const shouldShowNextPatent = Boolean(storedSettings.showNextPatent);
    const isOwnProfile = tipoPagina === "PFP";
    const shouldShowExperienceRanking = isOwnProfile && Boolean(storedSettings.showExperienceRanking);
    const shouldShowAnyFireteam = isOwnProfile && (
        storedSettings.showFireteamClanRank ||
        storedSettings.showFireteamPlayerRank ||
        storedSettings.showFireteamPoints ||
        storedSettings.showFireteamPlayerPoints ||
        storedSettings.showFireteamPlayerXp
    );

    // Hot-reload cleanup: remove our injected nodes / restore original state when features are disabled
    if (!shouldShowAnyFireteam) {
        document.querySelectorAll(`[${FIRETEAM_CONTAINER_ATTR}]`).forEach(el => el.remove());
    }
    if (!shouldShowExperienceRanking) {
        document.querySelectorAll("[data-fcabr-rank-badge]").forEach(el => el.remove());
    }
    if (!shouldShowNextPatent) {
        const tempCard = new ExperienceCard(translations, tipoPagina);
        if (tempCard.card) tempCard.restoreSnapshot(SNAPSHOT_KEY_XP);
    }

    if (!shouldShowNextPatent && !shouldShowExperienceRanking && !shouldShowAnyFireteam) return;

    // Aguardar até que o elemento de Experiência esteja presente na página.
    await DOM.waitUntil(() => ExperienceCard.findCardElementByName(translations, tipoPagina), 10000);

    const cardElement = ExperienceCard.findCardElementByName(translations, tipoPagina);
    if (!cardElement) return;

    const card = new ExperienceCard(translations, tipoPagina);

    // ---- Renderização do card de XP (Próxima Patente) ----
    if (shouldShowNextPatent) {
        const currentPatent = patentes.find((patent) => patent.name === data.data.patenteAtual);

        if (currentPatent) {
            const currentExperiencePoints = data.data.exp;
            const nextExperiencePoints = data.data.expNecessario || currentExperiencePoints;
            const baseExperiencePoints = currentPatent.targetXp;
            const remainingExperiencePoints = Math.max(0, nextExperiencePoints - currentExperiencePoints);

            card.captureSnapshot(SNAPSHOT_KEY_XP);
            card.setBaseXp(baseExperiencePoints);
            card.setRemaining(remainingExperiencePoints);
            card.setNextXp(nextExperiencePoints);
            card.setProgress(currentExperiencePoints, baseExperiencePoints, nextExperiencePoints);
        }
    }

    // ---- Renderização do badge de Ranking de Experiência (independente da Próxima Patente) ----
    if (shouldShowExperienceRanking) {
        const rankData = StorageService.get(`${RouteKeys.ExperienceRankingPosition}-${data.data.oidUser}`);
        card.setRankingBadge(rankData?.rank ?? 0);
    }

    // ---- Renderização do card de Fireteam ----
    if (shouldShowAnyFireteam) {
        const oidUser = data.data.oidUser;
        const userClan = StorageService.get(`${RouteKeys.FireteamUserClan}-${oidUser}`);
        const clanData = userClan?.oidGuild
            ? StorageService.get(`${RouteKeys.FireteamClan}-${userClan.oidGuild}`)
            : null;
        const playerData = StorageService.get(`${RouteKeys.FireteamClanPlayer}-${oidUser}`);

        const allCards = ExperienceCard.findAllCardElements(translations, tipoPagina);
        const targets = allCards.length > 0 ? allCards : [cardElement];
        const renderOptions = {
            showClanRank: Boolean(storedSettings.showFireteamClanRank),
            showPlayerRank: Boolean(storedSettings.showFireteamPlayerRank),
            showPoints: Boolean(storedSettings.showFireteamPoints),
            showPlayerPoints: Boolean(storedSettings.showFireteamPlayerPoints),
            showPlayerXp: Boolean(storedSettings.showFireteamPlayerXp),
            clanData,
            playerData
        };
        for (const target of targets) {
            FireteamCard.render(target, translations, renderOptions);
        }
    }

    const outerCard = cardElement?.parentElement;
    card.watchTabSwitch(profilePage, () => {
        outerCard?.querySelector(`[${FIRETEAM_CONTAINER_ATTR}]`)?.remove();
    });

    // O card "Em breve" ao lado tem altura fixa (307px); remove para acompanhar o card da extensão
    const emBreveSpan = DOM.byTextVisible("span", "Em breve");
    const emBreveCard = emBreveSpan?.closest(".relative");
    if (emBreveCard) emBreveCard.style.height = "100%";
}
