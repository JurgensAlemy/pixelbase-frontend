import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss']
})
export class Categories implements OnInit {
  private categoryService = inject(CategoryService);

  // Signal para almacenar la lista de categorías
  categories = signal<any[]>([]);

  ngOnInit() {
    this.categoryService.getTree().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Error cargando categorías:', err)
    });
  }
}
