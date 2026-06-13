
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../components/header/header';
import { Hero } from '../../components/hero/hero';
import { Categories } from '../../components/categories/categories';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Header, Hero, Categories, Footer, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home { }
