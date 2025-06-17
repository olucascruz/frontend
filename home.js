import { ethers } from "https://esm.sh/ethers@6.10.0";
import abi from "./abi.json" with { type: "json" };

const CONTRACT_ADDRESS = "0x6edd5172b984b371798a73ef6be1dc80c2e2de45";

let contract;

// Inicializa o contrato
async function inicializarContrato() {
  if (!window.ethereum) {
    console.error("MetaMask não encontrada.");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  } catch (err) {
    console.error("Erro ao inicializar o contrato:", err);
  }
}

// Mostra o endereço do usuário na UI
async function mostrarEnderecoUsuario() {
  try {
    const signer = contract.runner;
    const endereco = await signer.getAddress();
    document.getElementById("nome-usuario").textContent = endereco;
  } catch (err) {
    console.error("Erro ao obter endereço do usuário:", err);
  }
}

// Carrega pagamentos pessoais na UI
async function carregarPagamentosPessoais() {
  const listaPagamentos = document.getElementById("lista-pagamentos");
  listaPagamentos.innerHTML = "";

  try {
    const pagamentos = await contract.listarPagamentosPessoais();

    if (!pagamentos || pagamentos.length === 0) {
      listaPagamentos.innerHTML = `<li class="list-group-item">Nenhum pagamento encontrado.</li>`;
      return;
    }

    pagamentos.forEach((p, i) => {
      const valorEth = ethers.formatEther(p.valor);
      const dataFormatada = new Date(Number(p.data) * 1000).toLocaleString();

      const item = document.createElement("li");
      item.className = "list-group-item";
      item.innerHTML = `
        <strong>#${i + 1}</strong> - <em>${p.tipo}</em><br>
        <strong>Valor:</strong> ${valorEth} ETH<br>
        <strong>Descrição:</strong> ${p.descricao}<br>
        <strong>Data:</strong> ${dataFormatada}<br>
        <strong>Grupo:</strong> ${p.idGrupo}<br>
        <strong>Ativo:</strong> ${p.ativo ? "Sim" : "Não"}<br>
        <strong>Pagador:</strong> ${p.pagador}
      `;
      listaPagamentos.appendChild(item);
    });
  } catch (err) {
    console.error("Erro ao carregar pagamentos pessoais:", err);
    listaPagamentos.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar pagamentos.</li>`;
  }
}

// Obter grupo do usuário
async function obterGrupoUsuario() {
  if (!contract) {
    alert("Conecte a carteira primeiro!");
    return null;
  }

  try {
    const grupo = await contract.meuGrupo();

    if (!grupo || grupo === "" || grupo === "0x0000000000000000000000000000000000000000") {
      return null;
    }
    console.log("Grupo do usuário:", grupo);
    return grupo[0];
  } catch (err) {
    console.error("Erro ao obter grupo:", err);
    return null;
  }
}

// Atualizar UI do grupo e botões
async function atualizarInfoGrupo() {
  const infoGrupoElem = document.getElementById("info-grupo");
  const btnVerTransacoesGrupo = document.getElementById("btn-ver-transacoes-grupo");
  const btnCriarGrupo = document.getElementById("btn-criar-grupo");
  const btnEntrarGrupo = document.getElementById("btn-entrar-grupo");

  const grupo = await obterGrupoUsuario();

  if (grupo && grupo !== "") {
    infoGrupoElem.textContent = `Você está no grupo: ${grupo}`;
    btnVerTransacoesGrupo.style.display = "inline-block";
    btnCriarGrupo.style.display = "none";
    btnEntrarGrupo.style.display = "none";
  } else {
    infoGrupoElem.textContent = "Você não está em nenhum grupo.";
    btnVerTransacoesGrupo.style.display = "none";
    btnCriarGrupo.style.display = "inline-block";
    btnEntrarGrupo.style.display = "inline-block";
  }
}

// Função que gera ID aleatório no padrão Google Classroom
function gerarIdGrupo() {
  const letras = "abcdefghijklmnopqrstuvwxyz";
  function aleatorio(n) {
    let s = "";
    for (let i = 0; i < n; i++) {
      s += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    return s;
  }
  return `${aleatorio(3)}-${aleatorio(4)}`;
}

// Função para criar grupo com ID aleatório
async function criarGrupo() {
  if (!contract) {
    alert("Conecte a carteira primeiro!");
    return;
  }

  const idGrupo = gerarIdGrupo();
  const confirmacao = confirm(`Deseja criar o grupo com o ID: ${idGrupo} ?`);
  if (!confirmacao) return;

  try {
    const tx = await contract.criarGrupo(idGrupo);
    await tx.wait();
    console.log("Grupo criado:", idGrupo);
    alert(`Grupo criado com sucesso! ID: ${idGrupo}`);
    await atualizarInfoGrupo();
  } catch (err) {
    console.error("Erro ao criar grupo:", err);
    alert("Erro ao criar grupo. Veja o console para detalhes.");
  }
}

// Função para entrar em um grupo
async function entrarNoGrupo() {
  if (!contract) {
    alert("Conecte a carteira primeiro!");
    return;
  }

  const idGrupo = prompt("Digite o ID do grupo:");
  if (!idGrupo || idGrupo.trim() === "") {
    alert("ID do grupo inválido.");
    return;
  }

  try {
    const tx = await contract.entrarNoGrupo(idGrupo.trim());
    await tx.wait();
    console.log("Entrou no grupo:", idGrupo);
    alert(`Entrou no grupo: ${idGrupo}`);
    await atualizarInfoGrupo();
  } catch (err) {
    console.error("Erro ao entrar no grupo:", err);
    alert("Erro ao entrar no grupo. Veja o console para mais detalhes.");
  }
}

// Função para registrar pagamento
async function registrarPagamento() {
  if (!contract) {
    alert("Conecte a carteira primeiro!");
    return;
  }

  const valor = prompt("Digite o valor em Reais:");
  if (!valor || isNaN(valor) || Number(valor) <= 0) {
    alert("Valor inválido.");
    return;
  }

  const descricao = prompt("Digite a descrição do pagamento:");
  if (!descricao || descricao.trim() === "") {
    alert("Descrição inválida.");
    return;
  }

  const tipo = prompt("Digite o tipo de pagamento (ex: alimentação, transporte, etc):");
  if (!tipo || tipo.trim() === "") {
    alert("Tipo inválido.");
    return;
  }

  try {
    const valorWei = ethers.parseEther(valor);
    const tx = await contract.registrarPagamento(valorWei, descricao.trim(), tipo.trim());
    await tx.wait();
    console.log("Pagamento registrado com sucesso.");
    alert("Pagamento registrado com sucesso!");
    await carregarPagamentosPessoais(); // Atualiza lista após registrar
  } catch (err) {
    console.error("Erro ao registrar pagamento:", err);
    alert("Erro ao registrar pagamento. Veja o console para detalhes.");
  }
}

// Eventos ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  await inicializarContrato();
  await mostrarEnderecoUsuario();
  await carregarPagamentosPessoais();
  await atualizarInfoGrupo();

  const btnCriarGrupo = document.getElementById("btn-criar-grupo");
  btnCriarGrupo.addEventListener("click", criarGrupo);

  const btnEntrarGrupo = document.getElementById("btn-entrar-grupo");
  btnEntrarGrupo.addEventListener("click", entrarNoGrupo);

  const btnRegistrarPagamento = document.getElementById("btn-registrar-pagamento");
  if (btnRegistrarPagamento) {
    btnRegistrarPagamento.addEventListener("click", registrarPagamento);
  }

  document.getElementById("btn-logout").addEventListener("click", () => {
    window.location.href = "login.html";
  });
  
  // Redireciona para a página de grupo ao clicar em "Ver Transações do Grupo"
  document.getElementById("btn-ver-transacoes-grupo").addEventListener("click", () => {
    window.location.href = "group.html";
  });
});
