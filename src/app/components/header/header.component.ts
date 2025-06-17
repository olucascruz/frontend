import { Component, EventEmitter, OnInit, Output} from '@angular/core';
import { MetamaskService } from '../../services/metamask.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  grupoId?: string = '';
  @Output() toggle = new EventEmitter<void>();

  emitToggle() {
    this.toggle.emit();
  }

  statusMensagem: string = '';

  constructor(private metamaskService: MetamaskService) {}

 async ngOnInit(): Promise<void> {
    this.getGrupo();
  }

  async criarGrupo() {
    this.grupoId = gerarIdAleatorio()
    if (!this.grupoId.trim()) {
      this.statusMensagem = 'Informe um ID válido para o grupo.';
      return;
    }

    try {
    await this.metamaskService.criarGrupo(this.grupoId);    

  } catch (error: any) {
      console.error('Erro ao criar grupo:', error);

    }
  }

  async getGrupo() {
    try {
      const grupo = await this.metamaskService.verMeuGrupo();
      if (!grupo) return;
      this.grupoId = grupo.idGrupo;
      console.log('Grupo obtido:', this.grupoId);

      this.statusMensagem = `✅ Grupo:${this.grupoId}`;
    } catch (error: any) {
      console.error('Erro ao criar grupo:', error);
      this.statusMensagem = '❌ Erro ao criar grupo: ' + (error?.message || error);
    }
  }
}

function gerarIdAleatorio(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let resultado = '';
  for (let i = 0; i < 4; i++) {
    const indice = Math.floor(Math.random() * caracteres.length);
    resultado += caracteres[indice];
  }
  return resultado;
}
