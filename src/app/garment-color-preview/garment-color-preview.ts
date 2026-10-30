import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-garment-color-preview',
  template: `
    <svg
      viewBox="0 0 800 1000"
      role="img"
      [attr.aria-label]="'Illustrative ' + colorName() + ' colour preview for ' + productName()"
      focusable="false"
    >
      <rect width="800" height="1000" fill="#e9e1d7" />
      <path d="M0 710c175-74 306-30 436 20s245 47 364-17v287H0z" fill="#d9cabc" />
      <path
        d="M400 190c-58 0-98 46-100 108l-27 106-100 224 92 43 92-178 8 291h70l8-291 92 178 92-43-100-224-27-106c-2-62-42-108-100-108z"
        [attr.fill]="color()"
      />
      <path d="M400 190c-40 0-63 38-63 94l63 68 63-68c0-56-23-94-63-94z" fill="#f3ede6" />
      <path d="M400 352v431" stroke="#e9e1d7" stroke-width="6" />
      <text
        x="400"
        y="870"
        text-anchor="middle"
        fill="#51443a"
        font-family="Arial,sans-serif"
        font-size="24"
      >
        Illustrative colour preview
      </text>
      <text
        x="400"
        y="910"
        text-anchor="middle"
        fill="#51443a"
        font-family="Arial,sans-serif"
        font-size="22"
      >
        Not a product photo
      </text>
    </svg>
  `,
  styles: `
    :host { display: block; width: 100%; }
    svg { display: block; width: 100%; height: auto; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GarmentColorPreviewComponent {
  readonly color = input.required<string>();
  readonly colorName = input.required<string>();
  readonly productName = input.required<string>();
}
