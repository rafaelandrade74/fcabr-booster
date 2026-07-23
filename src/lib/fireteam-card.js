export const CONTAINER_ATTR = "data-fcabr-fireteam-card";

export default class FireteamCard {

    static render(anchor, translations, options) {
        const { showClanRank, showPlayerRank, showPoints, showPlayerPoints, showPlayerXp, clanData, playerData } = options;

        const hasClanContent = showClanRank || showPoints;
        const hasPlayerContent = showPlayerRank || showPlayerPoints || showPlayerXp;
        const hasContent = hasClanContent || hasPlayerContent;

        const existing = anchor.parentElement?.querySelector(`[${CONTAINER_ATTR}]`) ?? null;

        if (!hasContent) {
            existing?.remove();
            return;
        }

        const container = existing ?? FireteamCard._createContainer(anchor);
        FireteamCard._populate(container, translations, {
            showClanRank, showPlayerRank, showPoints, showPlayerPoints, showPlayerXp,
            clanData, playerData, hasClanContent, hasPlayerContent,
        });
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

    static _populate(container, translations, {
        showClanRank, showPlayerRank, showPoints, showPlayerPoints, showPlayerXp,
        clanData, playerData, hasClanContent, hasPlayerContent,
    }) {
        container.innerHTML = "";

        const isEn = translations?.lang === "en";
        const locale = isEn ? "en-US" : "pt-BR";
        const t = translations?.Profile ?? {};

        const header = document.createElement("div");
        header.style.cssText = "display:flex;align-items:center;gap:6px;margin-bottom:10px";
        header.appendChild(createTrophyIcon());
        const title = document.createElement("span");
        title.style.cssText = "font-size:15px;font-weight:700;color:#f0b429;letter-spacing:0.02em";
        title.textContent = "Fireteam";
        header.appendChild(title);
        container.appendChild(header);

        const grid = document.createElement("div");
        grid.style.cssText = "display:flex;gap:8px;flex-wrap:wrap";

        if (hasClanContent) {
            const card = createSubCard(isEn ? "Clan" : "Clã", createShieldIcon());

            if (showClanRank) {
                const label = t["fireteam-clan-rank-label"] || (isEn ? "Rank" : "Posição");
                const value = clanData?.rank ? `#${clanData.rank}` : "0";
                card.appendChild(createStatRow(label, value));
            }
            if (showPoints) {
                const label = t["fireteam-points-label"] || (isEn ? "Points" : "Pontos");
                const value = clanData?.pointTotal ? Number(clanData.pointTotal).toLocaleString(locale) : "0";
                card.appendChild(createStatRow(label, value));
            }

            grid.appendChild(card);
        }

        if (hasPlayerContent) {
            const card = createSubCard(isEn ? "Player" : "Jogador", createUserIcon());

            if (showPlayerRank) {
                const label = t["fireteam-player-rank-label"] || (isEn ? "Rank" : "Posição");
                const value = playerData?.rank ? `#${playerData.rank}` : "0";
                card.appendChild(createStatRow(label, value));
            }
            if (showPlayerPoints) {
                const label = t["fireteam-player-points-label"] || (isEn ? "Points" : "Pontos");
                const value = playerData?.pointTotal ? Number(playerData.pointTotal).toLocaleString(locale) : "0";
                card.appendChild(createStatRow(label, value));
            }
            if (showPlayerXp) {
                const label = t["fireteam-player-xp-label"] || "XP";
                const value = playerData?.xp ? Number(playerData.xp).toLocaleString(locale) : "0";
                card.appendChild(createStatRow(label, value));
            }

            grid.appendChild(card);
        }

        container.appendChild(grid);
    }
}

function createSubCard(titleText, icon) {
    const card = document.createElement("div");
    card.style.cssText = [
        "flex:1",
        "min-width:110px",
        "background:rgba(255,255,255,0.04)",
        "border-radius:6px",
        "padding:8px 10px",
        "border:1px solid rgba(255,255,255,0.07)",
        "display:flex",
        "flex-direction:column",
        "gap:6px",
    ].join(";");

    const cardHeader = document.createElement("div");
    cardHeader.style.cssText = [
        "display:flex",
        "align-items:center",
        "gap:5px",
        "padding-bottom:6px",
        "margin-bottom:2px",
        "border-bottom:1px solid rgba(255,255,255,0.06)",
    ].join(";");
    cardHeader.appendChild(icon);

    const label = document.createElement("span");
    label.style.cssText = "font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:rgba(255,255,255,0.55)";
    label.textContent = titleText;
    cardHeader.appendChild(label);
    card.appendChild(cardHeader);

    return card;
}

function createStatRow(label, value) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;justify-content:space-between;align-items:baseline;gap:4px;min-width:0";

    const labelEl = document.createElement("span");
    labelEl.style.cssText = "font-size:12px;color:rgba(255,255,255,0.45);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0";
    labelEl.textContent = label;

    const valueEl = document.createElement("span");
    valueEl.style.cssText = "font-size:14px;font-weight:700;color:#f0b429;white-space:nowrap;flex-shrink:0";
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

function createShieldIcon() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "11");
    svg.setAttribute("height", "11");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "rgba(255,255,255,0.45)");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.style.flexShrink = "0";

    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z");
    svg.appendChild(path);
    return svg;
}

function createUserIcon() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "11");
    svg.setAttribute("height", "11");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "rgba(255,255,255,0.45)");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.style.flexShrink = "0";

    [
        "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
        "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    ].forEach(d => {
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", d);
        svg.appendChild(path);
    });
    return svg;
}
