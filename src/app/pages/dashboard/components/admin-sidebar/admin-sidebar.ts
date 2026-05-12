import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss',
})
export class AdminSidebar {
  private router = inject(Router);
  readonly auth = inject(AuthService);

  readonly userInitials = computed(() => {
    const email = this.auth.currentUser()?.email ?? '';
    const base = email.split('@')[0] ?? '';
    return (base.slice(0, 2) || 'AD').toUpperCase();
  });

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
