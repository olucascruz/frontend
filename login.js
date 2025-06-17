import { ethers } from "https://esm.sh/ethers@6.10.0";
import abi from "./abi.json" with { type: "json" };

const CONTRACT_ADDRESS = "0x6edd5172b984b371798a73ef6be1dc80c2e2de45";
let contract;

async function connectWallet() {
  if (!window.ethereum) {
    console.error("MetaMask não está instalada.");
    alert("MetaMask não está instalada!");
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

    console.log("Contrato conectado:", contract);

    const address = await signer.getAddress();
    console.log("Carteira conectada:", address);

    // Salva o endereço da carteira no localStorage
    localStorage.setItem("userAddress", address);

    alert("Carteira conectada com sucesso!");

    // Redireciona para a tela principal
    window.contract = contract;
    window.location.href = "home.html";
  } catch (err) {
    console.error("Erro ao conectar carteira:", err);
    alert("Erro ao conectar carteira. Verifique o console.");
  }
}

export function getContratoAtual() {
    return contract;
}

window.connectWallet = connectWallet;
