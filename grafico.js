import { ethers } from "https://esm.sh/ethers@6.10.0";
import abi from "./abi.json" with { type: "json" };

// endereço e contrato como no home.js
const CONTRACT_ADDRESS = "0x6edd5172b984b371798a73ef6be1dc80c2e2de45";
let contract;

async function inicializarContrato() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
}

document.addEventListener("DOMContentLoaded", async () => {
  await inicializarContrato();

  const totalGastoElem = document.getElementById("total-gasto");
  const maiorTransacaoElem = document.getElementById("maior-transacao");

  const pizzaChart = document.getElementById("pizzaChart");
  const linhaChart = document.getElementById("linhaChart");
  const barraChart = document.getElementById("barraChart");

  try {
    const pagamentos = await contract.listarPagamentosPessoais();

    let totalGasto = 0;
    let maiorTransacao = 0;
    let categorias = {};
    let porData = {};

    pagamentos.forEach(p => {
      const valor = parseFloat(ethers.formatEther(p.valor));
      totalGasto += valor;
      maiorTransacao = Math.max(maiorTransacao, valor);

      // Agrupamento por categoria (tipo)
      categorias[p.tipo] = (categorias[p.tipo] || 0) + valor;

      // Agrupamento por data
      const data = new Date(Number(p.data) * 1000).toLocaleDateString();
      porData[data] = (porData[data] || 0) + valor;
    });

    // Exibir totais
    totalGastoElem.textContent = totalGasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    maiorTransacaoElem.textContent = maiorTransacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Chart.js - Pizza
    new Chart(pizzaChart, {
      type: "pie",
      data: {
        labels: Object.keys(categorias),
        datasets: [{
          data: Object.values(categorias),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#9CCC65', '#BA68C8']
        }]
      }
    });

    // Linha - Evolução diária
    new Chart(linhaChart, {
      type: "line",
      data: {
        labels: Object.keys(porData),
        datasets: [{
          label: "Gastos por dia",
          data: Object.values(porData),
          fill: false,
          borderColor: 'blue',
          tension: 0.1
        }]
      }
    });

    // Barra - Categoria
    new Chart(barraChart, {
      type: "bar",
      data: {
        labels: Object.keys(categorias),
        datasets: [{
          label: "Gasto por categoria",
          data: Object.values(categorias),
          backgroundColor: '#42A5F5'
        }]
      }
    });

  } catch (err) {
    console.error("Erro ao carregar pagamentos para gráficos:", err);
  }
});
