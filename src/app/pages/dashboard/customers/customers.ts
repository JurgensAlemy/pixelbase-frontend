import { Component, HostListener, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../components/admin-header/admin-header';
import { AdminCustomerService } from '../../../services/admin-customer.service';

type Segment = 'vip' | 'active' | 'new' | 'inactive';
type SegmentFilter = 'all' | Segment;
type ModalMode = 'closed' | 'create' | 'edit' | 'detail' | 'delete-confirm';

interface CustomerOrder {
  orderNumber: string;
  date: string;
  total: number;
  status: string;
}

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;  // Ahora NO es opcional
  phone?: string;
  documentNumber?: string;
  createdAt: string;
  registeredAt: string;  // Ahora NO es opcional
  orders?: CustomerOrder[];
  orderHistory: CustomerOrder[];  // Ahora NO es opcional
  totalSpent: number;  // Ahora NO es opcional
  avatar: string;  // Ahora NO es opcional
  address: string;  // Ahora NO es opcional
  city: string;  // Ahora NO es opcional
}

const TODAY = new Date();

function avatarFor(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}

@Component({
  selector: 'app-customers-admin',
  standalone: true,
  imports: [AdminSidebar, AdminHeader, DecimalPipe, ReactiveFormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers implements OnInit {
  private customerService = inject(AdminCustomerService);
  private fb = inject(FormBuilder);

  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly selectedSegment = signal<SegmentFilter>('all');
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  readonly segmentOptions: { value: SegmentFilter; label: string }[] = [
    { value: 'all', label: 'Todos los clientes' },
    { value: 'vip', label: 'VIP' },
    { value: 'active', label: 'Activos' },
    { value: 'new', label: 'Nuevos (< 30 días)' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  readonly filteredCustomers = computed<Customer[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const seg = this.selectedSegment();
    return this.customers().filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const matchesSeg = seg === 'all' || this.segmentOf(c) === seg;
      const matchesQuery =
        !q ||
        fullName.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone?.includes(q) ?? false) ||
        (c.city?.toLowerCase().includes(q) ?? false);
      return matchesSeg && matchesQuery;
    });
  });

  readonly stats = computed(() => {
    const all = this.customers();
    return {
      total: all.length,
      active: all.filter((c) => this.segmentOf(c) === 'active' || this.segmentOf(c) === 'vip').length,
      vip: all.filter((c) => this.segmentOf(c) === 'vip').length,
      newRecent: all.filter((c) => this.daysSinceRegister(c) <= 30).length,
    };
  });

  /* ---------- Modal ---------- */
  readonly modalMode = signal<ModalMode>('closed');
  readonly selectedCustomer = signal<Customer | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    documentNumber: [''],
    address: [''],
    city: ['Lima'],
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.customerService.getAllCustomers(this.currentPage(), this.pageSize()).subscribe({
      next: (res) => {
        let data = res.content ?? res ?? [];
        // Normalizar datos - IMPORTANTE: asegurar que TODOS los campos existan
        data = (Array.isArray(data) ? data : []).map((c: any) => ({
          ...c,
          name: `${c.firstName} ${c.lastName}`.trim(),
          avatar: c.avatar || avatarFor(`${c.firstName} ${c.lastName}`),
          registeredAt: c.registeredAt || c.createdAt || new Date().toISOString().split('T')[0],
          orderHistory: c.orders || c.orderHistory || [],
          city: c.city || 'Lima',
          address: c.address || 'N/A',
          totalSpent: c.totalSpent ?? 0,
        }));
        this.customers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.loading.set(false);
      }
    });
  }

  /* ---------- Helpers ---------- */
  getFullName(c: Customer): string {
    return c.name || `${c.firstName} ${c.lastName}`.trim();
  }

  daysSinceRegister(c: Customer): number {
    const reg = new Date(c.registeredAt || c.createdAt);
    return Math.floor((TODAY.getTime() - reg.getTime()) / (1000 * 60 * 60 * 24));
  }

  totalSpent(c: Customer): number {
    return c.totalSpent ?? 0;
  }

  ordersCount(c: Customer): number {
    return (c.orderHistory || c.orders || []).length;
  }

  segmentOf(c: Customer): Segment {
    const days = this.daysSinceRegister(c);
    const spent = this.totalSpent(c);
    const orders = this.ordersCount(c);

    if (orders >= 5 || spent >= 15000) return 'vip';
    if (orders === 0 && days <= 30) return 'new';
    if (orders === 0) return 'inactive';
    return 'active';
  }

  segmentLabel(s: Segment): string {
    const map: Record<Segment, string> = {
      vip: 'VIP',
      active: 'Activo',
      new: 'Nuevo',
      inactive: 'Inactivo',
    };
    return map[s];
  }

  segmentIcon(s: Segment): string {
    const map: Record<Segment, string> = {
      vip: 'fa-crown',
      active: 'fa-circle-check',
      new: 'fa-seedling',
      inactive: 'fa-circle-pause',
    };
    return map[s];
  }

  formatRegisteredDate(iso: string | undefined): string {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ---------- Event handlers ---------- */
  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onSegmentChange(event: Event): void {
    this.selectedSegment.set((event.target as HTMLSelectElement).value as SegmentFilter);
  }

  /* ---------- Modal Actions ---------- */
  openCreate(): void {
    this.selectedCustomer.set(null);
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      documentNumber: '',
      address: '',
      city: 'Lima'
    });
    this.modalMode.set('create');
  }

  openEdit(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.form.reset({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      documentNumber: customer.documentNumber || '',
      address: customer.address || '',
      city: customer.city || 'Lima',
    });
    this.modalMode.set('edit');
  }

  openDetail(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.modalMode.set('detail');
  }

  requestDelete(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.modalMode.set('delete-confirm');
  }

  closeModal(): void {
    this.modalMode.set('closed');
    this.selectedCustomer.set(null);
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const current = this.selectedCustomer();

    if (current) {
      // Editar
      this.customerService.updateCustomer(current.id, value).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        },
        error: (err) => console.error('Error actualizando cliente:', err)
      });
    } else {
      // Crear
      this.customerService.createCustomer(value).subscribe({
        next: () => {
          this.loadCustomers();
          this.closeModal();
        },
        error: (err) => console.error('Error creando cliente:', err)
      });
    }
  }

  confirmDelete(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;

    this.customerService.deleteCustomer(customer.id).subscribe({
      next: () => {
        this.loadCustomers();
        this.closeModal();
      },
      error: (err) => console.error('Error eliminando cliente:', err)
    });
  }

  editFromDetail(): void {
    const c = this.selectedCustomer();
    if (c) this.openEdit(c);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalMode() !== 'closed') this.closeModal();
  }
}
