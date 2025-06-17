// src/app/services/metamask.service.ts
import { Injectable } from '@angular/core';
import { Addressable, ethers } from 'ethers';
import  abi  from './abi.json'; // Certifique-se de que o caminho está correto




export interface Pagamento {
  valor: bigint;
  descricao: string;
  data: bigint;
  ativo: boolean;
  idGrupo: string;
  tipo: string;
  pagador: string;
}

export interface Grupo {
  idGrupo: string;
  participantes: string[];
  existe: boolean;
}



@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  private provider: ethers.BrowserProvider | null = null;
  
  contractAddress = "0xfc329e7c7b29c6e473f8ad8ddbd8b428e9d21892";

  constructor() {
    if ((window as any).ethereum) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
    } else {
      console.error('MetaMask não está instalado.');
    }
  }

  async connectWallet(): Promise<string | null> {
    if (!(window as any).ethereum) {
      console.error("MetaMask não está instalada.");
      return null;
    }

    try {
      // Solicita permissão explicitamente
      await (window as any).ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // Atualiza o provider
      this.provider = new ethers.BrowserProvider((window as any).ethereum);

      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();
      console.log("Carteira conectada:", address);
      return address;
    } catch (err) {
      console.error("Erro ao conectar carteira:", err);
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


  // Novo método: verMeuGrupo
  async verMeuGrupo(): Promise<Grupo | null> {
    try {
      const contract = await this.getContract(true);
      if (!contract['meuGrupo']) {
        console.error("Método 'meuGrupo' não existe no contrato.");
        return null;
      }
      const grupo = await contract['meuGrupo']();
      if (!grupo || !grupo.idGrupo) {
        console.log("Você não está em nenhum grupo.");
        return null;
      }
      console.log("Grupo atual:", grupo);
      return grupo as Grupo;
    } catch (err) {
      console.error("Erro ao obter grupo:", err);
      return null;
    }
  }

  // Novo método: verPagamentosDoGrupo
  async verPagamentosDoGrupo(): Promise<Pagamento[]> {
    try {
      const contract = await this.getContract(false);
      const pagamentos = await contract['listarPagamentosDoMeuGrupo']();
      return pagamentos.map((p: any) => ({
        valor: p.valor,
        descricao: p.descricao,
        data: p.data,
        ativo: p.ativo,
        idGrupo: p.idGrupo,
        tipo: p.tipo,
        pagador: p.pagador
      })) as Pagamento[];
    } catch (err) {
      console.error("Erro ao obter pagamentos do grupo:", err);
      return [];
    }
  }

  // Novo método: registrarPagamentoComTipo
  async registrarPagamentoComTipo(valor: string, descricao: string, tipo: string): Promise<void> {
    try {
      const contract = await this.getContract(true);
      const valorWei = ethers.parseEther(valor);
      const tx = await contract['registrarPagamento'](valorWei, descricao, tipo);
      await tx.wait();
      console.log("Pagamento registrado com sucesso.");
    } catch (err) {
      console.error("Erro ao registrar pagamento:", err);
    }
  }

  // Novo método: verPagamentosPessoais
  async verPagamentosPessoais(): Promise<Pagamento[]> {
    try {
      const contract = await this.getContract(false);
      const pagamentos = await contract['listarPagamentosPessoais']();
      return pagamentos.map((p: any) => ({
        valor: p.valor,
        descricao: p.descricao,
        data: p.data,
        ativo: p.ativo,
        idGrupo: p.idGrupo,
        tipo: p.tipo,
        pagador: p.pagador
      })) as Pagamento[];
    } catch (err) {
      console.error("Erro ao obter pagamentos pessoais:", err);
      return [];
    }
  }

  // Cria um novo grupo
  async criarGrupo(idGrupo: string): Promise<void> {
    try {
      const contract = await this.getContract(true);
      const tx = await contract['criarGrupo'](idGrupo);
      await tx.wait();
      console.log("Grupo criado:", idGrupo);
    } catch (err) {
      console.error("Erro ao criar grupo:", err);
    }
  }

  // Entra em um grupo existente
  async entrarNoGrupo(idGrupo: string): Promise<void> {
    try {
      const contract = await this.getContract(true);
      const tx = await contract['entrarNoGrupo'](idGrupo);
      await tx.wait();
      console.log("Entrou no grupo:", idGrupo);
    } catch (err) {
      console.error("Erro ao entrar no grupo:", err);
    }
  }
}
