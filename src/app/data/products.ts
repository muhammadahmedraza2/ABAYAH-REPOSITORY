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

const oliveAbayaPhoto = '/images/abaya-olive-set.png';
const oliveAbayaImageSlides = [
  { src: oliveAbayaPhoto, label: 'Full set overview' },
  { src: oliveAbayaPhoto, label: 'Abaya full view', viewBox: '94 0 355 768', aspectRatio: '355 / 768' },
  { src: oliveAbayaPhoto, label: 'Abaya shape detail', viewBox: '453 0 219 313', aspectRatio: '219 / 313' },
  { src: oliveAbayaPhoto, label: 'Neckline detail', viewBox: '453 316 219 203', aspectRatio: '219 / 203' },
  { src: oliveAbayaPhoto, label: 'Sleeve and fabric detail', viewBox: '453 522 219 246', aspectRatio: '219 / 246' },
];
const createProductColors = (): ProductColor[] =>
  sampleColors.map((color) => ({
    ...color,
    images: color.id === 'mehndi-green' ? [oliveAbayaPhoto] : [...color.images],
    imageSlides: color.id === 'mehndi-green' ? [...oliveAbayaImageSlides] : [],
  }));

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Aabroo 4-Piece Abaya Set',
    price: null,
    description: 'A coordinated modest-wear set with a 54-inch Abaya and 23-inch waist.',
    category: 'abaya',
    collectionLabel: '4-Piece Set',
    fabric: null,
    careInstructions: [],
    images: [oliveAbayaPhoto],
    imageSlides: oliveAbayaImageSlides,
    image: oliveAbayaPhoto,
    colors: createProductColors(),
    sizes: [],
    includedItems: ['Abaya', 'Dupatta', 'Hijab', 'Inner'],
    lengthInches: 54,
    waistInches: 23,
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Aabroo 3-Piece Abaya Set',
    price: null,
    description: 'A coordinated modest-wear set with a 54-inch Abaya and 23-inch waist.',
    category: 'abaya',
    collectionLabel: '3-Piece Set',
    fabric: null,
    careInstructions: [],
    images: [oliveAbayaPhoto],
    imageSlides: oliveAbayaImageSlides,
    image: oliveAbayaPhoto,
    colors: createProductColors(),
    sizes: [],
    includedItems: ['Abaya', 'Dupatta', 'Hijab'],
    lengthInches: 54,
    waistInches: 23,
    isFeatured: true,
  },
];
