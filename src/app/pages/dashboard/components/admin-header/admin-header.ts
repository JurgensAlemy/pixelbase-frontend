import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.scss',
})
export class AdminHeader {
  title = input<string>('Hola, Administrador 👋');
  subtitle = input<string>('Aquí tienes el resumen de tu tienda de hoy.');
  searchPlaceholder = input<string>('Buscar pedidos, clientes...');
}
