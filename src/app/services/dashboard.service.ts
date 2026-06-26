import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/admin`;

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/dashboard/stats`);
  }

  getRecentOrders(limit = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/orders?size=${limit}&sort=createdAt,desc`);
  }

  getRevenueMetrics(period = 'month'): Observable<any> {
    return this.http.get<any>(`${this.base}/dashboard/revenue?period=${period}`);
  }
}
