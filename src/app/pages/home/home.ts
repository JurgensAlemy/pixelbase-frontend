import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { Hero } from '../../components/hero/hero';
import { Categories } from '../../components/categories/categories';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, Header, Footer, Hero, Categories],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home { }
