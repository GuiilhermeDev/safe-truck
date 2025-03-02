import { database } from './firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

// Função para autenticar usuário
async function autenticarUsuario(email, senha) {
  const emailCodificado = codificarEmail(email); // Codifica o e-mail
  const usuariosRef = ref(database, `usuarios/${emailCodificado}`);

  // Busca o usuário no banco de dados
  const snapshot = await get(usuariosRef);
  if (!snapshot.exists()) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'E-mail ou senha incorretos!',
    });
    return;
  }

  const usuario = snapshot.val();

  // Gera o hash da senha fornecida
  const hashSenha = await gerarHash(senha);

  // Verifica a senha
  if (hashSenha === usuario.senha) {
    Swal.fire({
      icon: 'success',
      title: 'Login realizado!',
      text: `Bem-vindo, ${usuario.nome}!`,
    }).then(() => {
      // Armazena o e-mail do usuário no localStorage
      localStorage.setItem("emailUsuario", email);
      // Redireciona para a tela home
      window.location.href = "home.html";
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'E-mail ou senha incorretos!',
    });
  }
}

// Evento de envio do formulário
document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  await autenticarUsuario(email, senha);
});