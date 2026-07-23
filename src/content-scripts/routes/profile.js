import DOM from "../../lib/dom";
import ExperienceCard from "../../lib/experience-card";
import FireteamCard from "../../lib/fireteam-card";
import patentes from "../../data/patents";
import { initializeStoredValues } from "../../utils";
import { DEFAULT_SETTINGS } from "../../utils/settings";
import { getTranslations } from "../../translations";
import StorageService from "../../lib/storage-service";
import { RouteKeys } from "../../data/routekeys.js";

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

/**
 * @param {object}
 * @returns {string}
 */
export function storageKeyGoaRankStatus(data) {
    const profileValue = getProfileId();

    const oidUser = data.data.oidUser;
    const nickname = data.data.nickname;
    const result = oidUser === profileValue
        ? RouteKeyProfile(oidUser)
        : RouteKeyProfile(nickname);

    return result;
}
/**
 * 
 * @returns {string}
 */
function getProfileId() {
    const profileKey = Object.keys(localStorage)
        .find(k => k.startsWith("selected-profile-"));

    if (!profileKey)
        return null;

    const profileValue = Number(localStorage.getItem(profileKey));

    if (Number.isNaN(profileValue))
        return null;

    return profileValue;
}

/**
 * 
 * @param {any|null} name 
 * @returns {string}
 */
function RouteKeyProfile(name = null) {
    if (name == null || name == undefined) {
        const oidUser = getProfileId();

        if (oidUser == null) return null;
        return RouteKeyProfile(oidUser);
    }

    return `${RouteKeys.GoaRankStatus}-${name}`;
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
    const shouldShowAnyFireteam = isOwnProfile && (
        storedSettings.showFireteamClanRank ||
        storedSettings.showFireteamPlayerRank ||
        storedSettings.showFireteamPoints ||
        storedSettings.showFireteamPlayerPoints ||
        storedSettings.showFireteamPlayerXp
    );

    if (!shouldShowNextPatent && !shouldShowAnyFireteam) return;

    // Aguardar até que o elemento de Experiência esteja presente na página.
    await DOM.waitUntil(() => ExperienceCard.findCardElementByName(translations, tipoPagina), 10000);

    const cardElement = ExperienceCard.findCardElementByName(translations, tipoPagina);
    if (!cardElement) return;

    const card = new ExperienceCard(translations, tipoPagina);

    // ---- Renderização do card de XP ----
    if (shouldShowNextPatent) {
        const currentPatent = patentes.find((patent) => patent.name === data.data.patenteAtual);

        if (currentPatent) {
            const currentExperiencePoints = data.data.exp;
            const nextExperiencePoints = data.data.expNecessario || currentExperiencePoints;
            const baseExperiencePoints = currentPatent.targetXp;
            const remainingExperiencePoints = Math.max(0, nextExperiencePoints - currentExperiencePoints);

            card.setBaseXp(baseExperiencePoints);
            card.setRemaining(remainingExperiencePoints);
            card.setNextXp(nextExperiencePoints);
            card.setProgress(currentExperiencePoints, baseExperiencePoints, nextExperiencePoints);
        }

        if (isOwnProfile) {
            const rankData = StorageService.get(`${RouteKeys.ExperienceRankingPosition}-${data.data.oidUser}`);
            if (rankData?.rank) {
                card.setRankingBadge(rankData.rank);
            }
        }
    }

    // ---- Renderização do card de Fireteam ----
    if (shouldShowAnyFireteam) {
        const oidUser = data.data.oidUser;
        const userClan = StorageService.get(`${RouteKeys.FireteamUserClan}-${oidUser}`);
        const clanData = userClan?.oidGuild
            ? StorageService.get(`${RouteKeys.FireteamClan}-${userClan.oidGuild}`)
            : null;
        const playerData = StorageService.get(`${RouteKeys.FireteamClanPlayer}-${oidUser}`);

        if (clanData || playerData) {
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
    }

    card.watchTabSwitch(profilePage);
}
