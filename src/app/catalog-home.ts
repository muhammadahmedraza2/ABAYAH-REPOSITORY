import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { STORE_CONFIG, STORE_URL, WHATSAPP_CONTACTS, WHATSAPP_NUMBER } from './config/contact';
import { Product, ProductColor } from './models/product';
import { ProductCatalogService } from './services/product-catalog.service';
import { SeoService } from './services/seo.service';
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
  selector: 'app-catalog-home',
  imports: [NgOptimizedImage, ProductCardComponent, ProductDetailComponent, SizeGuideComponent],
  templateUrl: './catalog-home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'handleEscape()',
  },
})
export class CatalogHomeComponent {
  private readonly seo = inject(SeoService);
  private readonly catalog = inject(ProductCatalogService);
  readonly config = STORE_CONFIG;
  readonly brandName = STORE_CONFIG.brandName;
  readonly products = this.catalog.products;
  readonly newArrivals = computed(() => this.products().filter((product) => product.isNewArrival));
  readonly whatsappContacts = WHATSAPP_CONTACTS;
  readonly faq = STORE_CONFIG.faq;
  readonly heroSlides = [
    {
      eyebrow: 'Modern modest wear',
      title: 'Timeless Elegance, Everyday Comfort',
      description: 'Discover graceful abaya designs made to bring quiet confidence to every moment.',
      note: 'Thoughtful silhouettes. Effortless style.',
    },
    {
      eyebrow: 'Made for your moments',
      title: 'A Complete Look, Made Simple',
      description: 'Choose a coordinated three-piece or four-piece set, thoughtfully put together for everyday wear.',
      note: '3-piece and 4-piece sets available',
    },
    {
      eyebrow: 'Find your signature',
      title: 'Grace in Every Layer',
      description: 'Choose your preferred shade and ask us about the latest availability on WhatsApp.',
      note: 'Personal assistance, just a message away.',
    },
  ];
  readonly categories = computed(() => [...new Set(this.products().map((product) => product.category))]);
  readonly sizeOptions = computed(() => [
    ...new Set(this.products().flatMap((product) => product.sizes ?? [])),
  ]);
  readonly colorOptions = computed(() => [
    ...new Map(
      this.products()
        .flatMap((product) => product.colors)
        .filter((color) => color.inStock !== false)
        .map((color) => [color.id, { id: color.id, name: color.name, hex: color.hex }]),
    ).values(),
  ]);
  readonly priceRanges: PriceRange[] = [
    { id: 'under2000', label: 'Under Rs. 2,000', min: 0, max: 2000, maxExclusive: true },
    { id: '2000to3000', label: 'Rs. 2,000–3,000', min: 2000, max: 3000 },
    { id: '3000to5000', label: 'Rs. 3,001–5,000', min: 3001, max: 5000 },
    { id: 'above5000', label: 'Above Rs. 5,000', min: 5001, max: null },
  ];
  readonly navItems = [
    { label: 'Home', href: '#home' },
    { label: 'Collection', href: '#collection' },
    { label: 'New Arrivals', href: '#collection' },
    { label: 'About Us', href: '#about-us' },
    { label: 'Contact', href: '#contact' },
  ];

  constructor() {
    this.seo.update({
      title: 'Aabroo | Modern Abaya Collection',
      description:
        'Discover elegant, modest abaya designs. Explore the collection and contact us on WhatsApp for colors, sizing and prices.',
      path: '/',
      image: '/images/aabroo-logo.svg',
    });
  }

  readonly menuOpen = signal(false);
  readonly activeHeroSlide = signal(0);
  readonly selectedProduct = signal<Product | null>(null);
  readonly selectedColors = signal<Record<number, string>>({});
  readonly selectedSizes = signal<Record<number, string>>({});
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('');
  readonly selectedColorFilter = signal('');
  readonly selectedSizeFilter = signal('');
  readonly selectedPriceRange = signal('');
  readonly sortBy = signal<SortOption>('featured');
  readonly openFaqIndex = signal<number | null>(null);
  readonly isSizeGuideOpen = signal(false);
  private detailsReturnFocus: HTMLElement | null = null;
  private sizeGuideReturnFocus: HTMLElement | null = null;

