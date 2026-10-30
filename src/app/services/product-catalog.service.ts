import { Injectable, signal } from '@angular/core';
import { PRODUCTS } from '../data/products';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductCatalogService {
  private readonly catalog = signal<Product[]>(PRODUCTS);
  readonly products = this.catalog.asReadonly();

  getById(id: string): Product | undefined {
    const productId = Number(id);
    return Number.isInteger(productId)
      ? this.catalog().find((product) => product.id === productId)
      : undefined;
  }
}
