import { Component, OnInit, OnDestroy, inject, signal, computed, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { AdminSidebar } from './components/admin-sidebar/admin-sidebar';
import { AdminHeader } from './components/admin-header/admin-header';
import { AdminOrderService } from '../../services/admin-order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdminSidebar, AdminHeader, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private orderService = inject(AdminOrderService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  private chartInstance: any = null;

  readonly allOrders = signal<any[]>([]);
  readonly recentOrders = signal<any[]>([]);
  readonly loading = signal(false);

  readonly totalOrders = computed(() => this.allOrders().length);
  readonly totalRevenue = computed(() =>
    this.allOrders().reduce((sum, o) => sum + (o.totalPrice ?? 0), 0)
  );
  readonly pendingOrders = computed(() =>
    this.allOrders().filter(o => o.status === 'PENDIENTE').length
  );
  readonly deliveredOrders = computed(() =>
    this.allOrders().filter(o => o.status === 'ENTREGADO').length
  );
  readonly confirmedOrders = computed(() =>
    this.allOrders().filter(o => o.status === 'CONFIRMADO').length
  );

  ngOnInit(): void {
    this.loading.set(true);
    this.orderService.getAllOrders(0, 50).subscribe({
      next: (res) => {
        const orders = res.content ?? res ?? [];
        this.allOrders.set(orders);
        this.recentOrders.set(orders.slice(0, 5));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initChart();
    }
  }

  private async initChart(): Promise<void> {
    // Importación dinámica para evitar problemas de SSR
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    const canvas = this.salesChartRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destruir instancia previa si existe
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          {
            label: 'Ventas (S/)',
            data: [4505, 9478, 15900, 44600, 22090, 6910, 7399],
            backgroundColor: (context: any) => {
              const index = context.dataIndex;
              // Jue es el día con más ventas → color destacado
              return index === 3 ? '#2563eb' : '#bfdbfe';
            },
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` S/ ${ctx.parsed.y.toLocaleString('es-PE')}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { weight: 600, size: 12 }
            }
          },
          y: {
            grid: {
              color: '#f1f5f9',
            },
            ticks: {
              color: '#94a3b8',
              callback: (value: any) => `S/ ${(value / 1000).toFixed(0)}k`
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
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

  getAvatar(firstName: string, lastName: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random&color=fff&size=36`;
  }
}
