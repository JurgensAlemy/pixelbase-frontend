import { Component } from '@angular/core';

// 1. Tienes que importar las clases de tus componentes aquí arriba.
// Asegúrate de que las rutas y los nombres de las clases coincidan con cómo los tienes.
import { Header } from '../../components/header/header';
import { Hero } from '../../components/hero/hero';
import { Categories } from '../../components/categories/categories';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  // 2. ¡AQUÍ ESTÁ LA MAGIA! Metes los componentes en este arreglo de imports:
  imports: [Header, Hero, Categories, Footer],

  // 3. Aquí Angular ya sabe que tus archivos no llevan ".component"
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  // La lógica de tu Home va aquí
}
