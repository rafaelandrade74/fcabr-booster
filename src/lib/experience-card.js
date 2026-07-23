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
     * Retorna todos os cards de XP no DOM (mobile + desktop do Next.js).
     * @param {Translations} translations
     * @param {string} tipoPagina
     * @returns {HTMLElement[]}
     */
    static findAllCardElements(translations, tipoPagina) {
        if (tipoPagina === "PF") {
            return DOM.$$("span")
                .filter(el => el.textContent.trim() === translations.Profile["xp-label"])
                .map(el => el.closest("div.rounded-lg"))
                .filter(Boolean);
        }
        if (tipoPagina === "PFP") {
            return DOM.$$("div.inline-flex.rounded.border > button")
                .filter(el => el.textContent.trim() === translations.Profile["xp-label-btn"])
                .map(el => el.closest("div.rounded-lg"))
                .filter(Boolean);
        }
        return [];
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
        if (spans[0]) setSpanText(spans[0], formatXP(xp, this.translations.lang));
    }

    /**
     * @param {number} xp
     */
    setRemaining(xp) {
        if (xp === 0) return;
        if (xp === undefined || xp === null) return;
        const remainingLabel = this.translations?.Profile?.["xp-remaining-bg"] || "XP restante";
        const spans = this.getFooterSpans();
        if (spans[1]) setSpanText(spans[1], `${formatXP(xp, this.translations.lang)} ${remainingLabel}`);
    }

    /**
     * @param {number} xp
     */
    setNextXp(xp) {
        if (xp === undefined || xp === null) return;
        const spans = this.getFooterSpans();
        if (spans[2]) setSpanText(spans[2], formatXP(xp, this.translations.lang));
    }

    /**
     * Escuta cliques no botão EXP e dispara callback após o FCABR atualizar o DOM.
     * Idempotente: registra o listener apenas uma vez por elemento.
     * @param {() => void} callback
     */
    /**
     * @param {() => void} callback - re-injetado após React reconciliar (setTimeout)
     * @param {(() => void) | null} [beforeCallback] - chamado síncronamente antes de o React processar o clique
     */
    watchTabSwitch(callback, beforeCallback = null) {
        const BADGE_ATTR = "data-fcabr-badge-container";
        const outerCard = this.card?.parentElement;

        const buttons = this.card?.querySelectorAll("div.inline-flex.rounded.border > button") ?? [];
        buttons.forEach(btn => {
            if (btn.hasAttribute("data-fcabr-tab-watch")) return;
            btn.setAttribute("data-fcabr-tab-watch", "");
            btn.addEventListener("click", () => {
                // Remove nossos nós ANTES de o React processar o clique (síncrono = antes do listener delegado do React)
                outerCard?.querySelector(`[${BADGE_ATTR}]`)?.remove();
                beforeCallback?.();
                setTimeout(callback, 0);
            });
        });
    }

    /** @returns {HTMLElement | null} */
    getHeader() {
        const tabEl = this.card?.querySelector("div.inline-flex.rounded.border");
        return tabEl?.parentElement || null;
    }

    /** @returns {HTMLElement | null} */
    _getBadgeContainer() {
        if (!this.card) return null;

        // O nome do player está no card externo (parentElement), não no card interno de XP
        const outerCard = this.card.parentElement;
        const ATTR = "data-fcabr-badge-container";
        let container = outerCard?.querySelector(`[${ATTR}]`) ?? this.card.querySelector(`[${ATTR}]`);

        if (!container) {
            container = document.createElement("div");
            container.setAttribute(ATTR, "");
            container.style.cssText = [
                "display:flex",
                "align-items:center",
                "gap:6px",
                "margin-top:4px",
            ].join(";");

            const nameEl = outerCard?.querySelector('[class*="text-4xl"]') ?? null;
            // outerRow = div.flex.flex-wrap.justify-between (linha topo do card)
            const outerRow = nameEl?.parentElement?.parentElement?.parentElement ?? null;
            if (outerRow) {
                // Append ao final: React só itera os fibers que conhece e ignora nós extras
                // no fim do DOM — inserir antes de socialCol quebrava a reconciliação do React
                outerRow.appendChild(container);
            } else {
                this.card.appendChild(container);
            }
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
            "font-size:13px",
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


/**
 * Atualiza o texto de um span modificando o nó de texto EXISTENTE (nodeValue),
 * sem remover/recriar o nó — necessário para não desincronizar o fiber tree do React.
 * Usar span.textContent = x descarta o nó de texto que o React rastreia;
 * quando o React faz removeChild desse nó ao desmontar, o nó já tem parentNode=null → NotFoundError.
 * @param {HTMLElement} span
 * @param {string} value
 */
function setSpanText(span, value) {
    const textNode = span.firstChild;
    if (textNode?.nodeType === Node.TEXT_NODE) {
        textNode.nodeValue = value;
    } else {
        span.textContent = value;
    }
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