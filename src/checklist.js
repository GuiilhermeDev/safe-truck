import { database } from './firebaseConfig.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Função para verificar o status do caminhão
async function verificarStatusCaminhao(placa) {
  const checklistRef = ref(database, `checklists/${placa}`);
  const snapshot = await get(checklistRef);

  if (snapshot.exists()) {
    const checklist = snapshot.val();
    if (checklist.status === "pendente" || checklist.status === "liberado") {
      return false; // Caminhão não pode receber novo checklist
    }
  }
  return true; // Caminhão pode receber novo checklist
}

// Função para codificar e-mails
function codificarEmail(email) {
  return email.replace(/[.#$\[\]%@]/g, '_');
}

// Recupera o e-mail do usuário logado (armazenado no localStorage)
const emailUsuario = localStorage.getItem("emailUsuario");

// Função para buscar o nome do usuário
async function buscarNomeUsuario(email) {
  const emailCodificado = codificarEmail(email); // Codifica o e-mail
  const usuariosRef = ref(database, `usuarios/${emailCodificado}`);
  const snapshot = await get(usuariosRef);
  if (snapshot.exists()) {
    return snapshot.val().nome;
  }
  return null;
}

// Preenche o nome do usuário automaticamente
buscarNomeUsuario(emailUsuario).then((nome) => {
  if (nome) {
    document.getElementById("motorista").value = nome; // Preenche o campo
  }
});

// Função para validar se todos os itens foram respondidos
function validarChecklist(itens) {
  for (const item in itens) {
    if (!itens[item]) { // Verifica se o item foi respondido
      return false;
    }
  }
  return true;
}

// Função para salvar o checklist
async function salvarChecklist(placa, motorista, itens) {
  if (!validarChecklist(itens)) {
    document.getElementById("erroChecklist").style.display = "block"; // Exibe a mensagem de erro
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Todos os itens do checklist devem ser respondidos!',
    });
    return; // Interrompe a função se a validação falhar
  }

  document.getElementById("erroChecklist").style.display = "none"; // Oculta a mensagem de erro

  // Verifica o status do caminhão
  const podeSalvar = await verificarStatusCaminhao(placa);
  if (!podeSalvar) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Este caminhão já possui um checklist pendente ou liberado. Aguarde o retorno para criar um novo checklist.',
    });
    return;
  }

  const checklistRef = ref(database, `checklists/${placa}`);
  set(checklistRef, {
    motorista: motorista,
    status: "pendente",
    itens: itens,
    dataHoraChecklist: new Date().toISOString() // Armazena o horário do checklist
  }).then(() => {
    Swal.fire({
      icon: 'success',
      title: 'Checklist salvo!',
      text: 'O checklist foi salvo com sucesso.', // Corrigido: removida a vírgula extra
    });
  }).catch((error) => {
    console.error("Erro ao salvar checklist:", error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Ocorreu um erro ao salvar o checklist.',
    });
  });
}

// Evento de envio do formulário
document.getElementById("formChecklist").addEventListener("submit", async (e) => {
  e.preventDefault();
  const placa = document.getElementById("placa").value;
  const motorista = document.getElementById("motorista").value; // Já preenchido automaticamente

  // Captura as respostas dos itens
  const itens = {
    Freios: document.querySelector('input[name="freios"]:checked')?.value,
    Farois: document.querySelector('input[name="farois"]:checked')?.value,
    Pneus: document.querySelector('input[name="pneus"]:checked')?.value
  };

  await salvarChecklist(placa, motorista, itens);
});