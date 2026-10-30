import { Component, Input, OnChanges, SimpleChanges, inject, isDevMode } from '@angular/core';

import {
  AbstractControl,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AddressLocationFields } from '@/shared/components/address-location-fields/address-location-fields';
import { ZardInputComponent } from '@/shared/components/input';
import { ZardSelectImports } from '@/shared/components/select';
import {
  IBrandsParameter,
  ICurrentVehicleConditionTypeParameter,
  ILocationParameter,
  IModelsParameter,
  IMotorcyclePhotoTypeDisplay,
  IVehicleUserTypeDisplay,
} from '../../interfaces/master-data.interface';
import { PhotoPreviewDialog } from '@/shared/components/photo-preview-dialog/photo-preview-dialog';
import { ZardDialogService } from '@/shared/components/dialog';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-product-information-step',

  standalone: true,

  imports: [
    AddressLocationFields,
    ReactiveFormsModule,
    ZardInputComponent,
    ZardSelectImports,
    ZardButtonComponent,
    ZardBadgeComponent,
  ],

  templateUrl: './product-information-step.html',

  styleUrl: './product-information-step.css',
})
export class ProductInformationStep implements OnChanges {
  readonly showMock = isDevMode();
  // =========================================================
  // Services
  // =========================================================

  private readonly dialogService = inject(ZardDialogService);
  private readonly imageService = inject(ImageService);

  // =========================================================
  // Inputs
  // =========================================================

  @Input({ required: true })
  form!: FormGroup;

  @Input({ required: true })
  motorcyclePhotoTypes: IMotorcyclePhotoTypeDisplay[] = [];

  @Input({ required: true })
  vehicleUserTypes: IVehicleUserTypeDisplay[] = [];

  @Input({ required: true }) locations: ILocationParameter[] = [];
  @Input({ required: true }) brands: IBrandsParameter[] = [];
  @Input({ required: true }) models: IModelsParameter[] = [];
  @Input({ required: true }) currentVehicleConditionTypes: ICurrentVehicleConditionTypeParameter[] =
    [];
  filteredModels: IModelsParameter[] = [];

  // =========================================================
  // Address Group
  // =========================================================

  addressGroup(addressName: string): FormGroup {
    return this.form.get(addressName) as FormGroup;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vehicleUserTypes']) {
      this.updateAdditionalInfoState();
    }

    if (changes['form']) {
      this.setupVehicleUserTypeHandler();
      this.setupBrandModelHandler();
      this.updateAdditionalInfoState();
    }

    if (changes['models']) {
      this.updateFilteredModels();
    }

    Object.keys(this.form.controls).forEach((fieldName) => {
      const control = this.form.get(fieldName);

      console.log(fieldName, {
        value: control?.value,
        valid: control?.valid,
        invalid: control?.invalid,
        status: control?.status,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty,
        disabled: control?.disabled,
        enabled: control?.enabled,
      });
    });
  }

  mockData() {
    if (!this.showMock) return;
    this.form.get('brand')?.setValue('01');
    this.form.get('model')?.setValue('0001');
    this.form.get('color')?.setValue('ดำ');
    this.form.get('registrationNo')?.setValue('ปค1311');
    this.form.get('vehicleUserType')?.setValue('VUS01');
    this.form.get('additionalInfo')?.setValue('');
    this.form.get('currentUserName')?.setValue('สมปอง');
    this.form.get('relationship')?.setValue('เพื่อน');
    this.form.get('currentUserPhone')?.setValue('0999999999');
    this.form.get('vehicleUsageAddress')?.setValue('93/1 หมู่ 3 ซ.วัดใหญ่');
    this.form.get('carUserAddress.postalCodeLookup')?.setValue('110504');
    this.form.get('carUserAddress.provCode')?.setValue('11');
    this.form.get('currentMileage')?.setValue('200000');
    this.form.get('currentVehicleCondition')?.setValue('CV01');

    this.mockMotorcyclePhoto();
  }

  private mockMotorcyclePhoto(): void {
    this.motorcyclePhoto.controls.forEach((control, index) => {
      const photoType = this.motorcyclePhotoTypes[index];

      if (!photoType) {
        return;
      }

      const file = this.imageService.createMockImageFile(
        `${photoType.code}-${photoType.name}.jpg`,
        index === 0 ? '#2563eb' : '#16a34a',
      );

      control.patchValue({
        file,
        fileName: file.name,
      });

      control.get('file')?.markAsTouched();
      control.get('file')?.markAsDirty();
    });

    this.motorcyclePhoto.updateValueAndValidity();
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

    this.form.get('carUserAddress.subDistrict')?.disable();
    this.form.get('carUserAddress.district')?.disable();
    this.form.get('carUserAddress.province')?.disable();
    this.form.get('carUserAddress.postalCode')?.disable();
    /* ... เงื่อนไขเมื่อเปลี่ยนสถานะการเช่าซื้อ ... */
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

    Object.keys(this.form.controls).forEach((fieldName) => {
      const control = this.form.get(fieldName);

      console.log(fieldName, {
        value: control?.value,
        valid: control?.valid,
        invalid: control?.invalid,
        status: control?.status,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty,
        disabled: control?.disabled,
        enabled: control?.enabled,
      });
    });
  }

  private setupBrandModelHandler(): void {
    const brandControl = this.form.get('brand');
    const modelControl = this.form.get('model');

    if (!brandControl || !modelControl) {
      return;
    }

    brandControl.valueChanges.subscribe((brandCode) => {
      // Clear currently selected model
      modelControl.reset('', {
        emitEvent: false,
      });

      // Filter models based on selected brand
      this.filteredModels = this.models.filter((model) => model.brand_code === brandCode);
    });

    // Initial filtering
    this.filteredModels = this.models.filter((model) => model.brand_code === brandControl.value);
  }

  private updateFilteredModels(): void {
    const brandCode = this.form.get('brand')?.value;

    if (!brandCode) {
      this.filteredModels = [];
      return;
    }

    this.filteredModels = this.models.filter((model) => model.brand_code === brandCode);
  }

  // =========================================================
  // Form helpers
  // =========================================================

  get motorcyclePhoto(): FormArray {
    return this.form.get('motorcyclePhoto') as FormArray;
  }

  control(path: string): AbstractControl | null {
    return this.form.get(path);
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);

    if (!control) return false;

    const interacted = control.touched || control.dirty;

    const parentError = control.parent?.getError('referenceFieldsRequired');

    const fieldName = controlName.split('.').pop();

    return interacted && (control.invalid || !!(fieldName && parentError?.[fieldName]));
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

    const photoGroup = this.motorcyclePhoto.at(index) as FormGroup;

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
    const photoGroup = this.motorcyclePhoto.at(index) as FormGroup;

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
    return this.motorcyclePhoto.at(index)?.get('file')?.value ?? null;
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
