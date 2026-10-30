import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { WHATSAPP_NUMBER, STORE_URL } from '../config/contact';
import { Product, ProductColor, ProductImageSlide } from '../models/product';
import { ProductCatalogService } from '../services/product-catalog.service';
import { SeoService } from '../services/seo.service';
import { ProductGalleryComponent } from '../product-gallery/product-gallery';

@Component({
  selector: 'app-product-page',
  imports: [DecimalPipe, NgOptimizedImage, ProductGalleryComponent, RouterLink],
  template: `
    @if (product(); as item) {
      <main class="product-page">
        <a routerLink="/" class="back-link">← Back to collection</a>
        <article>
          <div class="product-media">
            @defer (on idle) {
              <app-product-gallery
                [slides]="gallerySlides()"
                [alt]="item.name + ' product photo'"
                [colorPreview]="colorPreview()"
                [colorName]="selectedColor()?.name ?? ''"
              />
            } @placeholder {
              <img
                [ngSrc]="item.image"
                [alt]="item.image.includes('placeholder') ? item.name + ' photo placeholder' : item.name + ' olive-green abaya photo'"
                width="768"
                height="768"
                priority
              />
            }
          </div>
          <div class="product-info">
            <p class="category">{{ item.collectionLabel }}</p>
            <h1>{{ item.name }}</h1>
            <p class="price">
              @if (item.price !== null) {
                Rs. {{ item.price | number: '1.0-0' }}
              } @else {
                Price on request
              }
            </p>
            <p>{{ item.description }}</p>
            @if (item.includedItems?.length) {
              <section class="set-includes" aria-labelledby="included-heading">
                <h2 id="included-heading">This set includes</h2>
                <ul>
                  @for (includedItem of item.includedItems; track includedItem) {
                    <li>{{ includedItem }}</li>
                  }
                </ul>
              </section>
            }

            <section aria-labelledby="color-heading">
              <h2 id="color-heading">Colour</h2>
              <div class="options">
                @for (color of item.colors; track color.id) {
                  <button
                    type="button"
                    class="colour-option"
                    [attr.aria-pressed]="selectedColor()?.id === color.id"
                    (click)="selectColor(color)"
                  >
                    <span class="colour-swatch" [style.--colour]="color.hex" aria-hidden="true"></span>
                    {{ color.name }}
                  </button>
                }
              </div>
              @if (selectedColor(); as color) {
                <p class="selected-colour">Selected colour: <strong>{{ color.name }}</strong></p>
                @if (color.images.length === 0) {
                  <p class="photo-note">A real photo of this colour is not available yet. The preview is illustrative.</p>
                }
              }
            </section>
            @if (item.sizes?.length) {
              <label for="product-size">Size</label>
              <select id="product-size" [value]="selectedSize()" (change)="setSize($event)">
                <option value="">Ask about available sizes</option>
                @for (size of item.sizes; track size) {
                  <option [value]="size">{{ size }}</option>
                }
              </select>
            } @else {
              <p>Please contact us to confirm available sizes.</p>
            }

            <a class="order-button whatsapp-contact" [href]="whatsappLink(item)" target="_blank" rel="noopener noreferrer">
              <svg class="whatsapp-icon" aria-hidden="true" focusable="false">
                <use href="#whatsapp-symbol"></use>
              </svg>
              Contact us on WhatsApp
            </a>
            <section class="details">
              <h2>Fabric & care</h2>
              <p>{{ item.fabric ?? 'Please contact us on WhatsApp to confirm fabric details.' }}</p>
              @if (item.careInstructions.length > 0) {
                <ul>
                  @for (instruction of item.careInstructions; track instruction) {
                    <li>{{ instruction }}</li>
                  }
                </ul>
              } @else {
                <p>Please contact us on WhatsApp to confirm care instructions.</p>
              }
              <h2>Size guide</h2>
              <table>
                <caption>Currently listed measurements</caption>
                <tbody>
                  <tr><th scope="row">Abaya length</th><td>{{ item.lengthInches ?? 'Please confirm' }} inches</td></tr>
                  <tr><th scope="row">Waist</th><td>{{ item.waistInches ?? 'Please confirm' }} inches</td></tr>
                </tbody>
              </table>
            </section>
          </div>
        </article>
      </main>
    } @else {
      <main class="not-found">
        <h1>Product not found</h1>
        <p>This product is not available in the catalog.</p>
        <a routerLink="/">Return to the collection</a>
      </main>
    }
  `,
  styles: `
    .product-page, .not-found { max-width: 74rem; margin: auto; padding: 2rem 1rem 5rem; }
    .back-link { display: inline-block; margin-bottom: 1.5rem; color: #291f19; }
    article { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .9fr); gap: clamp(2rem, 5vw, 5rem); }
    .product-media { min-width: 0; }
    .product-info h1 { margin: .25rem 0 1rem; font: 500 clamp(2rem, 5vw, 3.2rem)/1.1 Georgia, serif; }
    .category { text-transform: uppercase; letter-spacing: .12em; color: #806b5a; }
    .price { font-size: 1.25rem; font-weight: 700; }
    .options { display: flex; flex-wrap: wrap; gap: .5rem; }
    .colour-option { display: inline-flex; align-items: center; gap: .5rem; min-height: 2.75rem; padding: .5rem .75rem; border: 1px solid #d5c7ba; border-radius: 2rem; background: #fffdfa; color: #291f19; cursor: pointer; }
    .colour-option[aria-pressed="true"] { border-color: #49372b; background: #eee6dc; box-shadow: 0 0 0 2px #c9b8a9; }
    .colour-swatch { width: 1rem; height: 1rem; border: 1px solid #8a7a6e; border-radius: 50%; background: var(--colour); }
    .selected-colour { color: #49372b; }
    .photo-note { color: #71645a; font-size: .88rem; }
    select { min-height: 2.75rem; padding: .5rem .75rem; }
    .order-button { display: inline-flex; min-height: 3rem; align-items: center; justify-content: center; gap: .55rem; margin: 1.5rem 0; padding: 0 1.25rem; border: 1px solid #d7cabc; border-radius: 2rem; background: #f1e9df; color: #291f19; font-weight: 600; text-decoration: none; }
    .details { border-top: 1px solid #ded5cc; padding-top: 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: .5rem; border-bottom: 1px solid #ded5cc; text-align: left; }
    .not-found { min-height: 60vh; }
    @media (max-width: 760px) { article { grid-template-columns: 1fr; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPageComponent {
  readonly id = input.required<string>();
  private readonly catalog = inject(ProductCatalogService);
  private readonly seo = inject(SeoService);
  private readonly item = computed(() => this.catalog.getById(this.id()));
  readonly product = this.item;
  readonly selectedColor = signal<ProductColor | undefined>(undefined);
  readonly selectedSize = signal('');
  readonly gallerySlides = computed<ProductImageSlide[]>(() => {
    const item = this.item();
    const color = this.selectedColor();
    if (!item) {
      return [];
    }

    if (!color) {
      return item.imageSlides;
    }

    if (color.images.length === 0) {
      return [];
    }

    return color.imageSlides?.length
      ? color.imageSlides
      : color.images.map((src, index) => ({ src, label: `${color.name} view ${index + 1}` }));
  });
  readonly colorPreview = computed(() => {
    const color = this.selectedColor();
    return color && color.images.length === 0 ? color.hex : undefined;
  });

  constructor() {
    effect(() => {
      const product = this.item();
      if (product) {
        this.seo.update({
          title: `${product.name} | Aabroo`,
          description: product.description,
          path: `/product/${product.id}`,
          image: product.image,
          structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.images.map((image) => new URL(image, STORE_URL).toString()),
            category: product.category,
            offers: product.price === null
              ? undefined
              : { '@type': 'Offer', priceCurrency: 'PKR', price: product.price },
          },
        });
      } else {
        this.seo.update({
          title: 'Product not found | Aabroo',
          description: 'This product could not be found in the Aabroo collection.',
          path: `/product/${this.id()}`,
        });
      }
    });
  }

  selectColor(color: ProductColor): void {
    this.selectedColor.set(color);
  }

  setSize(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedSize.set(event.target.value);
    }
  }

  whatsappLink(product: Product): string {
    const detailsPage = `${STORE_URL}/product/${product.id}`;
    const details = [
      `Hello! I am interested in ${product.name}.`,
      `Product: ${product.name}`,
      `Price: ${product.price === null ? 'Please confirm' : `Rs. ${product.price}`}`,
      `Size: ${this.selectedSize() || 'Please confirm'}`,
      `Colour: ${this.selectedColor()?.name ?? 'Please confirm'}`,
      `Page: ${detailsPage}`,
    ].join('\n');

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(details)}`;
  }
}
