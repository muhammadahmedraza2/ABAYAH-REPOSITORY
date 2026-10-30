import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Aabroo | Modern Abaya Collection',
    loadComponent: () =>
      import('./catalog-home').then((module) => module.CatalogHomeComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./product-page/product-page').then((module) => module.ProductPageComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found').then((module) => module.NotFoundComponent),
  },
];
