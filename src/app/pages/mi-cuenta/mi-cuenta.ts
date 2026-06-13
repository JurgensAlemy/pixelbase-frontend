import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [Header, Footer, RouterLink],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.scss',
})
export class MiCuenta {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly user = this.auth.currentUser;

  get initials(): string {
    const email = this.user()?.email ?? '';
    const base = email.split('@')[0] ?? '';
    return (base.slice(0, 2) || 'US').toUpperCase();
  }

  get roleLabel(): string {
    return this.user()?.role === 'ADMIN' ? 'Administrador' : 'Cliente';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
