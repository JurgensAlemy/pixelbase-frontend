import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../components/admin-header/admin-header';

type StockLevel = 'in' | 'low' | 'out';
type ModalMode = 'closed' | 'create' | 'edit' | 'delete-confirm';

interface AdminProduct {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

const DEFAULT_IMAGE = '/img/generated-1776449462383.png';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [AdminSidebar, AdminHeader, DecimalPipe, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  private fb = inject(FormBuilder);

  readonly products = signal<AdminProduct[]>([
    { id: 1,  name: 'GeForce RTX 4090 24GB',      brand: 'NVIDIA',   category: 'GPUs',           price: 1799, stock: 12, image: '/img/generated-1776449462383.png' },
    { id: 2,  name: 'Ryzen 9 7950X 16 cores',     brand: 'AMD',      category: 'CPUs',           price: 2199, stock: 3,  image: '/img/generated-1776449484740.png' },
    { id: 3,  name: 'Vengeance DDR5 64GB RGB',    brand: 'CORSAIR',  category: 'RAM',            price: 1249, stock: 21, image: '/img/generated-1776449488887.png' },
    { id: 4,  name: 'SSD 990 Pro 2TB NVMe',       brand: 'SAMSUNG',  category: 'Almacenamiento', price: 749,  stock: 18, image: '/img/generated-1776449494133.png' },
    { id: 5,  name: 'G Pro X Superlight Mouse',   brand: 'LOGITECH', category: 'Periféricos',    price: 389,  stock: 0,  image: '/img/generated-1776451650381.png' },
    { id: 6,  name: 'ROG Swift 27" 240Hz Monitor',brand: 'ASUS',     category: 'Monitores',      price: 2369, stock: 7,  image: '/img/generated-1776453894572.png' },
    { id: 7,  name: 'Kraken X63 RGB Cooler',      brand: 'NZXT',     category: 'Refrigeración',  price: 600,  stock: 5,  image: '/img/generated-1776450176480.png' },
    { id: 8,  name: 'Ryzen 7 7800X3D',            brand: 'AMD',      category: 'CPUs',           price: 1530, stock: 14, image: '/img/generated-1776450244346.png' },
    { id: 9,  name: 'K70 RGB PRO Mechanical',     brand: 'CORSAIR',  category: 'Periféricos',    price: 760,  stock: 11, image: '/img/generated-1776454451190.png' },
    { id: 10, name: 'ROG Strix G15',              brand: 'ASUS',     category: 'Laptops',        price: 5850, stock: 0,  image: '/img/generated-1776449606200.png' },
  ]);

  readonly searchQuery = signal('');
  readonly selectedCategory = signal('Todas');

  readonly categories = computed<string[]>(() => {
    const cats = new Set(this.products().map((p) => p.category));
    return ['Todas', ...Array.from(cats).sort()];
  });

  readonly filteredProducts = computed<AdminProduct[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();
    return this.products().filter((p) => {
      const matchesCat = cat === 'Todas' || p.category === cat;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  });

  readonly stats = computed(() => {
    const all = this.products();
    return {
      total: all.length,
      inStock: all.filter((p) => p.stock > 10).length,
      lowStock: all.filter((p) => p.stock > 0 && p.stock <= 10).length,
      outOfStock: all.filter((p) => p.stock === 0).length,
    };
  });

  /* ----------- Estado del modal ----------- */
  readonly modalMode = signal<ModalMode>('closed');
  readonly selectedProduct = signal<AdminProduct | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    brand: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    image: [DEFAULT_IMAGE, Validators.required],
  });

  stockLevel(stock: number): StockLevel {
    if (stock === 0) return 'out';
    if (stock <= 10) return 'low';
    return 'in';
  }

  stockLabel(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock <= 10) return 'Bajo stock';
    return 'En stock';
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onCategoryChange(event: Event): void {
    this.selectedCategory.set((event.target as HTMLSelectElement).value);
  }

  /* ----------- Acciones de modal ----------- */
  openCreate(): void {
    this.selectedProduct.set(null);
    this.form.reset({
      name: '',
      brand: '',
      category: '',
      price: 0,
      stock: 0,
      image: DEFAULT_IMAGE,
    });
    this.modalMode.set('create');
  }

  openEdit(product: AdminProduct): void {
    this.selectedProduct.set(product);
    this.form.reset({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
    });
    this.modalMode.set('edit');
  }

  requestDelete(product: AdminProduct): void {
    this.selectedProduct.set(product);
    this.modalMode.set('delete-confirm');
  }

  closeModal(): void {
    this.modalMode.set('closed');
    this.selectedProduct.set(null);
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const current = this.selectedProduct();

    if (current) {
      this.products.update((list) =>
        list.map((p) => (p.id === current.id ? { ...current, ...value } : p)),
      );
    } else {
      const nextId = Math.max(0, ...this.products().map((p) => p.id)) + 1;
      this.products.update((list) => [{ id: nextId, ...value }, ...list]);
    }

    this.closeModal();
  }

  confirmDelete(): void {
    const product = this.selectedProduct();
    if (!product) return;
    this.products.update((list) => list.filter((p) => p.id !== product.id));
    this.closeModal();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalMode() !== 'closed') this.closeModal();
  }
}
