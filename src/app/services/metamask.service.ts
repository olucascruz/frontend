// src/app/services/metamask.service.ts
import { Injectable } from '@angular/core';
import { Addressable, ethers } from 'ethers';
import  abi  from './abi.json'; // Certifique-se de que o caminho está correto




interface Pagamento {
  id: string;
  valor: bigint;
  descricao: string;
  data: bigint;
  ativo: boolean;
  idGrupo: string;
}



@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  private provider: ethers.BrowserProvider | null = null;
  contractAddress = "0x3A501D9E8359250EaF327Ff38dF20828d730597f";

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
    if (!this.provider) {
      console.log('Provider não está disponível.'); 
      return null;
    }
    return await this.provider.getSigner();
  }


  async callTest() {
    if (!this.provider) {
      console.error('Provider não está disponível.');
      return;
    }
   
    const contractAddress = "0x3A501D9E8359250EaF327Ff38dF20828d730597f"; // Endereço do meu smart contract local na rede de teste sepolia.
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    const result = await contract['testFunction']();
    console.log("Resposta do contrato:", result);
  }

   private async getContract(write: boolean = false) {
    if (!this.provider) throw new Error('Provider não disponível.');
    const signerOrProvider = write ? await this.provider.getSigner() : this.provider;
    return new ethers.Contract(this.contractAddress, abi, signerOrProvider);
  }

  async criarGrupo(idGrupo: string) {
    const contract = await this.getContract(true);
    const tx = await contract['criarGrupo'](idGrupo);
    await tx.wait();
  }

  async entrarNoGrupo(idGrupo: string) {
    const contract = await this.getContract(true);
    const tx = await contract['entrarNoGrupo'](idGrupo);
    await tx.wait();
  }

  async registrarPagamento(id: string, valor: number, descricao: string) {
    const contract = await this.getContract(true);
    const tx = await contract['registrarPagamento'](id, valor, descricao);
    await tx.wait();
  }

  async apagarPagamento(id: string) {
    const contract = await this.getContract(true);
    const tx = await contract['apagarPagamento'](id);
    await tx.wait();
  }

  async editarPagamento(id: string, novoValor: number, novaDescricao: string) {
    const contract = await this.getContract(true);
    const tx = await contract['editarPagamento'](id, novoValor, novaDescricao);
    await tx.wait();
  }

  async listarPagamentosDoMeuGrupo(): Promise<Pagamento[]> {
    const contract = await this.getContract(false);
    const result = await contract['listarPagamentosDoMeuGrupo']();

    const pagamentos: Pagamento[] = result.map((p: any) => ({
      id: p.id,
      valor: BigInt(p.valor),
      descricao: p.descricao,
      data: BigInt(p.data),
      ativo: p.ativo,
      idGrupo: p.idGrupo
    }));

    return pagamentos;
  }

  async meuGrupo(): Promise<string> {
    const contract = await this.getContract(false);
    const meuGrupo = await contract['meuGrupo']();
    console.log('Meu grupo:', meuGrupo);
    return meuGrupo;

  }
}
