import { RenderMode, ServerRoute } from '@angular/ssr';
import { PRODUCTS } from './data/products';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'product/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PRODUCTS.map((product) => ({ id: String(product.id) })),
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  }
];
