import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Z_MODAL_DATA } from '@/shared/components/dialog';

export interface IPhotoPreviewDialogData {
  photoTypeName: string;

  file: File;
}

@Component({
  selector: 'app-photo-preview-dialog',

  standalone: true,

  imports: [],

  templateUrl: './photo-preview-dialog.html',

  styleUrl: './photo-preview-dialog.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoPreviewDialog {
  // =========================================================
  // Dialog data
  // =========================================================

  readonly data = inject(Z_MODAL_DATA) as IPhotoPreviewDialogData;

  // =========================================================
  // Preview URL
  // =========================================================

  readonly previewUrl = URL.createObjectURL(this.data.file);

  // =========================================================
  // Format file size
  // =========================================================

  formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const units = ['Bytes', 'KB', 'MB', 'GB'];

    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    const size = bytes / Math.pow(1024, index);

    return `${size.toFixed(2)} ${units[index]}`;
  }

  // =========================================================
  // Cleanup
  // =========================================================

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.previewUrl);
  }
}
