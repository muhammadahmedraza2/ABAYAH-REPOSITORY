import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <main class="not-found">
      <p class="code">404</p>
      <h1>Page not found</h1>
      <p>Maaf, yeh page nahi mila. Aap collection par wapas ja sakte hain.</p>
      <a routerLink="/">Collection dekhein</a>
    </main>
  `,
  styles: `
    .not-found { max-width: 54rem; min-height: 70vh; margin: auto; padding: 5rem 1rem; }
    .code { color: #806b5a; font-size: 1rem; letter-spacing: .2em; }
    h1 { font: 500 clamp(2.5rem, 8vw, 5rem)/1.1 Georgia, serif; }
    a { color: #291f19; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  private readonly seo = inject(SeoService);

  constructor() {
    effect(() => {
      this.seo.update({
        title: 'Page not found | Aabroo',
        description: 'The page you requested could not be found. Explore the Aabroo collection.',
        path: '/404',
      });
    });
  }
}
