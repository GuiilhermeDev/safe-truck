import { database } from './firebaseConfig.js';
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Função para gerar hash SHA-256
async function gerarHash(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Função para codificar e-mails
function codificarEmail(email) {
  return email.replace(/[.#$\[\]%@]/g, '_');
}

// Função para cadastrar usuário
async function cadastrarUsuario(email, nome, senha, perfil) {
  const emailCodificado = codificarEmail(email); // Codifica o e-mail
  const usuariosRef = ref(database, `usuarios/${emailCodificado}`);

  // Verifica se o usuário já existe
  const snapshot = await get(usuariosRef);
  if (snapshot.exists()) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Este e-mail já está cadastrado!',
    });
    return;
  }

  // Cria um hash da senha
  const hashSenha = await gerarHash(senha);

  // Salva o usuário no banco de dados
  set(usuariosRef, {
    nome: nome,
    senha: hashSenha,
    perfil: perfil
  }).then(() => {
    Swal.fire({
      icon: 'success',
      title: 'Cadastro realizado!',
      text: 'Usuário cadastrado com sucesso.',
    });
  }).catch((error) => {
    console.error("Erro ao cadastrar usuário:", error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Ocorreu um erro ao cadastrar o usuário.',
    });
  });
}

// Evento de envio do formulário
document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const nome = document.getElementById("nome").value;
  const senha = document.getElementById("senha").value;
  const perfil = document.getElementById("perfil").value;

  await cadastrarUsuario(email, nome, senha, perfil);
});

// Botão de Voltar
document.getElementById("btnVoltar").addEventListener("click", () => {
  window.location.href = "home.html";
});