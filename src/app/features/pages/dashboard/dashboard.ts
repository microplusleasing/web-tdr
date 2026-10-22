import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRANDING } from '@/shared/constants/branding';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardImports } from '@/shared/components/card/card.imports';
import { type Lang, LangService } from '@/shared/services/lang.service';

const TEXT = {
  th: {
    welcome: 'ยินดีต้อนรับ',
    subtitle: 'เลือกรายการที่ต้องการดำเนินการ',
    tdrTitle: 'การปรับโครงสร้างหนี้',
    tdrDescription: 'กรอกข้อมูลเพื่อประเมินและดำเนินการปรับโครงสร้างหนี้',
    tdrButton: 'กรอกข้อมูลปรับโครงสร้างหนี้',
  },
  en: {
    welcome: 'Welcome',
    subtitle: 'Choose what you would like to do',
    tdrTitle: 'Debt Restructuring',
    tdrDescription: 'Enter your information for debt restructuring assessment',
    tdrButton: 'Fill in debt restructuring information',
  },
} as const;

@Component({
  imports: [RouterLink, ZardCardImports, ZardButtonComponent],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  protected readonly langService = inject(LangService);

  protected readonly tdrLink = '/tdr-assessment';
  protected readonly branding = BRANDING;
  protected readonly languages: { code: Lang; label: string }[] = [
    { code: 'th', label: 'ไทย' },
    { code: 'en', label: 'EN' },
  ];

  protected readonly t = computed(() => TEXT[this.langService.lang()]);
}
