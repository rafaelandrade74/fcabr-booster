import { routes } from "./router.js";
import { profilePage } from "./routes/profile.js";
import StorageService from "../lib/storage-service.js";
import { RouteKeys } from "../data/routekeys.js";

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


function start() {
    let timeout;
    let lastUrl = location.href;

    const observer = new MutationObserver(() => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            onPageChanged();
        }, 200);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
function onPageChanged() {
    const route = routes.PageRoutes.find(r => r.regex.test(location.pathname));
    if (route) {
        const resultado = StorageService.get(RouteKeys.GoaRankStatus);
        console.log("resultado", resultado);
        route.handler(resultado);
    }
}

window.addEventListener("DOMContentLoaded", start);