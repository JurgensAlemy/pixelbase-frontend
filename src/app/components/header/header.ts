import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CategoryLookupService } from '../../services/category-lookup.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  readonly cart = inject(CartService);
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private categoryLookup = inject(CategoryLookupService);

  searchQuery = signal('');

  ngOnInit(): void {
    this.categoryLookup.loadIfNeeded();
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  submitSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/catalogo'], { queryParams: { search: q } });
    } else {
      this.router.navigate(['/catalogo']);
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.submitSearch();
  }

  /**
   * Navega al catálogo filtrando por categoría si se encuentra el ID,
   * o por búsqueda de texto como respaldo.
   */
  goToCategory(categoryName: string, fallbackSearch?: string): void {
    const categoryId = this.categoryLookup.findIdByName(categoryName);
    if (categoryId) {
      this.router.navigate(['/catalogo'], { queryParams: { categoryId } });
    } else {
      this.router.navigate(['/catalogo'], { queryParams: { search: fallbackSearch ?? categoryName } });
    }
  }
}
