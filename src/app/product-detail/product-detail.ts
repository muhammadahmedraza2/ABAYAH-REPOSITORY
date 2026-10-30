import { DecimalPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  ViewChild,
  inject,
  input,
  output,
} from '@angular/core';
import { Product, ProductColor, ProductImageSlide } from '../models/product';
import { ProductGalleryComponent } from '../product-gallery/product-gallery';

@Component({
  selector: 'app-product-detail',
  imports: [DecimalPipe, ProductGalleryComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  host: {
    '(keydown)': 'keepTabFocusInside($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements AfterViewInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;
  readonly product = input.required<Product>();
  readonly selectedColorName = input<string | undefined>();
  readonly selectedSize = input('');
  readonly whatsappHref = input.required<string>();
  readonly colorSelected = output<ProductColor>();
  readonly sizeSelected = output<string>();
  readonly sizeGuideRequested = output<void>();
  readonly closed = output<void>();

  ngAfterViewInit(): void {
    this.closeButton?.nativeElement.focus();
  }

  readonly selectedColor = computed(() =>
    this.product().colors.find((color) => color.name === this.selectedColorName()),
  );
  readonly gallerySlides = computed<ProductImageSlide[]>(() => {
    const product = this.product();
    const color = this.selectedColor();
    if (!color) {
      return product.imageSlides;
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
    return color?.images.length === 0 ? color.hex : undefined;
  });

  selectColor(color: ProductColor): void {
    this.colorSelected.emit(color);
  }

  onSizeChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.sizeSelected.emit(event.target.value);
    }
  }

  keepTabFocusInside(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const focusable = this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], select:not([disabled]), input:not([disabled])',
    );
    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}
