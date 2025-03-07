import { database } from './firebaseConfig.js';
import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Função para codificar e-mails
function codificarEmail(email) {
  return email.replace(/[.#$\[\]%@]/g, '_');
}

// Função para verificar se o usuário é admin
async function verificarAdmin() {
  const emailUsuario = localStorage.getItem("emailUsuario");

  if (!emailUsuario) {
    // Redireciona para a tela de login se o usuário não estiver logado
    window.location.href = "./public/index.html";
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

// Função para gerar o relatório em Excel
function gerarRelatorioExcel(checklists) {
  // Mapeia os dados para o formato necessário
  const dados = checklists.map(checklist => ({
    Placa: checklist.placa, // Inclui a placa do caminhão
    Motorista: checklist.motorista,
    "Data do Checklist": new Date(checklist.dataHoraChecklist).toLocaleString(),
    "Data de Liberação": checklist.dataHoraLiberacao ? new Date(checklist.dataHoraLiberacao).toLocaleString() : "N/A",
    "Data de Retorno": checklist.dataHoraRetorno ? new Date(checklist.dataHoraRetorno).toLocaleString() : "N/A"
  }));

  // Cria uma planilha com os dados
  const planilha = XLSX.utils.json_to_sheet(dados);

  // Cria um livro (workbook) e adiciona a planilha
  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, "Relatório");

  // Gera o arquivo Excel e faz o download
  XLSX.writeFile(livro, `relatorio_checklists_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Função para filtrar checklists por intervalo de datas
function filtrarChecklistsPorData(checklists, dataInicio, dataFim) {
  return checklists.filter(([placa, checklist]) => {
    const dataChecklist = new Date(checklist.dataHoraChecklist);
    return dataChecklist >= dataInicio && dataChecklist <= dataFim;
  }).map(([placa, checklist]) => ({
    placa, // Inclui a placa no objeto
    ...checklist
  }));
}

// Função para carregar checklists
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
        <strong>Data de Liberação:</strong> ${new Date(checklist.dataHoraLiberacao).toLocaleString()}
      </li>
    `).join("");

    // Atualiza os gráficos
    carregarDadosItens(data);
    carregarDadosMetricas(data);
  });
}

// Função para carregar dados dos itens dos checklists
function carregarDadosItens(data) {
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
}

// Função para carregar dados das métricas gerais
function carregarDadosMetricas(data) {
  const metricas = {
    pendentes: 0,
    liberados: 0,
    retornados: 0
  };

  for (const placa in data) {
    const checklist = data[placa];
    if (checklist.status === "pendente") metricas.pendentes++;
    if (checklist.status === "liberado") metricas.liberados++;
    if (checklist.status === "retornado") metricas.retornados++;
  }

  // Cria o gráfico de métricas gerais
  criarGraficoMetricas(metricas);
}

// Função para criar gráfico de status dos itens
function criarGraficoItens(itens) {
  const ctx = document.getElementById("graficoItens").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Freios', 'Faróis', 'Pneus'],
      datasets: [{
        label: 'Itens OK',
        data: [itens.freiosOK, itens.faroisOK, itens.pneusOK],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }, {
        label: 'Itens N/OK',
        data: [itens.freiosNOK, itens.faroisNOK, itens.pneusNOK],
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

// Função para criar gráfico de métricas gerais
function criarGraficoMetricas(metricas) {
  const ctx = document.getElementById("graficoMetricas").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Pendentes', 'Liberados', 'Retornados'],
      datasets: [{
        label: 'Quantidade',
        data: [metricas.pendentes, metricas.liberados, metricas.retornados],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
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

// Evento para gerar o relatório
document.getElementById("btnGerarRelatorio").addEventListener("click", () => {
  const dataInicio = new Date(document.getElementById("dataInicio").value);
  const dataFim = new Date(document.getElementById("dataFim").value);

  if (!dataInicio || !dataFim) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Selecione as datas de início e fim para gerar o relatório.',
    });
    return;
  }

  const checklistsRef = ref(database, 'checklists');
  onValue(checklistsRef, (snapshot) => {
    const data = snapshot.val();

    // Converte o objeto em um array de [placa, checklist]
    const checklists = Object.entries(data);

    // Filtra os checklists pelo intervalo de datas
    const checklistsFiltrados = filtrarChecklistsPorData(checklists, dataInicio, dataFim);

    if (checklistsFiltrados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Nenhum dado encontrado',
        text: 'Não há checklists no intervalo de datas selecionado.',
      });
      return;
    }

    // Gera o relatório em Excel
    gerarRelatorioExcel(checklistsFiltrados);
  });
});

// Botão de Voltar
document.getElementById("btnVoltar").addEventListener("click", () => {
  window.location.href = "../public/index.html";
});

// Verifica o acesso ao carregar a página
verificarAdmin().then((isAdmin) => {
  if (isAdmin) {
    console.log("Acesso permitido: usuário é admin.");
    // Inicializa o dashboard
    carregarChecklists();
  } else {
    console.log("Acesso negado: usuário não é admin.");
  }
});