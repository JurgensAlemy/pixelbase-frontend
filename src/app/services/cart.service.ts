import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/product.models';

const CART_KEY = 'pixelbase_cart';

@Injectable({ providedIn: 'root' })
export class CartService {

  private _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0)
  );

  readonly shipping = computed(() =>
    this._items().length === 0 ? 0 : (this.subtotal() >= 299 ? 0 : 15)
  );

  readonly total = computed(() => this.subtotal() + this.shipping());

  addItem(item: Omit<CartItem, 'quantity'>, qty = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.slug === item.slug);
      if (existing) {
        return items.map(i =>
          i.slug === item.slug
            ? { ...i, quantity: Math.min(i.quantity + qty, i.stock) }
            : i
        );
      }
      return [...items, { ...item, quantity: Math.min(qty, item.stock) }];
    });
    this.saveToStorage();
  }

  removeItem(slug: string): void {
    this._items.update(items => items.filter(i => i.slug !== slug));
    this.saveToStorage();
  }

  updateQuantity(slug: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(slug);
      return;
    }
    this._items.update(items =>
      items.map(i => i.slug === slug
        ? { ...i, quantity: Math.min(quantity, i.stock) }
        : i
      )
    );
    this.saveToStorage();
  }

  clear(): void {
    this._items.set([]);
    localStorage.removeItem(CART_KEY);
  }

  private saveToStorage(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(this._items()));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
