import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private customerBase = `${environment.apiUrl}/api/v1/customer`;
  private publicBase = `${environment.apiUrl}/api/v1/public`;

  getMyOrders(page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    return this.http.get<any>(`${this.customerBase}/orders`, { params });
  }

  getAddresses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.customerBase}/addresses`);
  }

  createAddress(addressData: any): Observable<any> {
    return this.http.post<any>(`${this.customerBase}/addresses`, addressData);
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete<any>(`${this.customerBase}/addresses/${id}`);
  }

  setDefaultAddress(id: number): Observable<any> {
    return this.http.patch<any>(`${this.customerBase}/addresses/${id}/default`, {});
  }

  // Estos apuntan a public porque invitados también pueden usarlos
  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(`${this.publicBase}/orders`, orderData);
  }

  getStores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.publicBase}/stores`);
  }
}
