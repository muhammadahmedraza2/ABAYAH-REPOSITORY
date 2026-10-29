export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  images: string[];
  inStock: boolean | null;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number | null;
  description: string;
  category: string;
  image: string;
  colors: ProductColor[];
  includedItems?: string[];
  lengthInches?: number;
  waistInches?: number;
  sizes?: string[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}
