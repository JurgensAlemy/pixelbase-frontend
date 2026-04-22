import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Home},      // Tienda principal
  { path: 'login', component: Login},  // Login
  { path: 'dashboard', component: Dashboard },  // Dashboard (ya funciona este link)
  { path: '**', redirectTo: '' }                // Error 404 -> a la tienda
];
