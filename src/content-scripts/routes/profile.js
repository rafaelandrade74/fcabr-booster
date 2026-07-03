import DOM from "../../lib/dom";

export async function profilePage(data) {

    console.log("Tem dados?", data);
    // aguardar até que o elemento de Experiência esteja presente na página
    const experience = await DOM.waitUntil(() =>
        DOM.byText("span", "Experiência")
    );

    console.log("Elemento de Experiência encontrado:", DOM.byText("span", "Experiência"));
    console.log("Entrou no Perfil");
    console.log(experience);

}