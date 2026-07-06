export default class ExperienceCard {
    /**
     * @param {Translations} translations
     */
    constructor(translations) {
        /** @type {Translations} */
        this.translations = translations;

        /** @type {HTMLElement | null} */
        this.card = [...document.querySelectorAll("span")]
            .find((e) => e.textContent.trim() === this.translations.Profile["xp-label"] && e.offsetParent !== null)
            ?.closest(".p-2") || null;
    }

    /** @returns {HTMLElement | null} */
    get footer() {
        return this.card?.querySelector(".pt-2") || null;
    }

    /** @returns {NodeListOf<HTMLSpanElement>} */
    get spans() {
        return this.footer?.querySelectorAll("span") || /** @type {NodeListOf<HTMLSpanElement>} */ (document.createDocumentFragment().querySelectorAll("span"));
    }

    /**
     * @param {number} xp
     */
    setBaseXp(xp) {
        if (xp === undefined || xp === null) {
            console.warn("Base XP is undefined or null");
            return;
        }

        this.spans[0].textContent = formatXP(xp, this.translations.lang);
    }

    /**
     * @param {number} xp
     */
    setRemaining(xp) {
        if (xp === undefined || xp === null) {
            console.warn("Remaining XP is undefined or null");
            return;
        }
        const remainingLabel = this.translations?.Profile?.["xp-remaining-bg"] || "XP restante";
        this.spans[1].textContent = `${formatXP(xp, this.translations.lang)} ${remainingLabel}`;
    }

    /**
     * @param {number} xp
     */
    setNextXp(xp) {
        if (xp === undefined || xp === null) {
            console.warn("Next XP is undefined or null");
            return;
        }
        this.spans[2].textContent = formatXP(xp, this.translations.lang);
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