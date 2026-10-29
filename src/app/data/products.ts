import { Product, ProductColor } from '../models/product';

const sampleColors: ProductColor[] = [
  { id: 'mehndi-green', name: 'Mehndi Green', hex: '#68734b', images: [], inStock: null },
  { id: 'black', name: 'Black', hex: '#171717', images: [], inStock: null },
  { id: 'navy', name: 'Navy Blue', hex: '#172747', images: [], inStock: null },
  { id: 'mehroon', name: 'Mehroon (Maroon)', hex: '#702b3c', images: [], inStock: null },
  { id: 'brown', name: 'Brown', hex: '#634333', images: [], inStock: null },
  { id: 'half-white', name: 'Half White', hex: '#f3f0e8', images: [], inStock: null },
  { id: 'plum', name: 'Plum', hex: '#5b365f', images: [], inStock: null },
  { id: 'light-pink', name: 'Light Pink', hex: '#e8b6c4', images: [], inStock: null },
  { id: 'peacock', name: 'Peacock', hex: '#087e83', images: [], inStock: null },
];

const productPhotoPlaceholder = '/images/product-photo-placeholder.svg';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Aabroo 4-Piece Abaya Set',
    price: null,
    description: 'A coordinated modest-wear set with a 54-inch Abaya.',
    category: '4-Piece Set',
    image: productPhotoPlaceholder,
    colors: sampleColors.map((color) => ({ ...color })),
    includedItems: ['Abaya', 'Inner', 'Hijab', 'Dupatta'],
    lengthInches: 54,
    isFeatured: true,
  },
];
