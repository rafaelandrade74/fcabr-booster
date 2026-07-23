const CONTAINER_ATTR = "data-fcabr-fireteam-card";

export default class FireteamCard {

    static render(anchor, translations, options) {
        const { showClanRank, showPlayerRank, showPoints, showPlayerXp, clanData, playerData } = options;

        const hasContent =
            (showClanRank && clanData?.rank) ||
            (showPlayerRank && playerData?.rank) ||
            (showPoints && clanData?.pointTotal) ||
            (showPlayerXp && playerData?.xp);

        const existing = document.querySelector(`[${CONTAINER_ATTR}]`);

        if (!hasContent) {
            existing?.remove();
            return;
        }

        const container = existing ?? FireteamCard._createContainer(anchor);
        FireteamCard._populate(container, translations, { showClanRank, showPlayerRank, showPoints, showPlayerXp, clanData, playerData });
    }

    static _createContainer(anchor) {
        const container = document.createElement("div");
        container.setAttribute(CONTAINER_ATTR, "");
        container.style.cssText = [
            "margin-top:12px",
            "border-radius:8px",
            "padding:12px 16px",
            "background:rgba(255,255,255,0.03)",
            "border:1px solid rgba(255,255,255,0.08)",
        ].join(";");
        anchor.insertAdjacentElement("afterend", container);
        return container;
    }

    static _populate(container, translations, { showClanRank, showPlayerRank, showPoints, showPlayerXp, clanData, playerData }) {
        container.innerHTML = "";

        const header = document.createElement("div");
        header.style.cssText = "display:flex;align-items:center;gap:6px;margin-bottom:10px";
        header.appendChild(createTrophyIcon());

        const title = document.createElement("span");
        title.style.cssText = "font-size:13px;font-weight:700;color:#f0b429;letter-spacing:0.02em";
        title.textContent = "Fireteam";
        header.appendChild(title);
        container.appendChild(header);

        const stats = document.createElement("div");
        stats.style.cssText = "display:flex;flex-direction:column;gap:6px";

        if (showClanRank && clanData?.rank) {
            const label = translations?.Profile?.["fireteam-clan-rank-label"] || "Posição do Clã";
            stats.appendChild(createRow(label, `#${clanData.rank}`));
        }

        if (showPlayerRank && playerData?.rank) {
            const label = translations?.Profile?.["fireteam-player-rank-label"] || "Posição no Clã";
            stats.appendChild(createRow(label, `#${playerData.rank}`));
        }

        if (showPoints && clanData?.pointTotal != null) {
            const label = translations?.Profile?.["fireteam-points-label"] || "Pontuação";
            const locale = translations?.lang === "en" ? "en-US" : "pt-BR";
            const value = Number(clanData.pointTotal).toLocaleString(locale);
            stats.appendChild(createRow(label, value));
        }

        if (showPlayerXp && playerData?.xp) {
            const label = translations?.Profile?.["fireteam-player-xp-label"] || "XP Fireteam";
            const locale = translations?.lang === "en" ? "en-US" : "pt-BR";
            const value = Number(playerData.xp).toLocaleString(locale);
            stats.appendChild(createRow(label, value));
        }

        container.appendChild(stats);
    }
}

function createRow(label, value) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:8px;min-width:0";

    const labelEl = document.createElement("span");
    labelEl.style.cssText = "font-size:12px;color:rgba(255,255,255,0.5);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0";
    labelEl.textContent = label;

    const valueEl = document.createElement("span");
    valueEl.style.cssText = "font-size:13px;font-weight:700;color:#f0b429;white-space:nowrap;flex-shrink:0";
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    return row;
}

function createTrophyIcon() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "13");
    svg.setAttribute("height", "13");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "#f0b429");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.style.flexShrink = "0";

    [
        "M6 9H4.5a2.5 2.5 0 0 1 0-5H6",
        "M18 9h1.5a2.5 2.5 0 0 0 0-5H18",
        "M4 22h16",
        "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",
        "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",
        "M18 2H6v7a6 6 0 0 0 12 0V2Z",
    ].forEach(d => {
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", d);
        svg.appendChild(path);
    });

    return svg;
}
