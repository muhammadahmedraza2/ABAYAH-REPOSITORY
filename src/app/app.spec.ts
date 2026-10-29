import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { PRODUCTS } from './data/products';
import { FavoritesService } from './services/favorites.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    for (const product of PRODUCTS) {
      product.price = null;
      product.sizes = undefined;
      for (const color of product.colors) {
        color.images = [];
        color.inStock = null;
      }
    }
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should offer only the nine requested color options on every design', () => {
    const expectedColors = [
      'Mehndi Green',
      'Black',
      'Navy Blue',
      'Mehroon (Maroon)',
      'Brown',
      'Half White',
      'Plum',
      'Light Pink',
      'Peacock',
    ];

    for (const product of PRODUCTS) {
      expect(product.colors.map((color) => color.name)).toEqual(expectedColors);
    }
  });

  it('should render the hero headline and both abaya set types', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Timeless Elegance');
    expect(compiled.querySelectorAll('#collection app-product-card').length).toBe(2);
    expect(compiled.querySelector('#collection app-product-card h3')?.textContent).toContain(
      '4-Piece Abaya Set',
    );
    expect(compiled.querySelector('#collection app-product-card .product-kicker')?.textContent).toBe(
      '4-Piece Set',
    );
    expect(compiled.querySelectorAll('.color-card')).toHaveLength(9);
    expect(compiled.querySelector('.color-card')?.textContent).toContain('54″ length · 23″ waist');
  });

  it('should provide working hero slides, a set carousel, and color cards', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.hero-dots button')).toHaveLength(3);
    expect(compiled.querySelectorAll('#collection-carousel .product-slide')).toHaveLength(2);
    expect(
      compiled.querySelector<HTMLButtonElement>('[aria-label="Scroll products right"]')?.disabled,
    ).toBe(false);

    app.showHeroSlide(1);
    expect(app.activeHeroSlide).toBe(1);

    app.showHeroSlide(-1);
    expect(app.activeHeroSlide).toBe(2);
  });

  it('should show the Aabroo brand and abaya logo in the header and footer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const brandLinks = compiled.querySelectorAll<HTMLAnchorElement>('.brand');

    expect(compiled.querySelector('header .brand')?.textContent).toContain('Aabroo');
    expect(compiled.querySelector('.footer-brand')?.textContent).toContain('Aabroo');
    expect(brandLinks).toHaveLength(2);
    for (const link of brandLinks) {
      expect(link.querySelector('img')?.getAttribute('src')).toBe('/images/aabroo-logo.svg');
    }
    expect(compiled.querySelector('.footer-brand + p')?.textContent).toBe('Grace in Every Layer.');
  });

  it('should include a color in the WhatsApp message only after one is selected', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const product = app.products[0];
    const defaultMessage = decodeURIComponent(app.buildWhatsAppLink(product).split('text=')[1]);

    expect(app.buildWhatsAppLink(product)).toContain('wa.me/923702996795');
    expect(defaultMessage).toContain('Hello! I am interested in an abaya');
    expect(defaultMessage).not.toContain('Color:');
    expect(defaultMessage).not.toContain('Price:');
    expect(defaultMessage).not.toContain('Assalam');
    expect(defaultMessage).not.toContain('Barah-e-karam');

    app.selectColor(product.id, product.colors.find((color) => color.name === 'Navy Blue')!);
    const selectedMessage = decodeURIComponent(app.buildWhatsAppLink(product).split('text=')[1]);
    expect(selectedMessage).toContain('Color: Navy Blue');
  });

  it('should show a selected color in the product inquiry link', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const product = app.products[0];
    const navyColor = product.colors.find((color) => color.name === 'Navy Blue')!;
    const originalImages = navyColor.images;
    navyColor.images = ['/assets/abaya-navy.webp'];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const firstCard = compiled.querySelector('#collection app-product-card');
    const navySwatch = firstCard?.querySelector<HTMLButtonElement>(
      '[aria-label^="Select Navy Blue"]',
    );

    navySwatch?.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    const contactLink = firstCard?.querySelector<HTMLAnchorElement>('.contact-button');
    const productImage = firstCard?.querySelector<HTMLImageElement>('.product-image-wrap img');
    expect(app.selectedColors[product.id]).toBe('Navy Blue');
    expect(contactLink?.href).toContain(encodeURIComponent('Color: Navy Blue'));
    expect(productImage?.getAttribute('src')).toBe('/assets/abaya-navy.webp');
    navyColor.images = originalImages;
  });

  it('should show a matching illustrative preview when the selected color has no photo', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const product = app.products[0];
    app.selectColor(product.id, product.colors.find((color) => color.name === 'Navy Blue')!);
    app.openDetails(product);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const colorPreview = compiled.querySelector<SVGElement>('.detail-color-preview');
    const previewNote = compiled.querySelector('.detail-copy .image-note');

    expect(colorPreview?.getAttribute('aria-label')).toContain('Navy Blue');
    expect(colorPreview?.style.getPropertyValue('--garment-color')).toBe('#172747');
    expect(previewNote?.textContent).toContain('illustrative color preview');
    expect(previewNote?.textContent).toContain('real photo');
  });

  it('should expose both configured WhatsApp contacts', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const contactLinks = compiled.querySelectorAll<HTMLAnchorElement>('.contact-options a');
    const contactOptions = compiled.querySelector<HTMLElement>('.contact-options');

    expect(contactLinks[0].href).toContain('wa.me/923702996795');
    expect(contactLinks[1].href).toContain('wa.me/923222123145');
    expect(contactOptions?.textContent).not.toMatch(/\d/);
    expect(contactLinks[0].querySelector('use')?.getAttribute('href')).toBe('#whatsapp-symbol');
    expect(contactLinks[1].querySelector('use')?.getAttribute('href')).toBe('#whatsapp-symbol');
    expect(contactOptions?.textContent).toContain('WhatsApp');
  });

  it('should combine case-insensitive search, category, and color filters', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.searchQuery = 'NAVY';
    app.selectedCategory = '4-Piece Set';
    app.selectedColorFilter = 'navy';

    expect(app.filteredProducts.map((product) => product.name)).toEqual([
      'Aabroo 4-Piece Abaya Set',
    ]);

    app.resetFilters();
    expect(app.filteredProducts).toHaveLength(2);

    PRODUCTS[0].colors.find((color) => color.name === 'Navy Blue')!.inStock = false;
    app.selectedColorFilter = 'navy';
    expect(app.filteredProducts.every((product) => product.id !== 1)).toBe(true);
  });

  it('should filter and sort products once real prices are configured', () => {
    const app = TestBed.createComponent(App).componentInstance;
    PRODUCTS[0].price = 2500;
    PRODUCTS[1].price = 3500;

    expect(app.hasKnownPrices).toBe(true);
    app.selectedPriceRange = '2000to3000';
    expect(app.filteredProducts.map((product) => product.id)).toEqual([1]);
    app.selectedPriceRange = '';
    app.sortBy = 'priceDesc';
    expect(app.filteredProducts.map((product) => product.id)).toEqual([2, 1]);
  });

  it('should persist favorite IDs without adding duplicates', () => {
    const favorites = TestBed.inject(FavoritesService);
    favorites.toggle(1);
    favorites.toggle(1);
    favorites.toggle(1);

    expect(favorites.ids()).toEqual([1]);
    expect(JSON.parse(localStorage.getItem('abaya-store-favorites') ?? '[]')).toEqual([1]);

    TestBed.resetTestingModule();
    const restoredFavorites = TestBed.inject(FavoritesService);
    expect(restoredFavorites.ids()).toEqual([1]);
    restoredFavorites.clear();
    expect(restoredFavorites.ids()).toEqual([]);
  });

  it('should select sizes, open the size guide, and close dialogs with Escape', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const product = app.products[0];
    const navyColor = product.colors.find((color) => color.name === 'Navy Blue')!;
    navyColor.images = ['/assets/navy-front.webp', '/assets/navy-back.webp'];
    product.sizes = ['M', 'L'];
    app.selectColor(product.id, navyColor);
    app.openDetails(product);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.set-details')?.textContent).toContain('Abaya');
    expect(compiled.querySelector('.set-details')?.textContent).toContain('Inner');
    expect(compiled.querySelector('.set-details')?.textContent).toContain('Hijab');
    expect(compiled.querySelector('.set-details')?.textContent).toContain('Dupatta');
    expect(compiled.querySelector('.abaya-length')?.textContent).toContain('54 inches');
    expect(compiled.querySelector('.abaya-waist')?.textContent).toContain('23 inches');
    const detailImage = compiled.querySelector<HTMLImageElement>('.detail-image');
    expect(detailImage?.getAttribute('src')).toBe('/assets/navy-front.webp');
    compiled.querySelector<HTMLButtonElement>('.gallery-next')?.click();
    fixture.detectChanges();
    expect(detailImage?.getAttribute('src')).toBe('/assets/navy-back.webp');
    compiled.querySelector<HTMLButtonElement>('.gallery-previous')?.click();
    fixture.detectChanges();
    expect(detailImage?.getAttribute('src')).toBe('/assets/navy-front.webp');
    compiled.querySelectorAll<HTMLButtonElement>('.thumbnail-button')[1]?.click();
    fixture.detectChanges();
    expect(detailImage?.getAttribute('src')).toBe('/assets/navy-back.webp');

    const sizeSelect = compiled.querySelector<HTMLSelectElement>('#abaya-size');
    expect(sizeSelect).not.toBeNull();
    if (sizeSelect) {
      sizeSelect.value = 'L';
      sizeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    fixture.detectChanges();
    expect(app.selectedSizes[product.id]).toBe('L');

    const whatsappLink = compiled.querySelector<HTMLAnchorElement>('.whatsapp-detail');
    expect(whatsappLink?.href).toContain(encodeURIComponent('Color: Navy Blue'));
    expect(whatsappLink?.href).toContain(encodeURIComponent('Size: L'));

    compiled.querySelector<HTMLButtonElement>('.size-guide-button')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[aria-labelledby="size-guide-title"]')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(compiled.querySelector('[aria-labelledby="size-guide-title"]')).toBeNull();
    expect(compiled.querySelector('[role="dialog"][aria-label*="details"]')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(compiled.querySelector('[role="dialog"][aria-label*="details"]')).toBeNull();
  });

  it('should expand and collapse FAQ answers accessibly', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const firstQuestion = compiled.querySelector<HTMLButtonElement>('.faq-item button');

    expect(firstQuestion?.getAttribute('aria-expanded')).toBe('false');
    firstQuestion?.click();
    fixture.detectChanges();
    expect(firstQuestion?.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelector('#faq-answer-0')?.hasAttribute('hidden')).toBe(false);
  });

  it('should toggle the mobile menu and apply category cards as filters', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton = compiled.querySelector<HTMLButtonElement>('.menu-toggle');

    menuButton?.click();
    fixture.detectChanges();
    expect(app.menuOpen).toBe(true);
    expect(compiled.querySelector('.menu-toggle')?.getAttribute('aria-expanded')).toBe('true');

    compiled.querySelector<HTMLButtonElement>('.category-card')?.click();
    fixture.detectChanges();
    expect(app.selectedCategory).toBe(app.categories[0]);
  });
});
