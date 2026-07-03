import { apiRoutes } from "./router.js";
import { profilePage } from "./routes/profile.js";

const script = document.createElement("script");

script.src = chrome.runtime.getURL("scripts/content-scripts/inject.js");
script.onload = () => script.remove();

(document.head || document.documentElement).appendChild(script);

window.addEventListener("message", event => {

    if (event.source !== window)
        return;

    if (event.data?.source !== "FCABR_EXTENSION")
        return;

    const route = apiRoutes.find(r => r.regex.test(event.data.url));
    if (route) {
        route.handler(event.data.data);
    }
});