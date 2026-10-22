import { Injectable, signal } from '@angular/core';

export type Lang = 'th' | 'en';

const STORAGE_KEY = 'app-lang';

/** Shared language state, so the choice carries across pages and reloads. */
@Injectable({ providedIn: 'root' })
export class LangService {
  readonly lang = signal<Lang>(this.read());

  set(lang: Lang): void {
    this.lang.set(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // storage unavailable (private mode etc.) - ignore
    }
  }

  private read(): Lang {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value === 'th' || value === 'en') return value;
    } catch {
      // ignore
    }
    return 'th';
  }
}
