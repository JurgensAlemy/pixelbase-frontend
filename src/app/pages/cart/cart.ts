import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, Header, Footer],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {}
