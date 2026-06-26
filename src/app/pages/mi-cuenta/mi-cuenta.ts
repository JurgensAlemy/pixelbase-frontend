import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

type Tab = 'perfil' | 'pedidos' | 'direcciones';

@Component({
  selector: 'app-mi-cuenta',
  standalone: true,
  imports: [Header, Footer, RouterLink, DecimalPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.scss',
})
export class MiCuenta implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  readonly user = this.auth.currentUser;
  activeTab = signal<Tab>('perfil');
  profileData = signal<any>(null);
  orders = signal<any[]>([]);
  addresses = signal<any[]>([]);
  loadingOrders = signal(false);
  loadingAddresses = signal(false);
  showAddressForm = signal(false);
  savingAddress = signal(false);
  addressError = signal<string | null>(null);

  readonly departments = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Lambayeque', 'Junín', 'Ica', 'Cajamarca', 'Puno'];

  readonly addressForm = this.fb.nonNullable.group({
    addressLine: ['', [Validators.required, Validators.maxLength(255)]],
    department: ['Lima', Validators.required],
    province: ['Lima', Validators.required],
    district: ['', Validators.required],
    reference: [''],
  });

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (data) => this.profileData.set(data),
      error: () => { }
    });
    this.loadOrders();
    this.loadAddresses();
  }

  loadOrders(): void {
    this.loadingOrders.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders.set(res.content ?? res ?? []);
        this.loadingOrders.set(false);
      },
      error: () => this.loadingOrders.set(false)
    });
  }

  loadAddresses(): void {
    this.loadingAddresses.set(true);
    this.orderService.getAddresses().subscribe({
      next: (data) => {
        this.addresses.set(data);
        this.loadingAddresses.set(false);
      },
      error: () => this.loadingAddresses.set(false)
    });
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    this.savingAddress.set(true);
    this.addressError.set(null);

    this.orderService.createAddress(this.addressForm.value).subscribe({
      next: () => {
        this.addressForm.reset({ department: 'Lima', province: 'Lima' });
        this.showAddressForm.set(false);
        this.savingAddress.set(false);
        this.loadAddresses(); // recargar lista
      },
      error: (err) => {
        this.savingAddress.set(false);
        this.addressError.set(err?.error?.message ?? 'Error al guardar la dirección.');
      }
    });
  }

  deleteAddress(id: number): void {
    this.orderService.deleteAddress(id).subscribe({
      next: () => this.loadAddresses(),
      error: () => { }
    });
  }

  setDefaultAddress(id: number): void {
    this.orderService.setDefaultAddress(id).subscribe({
      next: () => this.loadAddresses(),
      error: () => { }
    });
  }

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

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado',
      PREPARANDO: 'Preparando', ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'status-pending', CONFIRMADO: 'status-confirmed',
      PREPARANDO: 'status-preparing', ENVIADO: 'status-shipped',
      ENTREGADO: 'status-delivered', CANCELADO: 'status-cancelled',
    };
    return map[status] ?? '';
  }
}
