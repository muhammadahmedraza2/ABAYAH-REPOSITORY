import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-size-guide',
  standalone: true,
  templateUrl: './size-guide.html',
  styleUrl: './size-guide.css',
})
export class SizeGuideComponent implements AfterViewInit {
  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;
  @Input({ required: true }) whatsappHref!: string;
  @Output() closed = new EventEmitter<void>();

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.closeButton?.nativeElement.focus();
  }

  @HostListener('keydown', ['$event'])
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
