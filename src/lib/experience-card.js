import DOM from "./dom";

export default class ExperienceCard {
    /**
     * @param {Translations} translations
     * @param {string} tipoPerfil
     */
    constructor(translations, tipoPerfil) {
        /** @type {Translations} */
        this.translations = translations;

        /** @type {HTMLElement | null} */
        this.card = ExperienceCard.findCardElementByName(translations, tipoPerfil);
    }

    /**
     * @param {Translations} translations
     * @param {string} name
     * @returns {HTMLElement | null}
     */
    static findCardElementByName(translations, name) {
        const tipo = {
            PF: ExperienceCard.findCardElementPerfil,
            PFP: ExperienceCard.findCardElementPerfilPrincipal,
        };

        return tipo[name]?.(translations) ?? null;
    }

    /**
     * @param {Translations} translations
     * @returns {HTMLElement | null}
     */
    static findCardElementPerfil(translations) {
        const elementFounded = DOM.byTextVisible("span", translations.Profile["xp-label"]);
        return elementFounded?.closest("div.rounded-lg") || null;
    }

    /**
     * @param {Translations} translations
     * @returns {HTMLElement | null}
     */
    static findCardElementPerfilPrincipal(translations) {
        const elementFounded = DOM.byTextVisible("div.inline-flex.rounded.border > button", translations.Profile["xp-label-btn"]);
        return elementFounded?.closest("div.rounded-lg") || null;
    }

    /** @returns {HTMLElement | null} */
    getFooter() {
        return this.card?.querySelector(".pt-2") || null;
    }

    /** @returns {Array<HTMLSpanElement>} */
    getFooterSpans() {
        let footer = this.getFooter();
        return footer ? Array.from(footer.querySelectorAll("span")) : [];
    }

    /**
     * @param {number} xp
     */
    setBaseXp(xp) {
        if (xp === undefined || xp === null) return;

        const spans = this.getFooterSpans();
        if (spans[0]) {
            spans[0].textContent = formatXP(xp, this.translations.lang);
        }
    }

    /**
     * @param {number} xp
     */
    setRemaining(xp) {
        if (xp === 0) return;
        if (xp === undefined || xp === null) return;
        const remainingLabel = this.translations?.Profile?.["xp-remaining-bg"] || "XP restante";

        const spans = this.getFooterSpans();
        if (spans[1]) spans[1].textContent = `${formatXP(xp, this.translations.lang)} ${remainingLabel}`;
    }

    /**
     * @param {number} xp
     */
    setNextXp(xp) {
        if (xp === undefined || xp === null) return;
        const spans = this.getFooterSpans();
        if (spans[2]) {
            spans[2].textContent = formatXP(xp, this.translations.lang);
        }
    }

    /**
     * Escuta cliques no botão EXP e dispara callback após o FCABR atualizar o DOM.
     * Idempotente: registra o listener apenas uma vez por elemento.
     * @param {() => void} callback
     */
    watchTabSwitch(callback) {
        const btn = this.card?.querySelector("div.inline-flex.rounded.border > button");
        if (!btn || btn.hasAttribute("data-fcabr-tab-watch")) return;
        btn.setAttribute("data-fcabr-tab-watch", "");
        btn.addEventListener("click", () => setTimeout(callback, 0));
    }

    /** @returns {HTMLElement | null} */
    getHeader() {
        const tabEl = this.card?.querySelector("div.inline-flex.rounded.border");
        return tabEl?.parentElement || null;
    }

    /** @returns {HTMLElement | null} */
    _getBadgeContainer() {
        const header = this.getHeader();
        if (!header) return null;

        const ATTR = "data-fcabr-badge-container";
        let container = header.querySelector(`[${ATTR}]`);

        if (!container) {
            container = document.createElement("div");
            container.setAttribute(ATTR, "");
            container.style.cssText = [
                "display:inline-flex",
                "align-items:center",
                "gap:6px",
                "margin-left:auto",
                "flex-shrink:0",
            ].join(";");
            header.appendChild(container);
        }

        return container;
    }

