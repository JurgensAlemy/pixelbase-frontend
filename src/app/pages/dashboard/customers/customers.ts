import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../components/admin-header/admin-header';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
type Segment = 'vip' | 'active' | 'new' | 'inactive';
type SegmentFilter = 'all' | Segment;
type ModalMode = 'closed' | 'create' | 'edit' | 'detail' | 'delete-confirm';

interface CustomerOrder {
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  city: string;
  registeredAt: string; // ISO date
  orderHistory: CustomerOrder[];
}

const TODAY = new Date('2026-05-12');

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
export class Customers {
  private fb = inject(FormBuilder);

  readonly customers = signal<Customer[]>([
    {
      id: 1,
      name: 'Carlos Ruiz',
      email: 'carlos.ruiz@gmail.com',
      phone: '999 888 777',
      avatar: avatarFor('Carlos Ruiz'),
      address: 'Av. La Marina 1234',
      city: 'San Miguel, Lima',
      registeredAt: '2025-01-15',
      orderHistory: [
        { orderNumber: '#PX-8492', date: 'Hoy, 10:45 AM', total: 3450, status: 'completed' },
        { orderNumber: '#PX-7340', date: '15/02/2026',    total: 1899, status: 'completed' },
        { orderNumber: '#PX-6125', date: '02/12/2025',    total: 2200, status: 'completed' },
        { orderNumber: '#PX-5044', date: '18/08/2025',    total: 5430, status: 'completed' },
      ],
    },
    {
      id: 2,
      name: 'María Gómez',
      email: 'maria.gomez@hotmail.com',
      phone: '988 777 666',
      avatar: avatarFor('Maria Gomez'),
      address: 'Calle Las Begonias 567',
      city: 'San Isidro, Lima',
      registeredAt: '2025-06-20',
      orderHistory: [
        { orderNumber: '#PX-8491', date: 'Hoy, 09:12 AM', total: 850, status: 'pending'  },
        { orderNumber: '#PX-7012', date: '03/01/2026',    total: 1290, status: 'completed' },
      ],
    },
    {
      id: 3,
      name: 'Luis Pérez',
      email: 'luis.perez@yahoo.com',
      phone: '977 666 555',
      avatar: avatarFor('Luis Perez'),
      address: 'Av. Brasil 890',
      city: 'Magdalena, Lima',
      registeredAt: '2024-03-10',
      orderHistory: [
        { orderNumber: '#PX-8490', date: 'Ayer, 18:30 PM', total: 12990, status: 'completed' },
        { orderNumber: '#PX-8001', date: '20/03/2026',     total:  4200, status: 'completed' },
        { orderNumber: '#PX-7500', date: '02/02/2026',     total:  8900, status: 'completed' },
        { orderNumber: '#PX-6800', date: '15/12/2025',     total:  3550, status: 'completed' },
        { orderNumber: '#PX-6100', date: '08/10/2025',     total:  6320, status: 'completed' },
        { orderNumber: '#PX-5400', date: '22/07/2025',     total:  2780, status: 'completed' },
      ],
    },
    {
      id: 4,
      name: 'Ana Vargas',
      email: 'ana.vargas@outlook.com',
      phone: '966 555 444',
      avatar: avatarFor('Ana Vargas'),
      address: 'Jr. Huallaga 123',
      city: 'Cercado, Lima',
      registeredAt: '2025-09-05',
      orderHistory: [
        { orderNumber: '#PX-8489', date: 'Ayer, 15:20 PM', total: 120, status: 'cancelled' },
      ],
    },
    {
      id: 5,
      name: 'Diego Salazar',
      email: 'diego.salazar@gmail.com',
      phone: '955 444 333',
      avatar: avatarFor('Diego Salazar'),
      address: 'Calle Los Pinos 45',
      city: 'Surco, Lima',
      registeredAt: '2025-11-22',
      orderHistory: [
        { orderNumber: '#PX-8488', date: '10/05/2026', total: 2369, status: 'shipped' },
        { orderNumber: '#PX-7900', date: '15/03/2026', total: 1450, status: 'completed' },
      ],
    },
    {
      id: 6,
      name: 'Camila Torres',
      email: 'camila.t@gmail.com',
      phone: '944 333 222',
      avatar: avatarFor('Camila Torres'),
      address: 'Av. Benavides 2200',
      city: 'Miraflores, Lima',
      registeredAt: '2024-08-18',
      orderHistory: [
        { orderNumber: '#PX-8487', date: '10/05/2026', total: 2799, status: 'processing' },
        { orderNumber: '#PX-7222', date: '14/01/2026', total: 5100, status: 'completed' },
        { orderNumber: '#PX-6900', date: '20/11/2025', total: 3400, status: 'completed' },
      ],
    },
    {
      id: 7,
      name: 'José Mendoza',
      email: 'jose.mendoza@gmail.com',
      phone: '933 222 111',
      avatar: avatarFor('Jose Mendoza'),
      address: 'Calle Las Flores 78',
      city: 'La Molina, Lima',
      registeredAt: '2025-12-01',
      orderHistory: [
        { orderNumber: '#PX-8486', date: '09/05/2026', total: 1799, status: 'pending' },
      ],
    },
    {
      id: 8,
      name: 'Lucía Romero',
      email: 'lucia.r@outlook.com',
      phone: '922 111 000',
      avatar: avatarFor('Lucia Romero'),
      address: 'Av. Universitaria 1500',
      city: 'Los Olivos, Lima',
      registeredAt: '2026-04-25',
      orderHistory: [
        { orderNumber: '#PX-8485', date: '08/05/2026', total: 2247, status: 'completed' },
      ],
    },
    {
      id: 9,
      name: 'Sofía Cárdenas',
      email: 'sofia.c@gmail.com',
      phone: '911 000 999',
      avatar: avatarFor('Sofia Cardenas'),
      address: 'Av. Salaverry 850',
      city: 'Jesús María, Lima',
      registeredAt: '2026-05-05',
      orderHistory: [],
    },
    {
      id: 10,
      name: 'Pablo Rivera',
      email: 'pablo.rivera@gmail.com',
      phone: '900 999 888',
      avatar: avatarFor('Pablo Rivera'),
      address: 'Calle Las Camelias 320',
      city: 'San Borja, Lima',
      registeredAt: '2026-05-08',
      orderHistory: [],
    },
    {
      id: 11,
      name: 'Daniela Castro',
      email: 'daniela.c@hotmail.com',
      phone: '989 888 777',
      avatar: avatarFor('Daniela Castro'),
      address: 'Av. El Sol 4500',
      city: 'Barranco, Lima',
      registeredAt: '2023-05-10',
      orderHistory: [],
    },
  ]);

