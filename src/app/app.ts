import { Component, HostListener, inject } from '@angular/core';
import { STORE_CONFIG, WHATSAPP_CONTACTS, WHATSAPP_NUMBER } from './config/contact';
import { PRODUCTS } from './data/products';
import { Product, ProductColor } from './models/product';
import { FavoritesService } from './services/favorites.service';
import { ProductDetailComponent } from './product-detail/product-detail';
import { ProductCardComponent } from './product-card/product-card';
import { SizeGuideComponent } from './size-guide/size-guide';

type SortOption = 'featured' | 'priceAsc' | 'priceDesc' | 'newest';

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
  maxExclusive?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductCardComponent, ProductDetailComponent, SizeGuideComponent],
  templateUrl: './app.html',
})
export class App {
  readonly config = STORE_CONFIG;
  readonly brandName = STORE_CONFIG.brandName;
  readonly products = PRODUCTS;
  readonly newArrivals = PRODUCTS.filter((product) => product.isNewArrival);
  readonly whatsappContacts = WHATSAPP_CONTACTS;
  readonly faq = STORE_CONFIG.faq;
  readonly categories = [...new Set(PRODUCTS.map((product) => product.category))];
  readonly colorOptions = [
    ...new Map(
      PRODUCTS.flatMap((product) => product.colors)
        .filter((color) => color.inStock !== false)
        .map((color) => [color.id, { id: color.id, name: color.name }]),
    ).values(),
  ];
  readonly priceRanges: PriceRange[] = [
    { id: 'under2000', label: 'Under Rs. 2,000', min: 0, max: 2000, maxExclusive: true },
    { id: '2000to3000', label: 'Rs. 2,000–3,000', min: 2000, max: 3000 },
    { id: '3000to5000', label: 'Rs. 3,001–5,000', min: 3001, max: 5000 },
    { id: 'above5000', label: 'Above Rs. 5,000', min: 5001, max: null },
  ];
  readonly favorites = inject(FavoritesService);
  readonly navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Collection', href: '#collection' },
    { label: 'New Arrivals', href: '#new-arrivals' },
    { label: 'About Us', href: '#about-us' },
    { label: 'Contact', href: '#contact' },
  ];

  menuOpen = false;
  selectedProduct: Product | null = null;
  selectedColors: Record<number, string> = {};
  selectedSizes: Record<number, string> = {};
  searchQuery = '';
  selectedCategory = '';
  selectedColorFilter = '';
  selectedPriceRange = '';
  sortBy: SortOption = 'featured';
  favoritesOnly = false;
  openFaqIndex: number | null = null;
  isSizeGuideOpen = false;
  private detailsReturnFocus: HTMLElement | null = null;
  private sizeGuideReturnFocus: HTMLElement | null = null;

  get filteredProducts(): Product[] {
    const query = this.searchQuery.trim().toLocaleLowerCase();
    const range = this.priceRanges.find((option) => option.id === this.selectedPriceRange);
    const filtered = this.products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLocaleLowerCase().includes(query) ||
        product.colors.some((color) => color.name.toLocaleLowerCase().includes(query));
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesColor =
        !this.selectedColorFilter ||
        product.colors.some(
          (color) => color.id === this.selectedColorFilter && color.inStock !== false,
        );
      const matchesPrice =
        !range ||
        (product.price !== null &&
          product.price >= range.min &&
          (range.max === null ||
            (range.maxExclusive ? product.price < range.max : product.price <= range.max)));
      const matchesFavorites = !this.favoritesOnly || this.favorites.has(product.id);

      return matchesQuery && matchesCategory && matchesColor && matchesPrice && matchesFavorites;
    });

    return filtered.sort((a, b) => this.compareProducts(a, b));
  }

  get hasKnownPrices(): boolean {
    return this.products.some((product) => product.price !== null);
  }

  selectedSize(productId: number): string {
    return this.selectedSizes[productId] || '';
  }

  get activeFilterCount(): number {
    return [
      this.searchQuery.trim(),
      this.selectedCategory,
      this.selectedColorFilter,
      this.selectedPriceRange,
      this.favoritesOnly,
    ].filter(Boolean).length;
  }

  get categoryCards(): Array<{ name: string; image: string }> {
    return this.categories.map((name) => ({
      name,
      image: this.products.find((product) => product.category === name)?.image ?? '',
    }));
  }

  selectColor(productId: number, color: ProductColor): void {
    this.selectedColors = { ...this.selectedColors, [productId]: color.name };
  }

  selectedColor(product: Product): ProductColor | undefined {
    const selectedName = this.selectedColors[product.id];
    return product.colors.find((color) => color.name === selectedName);
  }

  openDetails(product: Product): void {
    this.detailsReturnFocus = this.activeElement();
    this.selectedProduct = product;
  }

  closeDetails(): void {
    this.selectedProduct = null;
    this.restoreFocus(this.detailsReturnFocus);
    this.detailsReturnFocus = null;
  }

  selectDetailColor(color: ProductColor): void {
    if (this.selectedProduct) {
      this.selectColor(this.selectedProduct.id, color);
    }
  }

  onSearchInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchQuery = event.target.value;
    }
  }

  onCategoryChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedCategory = event.target.value;
    }
  }

  onColorFilterChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedColorFilter = event.target.value;
    }
  }

  onPriceFilterChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedPriceRange = event.target.value;
    }
  }

  onSortChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement && this.isSortOption(event.target.value)) {
      this.sortBy = event.target.value;
    }
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    const collection = document.getElementById('collection');
    if (collection && typeof collection.scrollIntoView === 'function') {
      collection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedColorFilter = '';
    this.selectedPriceRange = '';
    this.sortBy = 'featured';
    this.favoritesOnly = false;
  }

  toggleFavorite(productId: number): void {
    this.favorites.toggle(productId);
  }

  isFavorite(productId: number): boolean {
    return this.favorites.has(productId);
  }

  clearFavorites(): void {
    this.favorites.clear();
    this.favoritesOnly = false;
  }

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  openSizeGuide(): void {
    this.sizeGuideReturnFocus = this.activeElement();
    this.isSizeGuideOpen = true;
  }

  closeSizeGuide(): void {
    this.isSizeGuideOpen = false;
    this.restoreFocus(this.sizeGuideReturnFocus);
    this.sizeGuideReturnFocus = null;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isSizeGuideOpen) {
      this.closeSizeGuide();
    } else if (this.selectedProduct) {
      this.closeDetails();
    }
  }

  onSizeSelected(size: string): void {
    if (this.selectedProduct) {
      this.selectedSizes = { ...this.selectedSizes, [this.selectedProduct.id]: size };
    }
  }

  buildWhatsAppLink(
    product?: Product,
    contactNumber: string = WHATSAPP_NUMBER,
    selectedSize?: string,
  ): string {
    const selectedColor = product ? this.selectedColor(product) : undefined;
    const price =
      product && product.price !== null ? `\nPrice: ${this.formatPrice(product.price)}` : '';
    const color = selectedColor ? `\nColor: ${selectedColor.name}` : '';
    const size = selectedSize ? `\nSize: ${selectedSize}` : '';
    const availability =
      selectedColor?.inStock === false
        ? 'Please confirm whether this color is available again.'
        : 'Please confirm availability and delivery details.';
    const inquiry = product
      ? `Hello! I am interested in an abaya from your website.\n\nProduct: ${product.name}\nProduct ID: ${product.id}${color}${size}${price}\n\n${availability}`
      : 'Hello! I would like to know more about your abaya collection. Please share the details.';

    return `https://wa.me/${contactNumber}?text=${encodeURIComponent(inquiry)}`;
  }

  formatPrice(price: number): string {
    return `Rs. ${new Intl.NumberFormat('en-PK').format(price)}`;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  private compareProducts(a: Product, b: Product): number {
    if (this.sortBy === 'newest') {
      const byDate = (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
      return (
        byDate || Number(Boolean(b.isNewArrival)) - Number(Boolean(a.isNewArrival)) || b.id - a.id
      );
    }

    if (this.sortBy === 'priceAsc' || this.sortBy === 'priceDesc') {
      if (a.price === null && b.price === null) return a.id - b.id;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return this.sortBy === 'priceAsc' ? a.price - b.price : b.price - a.price;
    }

    return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) || a.id - b.id;
  }

  private isSortOption(value: string): value is SortOption {
    return ['featured', 'priceAsc', 'priceDesc', 'newest'].includes(value);
  }

  private activeElement(): HTMLElement | null {
    return typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  }

  private restoreFocus(element: HTMLElement | null): void {
    if (element?.isConnected) {
      element.focus();
    }
  }
}
