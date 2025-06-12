import { Component } from '@angular/core';
import { MetamaskService } from '../../services/metamask.service';



@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private metamaskService: MetamaskService) {}
  
  async callTest() {
    try {
      await this.metamaskService.callTest();
    } catch (error) {
      console.error('Erro ao chamar a função de teste:', error);
    }
  }
}
