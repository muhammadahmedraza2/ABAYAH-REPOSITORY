import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product, ProductColor } from '../models/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() selectedColorName: string | undefined;
  @Input({ required: true }) whatsappHref!: string;
  @Input() isFavorite = false;
  @Output() colorSelected = new EventEmitter<ProductColor>();
  @Output() detailsRequested = new EventEmitter<void>();
  @Output() favoriteToggled = new EventEmitter<void>();

  get selectedColor(): ProductColor | undefined {
    return this.product.colors.find((color) => color.name === this.selectedColorName);
  }
}
