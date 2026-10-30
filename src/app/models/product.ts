export type ProductCategory = 'abaya' | 'burqa' | 'hijab' | 'niqab';

export interface ProductImageSlide {
  src: string;
  label: string;
  viewBox?: string;
  aspectRatio?: string;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  images: string[];
  imageSlides?: ProductImageSlide[];
  inStock: boolean | null;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number | null;
  description: string;
  category: ProductCategory;
  collectionLabel: string;
  fabric: string | null;
  careInstructions: string[];
  images: string[];
  imageSlides: ProductImageSlide[];
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
