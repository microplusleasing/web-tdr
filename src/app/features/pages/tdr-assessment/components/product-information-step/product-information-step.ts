import { Component, Input } from '@angular/core';

import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ZardInputComponent } from '@/shared/components/input';

import { ZardSelectImports } from '@/shared/components/select';

import { ZardButtonComponent } from '@/shared/components/button';

import { ZardTableImports } from '@/shared/components/table';

import { IMotorcyclePhotoTypeDisplay } from '../../interfaces/master-data.interface';

@Component({
  selector: 'app-product-information-step',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    ZardInputComponent,
    ZardSelectImports,
    ZardButtonComponent,
    ZardTableImports,
  ],

  templateUrl: './product-information-step.html',

  styleUrl: './product-information-step.css',
})
export class ProductInformationStep {
  // =========================================================
  // Inputs
  // =========================================================

  @Input({ required: true })
  form!: FormGroup;

  @Input({ required: true })
  motorcyclePhotoTypes: IMotorcyclePhotoTypeDisplay[] = [];

  // =========================================================
  // Product information
  // =========================================================

  get productInformation(): FormGroup {
    return this.form.get('productInformation') as FormGroup;
  }

  // =========================================================
  // Motorcycle photos
  // =========================================================

  get motorcyclePhotos(): FormArray {
    return this.productInformation.get('motorcyclePhotos') as FormArray;
  }

  // =========================================================
  // Form helper
  // =========================================================

  control(path: string): AbstractControl | null {
    return this.form.get(path);
  }

  isInvalid(path: string): boolean {
    const control = this.form.get(path);

    return !!control && control.invalid && (control.touched || control.dirty);
  }

  // =========================================================
  // File helper
  // =========================================================

  getPhotoFile(index: number): File | null {
    return this.motorcyclePhotos.at(index)?.get('file')?.value ?? null;
  }

  getPhotoFileName(index: number): string {
    return this.motorcyclePhotos.at(index)?.get('fileName')?.value ?? '';
  }

  hasPhoto(index: number): boolean {
    return !!this.getPhotoFile(index);
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
    // Validate file type
    // -------------------------------------------------------

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      input.value = '';

      return;
    }

    // -------------------------------------------------------
    // Validate file size
    // 10 MB maximum
    // -------------------------------------------------------

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      input.value = '';

      return;
    }

    // -------------------------------------------------------
    // Update FormArray
    // -------------------------------------------------------

    const photoGroup = this.motorcyclePhotos.at(index) as FormGroup;

    photoGroup.patchValue({
      file,
      fileName: file.name,
    });

    photoGroup.get('file')?.markAsTouched();

    photoGroup.get('file')?.markAsDirty();

    // Allow selecting the same file again
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
  // Step validation
  // =========================================================

  validateStep(): boolean {
    this.productInformation.markAllAsTouched();

    return this.productInformation.valid;
  }

  // =========================================================
  // Upload status
  // =========================================================

  getUploadStatus(index: number): 'pending' | 'uploaded' {
    return this.hasPhoto(index) ? 'uploaded' : 'pending';
  }
}
