(() => {

    const RANKING_API_URL = "https://fcabr.net/api/ranking/player?tab=experience&page=1&pageSize=1000&search=d&hideBannedUsers=0";
    const SYNTHETIC_URL = "fcabr://ranking/experience-position";
    // document.currentScript só está disponível durante a execução síncrona do script
    const intervalMs = Number(document.currentScript?.dataset?.interval) || 600000;

    function getCurrentUserId() {
        const profileKey = Object.keys(localStorage)
            .find(k => k.startsWith("selected-profile-"));

        if (!profileKey) return null;

        const value = Number(localStorage.getItem(profileKey));

        return Number.isNaN(value) ? null : value;
    }

    function fetchRanking() {
        const oidUser = getCurrentUserId();

        if (!oidUser) return;

        // XHR evita que inject.js intercepte e reposte os dados brutos dos 1000 jogadores
        const xhr = new XMLHttpRequest();

        xhr.open("GET", RANKING_API_URL);
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onload = function () {
            if (xhr.status < 200 || xhr.status >= 300) return;

            let body;

            try {
                body = JSON.parse(xhr.responseText);
            } catch {
                return;
            }

            // body.data é o array direto de jogadores
            const players = Array.isArray(body?.data) ? body.data : [];
            const player = players.find(p => p.oidUser === oidUser);

            if (!player) return;

            window.postMessage({
                source: "FCABR_EXTENSION",
                url: SYNTHETIC_URL,
                data: {
                    oidUser: player.oidUser,
                    rank: player.rank,
                    ingameName: player.inGameName
                }
            });
        };

        xhr.send();
    }

    fetchRanking();
    setInterval(fetchRanking, intervalMs);

})();
