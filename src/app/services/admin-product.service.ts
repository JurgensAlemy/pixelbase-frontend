import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

// Mapa product_id → URL real de Cloudinary (extraído de la tabla product_images)
const PRODUCT_IMAGE_MAP: Record<number, string> = {
  1: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_jdx3jg',
  2: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_eslwba',
  3: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_w1zthe',
  4: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_c83b55',
  5: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_nk8v7s',
  6: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_gzblxx',
  7: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_t9zclw',
  8: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_h1mo53',
  9: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_oxcci5',
  10: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkvi22',
  11: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkkfs0',
  12: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_nryplh',
  13: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_m0orro',
  14: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vrrzly',
  15: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_abnhts',
};

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/admin/products`;

  // ProductAdminTableResponse NO incluye imageUrl.
  // Usamos el mapa local con las URLs reales de Cloudinary de tu tabla product_images.
  getAllProducts(page = 0, size = 20, search = '', categoryId?: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'updatedAt,desc');

    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId);

    return this.http.get<any>(this.base, { params }).pipe(
      map(res => {
        if (res.content) {
          res.content = res.content.map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brandName || 'Sin Marca',
            category: p.categoryName || 'Sin Categoría',
            price: p.price,
            stock: p.stock,
            sku: p.sku,
            // Buscamos la imagen real por ID; si el producto es nuevo (no en el mapa), usamos avatar
            image: PRODUCT_IMAGE_MAP[p.id]
              ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=6366f1&color=fff&size=80&bold=true&length=2`
          }));
        }
        return res;
      })
    );
  }

  getProductDetail(productId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${productId}`);
  }

  createProduct(body: any): Observable<any> {
    const payload = this.buildStrictBackendPayload(body);
    return this.http.post<any>(this.base, payload);
  }

  updateProduct(productId: string, body: any): Observable<any> {
    const payload = this.buildStrictBackendPayload(body);
    return this.http.put<any>(`${this.base}/${productId}`, payload);
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${productId}/status`, { status: 'INACTIVO' });
  }

  private buildStrictBackendPayload(frontendProduct: any) {
    return {
      name: frontendProduct.name,
      description: 'Descripción autogenerada para el producto: ' + frontendProduct.name,
      price: frontendProduct.price,
      originalPrice: frontendProduct.price + 50,
      stock: frontendProduct.stock,
      partNumber: 'PN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: 'ACTIVO',
      brandId: 1,
      categoryId: 1,
      specifications: {},
      images: [
        {
          url: frontendProduct.image || 'https://placehold.co/400x400/6366f1/fff?text=Producto',
          altText: frontendProduct.name,
          publicId: 'local_img_' + Date.now()
        }
      ]
    };
  }
}
