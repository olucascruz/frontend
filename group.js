import { ethers } from "https://esm.sh/ethers@6.10.0";
import abi from "./abi.json" with { type: "json" };

// Endereço do contrato
const CONTRACT_ADDRESS = "0x6edd5172b984b371798a73ef6be1dc80c2e2de45";
let contract;

// Inicializa contrato
async function inicializarContrato() {
  if (!window.ethereum) return alert("MetaMask não encontrada.");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}

// Carrega e exibe pagamentos do grupo com gráficos
async function verPagamentosDoGrupo() {
  if (!contract) return alert("Conecte a carteira primeiro!");

  const lista = document.getElementById("lista-pagamentos-grupo");
  lista.innerHTML = "";

  try {
    const pagamentos = await contract.listarPagamentosDoMeuGrupo();

    if (!pagamentos || pagamentos.length === 0) {
      lista.innerHTML = `<li class="list-group-item">Nenhum pagamento encontrado.</li>`;
      return;
    }

    // Dados para os gráficos
    const porTipo = {};
    const porUsuario = {};
    let totalGrupo = 0;
    let maiorValor = 0;

    pagamentos.forEach((p, i) => {
      const valor = Number(ethers.formatEther(p.valor));
      const data = new Date(Number(p.data) * 1000).toLocaleString();
      const item = document.createElement("li");

      item.className = "list-group-item";
      item.innerHTML = `
        <strong>#${i + 1}</strong> - <em>${p.tipo}</em><br>
        <strong>Valor:</strong> ${valor.toFixed(4)} Reais<br>
        <strong>Descrição:</strong> ${p.descricao}<br>
        <strong>Data:</strong> ${data}<br>
        <strong>Grupo:</strong> ${p.idGrupo}<br>
        <strong>Ativo:</strong> ${p.ativo ? "Sim" : "Não"}<br>
        <strong>Usuario:</strong> ${p.pagador}
      `;
      lista.appendChild(item);

      // Gráfico pizza - por tipo
      porTipo[p.tipo] = (porTipo[p.tipo] || 0) + valor;

      // Gráfico barra - por pagador
      porUsuario[p.pagador] = (porUsuario[p.pagador] || 0) + valor;

      totalGrupo += valor;
      if (valor > maiorValor) maiorValor = valor;
    });

    desenharGraficoPizza(porTipo);
    desenharGraficoBarra(porUsuario);

    // Mostra resumo
    document.getElementById("info-gastos").innerHTML = `
      <h4>Total do Grupo: <strong>${totalGrupo.toFixed(4)} Reais</strong></h4>
      <h5>Maior pagamento: <strong>${maiorValor.toFixed(4)} Reais</strong></h5>
    `;
  } catch (err) {
    console.error("Erro ao obter pagamentos do grupo:", err);
    lista.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar pagamentos do grupo.</li>`;
  }
}

// Gráfico de Pizza: gastos por tipo
function desenharGraficoPizza(dados) {
  const ctx = document.getElementById("grafico-pizza").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(dados),
      datasets: [{
        data: Object.values(dados),
        backgroundColor: ["#0d6efd", "#6f42c1", "#198754", "#ffc107", "#dc3545", "#20c997"],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Gastos por Tipo",
          font: { size: 18 }
        }
      }
    }
  });
}

// Gráfico de Barra: gastos por usuário
function desenharGraficoBarra(dados) {
    const ctx = document.getElementById("grafico-barra").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(dados),
        datasets: [{
          label: "Total por Usuário (Reais)",
          data: Object.values(dados),
          backgroundColor: "#0d6efd"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Gastos por Usuário",
            font: { size: 18 }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: false,
              font: {
                size: 10
              }
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  

// Evento inicial
document.addEventListener("DOMContentLoaded", async () => {
  await inicializarContrato();
  await verPagamentosDoGrupo();

  document.getElementById("btn-voltar").addEventListener("click", () => {
    window.location.href = "home.html";
  });
});
