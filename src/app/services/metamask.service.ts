// src/app/services/metamask.service.ts
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import  abi  from './abi.json'; // Certifique-se de que o caminho está correto


@Injectable({
  providedIn: 'root'
})

export class MetamaskService {
  private provider: ethers.BrowserProvider | null = null;

  constructor() {
    if ((window as any).ethereum) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
    } else {
      console.error('MetaMask não está instalado.');
    }
  }

  async connectWallet(): Promise<string | null> {
    if (!this.provider) return null;

    try {
      const accounts = await this.provider.send("eth_requestAccounts", []);
      return accounts[0]; // Retorna o endereço da conta conectada
    } catch (error) {
      console.error('Erro ao conectar com MetaMask:', error);
      return null;
    }
  }

  async getSigner() {
    if (!this.provider) return null;
    return await this.provider.getSigner();
  }

  async callTest() {
    if (!this.provider) {
      console.error('Provider não está disponível.');
      return;
    }
    const contractAddress = "0x42f80c0FaC8E390AB22EDA9485bB98BE6b6D4B8C"; // Endereço do meu smart contract local na rede de teste sepolia.
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    const result = await contract['testFunction']();
    console.log("Resposta do contrato:", result);
  }


}