    /**
     * Injeta ou atualiza um badge no container do header.
     * Idempotente: chamadas subsequentes apenas atualizam o número.
     * @param {number} rank
     * @param {string} attrName
     * @param {string} labelText
     * @param {() => SVGSVGElement} createIconFn
     */
    _renderBadge(rank, attrName, labelText, createIconFn) {
        if (!rank) return;

        const container = this._getBadgeContainer();
        if (!container) return;

        const numAttr = `${attrName}-num`;
        let badge = container.querySelector(`[${attrName}]`);

        if (badge) {
            const numEl = badge.querySelector(`[${numAttr}]`);
            if (numEl) numEl.textContent = `${labelText} #${rank}`;
            return;
        }

        badge = document.createElement("div");
        badge.setAttribute(attrName, "");
        badge.style.cssText = [
            "display:inline-flex",
            "align-items:center",
            "gap:5px",
            "background:rgba(240,180,41,.1)",
            "border:1px solid rgba(240,180,41,.3)",
            "border-radius:5px",
            "padding:3px 9px",
            "font-size:11px",
            "font-weight:700",
            "color:#f0b429",
            "white-space:nowrap",
            "flex-shrink:0",
            "line-height:1.4",
        ].join(";");

        badge.appendChild(createIconFn());

        const num = document.createElement("span");
        num.setAttribute(numAttr, "");
        num.textContent = `${labelText} #${rank}`;
        badge.appendChild(num);

        container.appendChild(badge);
    }

    /**
     * Injeta ou atualiza o badge "Top #N" (Ranking de Experiência).
     * @param {number} rank
     */
    setRankingBadge(rank) {
        this._renderBadge(rank, "data-fcabr-rank-badge", "Top", createTrophyIcon);
    }

    /**
     * Injeta ou atualiza o badge do clã no Ranking Semanal Fireteam.
     * @param {number} rank
     */
    setFireteamClanBadge(rank) {
        const label = this.translations?.Profile?.["fireteam-clan-badge-label"] || "Clã";
        this._renderBadge(rank, "data-fcabr-fireteam-clan-badge", label, createShieldIcon);
    }

    /**
     * Injeta ou atualiza o badge do jogador no Ranking Semanal Fireteam.
     * @param {number} rank
     */
    setFireteamPlayerBadge(rank) {
        const label = this.translations?.Profile?.["fireteam-player-badge-label"] || "Fireteam";
        this._renderBadge(rank, "data-fcabr-fireteam-player-badge", label, createUsersIcon);
    }

    /** @returns {HTMLElement | null} */
    get progressBar() {
        return /** @type {HTMLElement | null} */ (this.card?.querySelector(".bg-gradient-to-r") || null);
    }

    /**
     * @param {number} currentXp
     * @param {number} baseXp
     * @param {number} nextXp
     */
    setProgress(currentXp, baseXp, nextXp) {
        if (!this.progressBar) {
            return;
        }

        let percent = ((currentXp - baseXp) / (nextXp - baseXp)) * 100;
        percent = Math.max(0, Math.min(100, percent));

        this.progressBar.style.width = `${percent}%`;
    }
}

/** @returns {SVGSVGElement} */
function createTrophyIcon() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "11");
    svg.setAttribute("height", "11");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
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

/** @returns {SVGSVGElement} */
function createShieldIcon() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "11");
    svg.setAttribute("height", "11");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.style.flexShrink = "0";

    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z");
    svg.appendChild(path);

    return svg;
}

/** @returns {SVGSVGElement} */
function createUsersIcon() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "11");
    svg.setAttribute("height", "11");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.style.flexShrink = "0";

    [
        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
        "M23 21v-2a4 4 0 0 0-3-3.87",
        "M16 3.13a4 4 0 0 1 0 7.75",
    ].forEach(d => {
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", d);
        svg.appendChild(path);
    });

    const circle = document.createElementNS(NS, "circle");
    circle.setAttribute("cx", "9");
    circle.setAttribute("cy", "7");
    circle.setAttribute("r", "4");
    svg.appendChild(circle);

    return svg;
}

/**
 * @param {number} value
 * @param {string} [lang]
 */
function formatXP(value, lang = "pt") {
    /** @type {{[key in string]: string}} */
    const languageMap = {
        pt: "pt-BR",
        en: "en-US",
    };

    const language = languageMap[lang] || "pt-BR";
    return value.toLocaleString(language);
}