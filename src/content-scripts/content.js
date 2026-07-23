import { routes } from "./router.js";
import { profilePage } from "./routes/profile.js";
import StorageService from "../lib/storage-service.js";
import { RouteKeys } from "../data/routekeys.js";
import { initializeStoredValues } from "../utils/index.js";
import { DEFAULT_SETTINGS, MIN_RANKING_INTERVAL_MS } from "../utils/settings.js";

const script = document.createElement("script");

script.src = chrome.runtime.getURL("scripts/content-scripts/inject.js");
script.onload = () => script.remove();

(document.head || document.documentElement).appendChild(script);

initializeStoredValues(DEFAULT_SETTINGS).then(settings => {
    const isFireteamEnabled = settings.showFireteamClanRank || settings.showFireteamPlayerRank || settings.showFireteamPoints || settings.showFireteamPlayerXp;
    if (!settings.showExperienceRanking && !isFireteamEnabled) return;

    const intervalMs = Math.max(MIN_RANKING_INTERVAL_MS, Number(settings.rankingInterval));

    const managerScript = document.createElement("script");
    managerScript.src = chrome.runtime.getURL("scripts/content-scripts/monitor-manager.js");
    managerScript.dataset.experienceRankingEnabled = settings.showExperienceRanking ? "1" : "0";
    managerScript.dataset.experienceRankingInterval = intervalMs;
    managerScript.dataset.fireteamRankingEnabled = isFireteamEnabled ? "1" : "0";
    managerScript.dataset.fireteamRankingInterval = intervalMs;
    managerScript.onload = () => managerScript.remove();
    (document.head || document.documentElement).appendChild(managerScript);
});


function renderPage() {

    const route = routes.PageRoutes.find(r => r.regex.test(location.pathname));

    if (!route)
        return;

    route.handler();
}

window.addEventListener("message", async event => {

    if (event.source !== window)
        return;

    if (event.data?.source !== "FCABR_EXTENSION")
        return;

    const route = routes.ApiRoutes.find(r => r.regex.test(event.data.url));

    if (!route)
        return;

    const storageKey = route.storageKey(event.data.data);

    if (!storageKey)
        return;

    const keys = Array.isArray(storageKey) ? storageKey : [storageKey];
    for (const key of keys) {
        StorageService.set(key, event.data.data);
    }

    // renderizar a página novamente para atualizar os dados exibidos
    renderPage();
});

let lastUrl = location.href;

// Intercepta localStorage.setItem para detectar troca de perfil sem cachear o ID em memória
const _origSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
    _origSetItem(key, value);
    if (key.startsWith("selected-profile-")) {
        renderPage();
    }
};

// atualizar os componentes da página quando a url mudar (navegação SPA)
window.addEventListener("DOMContentLoaded", () => {

    const checkUrlChange = () => {

        if (location.href === lastUrl)
            return;

        lastUrl = location.href;

        renderPage();
    };

    // Navegação SPA
    const pushState = history.pushState;
    history.pushState = function (...args) {
        pushState.apply(this, args);
        checkUrlChange();
    };

    const replaceState = history.replaceState;
    history.replaceState = function (...args) {
        replaceState.apply(this, args);
        checkUrlChange();
    };

    // Voltar/avançar navegador
    window.addEventListener("popstate", checkUrlChange);

    // Fallback para casos onde o framework altera a URL sem disparar os eventos acima
    setInterval(checkUrlChange, 200);
    renderPage();
});
// atualizar os componentes da página quando a janela for redimensionada
let isMobile = window.innerWidth <= 1023;
window.addEventListener("resize", () => {
    const mobile = window.innerWidth <= 1023;

    if (mobile === isMobile)
        return;

    isMobile = mobile;

    renderPage();
});