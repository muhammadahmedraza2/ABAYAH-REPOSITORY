import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-size-guide',
  templateUrl: './size-guide.html',
  styleUrl: './size-guide.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'keepTabFocusInside($event)',
  },
})
export class SizeGuideComponent implements AfterViewInit {
  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;
  readonly whatsappHref = input.required<string>();
  readonly closed = output<void>();

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    this.closeButton?.nativeElement.focus();
  }

  keepTabFocusInside(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const focusable = this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href]',
    );
    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}
