import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-product-gallery',
  imports: [NgOptimizedImage],
  template: `
    <div class="gallery">
      @if (colorPreview()) {
        <button
          class="main-image color-preview"
          type="button"
          [attr.aria-label]="zoomed() ? 'Zoom out of colour preview' : 'Zoom in on colour preview'"
          (click)="zoomed.update((value) => !value)"
        >
          <svg
            viewBox="0 0 800 1000"
            role="img"
            [attr.aria-label]="alt() + ' in selected colour'"
            [class.zoomed]="zoomed()"
            focusable="false"
          >
            <rect width="800" height="1000" fill="#e9e1d7" />
            <path d="M0 710c175-74 306-30 436 20s245 47 364-17v287H0z" fill="#d9cabc" />
            <path
              d="M400 190c-58 0-98 46-100 108l-27 106-100 224 92 43 92-178 8 291h70l8-291 92 178 92-43-100-224-27-106c-2-62-42-108-100-108z"
              [attr.fill]="colorPreview()"
            />
            <path d="M400 190c-40 0-63 38-63 94l63 68 63-68c0-56-23-94-63-94z" fill="#f3ede6" />
            <path d="M400 352v431" stroke="#e9e1d7" stroke-width="6" />
            <text x="400" y="900" text-anchor="middle" fill="#51443a" font-family="Arial,sans-serif" font-size="24">
              Illustrative colour preview
            </text>
          </svg>
        </button>
      } @else {
        <button
          class="main-image"
          type="button"
          [attr.aria-label]="zoomed() ? 'Zoom out of product image' : 'Zoom in on product image'"
          (click)="zoomed.update((value) => !value)"
        >
          <img
            [ngSrc]="currentImage()"
            [alt]="alt()"
            width="900"
            height="1125"
            [class.zoomed]="zoomed()"
            priority
          />
        </button>
      }
      @if (images().length > 1) {
        <div class="thumbnails" aria-label="Product images">
          @for (image of images(); track image; let index = $index) {
            <button
              type="button"
              [attr.aria-label]="'Show product image ' + (index + 1)"
              [attr.aria-pressed]="index === selectedIndex()"
              (click)="selectedIndex.set(index)"
            >
              <img [ngSrc]="image" [alt]="alt() + ' view ' + (index + 1)" width="72" height="90" />
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .gallery { display: grid; gap: 1rem; }
    .main-image { display: block; overflow: hidden; padding: 0; border: 0; background: transparent; cursor: zoom-in; }
    .main-image img, .main-image svg { display: block; width: 100%; height: auto; transition: transform 180ms ease; }
    .main-image img.zoomed, .main-image svg.zoomed { transform: scale(1.7); cursor: zoom-out; }
    .color-preview { background: #e9e1d7; }
    .thumbnails { display: flex; gap: .75rem; overflow-x: auto; }
    .thumbnails button { flex: 0 0 4.5rem; padding: 0; border: 1px solid #d5c7ba; background: transparent; }
    .thumbnails img { display: block; width: 100%; height: auto; }
    @media (prefers-reduced-motion: reduce) { .main-image img { transition: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGalleryComponent {
  readonly images = input.required<string[]>();
  readonly alt = input.required<string>();
  readonly colorPreview = input<string | undefined>();
  readonly selectedIndex = signal(0);
  readonly zoomed = signal(false);
  readonly currentImage = computed(() => this.images()[this.selectedIndex()] ?? this.images()[0]);
}
