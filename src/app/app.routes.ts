import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Products } from './pages/dashboard/products/products';
import { Orders } from './pages/dashboard/orders/orders';
import { Customers } from './pages/dashboard/customers/customers';
import { Reports } from './pages/dashboard/reports/reports';
import { Settings } from './pages/dashboard/settings/settings';
import { Roles } from './pages/dashboard/roles/roles';
import { Catalogo } from './pages/catalogo/catalogo';
import { Producto } from './pages/producto/producto';
import { Carrito } from './pages/carrito/carrito';
import { Checkout } from './pages/checkout/checkout';
import { MiCuenta } from './pages/mi-cuenta/mi-cuenta';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Storefront público
  { path: '', component: Home },
  { path: 'catalogo', component: Catalogo },
  { path: 'producto/:slug', component: Producto },
  { path: 'carrito', component: Carrito },
  { path: 'checkout', component: Checkout },

  // Auth
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Cliente (protegido)
  { path: 'mi-cuenta', component: MiCuenta, canActivate: [authGuard] },

  // Admin (protegido)
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'productos', component: Products, canActivate: [authGuard] },
  { path: 'pedidos', component: Orders, canActivate: [authGuard] },
  { path: 'clientes', component: Customers, canActivate: [authGuard] },
  { path: 'reportes', component: Reports, canActivate: [authGuard] },
  { path: 'ajustes', component: Settings, canActivate: [authGuard] },
  { path: 'roles', component: Roles, canActivate: [authGuard] },

  { path: '**', redirectTo: '' }
];
