import {
  Component,
  Input
} from '@angular/core';

import {
  AbstractControl,
  FormArray,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ZardInputComponent
} from '@/shared/components/input';

import {
  ZardSelectImports
} from '@/shared/components/select';
import { IMotorcyclePhotoTypeDisplay } from '../../interfaces/master-data.interface';

@Component({
  selector: 'app-product-information-step',
    imports: [
    ReactiveFormsModule,
    ZardInputComponent,
    ZardSelectImports
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
  // Form helpers
  // =========================================================

  get productInformation(): FormGroup {

    return this.form.get(
      'productInformation'
    ) as FormGroup;

  }


  get motorcyclePhotos(): FormArray {

    return this.productInformation.get(
      'motorcyclePhotos'
    ) as FormArray;

  }


  control(
    path: string
  ): AbstractControl | null {

    return this.form.get(path);

  }


  isInvalid(
    path: string
  ): boolean {

    const control = this.form.get(path);

    return !!control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      );

  }


  // =========================================================
  // File upload
  // =========================================================

  selectPhoto(
    index: number,
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    const photoGroup =
      this.motorcyclePhotos.at(index) as FormGroup;

    photoGroup.patchValue({

      file: file,

      fileName: file.name

    });

    photoGroup.get('file')
      ?.markAsTouched();

    photoGroup.get('file')
      ?.markAsDirty();

  }


  removePhoto(
    index: number
  ): void {

    const photoGroup =
      this.motorcyclePhotos.at(index) as FormGroup;

    photoGroup.patchValue({

      file: null,

      fileName: ''

    });

    photoGroup.get('file')
      ?.markAsTouched();

  }


  getPhotoFile(
    index: number
  ): File | null {

    return this.motorcyclePhotos
      .at(index)
      ?.get('file')
      ?.value ?? null;

  }


  // =========================================================
  // Submit / validation
  // =========================================================

  validateStep(): boolean {

    this.productInformation
      .markAllAsTouched();

    return this.productInformation.valid;

  }

}