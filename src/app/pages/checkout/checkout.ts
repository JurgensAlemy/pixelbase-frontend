import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, Header, Footer],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {}