  readonly searchQuery = signal('');
  readonly selectedSegment = signal<SegmentFilter>('all');

  readonly segmentOptions: { value: SegmentFilter; label: string }[] = [
    { value: 'all',      label: 'Todos los clientes' },
    { value: 'vip',      label: 'VIP' },
    { value: 'active',   label: 'Activos' },
    { value: 'new',      label: 'Nuevos (< 30 días)' },
    { value: 'inactive', label: 'Inactivos' },
  ];

  readonly filteredCustomers = computed<Customer[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const seg = this.selectedSegment();
    return this.customers().filter((c) => {
      const matchesSeg = seg === 'all' || this.segmentOf(c) === seg;
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q);
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
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-+()]{7,}$/)]],
    address: ['', Validators.required],
    city: ['Lima', Validators.required],
  });

  /* ---------- Helpers ---------- */
  totalSpent(c: Customer): number {
    return c.orderHistory
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
  }

  ordersCount(c: Customer): number {
    return c.orderHistory.length;
  }

  daysSinceRegister(c: Customer): number {
    const reg = new Date(c.registeredAt);
    return Math.floor((TODAY.getTime() - reg.getTime()) / (1000 * 60 * 60 * 24));
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

  formatRegisteredDate(iso: string): string {
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

  /* ---------- Acciones de modal ---------- */
  openCreate(): void {
    this.selectedCustomer.set(null);
    this.form.reset({ name: '', email: '', phone: '', address: '', city: 'Lima' });
    this.modalMode.set('create');
  }

  openEdit(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.form.reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
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
      this.customers.update((list) =>
        list.map((c) =>
          c.id === current.id
            ? { ...current, ...value, avatar: current.name === value.name ? current.avatar : avatarFor(value.name) }
            : c,
        ),
      );
    } else {
      const nextId = Math.max(0, ...this.customers().map((c) => c.id)) + 1;
      const today = TODAY.toISOString().slice(0, 10);
      this.customers.update((list) => [
        {
          id: nextId,
          ...value,
          avatar: avatarFor(value.name),
          registeredAt: today,
          orderHistory: [],
        },
        ...list,
      ]);
    }

    this.closeModal();
  }

  confirmDelete(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;
    this.customers.update((list) => list.filter((c) => c.id !== customer.id));
    this.closeModal();
  }

  /* ---------- Cambio entre detalle <-> editar (sin cerrar modal) ---------- */
  editFromDetail(): void {
    const c = this.selectedCustomer();
    if (c) this.openEdit(c);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalMode() !== 'closed') this.closeModal();
  }
}
