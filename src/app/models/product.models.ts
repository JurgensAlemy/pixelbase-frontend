export interface Category {
  id: number;
  name: string;
  parentCategory?: Category | null;
  subCategories?: Category[];
}

export interface ProductImage {
  id?: number;
  url: string;
  position: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  categories?: Category[];
  images?: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
