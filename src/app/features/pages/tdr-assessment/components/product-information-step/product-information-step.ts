import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';

import {
  AbstractControl,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ZardInputComponent } from '@/shared/components/input';

import { ZardSelectImports } from '@/shared/components/select';

import {
  IMotorcyclePhotoTypeDisplay,
  IVehicleUserTypeDisplay,
} from '../../interfaces/master-data.interface';

import { PhotoPreviewDialog } from '@/shared/components/photo-preview-dialog/photo-preview-dialog';
import { ZardDialogService } from '@/shared/components/dialog';

@Component({
  selector: 'app-product-information-step',

  standalone: true,

  imports: [ReactiveFormsModule, ZardInputComponent, ZardSelectImports],

  templateUrl: './product-information-step.html',

  styleUrl: './product-information-step.css',
})
export class ProductInformationStep implements OnChanges {
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

  @Input({ required: true })
  vehicleUserTypes: IVehicleUserTypeDisplay[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vehicleUserTypes']) {
      this.updateAdditionalInfoState();
    }

    if (changes['form']) {
      this.setupVehicleUserTypeHandler();
      this.updateAdditionalInfoState();
    }
  }

  get isAdditionalInfoRequired(): boolean {
    const code = this.form.get('vehicleUserType')?.value;

    return this.vehicleUserTypes.find((item) => item.code === code)?.remarkTextType === 'C';
  }

  private setupVehicleUserTypeHandler(): void {
    const vehicleUserTypeControl = this.form.get('vehicleUserType');

    if (!vehicleUserTypeControl) {
      return;
    }

    vehicleUserTypeControl.valueChanges.subscribe(() => {
      this.updateAdditionalInfoState();
    });
  }

  private updateAdditionalInfoState(): void {
    const vehicleUserTypeControl = this.form.get('vehicleUserType');

    const additionalInfoControl = this.form.get('additionalInfo');

    if (!vehicleUserTypeControl || !additionalInfoControl) {
      return;
    }

    const selectedCode = vehicleUserTypeControl.value;

    const selectedVehicleUserType = this.vehicleUserTypes.find(
      (item) => item.code === selectedCode,
    );

    const requireRemark = selectedVehicleUserType?.remarkTextType === 'C';

    if (requireRemark) {
      additionalInfoControl.enable({
        emitEvent: false,
      });

      additionalInfoControl.setValidators([Validators.required]);

      additionalInfoControl.updateValueAndValidity({
        emitEvent: false,
      });
    } else {
      additionalInfoControl.clearValidators();

      additionalInfoControl.reset('', {
        emitEvent: false,
      });

      additionalInfoControl.disable({
        emitEvent: false,
      });

      additionalInfoControl.updateValueAndValidity({
        emitEvent: false,
      });
    }
  }

  // =========================================================
  // Form helpers
  // =========================================================

  // get productInformation(): FormGroup {
  //   return this.form.get('productInformation') as FormGroup;
  // }

  get motorcyclePhotos(): FormArray {
    return this.form.get('motorcyclePhotos') as FormArray;
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
    this.form.markAllAsTouched();

    return this.form.valid;
  }
}
