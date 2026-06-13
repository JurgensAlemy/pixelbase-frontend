import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BrandResponse } from '../models/product.models';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/public/brands`;

  getAll(): Observable<BrandResponse[]> {
    return this.http.get<BrandResponse[]>(this.base);
  }

  getBySlug(slug: string): Observable<BrandResponse> {
    return this.http.get<BrandResponse>(`${this.base}/${slug}`);
  }
}
