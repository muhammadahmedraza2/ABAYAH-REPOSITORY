import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, ProductColor } from '../models/product';
import { GarmentColorPreviewComponent } from '../garment-color-preview/garment-color-preview';

@Component({
  selector: 'app-product-card',
  imports: [DecimalPipe, NgOptimizedImage, RouterLink, GarmentColorPreviewComponent],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly selectedColorName = input<string | undefined>();
  readonly whatsappHref = input.required<string>();
  readonly colorSelected = output<ProductColor>();
  readonly detailsRequested = output<void>();

  get selectedColor(): ProductColor | undefined {
    return this.product().colors.find((color) => color.name === this.selectedColorName());
  }
}
