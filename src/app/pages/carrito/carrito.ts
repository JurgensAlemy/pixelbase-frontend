import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [Header, Footer, RouterLink, DecimalPipe],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class Carrito {
  readonly cart = inject(CartService);

  updateQty(slug: string, event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    this.cart.updateQuantity(slug, val);
  }

  remove(slug: string): void {
    this.cart.removeItem(slug);
  }
}
