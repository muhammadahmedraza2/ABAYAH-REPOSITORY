import { DecimalPipe, NgOptimizedImage } from '@angular/common';
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
  signal,
} from '@angular/core';
import { Product, ProductColor } from '../models/product';

@Component({
  selector: 'app-product-detail',
  imports: [DecimalPipe, NgOptimizedImage],
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

  readonly selectedImageIndex = signal(0);

  ngAfterViewInit(): void {
    this.closeButton?.nativeElement.focus();
  }

  readonly selectedColor = computed(() =>
    this.product().colors.find((color) => color.name === this.selectedColorName()),
  );
  readonly selectedColorImageCount = computed(() => this.selectedColor()?.images.length ?? 0);

  readonly currentImage = computed(
    () => this.selectedColor()?.images[this.selectedImageIndex()] ?? this.product().image,
  );

  selectColor(color: ProductColor): void {
    this.selectedImageIndex.set(0);
    this.colorSelected.emit(color);
  }

  showPreviousImage(): void {
    const imageCount = this.selectedColor()?.images.length ?? 0;
    if (imageCount > 1) {
      this.selectedImageIndex.update((index) => (index - 1 + imageCount) % imageCount);
    }
  }

  showNextImage(): void {
    const imageCount = this.selectedColor()?.images.length ?? 0;
    if (imageCount > 1) {
      this.selectedImageIndex.update((index) => (index + 1) % imageCount);
    }
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
