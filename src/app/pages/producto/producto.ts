import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ProductDetailResponse } from '../../models/product.models';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [Header, Footer, DecimalPipe, RouterLink],
  templateUrl: './producto.html',
  styleUrl: './producto.scss',
})
export class Producto implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cart = inject(CartService);

  product = signal<ProductDetailResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedImage = signal<string | null>(null);
  quantity = signal(1);
  toastMessage = signal<string | null>(null);
  addedToCart = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadProduct(params['slug']);
    });
  }

  loadProduct(slug: string): void {
    this.loading.set(true);
    this.productService.getBySlug(slug).subscribe({
      next: (p) => {
        this.product.set(p);
        if (p.images?.length) {
          this.selectedImage.set(p.images.find(i => i.position === 0)?.url ?? p.images[0].url);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Producto no encontrado.');
        this.loading.set(false);
      }
    });
  }

  selectImage(url: string): void {
    this.selectedImage.set(url);
  }

  decreaseQty(): void {
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }

  increaseQty(): void {
    const p = this.product();
    if (p && this.quantity() < p.stock) this.quantity.update(q => q + 1);
  }

  addToCart(): void {
    const p = this.product();
    if (!p || p.stock === 0) return;
    this.cart.addItem({
      slug: p.slug,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      stock: p.stock,
      brandName: p.brand.name,
      imageUrl: this.selectedImage(),
    }, this.quantity());
    this.addedToCart.set(true);
    this.showToast('Producto añadido al carrito');
    setTimeout(() => this.addedToCart.set(false), 2000);
  }

  hasDiscount(): boolean {
    const p = this.product();
    return !!p?.originalPrice && p.originalPrice > p.price;
  }

  discountPercent(): number {
    const p = this.product();
    if (!p?.originalPrice) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }

  specsEntries(): { key: string; value: string }[] {
    const p = this.product();
    if (!p?.specifications) return [];
    return Object.entries(p.specifications).map(([key, value]) => ({
      key,
      value: String(value)
    }));
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  showToast(msg: string): void {
    this.toastMessage.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), 2500);
  }
}
