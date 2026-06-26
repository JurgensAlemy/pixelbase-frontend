import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/admin/orders`;

  // No existe GET /api/v1/admin/orders en el backend.
  // Datos simulados extraídos directamente de la tabla orders de PostgreSQL.
  getAllOrders(page = 0, size = 20, sort = 'createdAt,desc'): Observable<any> {
    const mockResponse = {
      content: [
        {
          id: '21', orderCode: 'ORD-20260624-0021', orderNumber: 'ORD-20260624-0021',
          customerEmail: 'juan@gmail.com', customerFirstName: 'Juan', customerLastName: 'Perez',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 1850.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'ASUS TUF GAMING RTX 4060 TI', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_t9zclw', quantity: 1, unitPrice: 1850.00 }]
        },
        {
          id: '20', orderCode: 'ORD-20260624-0020', orderNumber: 'ORD-20260624-0020',
          customerEmail: 'kalheb@gmail.com', customerFirstName: 'Papa', customerLastName: 'Jhons',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 3999.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'MONITOR CORSAIR XENEON 32', brand: 'CORSAIR', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_m0orro', quantity: 1, unitPrice: 3400.00 }, { productName: 'RAM CORSAIR VENGEANCE RGB 16GB DDR4', brand: 'CORSAIR', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_oxcci5', quantity: 1, unitPrice: 245.00 }]
        },
        {
          id: '19', orderCode: 'ORD-20260624-0019', orderNumber: 'ORD-20260624-0019',
          customerEmail: 'kalheb@gmail.com', customerFirstName: 'Kalheb', customerLastName: 'Jurgens',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 6800.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'LAPTOP ASUS ROG ZEPHYRUS G14', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkvi22', quantity: 1, unitPrice: 6800.00 }]
        },
        {
          id: '18', orderCode: 'ORD-20260624-0018', orderNumber: 'ORD-20260624-0018',
          customerEmail: 'guest.anonimo2@gmail.com', customerFirstName: 'Invitado N°2', customerLastName: 'Anónimo',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: null, status: 'PENDIENTE', totalPrice: 7399.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'LAPTOP RAZER BLADE 15', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkkfs0', quantity: 1, unitPrice: 7399.00 }]
        },
        {
          id: '17', orderCode: 'ORD-20260624-0017', orderNumber: 'ORD-20260624-0017',
          customerEmail: 'guest.anonimo1@gmail.com', customerFirstName: 'Invitado N°1', customerLastName: 'Anónimo',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'ENTREGADO', totalPrice: 25850.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'LAPTOP ASUS ROG ZEPHYRUS G14', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkvi22', quantity: 1, unitPrice: 7200.00 }, { productName: 'LAPTOP RAZER BLADE 15', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkkfs0', quantity: 1, unitPrice: 11500.00 }, { productName: 'MONITOR ASUS ROG SWIFT 27 OLED', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_nryplh', quantity: 1, unitPrice: 2850.00 }]
        },
        {
          id: '16', orderCode: 'ORD-20260624-0016', orderNumber: 'ORD-20260624-0016',
          customerEmail: 'ana.garcia@unmsm.edu.pe', customerFirstName: 'Ana', customerLastName: 'García Rosas',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 22090.00,
          address: 'Recojo en tienda', deliveryType: 'RECOJO_EN_TIENDA',
          items: [{ productName: 'LAPTOP RAZER BLADE 15', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkkfs0', quantity: 1, unitPrice: 11500.00 }, { productName: 'LAPTOP ASUS ROG ZEPHYRUS G14', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkvi22', quantity: 1, unitPrice: 7200.00 }]
        },
        {
          id: '15', orderCode: 'ORD-20260624-0015', orderNumber: 'ORD-20260624-0015',
          customerEmail: 'ana.garcia@unmsm.edu.pe', customerFirstName: 'Ana', customerLastName: 'García Rosas',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 6910.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'ASUS ROG STRIX RTX 4070 TI SUPER', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_gzblxx', quantity: 1, unitPrice: 4250.00 }, { productName: 'RAM KINGSTON FURY RENEGADE 32GB DDR5', brand: 'KINGSTON', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_h1mo53', quantity: 1, unitPrice: 680.00 }]
        },
        {
          id: '14', orderCode: 'ORD-20260624-0014', orderNumber: 'ORD-20260624-0014',
          customerEmail: 'ana.garcia@unmsm.edu.pe', customerFirstName: 'Ana', customerLastName: 'García Rosas',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 9478.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'LAPTOP ASUS ROG ZEPHYRUS G14', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkvi22', quantity: 1, unitPrice: 7200.00 }, { productName: 'AUDÍFONOS RAZER BLACKSHARK V2 PRO WHITE', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vrrzly', quantity: 1, unitPrice: 599.00 }]
        },
        {
          id: '13', orderCode: 'ORD-20260624-0013', orderNumber: 'ORD-20260624-0013',
          customerEmail: 'ana.garcia@unmsm.edu.pe', customerFirstName: 'Ana', customerLastName: 'García Rosas',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: null, status: 'PENDIENTE', totalPrice: 6245.70,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'ASUS ROG STRIX RTX 4070 TI SUPER', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_gzblxx', quantity: 1, unitPrice: 4250.00 }, { productName: 'AUDÍFONOS LOGITECH G733 LIGHTSPEED BLUE', brand: 'LOGITECH', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_nk8v7s', quantity: 1, unitPrice: 489.00 }]
        },
        {
          id: '12', orderCode: 'ORD-20260624-0012', orderNumber: 'ORD-20260624-0012',
          customerEmail: 'lucho.vidal@yahoo.es', customerFirstName: 'Luis', customerLastName: 'Vidal Bazán',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'ENTREGADO', totalPrice: 1778.00,
          address: 'Recojo en tienda', deliveryType: 'RECOJO_EN_TIENDA',
          items: [{ productName: 'TECLADO CORSAIR K70 RGB TKL', brand: 'CORSAIR', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_c83b55', quantity: 1, unitPrice: 580.00 }, { productName: 'MOUSE LOGITECH G PRO X SUPERLIGHT 2', brand: 'LOGITECH', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_jdx3jg', quantity: 1, unitPrice: 549.90 }]
        },
        {
          id: '11', orderCode: 'ORD-20260624-0011', orderNumber: 'ORD-20260624-0011',
          customerEmail: 'lucho.vidal@yahoo.es', customerFirstName: 'Luis', customerLastName: 'Vidal Bazán',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 15900.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'LAPTOP RAZER BLADE 15', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkkfs0', quantity: 1, unitPrice: 11500.00 }, { productName: 'MONITOR ASUS ROG SWIFT 27 OLED', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_nryplh', quantity: 1, unitPrice: 2850.00 }]
        },
        {
          id: '10', orderCode: 'ORD-20260624-0010', orderNumber: 'ORD-20260624-0010',
          customerEmail: 'lucho.vidal@yahoo.es', customerFirstName: 'Luis', customerLastName: 'Vidal Bazán',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 44600.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'LAPTOP RAZER BLADE 15', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkkfs0', quantity: 2, unitPrice: 11500.00 }, { productName: 'LAPTOP ASUS ROG ZEPHYRUS G14', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkvi22', quantity: 3, unitPrice: 7200.00 }]
        },
        {
          id: '9', orderCode: 'ORD-20260624-0009', orderNumber: 'ORD-20260624-0009',
          customerEmail: 'lucho.vidal@yahoo.es', customerFirstName: 'Luis', customerLastName: 'Vidal Bazán',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 15900.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'LAPTOP RAZER BLADE 15', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkkfs0', quantity: 1, unitPrice: 11500.00 }, { productName: 'MONITOR ASUS ROG SWIFT 27 OLED', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_nryplh', quantity: 1, unitPrice: 2850.00 }]
        },
        {
          id: '8', orderCode: 'ORD-20260624-0008', orderNumber: 'ORD-20260624-0008',
          customerEmail: 'maria.quispe@outlook.com', customerFirstName: 'María', customerLastName: 'Quispe Choque',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: null, status: 'PENDIENTE', totalPrice: 5574.00,
          address: 'Recojo en tienda', deliveryType: 'RECOJO_EN_TIENDA',
          items: [{ productName: 'ASUS ROG STRIX RTX 4070 TI SUPER', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_gzblxx', quantity: 1, unitPrice: 4250.00 }, { productName: 'AUDÍFONOS RAZER BLACKSHARK V2 PRO WHITE', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vrrzly', quantity: 1, unitPrice: 599.00 }]
        },
        {
          id: '7', orderCode: 'ORD-20260624-0007', orderNumber: 'ORD-20260624-0007',
          customerEmail: 'maria.quispe@outlook.com', customerFirstName: 'María', customerLastName: 'Quispe Choque',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'ENTREGADO', totalPrice: 2229.70,
          address: 'Recojo en tienda', deliveryType: 'RECOJO_EN_TIENDA',
          items: [{ productName: 'TECLADO RAZER HUNTSMAN V3 PRO TKL', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_w1zthe', quantity: 1, unitPrice: 899.00 }, { productName: 'MOUSE RAZER DEATHADDER V3 PRO', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_eslwba', quantity: 1, unitPrice: 529.00 }]
        },
        {
          id: '6', orderCode: 'ORD-20260624-0006', orderNumber: 'ORD-20260624-0006',
          customerEmail: 'maria.quispe@outlook.com', customerFirstName: 'María', customerLastName: 'Quispe Choque',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 1198.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'TECLADO CORSAIR K70 RGB TKL', brand: 'CORSAIR', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_c83b55', quantity: 1, unitPrice: 580.00 }, { productName: 'RAM CORSAIR VENGEANCE RGB 16GB DDR4', brand: 'CORSAIR', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_oxcci5', quantity: 1, unitPrice: 245.00 }]
        },
        {
          id: '5', orderCode: 'ORD-20260624-0005', orderNumber: 'ORD-20260624-0005',
          customerEmail: 'maria.quispe@outlook.com', customerFirstName: 'María', customerLastName: 'Quispe Choque',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 38900.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'LAPTOP RAZER BLADE 15', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkkfs0', quantity: 2, unitPrice: 11500.00 }, { productName: 'LAPTOP ASUS ROG ZEPHYRUS G14', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkvi22', quantity: 2, unitPrice: 7200.00 }]
        },
        {
          id: '4', orderCode: 'ORD-20260624-0004', orderNumber: 'ORD-20260624-0004',
          customerEmail: 'juan.perez@gmail.com', customerFirstName: 'Juan', customerLastName: 'Pérez Lucho',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 29000.00,
          address: 'Recojo en tienda', deliveryType: 'RECOJO_EN_TIENDA',
          items: [{ productName: 'LAPTOP RAZER BLADE 15', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkkfs0', quantity: 1, unitPrice: 11500.00 }, { productName: 'LAPTOP ASUS ROG ZEPHYRUS G14', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkvi22', quantity: 2, unitPrice: 7200.00 }]
        },
        {
          id: '3', orderCode: 'ORD-20260624-0003', orderNumber: 'ORD-20260624-0003',
          customerEmail: 'juan.perez@gmail.com', customerFirstName: 'Juan', customerLastName: 'Pérez Lucho',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: null, status: 'PENDIENTE', totalPrice: 9478.00,
          address: 'Recojo en tienda', deliveryType: 'RECOJO_EN_TIENDA',
          items: [{ productName: 'LAPTOP ASUS ROG ZEPHYRUS G14', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vkvi22', quantity: 1, unitPrice: 7200.00 }, { productName: 'AUDÍFONOS RAZER BLACKSHARK V2 PRO WHITE', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_vrrzly', quantity: 1, unitPrice: 599.00 }]
        },
        {
          id: '2', orderCode: 'ORD-20260624-0002', orderNumber: 'ORD-20260624-0002',
          customerEmail: 'juan.perez@gmail.com', customerFirstName: 'Juan', customerLastName: 'Pérez Lucho',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'ENTREGADO', totalPrice: 1740.00,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'TECLADO RAZER HUNTSMAN V3 PRO TKL', brand: 'RAZER', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_w1zthe', quantity: 1, unitPrice: 899.00 }, { productName: 'RAM CORSAIR VENGEANCE RGB 16GB DDR4', brand: 'CORSAIR', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_oxcci5', quantity: 1, unitPrice: 245.00 }]
        },
        {
          id: '1', orderCode: 'ORD-20260624-0001', orderNumber: 'ORD-20260624-0001',
          customerEmail: 'juan.perez@gmail.com', customerFirstName: 'Juan', customerLastName: 'Pérez Lucho',
          orderDate: '24/06/2026', date: '24/06/2026',
          paymentMethod: 'TARJETA', status: 'CONFIRMADO', totalPrice: 4505.70,
          address: 'A domicilio', deliveryType: 'A_DOMICILIO',
          items: [{ productName: 'ASUS ROG STRIX RTX 4070 TI SUPER', brand: 'ASUS', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_gzblxx', quantity: 1, unitPrice: 4250.00 }, { productName: 'MOUSE LOGITECH G PRO X SUPERLIGHT 2', brand: 'LOGITECH', image: 'https://res.cloudinary.com/dktgh8mgh/image/upload/v1779837715/pixelbase/products/file_jdx3jg', quantity: 1, unitPrice: 549.90 }]
        }
      ],
      totalElements: 21,
      totalPages: 2,
      number: 0,
      size: 20
    };

    return of(mockResponse).pipe(delay(300));
  }

  getOrderDetail(orderId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${orderId}`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/${orderId}/status`, { status });
  }
}
