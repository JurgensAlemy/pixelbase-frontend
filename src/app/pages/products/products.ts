import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, Header, Footer],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products {}