  readonly filteredProducts = computed<Product[]>(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase();
    const range = this.priceRanges.find((option) => option.id === this.selectedPriceRange());
    const filtered = this.products().filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLocaleLowerCase().includes(query) ||
        product.colors.some((color) => color.name.toLocaleLowerCase().includes(query));
      const matchesCategory = !this.selectedCategory() || product.category === this.selectedCategory();
      const matchesColor =
        !this.selectedColorFilter() ||
        product.colors.some(
          (color) => color.id === this.selectedColorFilter() && color.inStock !== false,
        );
      const matchesSize =
        !this.selectedSizeFilter() || product.sizes?.includes(this.selectedSizeFilter());
      const matchesPrice =
        !range ||
        (product.price !== null &&
          product.price >= range.min &&
          (range.max === null ||
            (range.maxExclusive ? product.price < range.max : product.price <= range.max)));

      return matchesQuery && matchesCategory && matchesColor && matchesSize && matchesPrice;
    });

    return [...filtered].sort((a, b) => this.compareProducts(a, b));
  });

  readonly hasKnownPrices = computed(() => this.products().some((product) => product.price !== null));

  selectedSize(productId: number): string {
    return this.selectedSizes()[productId] || '';
  }

  readonly activeFilterCount = computed(() => {
    return [
      this.searchQuery().trim(),
      this.selectedCategory(),
      this.selectedColorFilter(),
      this.selectedSizeFilter(),
      this.selectedPriceRange(),
    ].filter(Boolean).length;
  });

  readonly categoryCards = computed(() => this.categories().map((name) => ({
      name,
      image: this.products().find((product) => product.category === name)?.image ?? '',
    })));

  showHeroSlide(index: number): void {
    this.activeHeroSlide.set((index + this.heroSlides.length) % this.heroSlides.length);
  }

  scrollCollection(direction: -1 | 1): void {
    const carousel = document.getElementById('collection-carousel');
    carousel?.scrollBy({ left: direction * carousel.clientWidth * 0.8, behavior: 'smooth' });
  }

  selectColor(productId: number, color: ProductColor): void {
    this.selectedColors.update((selected) => ({ ...selected, [productId]: color.name }));
  }

  selectedColor(product: Product): ProductColor | undefined {
    const selectedName = this.selectedColors()[product.id];
    return product.colors.find((color) => color.name === selectedName);
  }

  openDetails(product: Product): void {
    this.detailsReturnFocus = this.activeElement();
    this.selectedProduct.set(product);
  }

  closeDetails(): void {
    this.selectedProduct.set(null);
    this.restoreFocus(this.detailsReturnFocus);
    this.detailsReturnFocus = null;
  }

  selectDetailColor(color: ProductColor): void {
    const selectedProduct = this.selectedProduct();
    if (selectedProduct) {
      this.selectColor(selectedProduct.id, color);
    }
  }

  onSearchInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchQuery.set(event.target.value);
    }
  }

  onCategoryChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedCategory.set(event.target.value);
    }
  }

  onColorFilterChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedColorFilter.set(event.target.value);
    }
  }

  onSizeFilterChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedSizeFilter.set(event.target.value);
    }
  }

  onPriceFilterChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedPriceRange.set(event.target.value);
    }
  }

  onSortChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement && this.isSortOption(event.target.value)) {
      this.sortBy.set(event.target.value);
    }
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
    const collection = document.getElementById('collection');
    if (collection && typeof collection.scrollIntoView === 'function') {
      collection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedColorFilter.set('');
    this.selectedSizeFilter.set('');
    this.selectedPriceRange.set('');
    this.sortBy.set('featured');
  }

  toggleFaq(index: number): void {
    this.openFaqIndex.set(this.openFaqIndex() === index ? null : index);
  }

  openSizeGuide(): void {
    this.sizeGuideReturnFocus = this.activeElement();
    this.isSizeGuideOpen.set(true);
  }

  closeSizeGuide(): void {
    this.isSizeGuideOpen.set(false);
    this.restoreFocus(this.sizeGuideReturnFocus);
    this.sizeGuideReturnFocus = null;
  }

  handleEscape(): void {
    if (this.isSizeGuideOpen()) {
      this.closeSizeGuide();
    } else if (this.selectedProduct()) {
      this.closeDetails();
    }
  }

  onSizeSelected(size: string): void {
    const selectedProduct = this.selectedProduct();
    if (selectedProduct) {
      this.selectedSizes.update((selected) => ({ ...selected, [selectedProduct.id]: size }));
    }
  }

  buildWhatsAppLink(
    product?: Product,
    contactNumber: string = WHATSAPP_NUMBER,
    selectedSize?: string,
  ): string {
    const selectedColor = product ? this.selectedColor(product) : undefined;
    const price = product
      ? `\nPrice: ${product.price === null ? 'Please confirm' : this.formatPrice(product.price)}`
      : '';
    const color = product ? `\nColor: ${selectedColor?.name ?? 'Please confirm'}` : '';
    const colorId = selectedColor ? `\nColor ID: ${selectedColor.id}` : '';
    const photo = product
      ? selectedColor?.images[0]
        ? `\nPhoto: ${new URL(selectedColor.images[0], STORE_URL).toString()}`
        : selectedColor
          ? `\nPhoto: No real photo is available for ${selectedColor.name} yet.`
          : `\nPhoto: ${new URL(product.image, STORE_URL).toString()}`
      : '';
    const size = product ? `\nSize: ${selectedSize || 'Please confirm'}` : '';
    const availability =
      selectedColor?.inStock === false
        ? 'Please confirm whether this color is available again.'
        : 'Please confirm availability and delivery details.';
    const inquiry = product
      ? `Hello! I am interested in an abaya from your website.\n\nProduct: ${product.name}\nProduct ID: ${product.id}${color}${colorId}${size}${price}${photo}\nPage: ${STORE_URL}/product/${product.id}\n\n${availability}`
      : 'Hello! I would like to know more about your abaya collection. Please share the details.';

    return `https://wa.me/${contactNumber}?text=${encodeURIComponent(inquiry)}`;
  }

  formatPrice(price: number): string {
    return `Rs. ${new Intl.NumberFormat('en-PK').format(price)}`;
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  private compareProducts(a: Product, b: Product): number {
    if (this.sortBy() === 'newest') {
      const byDate = (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
      return (
        byDate || Number(Boolean(b.isNewArrival)) - Number(Boolean(a.isNewArrival)) || b.id - a.id
      );
    }

    if (this.sortBy() === 'priceAsc' || this.sortBy() === 'priceDesc') {
      if (a.price === null && b.price === null) return a.id - b.id;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return this.sortBy() === 'priceAsc' ? a.price - b.price : b.price - a.price;
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
