import { Component, HostListener, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminSidebar } from '../components/admin-sidebar/admin-sidebar';
import { AdminHeader } from '../components/admin-header/admin-header';
import { AdminProductService } from '../../../services/admin-product.service';

type StockLevel = 'in' | 'low' | 'out';
type ModalMode = 'closed' | 'create' | 'edit' | 'detail' | 'delete-confirm';

interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  category?: string;
  price: number;
  stock: number;
  image?: string;
  sku?: string;
}

const DEFAULT_IMAGE = '/img/generated-1776449462383.png';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [AdminSidebar, AdminHeader, DecimalPipe, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private productService = inject(AdminProductService);
  private fb = inject(FormBuilder);

  readonly products = signal<AdminProduct[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('Todas');
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  readonly categories = computed<string[]>(() => {
    const cats = new Set(
      this.products()
        .map((p) => p.category || '')
        .filter(Boolean)
    );
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
        (p.brand?.toLowerCase().includes(q) ?? false) ||
        (p.category?.toLowerCase().includes(q) ?? false);
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

  /* ---------- Modal ---------- */
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

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllProducts(this.currentPage(), this.pageSize()).subscribe({
      next: (res) => {
        const data = res.content ?? res ?? [];
        this.products.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.loading.set(false);
      }
    });
  }

  /* ---------- Helpers ---------- */
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

  /* ---------- Event handlers ---------- */
  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onCategoryChange(event: Event): void {
    this.selectedCategory.set((event.target as HTMLSelectElement).value);
  }

  /* ---------- Modal Actions ---------- */
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
      category: product.category || '',
      price: product.price,
      stock: product.stock,
      image: product.image || DEFAULT_IMAGE,
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
      // Editar
      this.productService.updateProduct(current.id, value).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => console.error('Error actualizando producto:', err)
      });
    } else {
      // Crear
      this.productService.createProduct(value).subscribe({
        next: () => {
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => console.error('Error creando producto:', err)
      });
    }
  }

  confirmDelete(): void {
    const product = this.selectedProduct();
    if (!product) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.loadProducts();
        this.closeModal();
      },
      error: (err) => console.error('Error eliminando producto:', err)
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalMode() !== 'closed') this.closeModal();
  }
}
