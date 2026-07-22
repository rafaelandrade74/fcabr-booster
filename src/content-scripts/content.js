import { routes } from "./router.js";
import { profilePage } from "./routes/profile.js";
import StorageService from "../lib/storage-service.js";
import { RouteKeys } from "../data/routekeys.js";
import { initializeStoredValues } from "../utils/index.js";
import { DEFAULT_SETTINGS } from "../utils/settings.js";

const script = document.createElement("script");

script.src = chrome.runtime.getURL("scripts/content-scripts/inject.js");
script.onload = () => script.remove();

(document.head || document.documentElement).appendChild(script);

initializeStoredValues(DEFAULT_SETTINGS).then(settings => {
    if (!settings.showExperienceRanking) return;

    const rankingScript = document.createElement("script");
    rankingScript.src = chrome.runtime.getURL("scripts/content-scripts/ranking-monitor.js");
    rankingScript.dataset.interval = Number(settings.experienceRankingInterval);
    rankingScript.onload = () => rankingScript.remove();
    (document.head || document.documentElement).appendChild(rankingScript);
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

    let storageKey = route.storageKey(event.data.data);
    
    if (!storageKey)
        return;

    StorageService.set(storageKey, event.data.data);

    // renderizar a página novamente para atualizar os dados exibidos
    renderPage();
});

let lastUrl = location.href;
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