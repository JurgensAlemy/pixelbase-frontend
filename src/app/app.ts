import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { Categories } from './components/categories/categories';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Hero, Categories, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'pixelbase-frontend';
}
