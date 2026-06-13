// REEMPLAZA el archivo existente completo
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryResponse } from '../models/product.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/public/categories`;

  getTree(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.base}/tree`);
  }

  getBySlug(slug: string): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.base}/${slug}`);
  }
}
