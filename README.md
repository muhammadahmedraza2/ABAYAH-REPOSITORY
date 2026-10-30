# Aabroo catalog

Angular 21 storefront catalog. It has no cart, wishlist, checkout, or backend; product enquiries are sent directly to the configured WhatsApp contacts.

## Local development

```powershell
npm ci
npm start
```

`npm test` runs Vitest. `npm run build` makes a production build and prerenders the home page and each product route.

## Product data and contact settings

- Catalog records live in `src/app/data/products.ts` and are exposed by `ProductCatalogService`.
- WhatsApp numbers and the public canonical origin live in `src/app/config/contact.ts`.
- The supplied real olive-green abaya collage is stored at `public/images/abaya-olive-set.png` and used for both set listings and the Mehndi Green colour. Add separate verified 3–4 optimized WebP/AVIF photos per colour when available; other colour previews remain illustrative. Fabric, price, size, and care data are still unconfirmed and should only be filled with verified details.
- Update `public/sitemap.xml` and `public/robots.txt` whenever the public domain changes.

## Deployment

The Angular application builder is configured for SSR with prerendering. Use a host that supports Angular's generated server entry when retaining SSR:

| Host | Build command | Deployment notes |
| --- | --- | --- |
| Vercel | `npm run build` | Select the Angular framework preset and keep the repository root as the project root. Let the Angular/Vercel integration deploy the generated SSR output; do not set `dist/Abayah/browser` as the only output if SSR is required. |
| Netlify | `npm run build` | Enable the Netlify Angular runtime/adapter for SSR and let it consume the Angular build output. A browser-only publish directory is static hosting and does not run the SSR server. |
| Cloudflare Pages | `npm run build` | Use the Angular Cloudflare adapter/Workers runtime for SSR. For static-only Pages, publish `dist/Abayah/browser` and configure SPA fallback rewrites; prerendered product pages remain static. |
| Firebase Hosting | `npm run build` | For SSR, configure Hosting's framework-aware integration or a rewrite to the generated Angular server entry. For static-only Hosting, publish `dist/Abayah/browser` and add a route fallback. |

After deployment, verify `/`, `/product/1`, `/product/2`, and an unknown URL. Replace the placeholder domain in `src/app/config/contact.ts`, `public/sitemap.xml`, and `public/robots.txt` before production.
