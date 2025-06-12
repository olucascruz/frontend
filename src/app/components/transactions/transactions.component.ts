import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormularioModalComponent } from '../formulario-modal/formulario-modal.component';
@Component({
  selector: 'app-transactions',
  standalone: false,
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent {
   produtos = [
    { titulo: 'Notebook Gamer', preco: 4500, data: '2025-06-12' },
    { titulo: 'Smartphone', preco: 2300, data: '2025-06-10' },
    { titulo: 'Monitor 24"', preco: 899, data: '2025-06-01' }
  ];

  constructor(public dialog: MatDialog) {}

  abrirModal() {
    this.dialog.open(FormularioModalComponent);
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
