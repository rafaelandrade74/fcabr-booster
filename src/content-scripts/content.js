import { routes } from "./router.js";
import { profilePage } from "./routes/profile.js";
import StorageService from "../lib/storage-service.js";
import ConfigDispatcher from "../lib/config-dispatcher.js";
import { RouteKeys } from "../data/routekeys.js";
import { initializeStoredValues } from "../utils/index.js";
import { DEFAULT_SETTINGS, MIN_RANKING_INTERVAL_MS } from "../utils/settings.js";
import { dlog, dwarn, derror } from "../utils/debug-log.js";
import { FALLBACK_OID_USER_KEY } from "../data/api-route-keys.js";

// ---- inject.js (fetch interceptor, page world) ----

// Tokens gerados no mundo isolado; pages scripts não têm acesso ao valor.
// PAGE_TOKEN autentica mensagens page-world → content-world.
// MANAGER_TOKEN autentica mensagens content-world → monitor-manager (CONFIG_UPDATE).
const PAGE_TOKEN = crypto.randomUUID();
const MANAGER_TOKEN = crypto.randomUUID();

const script = document.createElement("script");
script.src = chrome.runtime.getURL("scripts/content-scripts/inject.js");
script.dataset.fcabrToken = PAGE_TOKEN;
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);

// ---- monitor-manager injection ----

let monitorManagerInjected = false;

function injectMonitorManager(settings) {
    if (monitorManagerInjected) return;

    const isFireteamEnabled = settings.showFireteamClanRank || settings.showFireteamPlayerRank
        || settings.showFireteamPoints || settings.showFireteamPlayerXp;

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
    managerScript.dataset.fcabrToken = PAGE_TOKEN;
    managerScript.dataset.fcabrManagerToken = MANAGER_TOKEN;
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
    monitorManagerInjected = true;
}

// ---- Hot Reload — ConfigDispatcher ----

ConfigDispatcher.init();

// Keys that affect what is rendered in the profile page
const RENDER_KEYS = [
    "showNextPatent", "showExperienceRanking",
    "showFireteamClanRank", "showFireteamPlayerRank",
    "showFireteamPoints", "showFireteamPlayerPoints", "showFireteamPlayerXp",
];

ConfigDispatcher.subscribe(RENDER_KEYS, () => {
    dlog("[FCABR][config-dispatcher] configuração de renderização alterada, atualizando página");
    renderPage();
});

// Keys that affect whether/how monitors run
const MONITOR_KEYS = [
    "showExperienceRanking",
    "showFireteamClanRank", "showFireteamPlayerRank",
    "showFireteamPoints", "showFireteamPlayerPoints", "showFireteamPlayerXp",
    "rankingInterval",
];

ConfigDispatcher.subscribe(MONITOR_KEYS, async () => {
    const settings = await initializeStoredValues(DEFAULT_SETTINGS);
    const isFireteamEnabled = settings.showFireteamClanRank || settings.showFireteamPlayerRank
        || settings.showFireteamPoints || settings.showFireteamPlayerXp;
    const intervalMs = Math.max(MIN_RANKING_INTERVAL_MS, Number(settings.rankingInterval));

    if (!monitorManagerInjected) {
        // Monitor was disabled at boot — inject it now that a flag was enabled
        if (settings.showExperienceRanking || isFireteamEnabled) {
            dlog("[FCABR][config-dispatcher] injetando monitor-manager após habilitação via popup");
            injectMonitorManager(settings);
        }
        return;
    }

    // Relay the updated config to monitor-manager running in the page world
    dlog("[FCABR][config-dispatcher] retransmitindo CONFIG_UPDATE para monitor-manager");
    window.postMessage({
        source: "FCABR_EXTENSION",
        type: "CONFIG_UPDATE",
        token: MANAGER_TOKEN,
        config: {
            experienceRankingEnabled: settings.showExperienceRanking ? "1" : "0",
            experienceRankingInterval: intervalMs,
            fireteamRankingEnabled: isFireteamEnabled ? "1" : "0",
            fireteamRankingInterval: intervalMs,
        },
    });
});

// ---- Initial boot ----

initializeStoredValues(DEFAULT_SETTINGS).then(settings => {
    dlog("[FCABR][monitor-manager] settings carregadas:", settings, "userAgent:", navigator.userAgent);
    injectMonitorManager(settings);
});

// ---- Page rendering ----

function renderPage() {
    const route = routes.PageRoutes.find(r => r.regex.test(location.pathname));
    if (!route) return;
    route.handler();
}

window.addEventListener("message", async event => {

    if (event.source !== window) return;
    if (event.data?.source !== "FCABR_EXTENSION") return;
    if (event.data?.token !== PAGE_TOKEN) return;
    if (event.data?.type === "CONFIG_UPDATE") return; // outbound only, not for us

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
        if (location.href === lastUrl) return;
        lastUrl = location.href;
        renderPage();
    };

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

    window.addEventListener("popstate", checkUrlChange);

    // Fallback para casos onde o framework altera a URL sem disparar os eventos acima
    setInterval(checkUrlChange, 200);
    renderPage();
});

// atualizar os componentes da página quando a janela for redimensionada
let isMobile = window.innerWidth <= 1023;
window.addEventListener("resize", () => {
    const mobile = window.innerWidth <= 1023;
    if (mobile === isMobile) return;
    isMobile = mobile;
    renderPage();
});
