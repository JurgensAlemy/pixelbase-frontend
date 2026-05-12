import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../components/admin-header/admin-header';

type Period = 'today' | 'week' | 'month' | 'year';

interface SalesPoint {
  label: string;
  value: number;
}

interface KPI {
  label: string;
  value: string;
  icon: string;
  iconClass: string;
  delta: number;
}

interface ProductRanking {
  rank: number;
  name: string;
  brand: string;
  image: string;
  unitsSold: number;
  revenue: number;
}

interface CustomerRanking {
  rank: number;
  name: string;
  avatar: string;
  orders: number;
  totalSpent: number;
}

function avatarFor(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}

@Component({
  selector: 'app-reports-admin',
  standalone: true,
  imports: [AdminSidebar, AdminHeader, DecimalPipe],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  readonly selectedPeriod = signal<Period>('week');

  readonly periodOptions: { value: Period; label: string }[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'week',  label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'year',  label: 'Año' },
  ];

  /* --- KPIs con comparativa vs periodo anterior --- */
  readonly kpis: KPI[] = [
    { label: 'INGRESOS TOTALES',  value: 'S/ 41,050', icon: 'fa-dollar-sign',  iconClass: 'bg-blue-light',   delta: 12.5 },
    { label: 'PEDIDOS',           value: '142',       icon: 'fa-cart-shopping', iconClass: 'bg-purple-light', delta:  5.8 },
    { label: 'TICKET PROMEDIO',   value: 'S/ 289',    icon: 'fa-receipt',       iconClass: 'bg-green-light',  delta: -2.1 },
    { label: 'TASA DE CONVERSIÓN',value: '3.25%',     icon: 'fa-bolt',          iconClass: 'bg-yellow-light', delta:  0.8 },
  ];

  /* --- Serie de ventas (mock, S/ por día de la semana) --- */
  readonly salesData: SalesPoint[] = [
    { label: 'Lun', value: 4250 },
    { label: 'Mar', value: 6890 },
    { label: 'Mié', value: 5120 },
    { label: 'Jue', value: 9450 },
    { label: 'Vie', value: 7320 },
    { label: 'Sáb', value: 3150 },
    { label: 'Dom', value: 4870 },
  ];

  readonly maxSales = Math.max(...this.salesData.map((s) => s.value));
  readonly totalSales = this.salesData.reduce((s, p) => s + p.value, 0);
  readonly avgSales = Math.round(this.totalSales / this.salesData.length);

  /* --- Top productos del periodo --- */
  readonly topProducts: ProductRanking[] = [
    { rank: 1, name: 'SSD 990 Pro 2TB NVMe',       brand: 'SAMSUNG',  image: '/img/generated-1776449494133.png', unitsSold: 215, revenue: 161035 },
    { rank: 2, name: 'GeForce RTX 4090 24GB',      brand: 'NVIDIA',   image: '/img/generated-1776449462383.png', unitsSold: 124, revenue: 223076 },
    { rank: 3, name: 'Ryzen 7 7800X3D',            brand: 'AMD',      image: '/img/generated-1776450244346.png', unitsSold:  98, revenue: 149940 },
    { rank: 4, name: 'G Pro X Superlight Mouse',   brand: 'LOGITECH', image: '/img/generated-1776451650381.png', unitsSold:  87, revenue:  33843 },
    { rank: 5, name: 'K70 RGB PRO Mechanical',     brand: 'CORSAIR',  image: '/img/generated-1776454451190.png', unitsSold:  74, revenue:  56240 },
  ];

  readonly maxProductUnits = Math.max(...this.topProducts.map((p) => p.unitsSold));

  /* --- Top clientes del periodo --- */
  readonly topCustomers: CustomerRanking[] = [
    { rank: 1, name: 'Luis Pérez',     avatar: avatarFor('Luis Perez'),     orders: 8, totalSpent: 38740 },
    { rank: 2, name: 'Camila Torres',  avatar: avatarFor('Camila Torres'),  orders: 6, totalSpent: 18230 },
    { rank: 3, name: 'Carlos Ruiz',    avatar: avatarFor('Carlos Ruiz'),    orders: 4, totalSpent: 12979 },
    { rank: 4, name: 'Diego Salazar',  avatar: avatarFor('Diego Salazar'),  orders: 3, totalSpent:  6749 },
    { rank: 5, name: 'María Gómez',    avatar: avatarFor('Maria Gomez'),    orders: 3, totalSpent:  3850 },
  ];

  readonly maxCustomerSpent = Math.max(...this.topCustomers.map((c) => c.totalSpent));

  setPeriod(p: Period): void {
    this.selectedPeriod.set(p);
  }

  barHeight(point: SalesPoint): number {
    return (point.value / this.maxSales) * 100;
  }

  productBar(p: ProductRanking): number {
    return (p.unitsSold / this.maxProductUnits) * 100;
  }

  customerBar(c: CustomerRanking): number {
    return (c.totalSpent / this.maxCustomerSpent) * 100;
  }
}
