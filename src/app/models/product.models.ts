// REEMPLAZA el archivo existente completo
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface BrandSummary {
  id: number;
  name: string;
  slug: string;
}

export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  url: string;
  altText: string;
  position: number;
}

export interface ProductCardResponse {
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  brandName: string;
  mainImageUrl: string | null;
}

export interface ProductDetailResponse {
  slug: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  status: string;
  partNumber: string;
  specifications: Record<string, unknown> | null;
  brand: BrandSummary;
  category: CategorySummary;
  images: ProductImage[];
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  subCategories: CategoryResponse[];
}

export interface BrandResponse {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  brandName: string;
  imageUrl: string | null;
  quantity: number;
}

export interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: 'DNI' | 'RUC' | 'CE';
  documentNumber: string;
  addressLine: string;
  department: string;
  province: string;
  district: string;
  paymentMethod: 'VISA' | 'MASTERCARD' | 'YAPE' | 'PLIN' | 'TRANSFER';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}
