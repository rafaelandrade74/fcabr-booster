(() => {

    // ---- Utilitários compartilhados ----

    function getCurrentUserId() {
        const key = Object.keys(localStorage).find(k => k.startsWith("selected-profile-"));
        if (!key) return null;
        const value = Number(localStorage.getItem(key));
        return Number.isNaN(value) ? null : value;
    }

    // XHR evita que inject.js intercepte e reposte os dados brutos das respostas
    function xhrGet(url) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.onload = function () {
                if (xhr.status < 200 || xhr.status >= 300) return resolve(null);
                try { resolve(JSON.parse(xhr.responseText)); } catch { resolve(null); }
            };
            xhr.onerror = () => resolve(null);
            xhr.send();
        });
    }

    function postExtensionMessage(url, data) {
        window.postMessage({ source: "FCABR_EXTENSION", url, data });
    }

    // ---- BaseMonitor ----

    class BaseMonitor {
        static MIN_INTERVAL_MS = 60000;

        constructor(intervalMs) {
            this.intervalMs = intervalMs;
        }

        async execute() {
            throw new Error("execute() deve ser implementado pela subclasse");
        }
    }

    // ---- ExperienceRankingMonitor ----

    class ExperienceRankingMonitor extends BaseMonitor {
        static MIN_INTERVAL_MS = 60000;

        static SYNTHETIC_URL = "fcabr://ranking/experience-position";
        static API_URL = "https://fcabr.net/api/ranking/player?tab=experience&page=1&pageSize=1000&hideBannedUsers=0";

        async execute() {
            const oidUser = getCurrentUserId();
            if (!oidUser) return;

            const body = await xhrGet(ExperienceRankingMonitor.API_URL);
            if (!body) return;

            const players = Array.isArray(body?.data) ? body.data : [];
            const player = players.find(p => p.oidUser === oidUser);
            if (!player) return;

            postExtensionMessage(ExperienceRankingMonitor.SYNTHETIC_URL, {
                oidUser: player.oidUser,
                rank: player.rank,
                ingameName: player.inGameName
            });
        }
    }

    // ---- FireteamRankingMonitor ----

    class FireteamRankingMonitor extends BaseMonitor {
        static MIN_INTERVAL_MS = 600000;

        static SYNTHETIC_URL_CLAN = "fcabr://ranking/fireteam/clan";
        static SYNTHETIC_URL_PLAYER = "fcabr://ranking/fireteam/player";
        static PROFILE_API_URL = "https://fcabr.net/api/profile?userId=";
        static RANKING_API_URL = "https://fcabr.net/api/ranking/clan/fireteam?page=1&size=1000&ranking=pointTotal";

        async execute() {
            const oidUser = getCurrentUserId();
            if (!oidUser) return;

            const profile = await xhrGet(FireteamRankingMonitor.PROFILE_API_URL + oidUser);
            const oidGuild = profile?.data?.clanInfo?.oidGuild;
            if (!oidGuild) return;

            const body = await xhrGet(FireteamRankingMonitor.RANKING_API_URL);
            if (!body) return;

            const clans = Array.isArray(body?.data) ? body.data : [];
            const clan = clans.find(c => c.oidGuild === oidGuild);
            if (!clan) return;

            postExtensionMessage(FireteamRankingMonitor.SYNTHETIC_URL_CLAN, {
                oidGuild: clan.oidGuild,
                clanName: clan.clanName ?? clan.name,
                rank: clan.rank,
                points: clan.pointTotal ?? clan.points ?? 0
            });

            if (Array.isArray(clan.members)) {
                const member = clan.members.find(m => m.oidUser === oidUser);
                if (member) {
                    postExtensionMessage(FireteamRankingMonitor.SYNTHETIC_URL_PLAYER, {
                        oidUser: member.oidUser,
                        ingameName: member.ingameName ?? member.inGameName,
                        rank: member.rank,
                        points: member.points ?? 0
                    });
                }
            }
        }
    }

    // ---- MonitorRegistry ----

    const MonitorRegistry = [
        {
            id: "experience-ranking",
            MonitorClass: ExperienceRankingMonitor,
            enabledKey: "experienceRankingEnabled",
            intervalKey: "experienceRankingInterval"
        },
        {
            id: "fireteam-ranking",
            MonitorClass: FireteamRankingMonitor,
            enabledKey: "fireteamRankingEnabled",
            intervalKey: "fireteamRankingInterval"
        }
    ];

    // ---- ApiMonitorManager ----

    class ApiMonitorManager {
        constructor() {
            this._timers = new Map();
        }

        start(dataset) {
            for (const entry of MonitorRegistry) {
                if (dataset[entry.enabledKey] !== "1") continue;
                if (this._timers.has(entry.id)) continue;

                const minInterval = entry.MonitorClass.MIN_INTERVAL_MS;
                const intervalMs = Math.max(
                    minInterval,
                    Number(dataset[entry.intervalKey]) || minInterval
                );

                const monitor = new entry.MonitorClass(intervalMs);
                monitor.execute();
                this._timers.set(entry.id, setInterval(() => monitor.execute(), intervalMs));
            }
        }
    }

    // document.currentScript só está disponível durante a execução síncrona do script
    const datasetSnapshot = {};
    const cs = document.currentScript;
    if (cs) {
        for (const key of Object.keys(cs.dataset)) {
            datasetSnapshot[key] = cs.dataset[key];
        }
    }

    new ApiMonitorManager().start(datasetSnapshot);

})();
