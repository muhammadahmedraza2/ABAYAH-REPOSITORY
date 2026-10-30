import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { STORE_URL } from '../config/contact';

export interface PageMetadata {
  title: string;
  description: string;
  path: string;
  image?: string;
  structuredData?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  update(page: PageMetadata): void {
    const url = new URL(page.path, STORE_URL).toString();
    const image = new URL(page.image ?? '/images/aabroo-logo.svg', STORE_URL).toString();

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: page.structuredData ? 'product' : 'website' });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });

    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;

    const existingSchema = this.document.head.querySelector<HTMLScriptElement>('#product-jsonld');
    if (page.structuredData) {
      const schema: HTMLScriptElement = existingSchema ?? this.document.createElement('script');
      schema.id = 'product-jsonld';
      schema.type = 'application/ld+json';
      schema.textContent = JSON.stringify(page.structuredData).replace(/</g, '\\u003c');
      this.document.head.appendChild(schema);
    } else {
      existingSchema?.remove();
    }
  }
}
