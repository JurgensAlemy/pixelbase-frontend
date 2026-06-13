import { Injectable, inject, signal } from '@angular/core';
import { CategoryService } from './category.service';
import { CategoryResponse } from '../models/product.models';

@Injectable({ providedIn: 'root' })
export class CategoryLookupService {
  private categoryService = inject(CategoryService);

  private tree = signal<CategoryResponse[]>([]);
  private loaded = false;

  loadIfNeeded(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.categoryService.getTree().subscribe({
      next: (cats) => this.tree.set(cats),
      error: () => { this.loaded = false; }
    });
  }

  /**
   * Busca el ID de una categoría por coincidencia parcial (insensible a mayúsculas)
   * en todo el árbol (raíces + subcategorías).
   */
  findIdByName(partialName: string): number | null {
    const target = partialName.toLowerCase();
    const found = this.searchInTree(this.tree(), target);
    return found ? found.id : null;
  }

  private searchInTree(nodes: CategoryResponse[], target: string): CategoryResponse | null {
    for (const node of nodes) {
      if (node.name.toLowerCase().includes(target) || target.includes(node.name.toLowerCase())) {
        return node;
      }
      if (node.subCategories?.length) {
        const found = this.searchInTree(node.subCategories, target);
        if (found) return found;
      }
    }
    return null;
  }
}
