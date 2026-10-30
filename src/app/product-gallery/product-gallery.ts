import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { ProductImageSlide } from '../models/product';
import { GarmentColorPreviewComponent } from '../garment-color-preview/garment-color-preview';

@Component({
  selector: 'app-product-gallery',
  imports: [NgOptimizedImage, GarmentColorPreviewComponent],
  template: `
    <div class="gallery">
      @if (colorPreview(); as previewColor) {
        <button
          class="main-image color-preview"
          type="button"
          [attr.aria-label]="zoomed() ? 'Zoom out of colour preview' : 'Zoom in on colour preview'"
          (click)="zoomed.update((value) => !value)"
        >
          <app-garment-color-preview
            [color]="previewColor"
            [colorName]="colorName()"
            [productName]="alt()"
            [class.zoomed]="zoomed()"
          />
        </button>
      } @else {
        @let slide = currentSlide();
        <button
          class="main-image"
          type="button"
          [attr.aria-label]="(zoomed() ? 'Zoom out: ' : 'Zoom in: ') + slide.label"
          (click)="zoomed.update((value) => !value)"
        >
          @if (slide.viewBox) {
            <svg
              class="cropped-slide"
              [attr.viewBox]="slide.viewBox"
              [style.aspect-ratio]="slide.aspectRatio ?? '1 / 1'"
              role="img"
              [attr.aria-label]="alt() + ': ' + slide.label"
              [class.zoomed]="zoomed()"
            >
              <image [attr.href]="slide.src" x="0" y="0" width="768" height="768" />
            </svg>
          } @else {
            <img
              [ngSrc]="slide.src"
              [alt]="alt() + ': ' + slide.label"
              width="768"
              height="768"
              [class.zoomed]="zoomed()"
              priority
            />
          }
        </button>
      }
      @if (!colorPreview() && slides().length > 1) {
        <div class="gallery-nav" aria-label="Product gallery">
          <div class="gallery-controls">
            <button
              type="button"
              aria-label="Previous product image"
              (click)="showPrevious()"
            >←</button>
            <span aria-live="polite">{{ currentSlide().label }} · {{ selectedIndex() + 1 }}/{{ slides().length }}</span>
            <button type="button" aria-label="Next product image" (click)="showNext()">→</button>
          </div>
          <div class="thumbnails" aria-label="Choose a product view">
            @for (slide of slides(); track $index; let index = $index) {
              <button
                type="button"
                [attr.aria-label]="'Show ' + slide.label"
                [attr.aria-pressed]="index === selectedIndex()"
                [class.active]="index === selectedIndex()"
                (click)="selectedIndex.set(index)"
              >
                @if (slide.viewBox) {
                  <svg [attr.viewBox]="slide.viewBox" [style.aspect-ratio]="slide.aspectRatio ?? '1 / 1'" aria-hidden="true">
                    <image [attr.href]="slide.src" x="0" y="0" width="768" height="768" />
                  </svg>
                } @else {
                  <img [ngSrc]="slide.src" [alt]="slide.label" width="72" height="72" />
                }
                <span>{{ slide.label }}</span>
              </button>
            }
          </div>
        </div>
      }
      @if (colorPreview()) {
        <p class="preview-note">Illustration only; actual colour may vary. Product photo is available for Mehndi Green only.</p>
      }
    </div>
  `,
  styles: `
    .gallery { display: grid; gap: .75rem; min-width: 0; }
    .main-image { display: block; width: 100%; overflow: hidden; padding: 0; border: 0; background: #e9e1d7; cursor: zoom-in; }
    .main-image img, .main-image svg { display: block; width: 100%; height: auto; transition: transform 180ms ease; }
    .main-image img.zoomed, .main-image svg.zoomed, .main-image app-garment-color-preview.zoomed { transform: scale(1.7); cursor: zoom-out; }
    .main-image app-garment-color-preview { transition: transform 180ms ease; }
    .main-image .cropped-slide { overflow: hidden; }
    .color-preview { background: #e9e1d7; }
    app-garment-color-preview { aspect-ratio: 1 / 1; }
    .gallery-nav { min-width: 0; }
    .gallery-controls { display: flex; align-items: center; justify-content: space-between; gap: .5rem; color: #57483e; font-size: .82rem; }
    .gallery-controls button { min-width: 2.5rem; min-height: 2.5rem; border: 1px solid #d5c7ba; border-radius: 50%; background: #fffdfa; color: #291f19; cursor: pointer; }
    .thumbnails { display: flex; gap: .5rem; overflow-x: auto; padding: .25rem 0 .5rem; }
    .thumbnails button { display: grid; flex: 0 0 5.2rem; gap: .25rem; overflow: hidden; padding: .2rem; border: 1px solid #d5c7ba; border-radius: .4rem; background: #fffdfa; color: #291f19; font-size: .65rem; cursor: pointer; }
    .thumbnails button.active { border: 2px solid #49372b; }
    .thumbnails img, .thumbnails svg { display: block; width: 100%; height: 3.8rem; object-fit: cover; background: #e9e1d7; }
    .thumbnails span { line-height: 1.2; }
    .preview-note { margin: 0; color: #71645a; font-size: .78rem; }
    @media (prefers-reduced-motion: reduce) { .main-image img, .main-image svg, .main-image app-garment-color-preview { transition: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGalleryComponent {
  readonly slides = input.required<ProductImageSlide[]>();
  readonly alt = input.required<string>();
  readonly colorPreview = input<string | undefined>();
  readonly colorName = input('');
  readonly selectedIndex = signal(0);
  readonly zoomed = signal(false);
  readonly currentSlide = computed(() => this.slides()[this.selectedIndex()] ?? this.slides()[0]);

  constructor() {
    effect(() => {
      this.slides();
      this.colorPreview();
      this.selectedIndex.set(0);
      this.zoomed.set(false);
    });
  }

  showPrevious(): void {
    this.selectedIndex.update((index) => (index - 1 + this.slides().length) % this.slides().length);
    this.zoomed.set(false);
  }

  showNext(): void {
    this.selectedIndex.update((index) => (index + 1) % this.slides().length);
    this.zoomed.set(false);
  }
}
