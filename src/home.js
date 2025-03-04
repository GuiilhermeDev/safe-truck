import { database } from './firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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
      if (usuario.perfil === "admin") {
        document.getElementById("linkCadastro").style.display = "block";
        document.getElementById("linkLiberacao").style.display = "block";
        document.getElementById("linkAnalise").style.display = "block"; 
        document.getElementById("linkRetorno").style.display = "block"; 
      } else {
        document.getElementById("linkLiberacao").style.display = "none";
      }
    }
  }).catch((error) => {
    console.error("Erro ao buscar dados do usuário:", error);
  });
}

// Função para fazer logout
function fazerLogout() {
  localStorage.removeItem("emailUsuario");
  window.location.href = "index.html";
}

// Adiciona um botão de logout
document.addEventListener("DOMContentLoaded", () => {
  const botaoLogout = document.createElement("button");
  botaoLogout.textContent = "Logout";
  // Adiciona a classe CSS ao botão
  botaoLogout.classList.add("btn-logout");
  botaoLogout.addEventListener("click", fazerLogout);
  document.body.appendChild(botaoLogout);
});