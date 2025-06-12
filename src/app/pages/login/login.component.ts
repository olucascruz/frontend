import { Component } from '@angular/core';
import { MetamaskService } from './../../services/metamask.service';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
    walletAddress: string | null = null;

  constructor(private metamaskService: MetamaskService) {}

  async login() {
    this.walletAddress = await this.metamaskService.connectWallet();
    // Redirecionar para home após o login
    if (this.walletAddress) {
      window.location.href = '/home';
    }
  }
}
