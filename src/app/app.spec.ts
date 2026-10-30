import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CatalogHomeComponent } from './catalog-home';
import { routes } from './app.routes';
import { PRODUCTS } from './data/products';
import { ProductPageComponent } from './product-page/product-page';
import { ProductGalleryComponent } from './product-gallery/product-gallery';
import { ProductCatalogService } from './services/product-catalog.service';

describe('CatalogHomeComponent', () => {
  beforeEach(async () => {
    for (const product of PRODUCTS) {
      product.price = null;
      product.sizes = [];
      for (const color of product.colors) {
        color.images = [];
        color.inStock = null;
      }
    }

    await TestBed.configureTestingModule({
      imports: [CatalogHomeComponent, ProductPageComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('creates a browse-only catalog without cart or wishlist actions', async () => {
    const fixture = TestBed.createComponent(CatalogHomeComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Timeless Elegance');
    expect(compiled.querySelectorAll('#collection app-product-card')).toHaveLength(2);
    expect(compiled.querySelectorAll('.cart, .wishlist, .checkout, .favorite-button')).toHaveLength(0);
    expect(compiled.querySelectorAll('.color-card')).toHaveLength(9);
  });

  it('uses signal state for hero slides and exposes the two product-set types', async () => {
    const fixture = TestBed.createComponent(CatalogHomeComponent);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component.products().map((product) => product.collectionLabel)).toEqual([
      '4-Piece Set',
      '3-Piece Set',
    ]);
    component.showHeroSlide(1);
    expect(component.activeHeroSlide()).toBe(1);
    component.showHeroSlide(-1);
    expect(component.activeHeroSlide()).toBe(2);
  });

  it('keeps WhatsApp inquiries populated with product, price, selection, and canonical page link', () => {
    const component = TestBed.createComponent(CatalogHomeComponent).componentInstance;
    const product = component.products()[0];
    product.price = 2500;
    component.selectColor(product.id, product.colors.find((color) => color.id === 'navy')!);

    const href = component.buildWhatsAppLink(product, undefined, 'M');
    const message = decodeURIComponent(href.split('text=')[1]);

    expect(href).toContain('wa.me/923702996795');
    expect(message).toContain(`Product: ${product.name}`);
    expect(message).toContain('Color: Navy Blue');
    expect(message).toContain('Size: M');
    expect(message).toContain('Price: Rs. 2,500');
    expect(message).toContain(`Page: https://aabroo-modern-modest-wear.vercel.app/product/${product.id}`);
  });

  it('preserves both existing WhatsApp contact destinations', async () => {
    const fixture = TestBed.createComponent(CatalogHomeComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll<HTMLAnchorElement>('.contact-options a');
    expect(links).toHaveLength(2);
    expect(links[0].href).toContain('wa.me/923702996795');
    expect(links[1].href).toContain('wa.me/923222123145');
  });

  it('combines search, category, colour, and size filters with price sorting', () => {
    const component = TestBed.createComponent(CatalogHomeComponent).componentInstance;
    PRODUCTS[0].sizes = ['M', 'L'];
    PRODUCTS[0].price = 2500;
    PRODUCTS[1].sizes = ['S'];
    PRODUCTS[1].price = 3500;
    component.searchQuery.set('NAVY');
    component.selectedCategory.set('abaya');
    component.selectedColorFilter.set('navy');
    component.selectedSizeFilter.set('M');

    expect(component.filteredProducts().map((product) => product.id)).toEqual([1]);
    component.selectedSizeFilter.set('');
    component.searchQuery.set('');
    component.selectedColorFilter.set('');
    component.sortBy.set('priceDesc');
    expect(component.filteredProducts().map((product) => product.id)).toEqual([2, 1]);
  });

  it('includes a size filter and direct product detail links in the catalog', async () => {
    PRODUCTS[0].sizes = ['M', 'L'];
    const fixture = TestBed.createComponent(CatalogHomeComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('select option[value="M"]')?.textContent).toBe('M');
    expect(compiled.querySelector<HTMLAnchorElement>('.product-actions a.detail-button')?.getAttribute('href'))
      .toBe('/product/1');
  });

  it('provides the catalog through a service and configures lazy product and 404 routes', () => {
    const catalog = TestBed.inject(ProductCatalogService);
    expect(catalog.getById('1')?.name).toBe('Aabroo 4-Piece Abaya Set');
    expect(catalog.getById('invalid')).toBeUndefined();
    expect(routes.map((route) => route.path)).toEqual(['', 'product/:id', '**']);
    expect(routes[0].loadComponent).toBeDefined();
    expect(routes[1].loadComponent).toBeDefined();
    expect(routes[2].loadComponent).toBeDefined();
  });

  it('renders product metadata, structured data, and a prefilled WhatsApp detail-page link', async () => {
    const fixture = TestBed.createComponent(ProductPageComponent);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const orderLink = compiled.querySelector<HTMLAnchorElement>('.order-button');
    const message = decodeURIComponent(orderLink?.href.split('text=')[1] ?? '');
    const schema = document.querySelector<HTMLScriptElement>('#product-jsonld');

    expect(compiled.querySelector('h1')?.textContent).toContain('Aabroo 4-Piece Abaya Set');
    expect(message).toContain('Size: Please confirm');
    expect(message).toContain('Colour: Please confirm');
    expect(message).toContain('Page: https://aabroo-modern-modest-wear.vercel.app/product/1');
    expect(schema?.type).toBe('application/ld+json');
    expect(JSON.parse(schema?.textContent ?? '{}')['@type']).toBe('Product');
    expect(document.title).toContain('Aabroo 4-Piece Abaya Set');
  });

  it('updates the displayed colour and illustrative image when a colour has no real photo yet', async () => {
    const fixture = TestBed.createComponent(ProductPageComponent);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const peacock = [...compiled.querySelectorAll<HTMLButtonElement>('.colour-option')].find(
      (button) => button.textContent?.includes('Peacock'),
    );
    peacock?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.selected-colour')?.textContent).toContain('Peacock');
    expect(fixture.componentInstance.colorPreview()).toBe('#087e83');
    expect(compiled.querySelector<HTMLButtonElement>('.colour-option[aria-pressed="true"]')?.textContent)
      .toContain('Peacock');

    const gallery = TestBed.createComponent(ProductGalleryComponent);
    gallery.componentRef.setInput('images', ['/images/product-photo-placeholder.svg']);
    gallery.componentRef.setInput('alt', 'Abaya');
    gallery.componentRef.setInput('colorPreview', '#087e83');
    gallery.detectChanges();
    expect(gallery.nativeElement.querySelector('svg[role="img"] path[fill="#087e83"]')).not.toBeNull();
  });

  it('keeps existing color preview and accessible size-guide dialog behavior', async () => {
    const fixture = TestBed.createComponent(CatalogHomeComponent);
    const component = fixture.componentInstance;
    const product = component.products()[0];
    component.selectColor(product.id, product.colors.find((color) => color.id === 'navy')!);
    component.openDetails(product);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.detail-color-preview')?.getAttribute('aria-label')).toContain(
      'Navy Blue',
    );
    component.openSizeGuide();
    fixture.detectChanges();
    expect(compiled.querySelector('[aria-labelledby="size-guide-title"]')).not.toBeNull();
  });
});
