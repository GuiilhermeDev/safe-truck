import { database } from './firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Função para codificar e-mails
function codificarEmail(email) {
  return email.replace(/[.#$\[\]%@]/g, '_');
}

// Função para verificar se o usuário é admin
async function verificarAdmin() {
  const emailUsuario = localStorage.getItem("emailUsuario");

  if (!emailUsuario) {
    // Redireciona para a tela de login se o usuário não estiver logado
    window.location.href = "../public/index.html";
    return false;
  }

  const emailCodificado = codificarEmail(emailUsuario);
  const usuariosRef = ref(database, `usuarios/${emailCodificado}`);

  try {
    const snapshot = await get(usuariosRef);
    if (snapshot.exists()) {
      const usuario = snapshot.val();
      if (usuario.perfil === "admin") {
        return true; // Usuário é admin, permite o acesso
      }
    }
    // Redireciona para a home se o usuário não for admin ou não existir
    window.location.href = "../public/home.html";
    return false;
  } catch (error) {
    console.error("Erro ao verificar permissão de admin:", error);
    window.location.href = "../public/home.html";
    return false;
  }
}

// Verifica o acesso ao carregar a página
verificarAdmin().then((isAdmin) => {
  if (isAdmin) {
    console.log("Acesso permitido: usuário é admin.");
    // Aqui você pode chamar as funções específicas da página
  } else {
    console.log("Acesso negado: usuário não é admin.");
  }
});
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