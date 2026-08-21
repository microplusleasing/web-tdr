import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  ZardInputComponent
} from '@/shared/components/input';

import {
  ZardSelectImports
} from '@/shared/components/select';

import {
  ZardCheckboxComponent
} from '@/shared/components/checkbox';

import {
  ITitleParameter,
  ILocationParameter,
  IMarriedStatusParameter,
} from '../../interfaces/master-data.interface';
import { AddressLocationFields } from "@/shared/components/address-location-fields/address-location-fields";


@Component({
  selector: 'app-customer-information-step',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    ZardInputComponent,
    ZardSelectImports,
    ZardCheckboxComponent,
    AddressLocationFields
  ],

  templateUrl: './customer-information-step.html',

  styleUrl: './customer-information-step.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerInformationStep implements OnInit {


  // =========================================================
  // Inputs
  // =========================================================

  @Input({
    required: true,
  })
  form!: FormGroup;


  /**
   * Title master data from API
   *
   * response.parameters.title
   */
  @Input()
  titleOptions: ITitleParameter[] = [];

  /**
   * Married Status master data from API
   *
   * response.parameters.title
   */
  @Input()
  marriedStatusOptions: IMarriedStatusParameter[] = [];


  /**
   * Location master data from API
   *
   * Currently not used.
   *
   * We keep it here so the component is ready
   * when postcode / district / province lookup
   * is implemented later.
   */
  @Input()
  locations: ILocationParameter[] = [];

  // =========================================================
  // Address Group
  // =========================================================

  addressGroup(
    addressName: string,
  ): FormGroup {

    return this.form.get(
      addressName,
    ) as FormGroup;

  }


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {

    this.setupAddressCopyHandlers();

  }


  // =========================================================
  // Address Copy
  // =========================================================

  private setupAddressCopyHandlers(): void {

    this.form
      .get('registeredAddressSameAsIdCard')
      ?.valueChanges
      .subscribe((checked) => {

        if (checked) {

          this.copyAddress(
            'idCardAddress',
            'registeredAddress'
          );

          this.form
            .get('registeredAddress')
            ?.disable();

        } else {

          this.form
            .get('registeredAddress')
            ?.enable();

        }

      });


    this.form
      .get('currentAddressSameAsIdCard')
      ?.valueChanges
      .subscribe((checked) => {

        if (checked) {

          this.copyAddress(
            'idCardAddress',
            'currentAddress'
          );

          this.form
            .get('currentAddress')
            ?.disable();

        } else {

          this.form
            .get('currentAddress')
            ?.enable();

        }

      });

  }


  private copyAddress(
    source: string,
    target: string
  ): void {

    const sourceGroup =
      this.form.get(source);

    const targetGroup =
      this.form.get(target);


    if (
      !sourceGroup ||
      !targetGroup
    ) {

      return;

    }


    targetGroup.patchValue(
      sourceGroup.getRawValue()
    );

  }


  // =========================================================
  // Form Helpers
  // =========================================================

  control(
    path: string
  ): AbstractControl | null {

    return this.form.get(path);

  }


  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.form.get(controlName);


    return !!control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      );

  }


  isAddressInvalid(
    address: string,
    controlName: string
  ): boolean {

    const control =
      this.form.get(
        `${address}.${controlName}`
      );


    return !!control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      );

  }


  // =========================================================
  // Title Helper
  // =========================================================

  getTitleLabel(
    titleId: string
  ): string {

    const title =
      this.titleOptions.find(
        item =>
          item.titleId === titleId
      );


    return title?.titleName ?? '';

  }

}