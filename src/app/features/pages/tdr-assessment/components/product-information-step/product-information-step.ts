import { Component, Input, inject } from '@angular/core';

import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ZardInputComponent } from '@/shared/components/input';

import { ZardSelectImports } from '@/shared/components/select';

import { IMotorcyclePhotoTypeDisplay } from '../../interfaces/master-data.interface';

import { PhotoPreviewDialog } from '@/shared/components/photo-preview-dialog/photo-preview-dialog';
import { ZardDialogService } from '@/shared/components/dialog';

@Component({
  selector: 'app-product-information-step',

  standalone: true,

  imports: [ReactiveFormsModule, ZardInputComponent, ZardSelectImports],

  templateUrl: './product-information-step.html',

  styleUrl: './product-information-step.css',
})
export class ProductInformationStep {
  // =========================================================
  // Services
  // =========================================================

  private readonly dialogService = inject(ZardDialogService);

  // =========================================================
  // Inputs
  // =========================================================

  @Input({ required: true })
  form!: FormGroup;

  @Input({ required: true })
  motorcyclePhotoTypes: IMotorcyclePhotoTypeDisplay[] = [];

  // =========================================================
  // Form helpers
  // =========================================================

  get productInformation(): FormGroup {
    return this.form.get('productInformation') as FormGroup;
  }

  get motorcyclePhotos(): FormArray {
    return this.productInformation.get('motorcyclePhotos') as FormArray;
  }

  control(path: string): AbstractControl | null {
    return this.form.get(path);
  }

  isInvalid(path: string): boolean {
    const control = this.form.get(path);

    return !!control && control.invalid && (control.touched || control.dirty);
  }

  // =========================================================
  // File upload
  // =========================================================

  selectPhoto(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // -------------------------------------------------------
    // Optional validation
    // -------------------------------------------------------

    if (!file.type.startsWith('image/')) {
      return;
    }

    const photoGroup = this.motorcyclePhotos.at(index) as FormGroup;

    photoGroup.patchValue({
      file,

      fileName: file.name,
    });

    photoGroup.get('file')?.markAsTouched();

    photoGroup.get('file')?.markAsDirty();

    // Reset input so selecting the same file again
    // still triggers change event.

    input.value = '';
  }

  // =========================================================
  // Remove photo
  // =========================================================

  removePhoto(index: number): void {
    const photoGroup = this.motorcyclePhotos.at(index) as FormGroup;

    photoGroup.patchValue({
      file: null,
      fileName: '',
    });

    photoGroup.get('file')?.markAsTouched();
  }

  // =========================================================
  // Get selected file
  // =========================================================

  getPhotoFile(index: number): File | null {
    return this.motorcyclePhotos.at(index)?.get('file')?.value ?? null;
  }

  // =========================================================
  // Preview photo
  // =========================================================

  previewPhoto(index: number): void {
    const file = this.getPhotoFile(index);

    if (!file) {
      return;
    }

    const photoType = this.motorcyclePhotoTypes[index];

    this.dialogService.create({
      zTitle: photoType?.name ?? 'ตัวอย่างรูปภาพ',

      zDescription: 'ตัวอย่างรูปภาพที่แนบ',

      zContent: PhotoPreviewDialog,

      zData: {
        photoTypeName: photoType?.name ?? 'รูปภาพรถจักรยานยนต์',

        file,
      },

      zHideFooter: true,

      zMaskClosable: true,

      zClosable: true,

      zWidth: 'min(900px, calc(100vw - 2rem))',

      zCustomClasses: `
        max-h-[90vh]
        overflow-y-auto
      `,
    });
  }

  // =========================================================
  // Submit / validation
  // =========================================================

  validateStep(): boolean {
    this.productInformation.markAllAsTouched();

    return this.productInformation.valid;
  }
}
