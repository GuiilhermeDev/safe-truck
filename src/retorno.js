import { database } from './firebaseConfig.js';
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Função para carregar caminhões liberados
function carregarCaminhoesLiberados() {
  const checklistsRef = ref(database, 'checklists');

  onValue(checklistsRef, (snapshot) => {
    const data = snapshot.val();
    const lista = document.getElementById("listaCaminhoesLiberados");
    lista.innerHTML = ""; // Limpa a lista antes de carregar

    for (const placa in data) {
      const checklist = data[placa];
      if (checklist.status === "liberado") { // Mostra apenas caminhões liberados
        const item = document.createElement("li");
        item.id = `caminhao-${placa}`; // Adiciona um ID único ao item
        item.innerHTML = `
          <strong>Placa:</strong> ${placa} <br>
          <strong>Motorista:</strong> ${checklist.motorista} <br>
          <strong>Data de Liberação:</strong> ${new Date(checklist.dataHoraLiberacao).toLocaleString()} <br>
          <button onclick="registrarRetorno('${placa}')">Registrar Retorno</button>
        `;
        lista.appendChild(item);
      }
    }
  });
}

// Função para registrar o retorno do caminhão
window.registrarRetorno = function (placa) {
  Swal.fire({
    title: 'Registrar Retorno?',
    text: `Tem certeza que deseja registrar o retorno do caminhão de placa ${placa}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, registrar!'
  }).then((result) => {
    if (result.isConfirmed) {
      const checklistRef = ref(database, `checklists/${placa}`);
      update(checklistRef, {
        status: "retornado",
        dataHoraRetorno: new Date().toISOString() // Armazena a data do retorno
      }).then(() => {
        // Remove o item da lista
        const item = document.getElementById(`caminhao-${placa}`);
        if (item) {
          item.remove();
        }
        // Notificação de sucesso
        Swal.fire({
          icon: 'success',
          title: 'Retorno registrado!',
          text: `O retorno do caminhão de placa ${placa} foi registrado com sucesso.`,
        });
      }).catch((error) => {
        console.error("Erro ao registrar retorno:", error);
        // Notificação de erro
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Ocorreu um erro ao registrar o retorno.',
        });
      });
    }
  });
};

// Inicializa a tela de retorno
carregarCaminhoesLiberados();

// Botão de Voltar
document.getElementById("btnVoltar").addEventListener("click", () => {
  window.location.href = "home.html";
});