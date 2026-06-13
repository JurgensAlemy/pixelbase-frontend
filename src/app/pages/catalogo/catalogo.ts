import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { BrandService } from '../../services/brand.service';
import { CartService } from '../../services/cart.service';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ProductCardResponse, CategoryResponse, BrandResponse, PageResponse } from '../../models/product.models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [Header, Footer, DecimalPipe, RouterLink, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class Catalogo implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private cart = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  products = signal<ProductCardResponse[]>([]);
  categories = signal<CategoryResponse[]>([]);
  brands = signal<BrandResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Paginación
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = 12;

  // Filtros
  search = signal('');
  selectedCategoryId = signal<number | null>(null);
  selectedBrandId = signal<number | null>(null);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  sortOrder = signal('updatedAt,desc');

  // Toast
  toastMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.route.queryParams.subscribe(params => {
      this.search.set(params['search'] || '');
      this.selectedCategoryId.set(params['categoryId'] ? +params['categoryId'] : null);
      this.selectedBrandId.set(params['brandId'] ? +params['brandId'] : null);
      this.currentPage.set(0);
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productService.getProducts({
      search: this.search() || undefined,
      categoryId: this.selectedCategoryId() ?? undefined,
      brandId: this.selectedBrandId() ?? undefined,
      minPrice: this.minPrice() ?? undefined,
      maxPrice: this.maxPrice() ?? undefined,
      page: this.currentPage(),
      size: this.pageSize,
      sort: this.sortOrder(),
    }).subscribe({
      next: (res: PageResponse<ProductCardResponse>) => {
        this.products.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los productos. Intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getTree().subscribe({
      next: cats => this.categories.set(cats),
      error: () => { }
    });
  }

  loadBrands(): void {
    this.brandService.getAll().subscribe({
      next: brands => this.brands.set(brands),
      error: () => { }
    });
  }

  applyFilters(): void {
    this.currentPage.set(0);
    this.loadProducts();
  }

  clearFilters(): void {
    this.search.set('');
    this.selectedCategoryId.set(null);
    this.selectedBrandId.set(null);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.sortOrder.set('updatedAt,desc');
    this.currentPage.set(0);
    this.router.navigate(['/catalogo']);
  }

  selectCategory(id: number | null): void {
    this.selectedCategoryId.set(id);
    this.applyFilters();
  }

  selectBrand(id: number | null): void {
    this.selectedBrandId.set(id);
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  hasDiscount(product: ProductCardResponse): boolean {
    return product.originalPrice != null && product.originalPrice > product.price;
  }

  discountPercent(product: ProductCardResponse): number {
    if (!product.originalPrice) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }

  addToCart(product: ProductCardResponse, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (product.stock === 0) return;
    this.cart.addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      brandName: product.brandName,
      imageUrl: product.mainImageUrl,
    });
    this.showToast(`"${product.name}" añadido al carrito`);
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  showToast(msg: string): void {
    this.toastMessage.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), 2500);
  }
}
