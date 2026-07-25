import { dlog, dwarn, derror } from "../utils/debug-log.js";
import { FALLBACK_OID_USER_KEY } from "../data/api-route-keys.js";

(() => {

    // ---- Utilitários compartilhados ----

    function getCurrentUserId() {
        const key = Object.keys(localStorage).find(k => k.startsWith("selected-profile-"));
        if (key) {
            const value = Number(localStorage.getItem(key));
            if (!Number.isNaN(value)) return value;
            dwarn("[FCABR][monitor-manager] getCurrentUserId: valor não numérico em", key, "=", localStorage.getItem(key));
        }

        const fallbackValue = Number(localStorage.getItem(FALLBACK_OID_USER_KEY));
        if (Number.isNaN(fallbackValue)) {
            dwarn("[FCABR][monitor-manager] getCurrentUserId: nenhuma chave 'selected-profile-*' nem fallback encontrados no localStorage");
            return null;
        }
        return fallbackValue;
    }

    // XHR evita que inject.js intercepte e reposte os dados brutos das respostas
    function xhrGet(url) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.onload = function () {
                if (xhr.status < 200 || xhr.status >= 300) {
                    dwarn("[FCABR][monitor-manager] xhrGet status inválido:", xhr.status, url);
                    return resolve(null);
                }
                try {
                    const parsed = JSON.parse(xhr.responseText);
                    dlog("[FCABR][monitor-manager] xhrGet OK:", url, parsed);
                    resolve(parsed);
                } catch (err) {
                    derror("[FCABR][monitor-manager] xhrGet falha ao parsear JSON:", url, xhr.responseText, err);
                    resolve(null);
                }
            };
            xhr.onerror = (err) => {
                derror("[FCABR][monitor-manager] xhrGet erro de rede (possível CORS/bloqueio):", url, err);
                resolve(null);
            };
            xhr.send();
        });
    }

    function postExtensionMessage(url, data) {
        dlog("[FCABR][monitor-manager] postExtensionMessage:", url, data);
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
        static MIN_INTERVAL_MS = 600000;

        static SYNTHETIC_URL = "fcabr://ranking/experience-position";
        static API_URL = "https://fcabr.net/api/ranking/player?tab=experience&page=1&pageSize=1000&hideBannedUsers=0";

        async execute() {
            const oidUser = getCurrentUserId();
            if (!oidUser) {
                dwarn("[FCABR][ExperienceRankingMonitor] abortado: oidUser não encontrado");
                return;
            }

            const body = await xhrGet(ExperienceRankingMonitor.API_URL);
            if (!body) {
                dwarn("[FCABR][ExperienceRankingMonitor] abortado: resposta da API vazia/nula");
                return;
            }

            const players = Array.isArray(body?.data) ? body.data : [];
            const player = players.find(p => p.oidUser === oidUser);
            if (!player) {
                dwarn("[FCABR][ExperienceRankingMonitor] abortado: oidUser", oidUser, "não encontrado em", players.length, "jogadores retornados");
                return;
            }

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

        static URL_CLAN = "fcabr://ranking/fireteam/clan";
        static URL_CLAN_PLAYER = "fcabr://ranking/fireteam/clan/player";
        static URL_USER_CLAN = "fcabr://ranking/fireteam/user-clan";

        static API_PROFILE = "https://fcabr.net/api/profile?userId=";
        static API_FIRETEAM_CLAN = "https://fcabr.net/api/ranking/clan/fireteam?page=1&size=1000&ranking=pointTotal";
        static API_FIRETEAM_CLAN_PLAYERS = "https://fcabr.net/api/ranking/clan/fireteam/{oidGuild}/players?ranking=pointTotal&weekId={weekId}";

        async execute() {
            // 1. Obter userId do localStorage
            const oidUser = getCurrentUserId();
            if (!oidUser) {
                dwarn("[FCABR][FireteamRankingMonitor] abortado: oidUser não encontrado");
                return;
            }

            // 2. Obter oidGuild via profile
            const profile = await xhrGet(FireteamRankingMonitor.API_PROFILE + oidUser);
            const oidGuild = profile?.data?.clanInfo?.oidGuild;
            if (!oidGuild) {
                dwarn("[FCABR][FireteamRankingMonitor] abortado: oidGuild não encontrado no profile", profile);
                return;
            }

            // 3. Consultar FireteamClan — obter posição do clã e currentWeekID
            const clanBody = await xhrGet(FireteamRankingMonitor.API_FIRETEAM_CLAN);
            if (!clanBody) {
                dwarn("[FCABR][FireteamRankingMonitor] abortado: resposta de FIRETEAM_CLAN vazia/nula");
                return;
            }

            const currentWeekID = clanBody?.meta?.currentWeekID ?? clanBody?.meta?.weekId;
            const clans = Array.isArray(clanBody?.data) ? clanBody.data : [];
            const clan = clans.find(c => c.oidGuild === oidGuild);
            if (!clan) {
                dwarn("[FCABR][FireteamRankingMonitor] abortado: oidGuild", oidGuild, "não encontrado em", clans.length, "clãs retornados");
                return;
            }

            // Publicar mapeamento usuário → clã (necessário para renderização em profile.js)
            postExtensionMessage(FireteamRankingMonitor.URL_USER_CLAN, { oidUser, oidGuild });

            postExtensionMessage(FireteamRankingMonitor.URL_CLAN, {
                oidGuild: clan.oidGuild,
                clanName: clan.clanName ?? clan.name,
                rank: clan.rank,
                pointTotal: clan.pointTotal ?? clan.points ?? 0
            });

            if (!currentWeekID) {
                dwarn("[FCABR][FireteamRankingMonitor] abortado: currentWeekID ausente", clanBody?.meta);
                return;
            }

            // 4. Consultar FireteamClanPlayer — posição do jogador no ranking do clã
            const playersUrl = FireteamRankingMonitor.API_FIRETEAM_CLAN_PLAYERS
                .replace("{oidGuild}", oidGuild)
                .replace("{weekId}", currentWeekID);

            const playersBody = await xhrGet(playersUrl);
            if (!playersBody) {
                dwarn("[FCABR][FireteamRankingMonitor] abortado: resposta de FIRETEAM_CLAN_PLAYERS vazia/nula", playersUrl);
                return;
            }

            const players = Array.isArray(playersBody?.data) ? playersBody.data : [];
            const player = players.find(p => p.oidUser === oidUser);
            if (!player) {
                dwarn("[FCABR][FireteamRankingMonitor] abortado: oidUser", oidUser, "não encontrado em", players.length, "jogadores do clã");
                return;
            }

            postExtensionMessage(FireteamRankingMonitor.URL_CLAN_PLAYER, {
                oidUser: player.oidUser,
                rank: player.rank,
                pointTotal: player.pointTotal ?? player.points ?? 0,
                xp: player.expTotal ?? 0
            });
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
            this._monitors = new Map();
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
                this._monitors.set(entry.id, monitor);
                monitor.execute();
                this._timers.set(entry.id, setInterval(() => monitor.execute(), intervalMs));
            }
        }

        refresh() {
            for (const monitor of this._monitors.values()) {
                monitor.execute();
            }
        }

        /**
         * Aplica uma nova configuração em tempo real (hot-reload).
         * Inicia, para ou reconfigura cada monitor conforme necessário.
         * @param {{ [key: string]: string | number }} config
         */
        update(config) {
            for (const entry of MonitorRegistry) {
                const nowEnabled = config[entry.enabledKey] === "1";
                const wasRunning = this._timers.has(entry.id);
                const newInterval = Math.max(
                    entry.MonitorClass.MIN_INTERVAL_MS,
                    Number(config[entry.intervalKey]) || entry.MonitorClass.MIN_INTERVAL_MS
                );

                if (wasRunning && !nowEnabled) {
                    clearInterval(this._timers.get(entry.id));
                    this._timers.delete(entry.id);
                    this._monitors.delete(entry.id);
                    dlog("[FCABR][ApiMonitorManager] monitor parado:", entry.id);
                } else if (!wasRunning && nowEnabled) {
                    const monitor = new entry.MonitorClass(newInterval);
                    this._monitors.set(entry.id, monitor);
                    monitor.execute();
                    this._timers.set(entry.id, setInterval(() => monitor.execute(), newInterval));
                    dlog("[FCABR][ApiMonitorManager] monitor iniciado:", entry.id, "interval:", newInterval);
                } else if (wasRunning && nowEnabled) {
                    const currentMonitor = this._monitors.get(entry.id);
                    if (currentMonitor.intervalMs !== newInterval) {
                        clearInterval(this._timers.get(entry.id));
                        currentMonitor.intervalMs = newInterval;
                        this._timers.set(entry.id, setInterval(() => currentMonitor.execute(), newInterval));
                        dlog("[FCABR][ApiMonitorManager] interval atualizado:", entry.id, "->", newInterval);
                    }
                }
            }
        }
    }

    // document.currentScript só está disponível durante a execução síncrona do script
    const datasetSnapshot = {};
    const cs = document.currentScript;
    dlog("[FCABR][monitor-manager] monitor-manager.js executando. currentScript:", cs, "userAgent:", navigator.userAgent);
    if (cs) {
        for (const key of Object.keys(cs.dataset)) {
            datasetSnapshot[key] = cs.dataset[key];
        }
    } else {
        dwarn("[FCABR][monitor-manager] document.currentScript é null/undefined — dataset não pôde ser lido, nenhum monitor será iniciado");
    }

    dlog("[FCABR][monitor-manager] datasetSnapshot:", datasetSnapshot);

    const manager = new ApiMonitorManager();
    manager.start(datasetSnapshot);
    dlog("[FCABR][monitor-manager] manager.start() concluído. monitores ativos:", Array.from(manager._monitors.keys()));

    // Detecta troca de perfil comparando o ID salvo com o valor atual do localStorage
    let lastProfileId = getCurrentUserId();
    setInterval(() => {
        const currentId = getCurrentUserId();
        if (currentId !== null && currentId !== lastProfileId) {
            lastProfileId = currentId;
            manager.refresh();
        }
    }, 1000);

    // Hot-reload: recebe atualizações de configuração do content script
    window.addEventListener("message", event => {
        if (event.source !== window) return;
        if (event.data?.source !== "FCABR_EXTENSION") return;
        if (event.data?.type !== "CONFIG_UPDATE") return;
        dlog("[FCABR][monitor-manager] CONFIG_UPDATE recebido:", event.data.config);
        manager.update(event.data.config);
    });

})();
