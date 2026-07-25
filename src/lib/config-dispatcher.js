/**
 * ConfigDispatcher — central hub for chrome.storage.local change events.
 *
 * Components subscribe to a set of keys and receive a callback whenever
 * any of those keys changes. A single chrome.storage.onChanged listener
 * handles all subscriptions, avoiding scattered per-feature listeners.
 *
 * Usage:
 *   ConfigDispatcher.subscribe(['showFireteamClanRank'], changes => { ... });
 *   ConfigDispatcher.init(); // call once in the content script entry point
 */
const ConfigDispatcher = (() => {
    /** @type {{ keys: string[], callback: (changes: Object) => void }[]} */
    const subscribers = [];
    let initialized = false;

    return {
        init() {
            if (initialized) return;
            initialized = true;

            chrome.storage.onChanged.addListener((changes, area) => {
                if (area !== "local") return;

                for (const { keys, callback } of subscribers) {
                    const relevantChanges = {};
                    let hasChange = false;

                    for (const key of keys) {
                        if (key in changes) {
                            relevantChanges[key] = changes[key];
                            hasChange = true;
                        }
                    }

                    if (hasChange) {
                        callback(relevantChanges);
                    }
                }
            });
        },

        /**
         * @param {string[]} keys - storage keys this subscriber cares about
         * @param {(changes: Object) => void} callback - called with only the changed keys
         */
        subscribe(keys, callback) {
            subscribers.push({ keys, callback });
        },

        /** @param {(changes: Object) => void} callback */
        unsubscribe(callback) {
            const idx = subscribers.findIndex(s => s.callback === callback);
            if (idx !== -1) subscribers.splice(idx, 1);
        },
    };
})();

export default ConfigDispatcher;
