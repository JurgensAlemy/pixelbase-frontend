import { Component, HostListener, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../components/admin-header/admin-header';
import { AdminOrderService } from '../../../services/admin-order.service';

type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'PREPARANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';
type StatusFilter = 'all' | OrderStatus;
type ModalMode = 'closed' | 'detail';

interface OrderItem {
  productName: string;
  brand: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

interface Customer {
  name: string;
  email: string;
  avatar: string;
  address: string;
}

interface AdminOrder {
  id: string;
  orderCode: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  orderDate: string;
  date: string;
  paymentMethod: string;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];  // Ahora NO es opcional
  customer: Customer;  // Ahora NO es opcional
}

interface OrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [AdminSidebar, AdminHeader, DecimalPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit {
  private orderService = inject(AdminOrderService);

  readonly orders = signal<AdminOrder[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly selectedStatus = signal<StatusFilter>('all');
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'PREPARANDO', label: 'Preparando' },
    { value: 'ENVIADO', label: 'Enviado' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  readonly filteredOrders = computed<AdminOrder[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const status = this.selectedStatus();
    return this.orders().filter((o) => {
      const matchesStatus = status === 'all' || o.status === status;
      const matchesQuery =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.orderCode.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        `${o.customerFirstName} ${o.customerLastName}`.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  });

  readonly stats = computed(() => {
    const all = this.orders();
    return {
      total: all.length,
      pending: all.filter((o) => o.status === 'PENDIENTE').length,
      completed: all.filter((o) => o.status === 'ENTREGADO').length,
      cancelled: all.filter((o) => o.status === 'CANCELADO').length,
    };
  });

  /* ---------- Modal ---------- */
  readonly modalMode = signal<ModalMode>('closed');
  readonly selectedOrder = signal<AdminOrder | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getAllOrders(this.currentPage(), this.pageSize()).subscribe({
      next: (res) => {
        let data = res.content ?? res ?? [];
        // Normalizar los datos para que tengan TODOS los campos
        data = (Array.isArray(data) ? data : []).map((o: any) => ({
          ...o,
          orderCode: o.orderCode || o.orderNumber || `#PX-${o.id}`,
          orderNumber: o.orderNumber || o.orderCode || `#PX-${o.id}`,
          date: o.orderDate || o.date || new Date().toLocaleDateString(),
          paymentMethod: o.paymentMethod || 'Desconocido',
          items: o.items || [],  // Asegurar que siempre sea un array
          customer: {
            name: `${o.customerFirstName} ${o.customerLastName}`.trim(),
            email: o.customerEmail,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(o.customerFirstName + ' ' + o.customerLastName)}&background=random`,
            address: o.address || 'N/A'
          }
        }));
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando órdenes:', err);
        this.loading.set(false);
      }
    });
  }

  /* ---------- Helpers ---------- */
  getCustomerName(order: AdminOrder): string {
    return order.customer?.name || `${order.customerFirstName} ${order.customerLastName}`.trim();
  }

  itemsCount(order: AdminOrder): number {
    return order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  orderTotal(order: AdminOrder): OrderTotals {
    const subtotal = order.items?.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? order.totalPrice ?? 0;
    const shipping = subtotal >= 500 ? 0 : 15;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado', PREPARANDO: 'Preparando',
      ENVIADO: 'Enviado', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
    };
    return map[status];
  }

  statusIcon(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      PENDIENTE: 'fa-clock', CONFIRMADO: 'fa-circle-check', PREPARANDO: 'fa-rotate',
      ENVIADO: 'fa-truck', ENTREGADO: 'fa-box-open', CANCELADO: 'fa-ban',
    };
    return map[status];
  }

  /* ---------- Event handlers ---------- */
  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onStatusChange(event: Event): void {
    this.selectedStatus.set((event.target as HTMLSelectElement).value as StatusFilter);
  }

  openDetail(order: AdminOrder): void {
    this.selectedOrder.set(order);
    this.modalMode.set('detail');
  }

  closeModal(): void {
    this.modalMode.set('closed');
    this.selectedOrder.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalMode() !== 'closed') this.closeModal();
  }
}
