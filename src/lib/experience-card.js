export default class ExperienceCard {

    constructor() {

        this.card = [...document.querySelectorAll("span")]
            .find(e => e.textContent === "Experiência" && e.offsetParent !== null)
            ?.closest(".p-2");

    }

    get footer() {
        return this.card.querySelector(".pt-2");
    }

    get spans() {
        return this.footer.querySelectorAll("span");
    }

    setBaseXp(xp) {
        if(xp === undefined || xp === null) {
            console.warn("Base XP is undefined or null");
            return;
        }
        this.spans[0].textContent = formatXP(xp);
    }

    setRemaining(xp) {
        if(xp === undefined || xp === null) {
            console.warn("Remaining XP is undefined or null");
            return;
        }
        this.spans[1].textContent = formatXP(xp) + " restantes";
    }

    setNextXp(xp) {
        if(xp === undefined || xp === null) {
            console.warn("Next XP is undefined or null");
            return;
        }
        this.spans[2].textContent = formatXP(xp);
    }

    get progressBar() {
        return this.card.querySelector(".bg-gradient-to-r");
    }

    setProgress(currentXp, baseXp, nextXp) {

        let percent = ((currentXp - baseXp) / (nextXp - baseXp)) * 100;

        percent = Math.max(0, Math.min(100, percent));

        this.progressBar.style.width = `${percent}%`;
    }

}

function formatXP(value) {
    return value.toLocaleString("pt-BR") + " XP";
}