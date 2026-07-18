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
        if (xp === undefined || xp === null) {
            console.warn("Base XP is undefined or null");
            return;
        }

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
        if (xp === undefined || xp === null) {
            console.warn("Remaining XP is undefined or null");
            return;
        }
        const remainingLabel = this.translations?.Profile?.["xp-remaining-bg"] || "XP restante";

        const spans = this.getFooterSpans();
        if (spans[1]) spans[1].textContent = `${formatXP(xp, this.translations.lang)} ${remainingLabel}`;
    }

    /**
     * @param {number} xp
     */
    setNextXp(xp) {
        if (xp === undefined || xp === null) {
            console.warn("Next XP is undefined or null");
            return;
        }
        const spans = this.getFooterSpans();
        if (spans[2]) {
            spans[2].textContent = formatXP(xp, this.translations.lang);
        }
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