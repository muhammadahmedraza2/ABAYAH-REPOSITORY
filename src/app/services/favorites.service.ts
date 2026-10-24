import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const STORAGE_KEY = 'abaya-store-favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly favoriteIds = signal<number[]>([]);
  readonly ids = this.favoriteIds.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    if (isPlatformBrowser(platformId)) {
      try {
        const storedIds: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
        if (Array.isArray(storedIds)) {
          const validIds = storedIds.filter(
            (id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0,
          );
          if (validIds.length === storedIds.length) {
            this.favoriteIds.set([...new Set(validIds)]);
          }
        }
      } catch {
        this.favoriteIds.set([]);
      }
    }
  }

  has(productId: number): boolean {
    return this.favoriteIds().includes(productId);
  }

  toggle(productId: number): void {
    const favorites = this.favoriteIds();
    const next = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];
    this.favoriteIds.set(next);
    this.persist(next);
  }

  clear(): void {
    this.favoriteIds.set([]);
    this.persist([]);
  }

  private persist(ids: number[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Keep favorites available in memory when storage is disabled or full.
    }
  }
}
