import { ethers } from "https://esm.sh/ethers@6.10.0";
import abi from "../abi.json" with { type: "json" };

const CONTRACT_ADDRESS = "0x6edd5172b984b371798a73ef6be1dc80c2e2de45";
let contract;

async function connectWallet() {
  if (!window.ethereum) {
    console.error("MetaMask não está instalada.");
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    console.log("Carteira conectada:", await signer.getAddress());
  } catch (err) {
    console.error("Erro ao conectar carteira:", err);
  }
}

async function criarGrupo() {
  if (!contract) return alert("Conecte a carteira primeiro!");
  const idGrupo = prompt("Digite o ID do grupo:");
  try {
    const tx = await contract.criarGrupo(idGrupo);
    await tx.wait();
    console.log("Grupo criado:", idGrupo);
  } catch (err) {
    console.error("Erro ao criar grupo:", err);
  }
}

async function entrarNoGrupo() {
  if (!contract) return alert("Conecte a carteira primeiro!");
  const idGrupo = prompt("Digite o ID do grupo:");
  try {
    const tx = await contract.entrarNoGrupo(idGrupo);
    await tx.wait();
    console.log("Entrou no grupo:", idGrupo);
  } catch (err) {
    console.error("Erro ao entrar no grupo:", err);
  }
}

async function verMeuGrupo() {
  if (!contract) return alert("Conecte a carteira primeiro!");
  try {
    const grupo = await contract.meuGrupo();
    console.log("Grupo atual:", grupo);
  } catch (err) {
    console.error("Erro ao obter grupo:", err);
  }
}

async function verPagamentosDoGrupo() {
  if (!contract) return alert("Conecte a carteira primeiro!");

  try {
    const pagamentos = await contract.listarPagamentosDoMeuGrupo();
    console.log("Pagamentos do grupo atual:");

    pagamentos.forEach((p, index) => {
      console.log(`Pagamento #${index + 1}`);
      console.log(`Valor: ${ethers.formatEther(p.valor)} ETH`);
      console.log(`Descrição: ${p.descricao}`);
      console.log(`Tipo: ${p.tipo}`);
      console.log(`Data: ${new Date(Number(p.data) * 1000).toLocaleString()}`);
      console.log(`Ativo: ${p.ativo}`);
      console.log(`Grupo: ${p.idGrupo}`);
      console.log(`Pagador: ${p.pagador}`);
      console.log("-----------------------------");
    });
  } catch (err) {
    console.error("Erro ao obter pagamentos do grupo:", err);
  }
}

async function registrarPagamento() {
  if (!contract) return alert("Conecte a carteira primeiro!");
  const valor = prompt("Digite o valor em ETH:");
  const descricao = prompt("Digite a descrição:");
  const tipo = prompt("Digite o tipo (ex: alimentação, transporte, etc):");

  try {
    const valorWei = ethers.parseEther(valor);
    const tx = await contract.registrarPagamento(valorWei, descricao, tipo);
    await tx.wait();
    console.log("Pagamento registrado com sucesso.");
  } catch (err) {
    console.error("Erro ao registrar pagamento:", err);
  }
}

async function verPagamentosPessoais() {
  if (!contract) return alert("Conecte a carteira primeiro!");

  try {
    const pagamentos = await contract.listarPagamentosPessoais();
    console.log("Seus pagamentos:");

    pagamentos.forEach((p, index) => {
      console.log(`Pagamento #${index + 1}`);
      console.log(`Valor: ${ethers.formatEther(p.valor)} ETH`);
      console.log(`Descrição: ${p.descricao}`);
      console.log(`Tipo: ${p.tipo}`);
      console.log(`Data: ${new Date(Number(p.data) * 1000).toLocaleString()}`);
      console.log(`Ativo: ${p.ativo}`);
      console.log(`Grupo: ${p.idGrupo}`);
      console.log(`Pagador: ${p.pagador}`);
      console.log("-----------------------------");
    });
  } catch (err) {
    console.error("Erro ao obter pagamentos pessoais:", err);
  }
}

window.connectWallet = connectWallet;
window.criarGrupo = criarGrupo;
window.entrarNoGrupo = entrarNoGrupo;
window.verMeuGrupo = verMeuGrupo;
window.registrarPagamento = registrarPagamento;
window.verPagamentosPessoais = verPagamentosPessoais;
window.verPagamentosDoGrupo = verPagamentosDoGrupo;
