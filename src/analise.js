import { database } from './firebaseConfig.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Função para carregar checklists pendentes e liberados
function carregarChecklists() {
  const checklistsRef = ref(database, 'checklists');

  onValue(checklistsRef, (snapshot) => {
    const data = snapshot.val();
    const pendentes = [];
    const liberados = [];

    for (const placa in data) {
      const checklist = data[placa];
      if (checklist.status === "pendente") {
        pendentes.push({ placa, ...checklist });
      } else if (checklist.status === "liberado") {
        liberados.push({ placa, ...checklist });
      }
    }

    // Exibe checklists pendentes
    const listaPendentes = document.getElementById("checklistsPendentes");
    listaPendentes.innerHTML = pendentes.map(checklist => `
      <li>
        <strong>Placa:</strong> ${checklist.placa} <br>
        <strong>Motorista:</strong> ${checklist.motorista} <br>
        <strong>Data:</strong> ${new Date(checklist.dataHoraChecklist).toLocaleString()}
      </li>
    `).join("");

    // Exibe checklists liberados
    const listaLiberados = document.getElementById("checklistsLiberados");
    listaLiberados.innerHTML = liberados.map(checklist => `
      <li>
        <strong>Placa:</strong> ${checklist.placa} <br>
        <strong>Motorista:</strong> ${checklist.motorista} <br>
        <strong>Data:</strong> ${new Date(checklist.dataHoraLiberacao).toLocaleString()}
      </li>
    `).join("");
  });
}

// Função para criar gráfico de status dos itens
function criarGraficoItens(data) {
  const ctx = document.getElementById("graficoItens").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Freios', 'Faróis', 'Pneus'],
      datasets: [{
        label: 'Itens OK',
        data: [data.freiosOK, data.faroisOK, data.pneusOK],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }, {
        label: 'Itens N/OK',
        data: [data.freiosNOK, data.faroisNOK, data.pneusNOK],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Função para carregar dados dos itens dos checklists
function carregarDadosItens() {
  const checklistsRef = ref(database, 'checklists');

  onValue(checklistsRef, (snapshot) => {
    const data = snapshot.val();
    const itens = {
      freiosOK: 0,
      freiosNOK: 0,
      faroisOK: 0,
      faroisNOK: 0,
      pneusOK: 0,
      pneusNOK: 0
    };

    for (const placa in data) {
      const checklist = data[placa];
      if (checklist.itens) {
        if (checklist.itens.Freios === "OK") itens.freiosOK++;
        if (checklist.itens.Freios === "N/OK") itens.freiosNOK++;
        if (checklist.itens.Farois === "OK") itens.faroisOK++;
        if (checklist.itens.Farois === "N/OK") itens.faroisNOK++;
        if (checklist.itens.Pneus === "OK") itens.pneusOK++;
        if (checklist.itens.Pneus === "N/OK") itens.pneusNOK++;
      }
    }

    // Cria o gráfico de status dos itens
    criarGraficoItens(itens);
  });
}

// Inicializa o dashboard
carregarChecklists();
carregarDadosItens();

// Botão de Voltar
document.getElementById("btnVoltar").addEventListener("click", () => {
  window.location.href = "home.html";
});