import { routes } from "./router.js";
import { profilePage } from "./routes/profile.js";
import StorageService from "../lib/storage-service.js";
import { RouteKeys } from "../data/routekeys.js";
import { initializeStoredValues } from "../utils/index.js";
import { DEFAULT_SETTINGS, MIN_RANKING_INTERVAL_MS } from "../utils/settings.js";
import { dlog, dwarn, derror } from "../utils/debug-log.js";
import { FALLBACK_OID_USER_KEY } from "../data/api-route-keys.js";

const script = document.createElement("script");

script.src = chrome.runtime.getURL("scripts/content-scripts/inject.js");
script.onload = () => script.remove();

(document.head || document.documentElement).appendChild(script);

initializeStoredValues(DEFAULT_SETTINGS).then(settings => {
    dlog("[FCABR][monitor-manager] settings carregadas:", settings, "userAgent:", navigator.userAgent);

    const isFireteamEnabled = settings.showFireteamClanRank || settings.showFireteamPlayerRank || settings.showFireteamPoints || settings.showFireteamPlayerXp;
    if (!settings.showExperienceRanking && !isFireteamEnabled) {
        dwarn("[FCABR][monitor-manager] monitor NÃO iniciado: nenhuma flag habilitada", {
            showExperienceRanking: settings.showExperienceRanking,
            isFireteamEnabled
        });
        return;
    }

    const intervalMs = Math.max(MIN_RANKING_INTERVAL_MS, Number(settings.rankingInterval));
    const managerUrl = chrome.runtime.getURL("scripts/content-scripts/monitor-manager.js");

    const managerScript = document.createElement("script");
    managerScript.src = managerUrl;
    managerScript.dataset.experienceRankingEnabled = settings.showExperienceRanking ? "1" : "0";
    managerScript.dataset.experienceRankingInterval = intervalMs;
    managerScript.dataset.fireteamRankingEnabled = isFireteamEnabled ? "1" : "0";
    managerScript.dataset.fireteamRankingInterval = intervalMs;
    managerScript.onload = () => {
        dlog("[FCABR][monitor-manager] script carregado com sucesso:", managerUrl);
        managerScript.remove();
    };
    managerScript.onerror = event => {
        derror("[FCABR][monitor-manager] FALHA ao carregar o script:", managerUrl, event);
    };
    dlog("[FCABR][monitor-manager] injetando script:", managerUrl, managerScript.dataset);
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

    dlog("[FCABR][content] mensagem FCABR_EXTENSION recebida:", event.data);

    // Fallback de oidUser: quando o site não grava "selected-profile-*" no localStorage
    // (ex.: primeira sessão em outro navegador), capturamos o userId direto da própria
    // chamada de perfil quando estamos na página do perfil próprio (PFP).
    const profileApiMatch = /\/api\/profile\?.*userId=(\d+)/.exec(event.data.url);
    if (profileApiMatch) {
        const isOwnProfilePage = /^\/[a-z]{2}\/profile$/.test(location.pathname);
        if (isOwnProfilePage) {
            dlog("[FCABR][content] gravando fallback", FALLBACK_OID_USER_KEY, "=", profileApiMatch[1]);
            localStorage.setItem(FALLBACK_OID_USER_KEY, profileApiMatch[1]);
        }
    }

    const route = routes.ApiRoutes.find(r => r.regex.test(event.data.url));

    if (!route) {
        dwarn("[FCABR][content] nenhuma rota encontrada para url:", event.data.url);
        return;
    }

    const storageKey = route.storageKey(event.data.data);

    if (!storageKey) {
        dwarn("[FCABR][content] storageKey não gerada para:", event.data.url, event.data.data);
        return;
    }

    const keys = Array.isArray(storageKey) ? storageKey : [storageKey];
    dlog("[FCABR][content] salvando no storage:", keys, event.data.data);
    for (const key of keys) {
        StorageService.set(key, event.data.data);
    }

    // renderizar a página novamente para atualizar os dados exibidos
    dlog("[FCABR][content] chamando renderPage() após atualizar storage");
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