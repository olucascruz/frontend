import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormularioModalComponent } from '../formulario-modal/formulario-modal.component';
import { MetamaskService } from '../../services/metamask.service';




interface Pagamento {
  id: string;
  valor: bigint;
  descricao: string;
  data: bigint;
  ativo: boolean;
  idGrupo: string;
}
@Component({
  selector: 'app-transactions',
  standalone: false,
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit{

  filtroAtual: 'me' | 'all' = 'me';
  alternarFiltro() {
    this.filtroAtual = this.filtroAtual === 'me' ? 'all' : 'me';
  }
   produtos = [
    { titulo: 'Notebook Gamer', preco: 4500, data: '2025-06-12' },
    { titulo: 'Smartphone', preco: 2300, data: '2025-06-10' },
    { titulo: 'Monitor 24"', preco: 899, data: '2025-06-01' }
  ];

  pagamentos: Pagamento[] = [];
  carregando: boolean = false;
  erro: string | null = null;

  constructor(public dialog: MatDialog, private metamaskService: MetamaskService) {}

  abrirModal() {
    this.dialog.open(FormularioModalComponent);
  }

  ngOnInit(): void {
    // this.carregarPagamentos();
  }

  async carregarPagamentos() {
    this.carregando = true;
    this.erro = null;
    try {
      const pagamentosDoGrupo = await this.metamaskService.verPagamentosDoGrupo();
      this.pagamentos = pagamentosDoGrupo.map((p: any, idx: number) => ({
        id: p.id ?? idx.toString(),
        valor: p.valor,
        descricao: p.descricao,
        data: p.data,
        ativo: p.ativo,
        idGrupo: p.idGrupo
      }));
    } catch (e: any) {
      this.erro = 'Erro ao carregar pagamentos: ' + (e.message || e);
    }
    this.carregando = false;
  }

  formatarData(timestamp: bigint): string {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString();
  }
  editar() {
    console.log('Editar clicado');
  // aqui você abre um modal de edição ou navega, etc.
  }

  excluir() {
    console.log('Excluir clicado');
    // confirmação de exclusão, etc.
  }
}
