import { DecimalPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { Product, ProductColor } from '../models/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  host: {
    '(keydown)': 'keepTabFocusInside($event)',
  },
})
export class ProductDetailComponent implements AfterViewInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;
  @Input({ required: true }) product!: Product;
  @Input() selectedColorName: string | undefined;
  @Input() selectedSize = '';
  @Input({ required: true }) whatsappHref!: string;
  @Output() colorSelected = new EventEmitter<ProductColor>();
  @Output() sizeSelected = new EventEmitter<string>();
  @Output() sizeGuideRequested = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  selectedImageIndex = 0;

  ngAfterViewInit(): void {
    this.closeButton?.nativeElement.focus();
  }

  get selectedColor(): ProductColor | undefined {
    return this.product.colors.find((color) => color.name === this.selectedColorName);
  }

  get currentImage(): string {
    return this.selectedColor?.images[this.selectedImageIndex] ?? this.product.image;
  }

  selectColor(color: ProductColor): void {
    this.selectedImageIndex = 0;
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
