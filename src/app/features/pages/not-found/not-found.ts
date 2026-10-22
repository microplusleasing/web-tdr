import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BRANDING } from '@/shared/constants/branding';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardImports } from '@/shared/components/card/card.imports';
import { type Lang, LangService } from '@/shared/services/lang.service';

const TEXT = {
  th: {
    code: 'ข้อผิดพลาด 404',
    title: 'ไม่พบหน้าที่คุณต้องการ',
    description:
      'หน้านี้อาจถูกย้าย ถูกลบ หรือที่อยู่ลิงก์ไม่ถูกต้อง กรุณาตรวจสอบที่อยู่อีกครั้ง หรือกลับสู่หน้าหลัก',
    back: 'ย้อนกลับ',
    home: 'กลับสู่หน้าหลัก',
    help: 'หากยังพบปัญหา กรุณาติดต่อผู้ดูแลระบบ',
  },
  en: {
    code: 'Error 404',
    title: 'Page not found',
    description:
      "The page you are looking for doesn't exist, has been moved, or the link is incorrect. Please check the address or head back to the home page.",
    back: 'Go back',
    home: 'Back to home',
    help: 'Still having trouble? Please contact your administrator.',
  },
} as const;

@Component({
  imports: [RouterLink, ZardCardImports, ZardButtonComponent],
  selector: 'app-not-found',
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  protected readonly langService = inject(LangService);

  /** Where the "home" button goes */
  protected readonly homeLink = '/dashboard';
  protected readonly branding = BRANDING;
  protected readonly languages: { code: Lang; label: string }[] = [
    { code: 'th', label: 'ไทย' },
    { code: 'en', label: 'EN' },
  ];

  protected readonly t = computed(() => TEXT[this.langService.lang()]);

  protected goBack(): void {
    // No history (e.g. opened directly) -> fall back to home
    if (window.history.length > 1) {
      this.location.back();
    } else {
      void this.router.navigateByUrl(this.homeLink);
    }
  }
}
