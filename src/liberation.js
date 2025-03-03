import { database } from './firebaseConfig.js';
import { ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Função para codificar e-mails
function codificarEmail(email) {
  return email.replace(/[.#$\[\]%@]/g, '_');
}

// Recupera o e-mail do usuário logado (armazenado no localStorage)
const emailUsuario = localStorage.getItem("emailUsuario");

if (!emailUsuario) {
  // Redireciona para a tela de login se o usuário não estiver logado
  window.location.href = "index.html";
} else {
  // Verifica se o usuário é admin
  const emailCodificado = codificarEmail(emailUsuario);
  const usuariosRef = ref(database, `usuarios/${emailCodificado}`);

  get(usuariosRef).then((snapshot) => {
    if (snapshot.exists()) {
      const usuario = snapshot.val();
      if (usuario.perfil !== "admin") {
        // Redireciona para a home se o usuário não for admin
        window.location.href = "home.html";
      } else {
        // Carrega os checklists pendentes se o usuário for admin
        carregarChecklists();
      }
    } else {
      // Redireciona para a home se o usuário não existir
      window.location.href = "home.html";
    }
  }).catch((error) => {
    console.error("Erro ao buscar dados do usuário:", error);
    window.location.href = "home.html";
  });
}

// Função para carregar checklists pendentes
function carregarChecklists() {
  const checklistsRef = ref(database, 'checklists');
  onValue(checklistsRef, (snapshot) => {
    const data = snapshot.val();
    const lista = document.getElementById("listaChecklists");
    lista.innerHTML = ""; // Limpa a lista antes de carregar

    for (const placa in data) {
      const checklist = data[placa];
      if (checklist.status === "pendente") { // Mostra apenas checklists pendentes
        const item = document.createElement("li");
        item.id = `checklist-${placa}`; // Adiciona um ID único ao item
        item.innerHTML = `
          <strong>Placa:</strong> ${placa} <br>
          <strong>Motorista:</strong> ${checklist.motorista} <br>
          <strong>Status:</strong> ${checklist.status} <br>
          <button onclick="liberarCaminhao('${placa}')">Liberar</button>
        `;
        lista.appendChild(item);
      }
    }
  });
}

// Função para liberar o caminhão
window.liberarCaminhao = function (placa) {
  Swal.fire({
    title: 'Liberar Caminhão?',
    text: "Tem certeza que deseja liberar este caminhão?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, liberar!'
  }).then((result) => {
    if (result.isConfirmed) {
      const checklistRef = ref(database, `checklists/${placa}`);
      update(checklistRef, {
        status: "liberado",
        dataHoraLiberacao: new Date().toISOString() // Armazena a data da liberação
      }).then(() => {
        // Remove o item da lista
        const item = document.getElementById(`checklist-${placa}`);
        if (item) {
          item.remove();
        }
        // Notificação de sucesso
        Swal.fire({
          icon: 'success',
          title: 'Caminhão liberado!',
          text: 'O caminhão foi liberado com sucesso.',
        });
      }).catch((error) => {
        console.error("Erro ao liberar caminhão:", error);
        // Notificação de erro
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Ocorreu um erro ao liberar o caminhão.',
        });
      });
    }
  });
};