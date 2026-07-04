import DOM from "../../lib/dom";
import ExperienceCard from "../../lib/experience-card";
import patentes from "../../data/patents";

export async function profilePage(data) {
    // aguardar até que o elemento de Experiência esteja presente na página
    const experience = await DOM.waitUntil(() =>
        DOM.byTextVisible("span", "Experiência")
    );
        
    const patente = patentes.find(p => p.name === data.data.patenteAtual);
        
    const currentXp = data.data.exp;
    const nextXp = data.data.expNecessario;
    if (!patente && currentXp < 8_000_000) return;

    const baseXp = patente.targetXp;
    const remainingXp = Math.max(0, nextXp - currentXp);

    const card = new ExperienceCard();
    card.setBaseXp(baseXp);
    card.setRemaining(remainingXp);
    card.setNextXp(nextXp);
    card.setProgress(currentXp, baseXp, nextXp);
}