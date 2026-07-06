import { routes } from "./router.js";
import { profilePage } from "./routes/profile.js";
import StorageService from "../lib/storage-service.js";

const script = document.createElement("script");

script.src = chrome.runtime.getURL("scripts/content-scripts/inject.js");
script.onload = () => script.remove();

(document.head || document.documentElement).appendChild(script);

window.addEventListener("message", async event => {

    if (event.source !== window)
        return;

    if (event.data?.source !== "FCABR_EXTENSION")
        return;

    const route = routes.ApiRoutes.find(r => r.regex.test(event.data.url));

    if (!route)
        return;

    StorageService.set(route.storageKey, event.data.data);
});

let lastUrl = location.href;

function start() {

    const checkUrlChange = () => {

        if (location.href === lastUrl)
            return;

        lastUrl = location.href;

        onPageChanged();
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

    // Primeira renderização
    onPageChanged();
}

function onPageChanged() {

    const route = routes.PageRoutes.find(r => r.regex.test(location.pathname));

    if (!route)
        return;

    route.handler();
}

window.addEventListener("DOMContentLoaded", start);