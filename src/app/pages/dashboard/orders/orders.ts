import { Component, HostListener, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../components/admin-header/admin-header';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
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
  id: number;
  orderNumber: string;
  customer: Customer;
  date: string;
  paymentMethod: string;
  status: OrderStatus;
  items: OrderItem[];
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
export class Orders {
  readonly orders = signal<AdminOrder[]>([
    {
      id: 1,
      orderNumber: '#PX-8492',
      customer: {
        name: 'Carlos Ruiz',
        email: 'carlos.ruiz@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Ruiz&background=random',
        address: 'Av. La Marina 1234, San Miguel, Lima',
      },
      date: 'Hoy, 10:45 AM',
      paymentMethod: 'Tarjeta Visa',
      status: 'completed',
      items: [
        { productName: 'GeForce RTX 4090 24GB', brand: 'NVIDIA',  image: '/img/generated-1776449462383.png', quantity: 1, unitPrice: 1799 },
        { productName: 'Vengeance DDR5 64GB RGB', brand: 'CORSAIR', image: '/img/generated-1776449488887.png', quantity: 1, unitPrice: 1249 },
        { productName: 'SSD 990 Pro 2TB NVMe', brand: 'SAMSUNG',  image: '/img/generated-1776449494133.png', quantity: 1, unitPrice: 402 },
      ],
    },
    {
      id: 2,
      orderNumber: '#PX-8491',
      customer: {
        name: 'María Gómez',
        email: 'maria.gomez@hotmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Maria+Gomez&background=random',
        address: 'Calle Las Begonias 567, San Isidro, Lima',
      },
      date: 'Hoy, 09:12 AM',
      paymentMethod: 'Yape',
      status: 'pending',
      items: [
        { productName: 'G Pro X Superlight Mouse', brand: 'LOGITECH', image: '/img/generated-1776451650381.png', quantity: 1, unitPrice: 389 },
        { productName: 'K70 RGB PRO Mechanical', brand: 'CORSAIR',  image: '/img/generated-1776454451190.png', quantity: 1, unitPrice: 461 },
      ],
    },
    {
      id: 3,
      orderNumber: '#PX-8490',
      customer: {
        name: 'Luis Pérez',
        email: 'luis.perez@yahoo.com',
        avatar: 'https://ui-avatars.com/api/?name=Luis+Perez&background=random',
        address: 'Av. Brasil 890, Magdalena, Lima',
      },
      date: 'Ayer, 18:30 PM',
      paymentMethod: 'Tarjeta Mastercard',
      status: 'completed',
      items: [
        { productName: 'ROG Strix G15',        brand: 'ASUS', image: '/img/generated-1776449606200.png', quantity: 2, unitPrice: 5850 },
        { productName: 'Ryzen 7 7800X3D',      brand: 'AMD',  image: '/img/generated-1776450244346.png', quantity: 1, unitPrice: 1290 },
      ],
    },
    {
      id: 4,
      orderNumber: '#PX-8489',
      customer: {
        name: 'Ana Vargas',
        email: 'ana.vargas@outlook.com',
        avatar: 'https://ui-avatars.com/api/?name=Ana+Vargas&background=random',
        address: 'Jr. Huallaga 123, Cercado, Lima',
      },
      date: 'Ayer, 15:20 PM',
      paymentMethod: 'Plin',
      status: 'cancelled',
      items: [
        { productName: 'Cable HDMI 2.1 (2m)', brand: 'GENERIC', image: '/img/generated-1776451648343.png', quantity: 2, unitPrice: 60 },
      ],
    },
    {
      id: 5,
      orderNumber: '#PX-8488',
      customer: {
        name: 'Diego Salazar',
        email: 'diego.salazar@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Diego+Salazar&background=random',
        address: 'Calle Los Pinos 45, Surco, Lima',
      },
      date: '10/05/2026',
      paymentMethod: 'Tarjeta Visa',
      status: 'shipped',
      items: [
        { productName: 'ROG Swift 27" 240Hz Monitor', brand: 'ASUS', image: '/img/generated-1776453894572.png', quantity: 1, unitPrice: 2369 },
      ],
    },
    {
      id: 6,
      orderNumber: '#PX-8487',
      customer: {
        name: 'Camila Torres',
        email: 'camila.t@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Camila+Torres&background=random',
        address: 'Av. Benavides 2200, Miraflores, Lima',
      },
      date: '10/05/2026',
      paymentMethod: 'Yape',
      status: 'processing',
      items: [
        { productName: 'Ryzen 9 7950X 16 cores', brand: 'AMD',  image: '/img/generated-1776449484740.png', quantity: 1, unitPrice: 2199 },
        { productName: 'Kraken X63 RGB Cooler',  brand: 'NZXT', image: '/img/generated-1776450176480.png', quantity: 1, unitPrice: 600 },
      ],
    },
    {
      id: 7,
      orderNumber: '#PX-8486',
      customer: {
        name: 'José Mendoza',
        email: 'jose.mendoza@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Jose+Mendoza&background=random',
        address: 'Calle Las Flores 78, La Molina, Lima',
      },
      date: '09/05/2026',
      paymentMethod: 'PagoEfectivo',
      status: 'pending',
      items: [
        { productName: 'GeForce RTX 4090 24GB', brand: 'NVIDIA', image: '/img/generated-1776449462383.png', quantity: 1, unitPrice: 1799 },
      ],
    },
    {
      id: 8,
      orderNumber: '#PX-8485',
      customer: {
        name: 'Lucía Romero',
        email: 'lucia.r@outlook.com',
        avatar: 'https://ui-avatars.com/api/?name=Lucia+Romero&background=random',
        address: 'Av. Universitaria 1500, Los Olivos, Lima',
      },
      date: '08/05/2026',
      paymentMethod: 'Tarjeta Visa',
      status: 'completed',
      items: [
        { productName: 'SSD 990 Pro 2TB NVMe', brand: 'SAMSUNG', image: '/img/generated-1776449494133.png', quantity: 3, unitPrice: 749 },
      ],
    },
  ]);

  readonly searchQuery = signal('');
  readonly selectedStatus = signal<StatusFilter>('all');

  readonly statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all',        label: 'Todos los estados' },
    { value: 'pending',    label: 'Pendiente' },
    { value: 'processing', label: 'En proceso' },
    { value: 'shipped',    label: 'Enviado' },
    { value: 'completed',  label: 'Completado' },
    { value: 'cancelled',  label: 'Cancelado' },
  ];

  readonly filteredOrders = computed<AdminOrder[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const status = this.selectedStatus();
    return this.orders().filter((o) => {
      const matchesStatus = status === 'all' || o.status === status;
      const matchesQuery =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  });

  readonly stats = computed(() => {
    const all = this.orders();
    return {
      total: all.length,
      pending: all.filter((o) => o.status === 'pending').length,
      completed: all.filter((o) => o.status === 'completed').length,
      cancelled: all.filter((o) => o.status === 'cancelled').length,
    };
  });

  /* ---------- Modal ---------- */
  readonly modalMode = signal<ModalMode>('closed');
  readonly selectedOrder = signal<AdminOrder | null>(null);

  /* ---------- Helpers ---------- */
  itemsCount(order: AdminOrder): number {
    return order.items.reduce((s, i) => s + i.quantity, 0);
  }

  orderTotal(order: AdminOrder): OrderTotals {
    const subtotal = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const shipping = subtotal >= 500 ? 0 : 15;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending: 'Pendiente',
      processing: 'En proceso',
      shipped: 'Enviado',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return map[status];
  }

  statusIcon(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending: 'fa-clock',
      processing: 'fa-rotate',
      shipped: 'fa-truck',
      completed: 'fa-circle-check',
      cancelled: 'fa-ban',
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
