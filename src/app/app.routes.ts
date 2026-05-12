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
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'productos', component: Products, canActivate: [authGuard] },
  { path: 'pedidos', component: Orders, canActivate: [authGuard] },
  { path: 'clientes', component: Customers, canActivate: [authGuard] },
  { path: 'reportes', component: Reports, canActivate: [authGuard] },
  { path: 'ajustes', component: Settings, canActivate: [authGuard] },
  { path: 'roles', component: Roles, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
