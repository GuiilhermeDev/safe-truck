import { salvarNome, exibirNomes } from "./index.js";

// 📌 Aguarda o carregamento da página
document.addEventListener("DOMContentLoaded", async () => {
    await atualizarLista(); // Atualiza a lista ao carregar a página
});

// 📌 Evento para salvar nome ao enviar o formulário
document.getElementById("formulario").addEventListener("submit", async (event) => {
    event.preventDefault();

    let nome = document.getElementById("nome").value;
    let mensagem = await salvarNome(nome);

    document.getElementById("mensagem").innerText = mensagem;
    document.getElementById("mensagem").style.color = mensagem.includes("sucesso") ? "green" : "red";
    document.getElementById("nome").value = "";

    await atualizarLista(); // Atualiza a lista após salvar
});

// 📌 Função para atualizar a lista de nomes na tela
async function atualizarLista() {
    let nomes = await exibirNomes();
    const lista = document.getElementById("listaNomes");
    lista.innerHTML = "";

    nomes.forEach(nome => {
        const li = document.createElement("li");
        li.innerText = nome;
        lista.appendChild(li);
    });
}
