import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// No existe GET /api/v1/admin/customers ni /api/v1/admin/users (solo register-admin).
// Clientes simulados desde la tabla users + orders reales de PostgreSQL.
// totalSpent y orderHistory calculados cruzando orders.csv con users.csv.

@Injectable({ providedIn: 'root' })
export class AdminCustomerService {

  getAllCustomers(page = 0, size = 20, sort = 'createdAt,desc'): Observable<any> {
    const mockResponse = {
      content: [
        {
          id: '6',
          email: 'kalheb@gmail.com',
          firstName: 'Kalheb',
          lastName: 'Jurgens',
          phone: '999888777',
          documentType: 'DNI',
          documentNumber: '12345678',
          createdAt: '2026-06-24T00:00:00',
          registeredAt: '2026-06-24T00:00:00',
          city: 'Lima',
          address: 'A domicilio',
          totalSpent: 10650.00, // ORD-0019 (6800) + ORD-0020 (3999) - ORD-0020 fue otro pedido
          orderHistory: [
            { orderNumber: 'ORD-20260624-0019', date: '24/06/2026', total: 6800.00, status: 'CONFIRMADO' },
            { orderNumber: 'ORD-20260624-0020', date: '24/06/2026', total: 3999.00, status: 'CONFIRMADO' },
          ]
        },
        {
          id: '5',
          email: 'ana.garcia@unmsm.edu.pe',
          firstName: 'Ana',
          lastName: 'García Rosas',
          phone: '944567812',
          documentType: 'DNI',
          documentNumber: '87654321',
          createdAt: '2026-06-24T00:00:00',
          registeredAt: '2026-06-24T00:00:00',
          city: 'Lima',
          address: 'A domicilio',
          totalSpent: 44723.70, // ORD-0013+0014+0015+0016
          orderHistory: [
            { orderNumber: 'ORD-20260624-0013', date: '24/06/2026', total: 6245.70, status: 'PENDIENTE' },
            { orderNumber: 'ORD-20260624-0014', date: '24/06/2026', total: 9478.00, status: 'CONFIRMADO' },
            { orderNumber: 'ORD-20260624-0015', date: '24/06/2026', total: 6910.00, status: 'CONFIRMADO' },
            { orderNumber: 'ORD-20260624-0016', date: '24/06/2026', total: 22090.00, status: 'CONFIRMADO' },
          ]
        },
        {
          id: '4',
          email: 'lucho.vidal@yahoo.es',
          firstName: 'Luis',
          lastName: 'Vidal Bazán',
          phone: '955612378',
          documentType: 'CE',
          documentNumber: '001234567',
          createdAt: '2026-06-24T00:00:00',
          registeredAt: '2026-06-24T00:00:00',
          city: 'Lima',
          address: 'A domicilio',
          totalSpent: 78178.00, // ORD-0009+0010+0011+0012
          orderHistory: [
            { orderNumber: 'ORD-20260624-0009', date: '24/06/2026', total: 15900.00, status: 'CONFIRMADO' },
            { orderNumber: 'ORD-20260624-0010', date: '24/06/2026', total: 44600.00, status: 'CONFIRMADO' },
            { orderNumber: 'ORD-20260624-0011', date: '24/06/2026', total: 15900.00, status: 'CONFIRMADO' },
            { orderNumber: 'ORD-20260624-0012', date: '24/06/2026', total: 1778.00, status: 'ENTREGADO' },
          ]
        },
        {
          id: '3',
          email: 'maria.quispe@outlook.com',
          firstName: 'María',
          lastName: 'Quispe Choque',
          phone: '912345678',
          documentType: 'DNI',
          documentNumber: '45612378',
          createdAt: '2026-06-24T00:00:00',
          registeredAt: '2026-06-24T00:00:00',
          city: 'Lima',
          address: 'A domicilio',
          totalSpent: 47901.70, // ORD-0005+0006+0007+0008
          orderHistory: [
            { orderNumber: 'ORD-20260624-0005', date: '24/06/2026', total: 38900.00, status: 'CONFIRMADO' },
            { orderNumber: 'ORD-20260624-0006', date: '24/06/2026', total: 1198.00, status: 'CONFIRMADO' },
            { orderNumber: 'ORD-20260624-0007', date: '24/06/2026', total: 2229.70, status: 'ENTREGADO' },
            { orderNumber: 'ORD-20260624-0008', date: '24/06/2026', total: 5574.00, status: 'PENDIENTE' },
          ]
        },
        {
          id: '2',
          email: 'juan.perez@gmail.com',
          firstName: 'Juan',
          lastName: 'Pérez Lucho',
          phone: '945123456',
          documentType: 'DNI',
          documentNumber: '74859612',
          createdAt: '2026-06-24T00:00:00',
          registeredAt: '2026-06-24T00:00:00',
          city: 'Lima',
          address: 'A domicilio',
          totalSpent: 45229.40, // ORD-0001+0002+0003+0004
          orderHistory: [
            { orderNumber: 'ORD-20260624-0001', date: '24/06/2026', total: 4505.70, status: 'CONFIRMADO' },
            { orderNumber: 'ORD-20260624-0002', date: '24/06/2026', total: 1740.00, status: 'ENTREGADO' },
            { orderNumber: 'ORD-20260624-0003', date: '24/06/2026', total: 9478.00, status: 'PENDIENTE' },
            { orderNumber: 'ORD-20260624-0004', date: '24/06/2026', total: 29000.00, status: 'CONFIRMADO' },
          ]
        },
        // Invitados (sin cuenta registrada, user_id = NULL en orders)
        {
          id: 'guest-1',
          email: 'guest.anonimo1@gmail.com',
          firstName: 'Invitado N°1',
          lastName: 'Anónimo',
          phone: '999888771',
          documentType: 'DNI',
          documentNumber: '45781291',
          createdAt: '2026-06-24T00:00:00',
          registeredAt: '2026-06-24T00:00:00',
          city: 'Lima',
          address: 'A domicilio',
          totalSpent: 25850.00,
          orderHistory: [
            { orderNumber: 'ORD-20260624-0017', date: '24/06/2026', total: 25850.00, status: 'ENTREGADO' },
          ]
        },
        {
          id: 'guest-2',
          email: 'guest.anonimo2@gmail.com',
          firstName: 'Invitado N°2',
          lastName: 'Anónimo',
          phone: '999888772',
          documentType: 'DNI',
          documentNumber: '45781292',
          createdAt: '2026-06-24T00:00:00',
          registeredAt: '2026-06-24T00:00:00',
          city: 'Lima',
          address: 'A domicilio',
          totalSpent: 7399.00,
          orderHistory: [
            { orderNumber: 'ORD-20260624-0018', date: '24/06/2026', total: 7399.00, status: 'PENDIENTE' },
          ]
        },
        {
          id: 'guest-3',
          email: 'juan@gmail.com',
          firstName: 'Juan',
          lastName: 'Perez',
          phone: '999888777',
          documentType: 'DNI',
          documentNumber: '12345678',
          createdAt: '2026-06-24T00:00:00',
          registeredAt: '2026-06-24T00:00:00',
          city: 'Lima',
          address: 'A domicilio',
          totalSpent: 1850.00,
          orderHistory: [
            { orderNumber: 'ORD-20260624-0021', date: '24/06/2026', total: 1850.00, status: 'CONFIRMADO' },
          ]
        },
      ],
      totalElements: 8,
      totalPages: 1,
      number: 0,
      size: 20
    };

    return of(mockResponse).pipe(delay(300));
  }

  getCustomerDetail(customerId: string): Observable<any> {
    return of(null);
  }

  createCustomer(body: any): Observable<any> {
    return of({ success: true });
  }

  updateCustomer(customerId: string, body: any): Observable<any> {
    return of({ success: true });
  }

  deleteCustomer(customerId: string): Observable<void> {
    return of(undefined);
  }
}
