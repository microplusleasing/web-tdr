import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ZardInputComponent } from '@/shared/components/input';
import { ZardComboboxImports } from '@/shared/components/combobox/combobox.imports';
import type { ZardComboboxOption } from '@/shared/components/combobox/combobox.types';
import { ILocationParameter } from '@/features/pages/tdr-assessment/interfaces/master-data.interface';

@Component({
  selector: 'app-address-location-fields',
  standalone: true,
  imports: [ReactiveFormsModule, ZardInputComponent, ...ZardComboboxImports],
  templateUrl: './address-location-fields.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressLocationFields implements OnInit, OnChanges {
  // =========================================================
  // Inputs
  // =========================================================

  @Input({ required: true })
  addressGroup!: FormGroup;

  @Input()
  locations: ILocationParameter[] = [];

  // =========================================================
  // Search Configuration
  // =========================================================

  /**
   * User must enter at least 5 digits
   * before searching the master data.
   */
  readonly minimumSearchLength = 5;

  /**
   * Maximum number of results displayed.
   */
  readonly maximumResults = 50;

  // =========================================================
  // Search State
  // =========================================================

  searchValue = '';

  /**
   * Results displayed in the Zard Combobox.
   */
  locationOptions: ZardComboboxOption[] = [];

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.addressGroup.get('postalCodeLookup')?.valueChanges.subscribe((locationCode) => {
      if (!locationCode) {
        return;
      }

      this.syncSelectedLocation();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locations']) {
      this.locationOptions = [];
      this.searchValue = '';

      this.syncSelectedLocation();
    }
  }

  // =========================================================
  // Search
  // =========================================================

  onSearch(value: string): void {
    this.searchValue = value.trim();

    // -------------------------------------------------------
    // Clear selected address when user starts changing
    // the search value.
    // -------------------------------------------------------

    this.clearAddressIfSearchChanged();

    // -------------------------------------------------------
    // Empty
    // -------------------------------------------------------

    if (!this.searchValue) {
      this.locationOptions = [];

      this.setValidationError(null);

      return;
    }

    // -------------------------------------------------------
    // Validate format
    // -------------------------------------------------------

    if (!/^\d+$/.test(this.searchValue)) {
      this.locationOptions = [];

      this.setValidationError('กรุณากรอกรหัสไปรษณีย์เป็นตัวเลข 5 หลัก');

      return;
    }

    // -------------------------------------------------------
    // Minimum length
    // -------------------------------------------------------

    if (this.searchValue.length < this.minimumSearchLength) {
      this.locationOptions = [];

      this.setValidationError('กรุณากรอกรหัสไปรษณีย์ 5 หลัก');

      return;
    }

    // -------------------------------------------------------
    // Postal code must be exactly 5 digits
    // -------------------------------------------------------

    if (this.searchValue.length > this.minimumSearchLength) {
      this.locationOptions = [];

      this.setValidationError('กรุณากรอกรหัสไปรษณีย์ 5 หลัก');

      return;
    }

    // -------------------------------------------------------
    // Search POST CODE ONLY
    // -------------------------------------------------------

    const search = this.searchValue;

    const results = this.locations
      .filter((item) => {
        const postCode = item.postCode?.toString() ?? '';

        return postCode === search;
      })
      .slice(0, this.maximumResults);

    // -------------------------------------------------------
    // No match
    // -------------------------------------------------------

    if (results.length === 0) {
      this.locationOptions = [];

      this.setValidationError('ไม่พบรหัสไปรษณีย์นี้ในข้อมูลระบบ');

      return;
    }

    // -------------------------------------------------------
    // Valid
    // -------------------------------------------------------

    this.setValidationError(null);

    // -------------------------------------------------------
    // Convert to Zard options
    // -------------------------------------------------------

    this.locationOptions = results.map((item) => ({
      value: item.locationCode ?? '',

      /**
       * Internal Zard search label.
       *
       * We keep postal code and location information
       * here, although our custom search is based
       * ONLY on postalCode.
       */
      label: [item.subDistrict, item.district, item.province, item.postCode]
        .filter(Boolean)
        .join(' / '),
    }));
  }

  // =========================================================
  // Selection
  // =========================================================

  onSelected(option: ZardComboboxOption): void {
    const selected = this.locations.find((item) => item.locationCode === option.value);

    if (!selected) {
      this.setValidationError('ไม่พบข้อมูลพื้นที่ที่เลือก');
      return;
    }

    // -------------------------------------------------------
    // Update address form
    // -------------------------------------------------------

    this.addressGroup.patchValue({
      postalCodeLookup: selected.locationCode,
      postalCode: selected.postCode,
      subDistrict: selected.subDistrict,
      district: selected.district,
      province: selected.province,
      provCode: selected.provinceCode,
    });

    // -------------------------------------------------------
    // Clear validation error
    // -------------------------------------------------------

    this.setValidationError(null);
  }

  // =========================================================
  // Display Label
  // =========================================================

  getDisplayLabel(locationCode: string): string {
    const location = this.locations.find((item) => item.locationCode === locationCode);

    if (!location) {
      return '';
    }

    return [location.subDistrict, location.district, location.province, location.postCode]
      .filter(Boolean)
      .join(' / ');
  }

  private syncSelectedLocation(): void {
    const locationCode = this.addressGroup.get('postalCodeLookup')?.value;

    if (!locationCode) {
      return;
    }

    const selected = this.locations.find((item) => item.locationCode === locationCode);

    if (!selected) {
      return;
    }

    const option: ZardComboboxOption = {
      value: selected.locationCode ?? '',
      label: [selected.subDistrict, selected.district, selected.province, selected.postCode]
        .filter(Boolean)
        .join(' / '),
    };

    this.locationOptions = [option];

    this.searchValue = selected.postCode?.toString() ?? '';
  }

  // =========================================================
  // Validation
  // =========================================================

  private setValidationError(message: string | null): void {
    const control = this.addressGroup.get('postalCodeLookup');

    if (!control) {
      return;
    }

    if (message) {
      control.setErrors({
        ...control.errors,
        locationInvalid: message,
      });
    } else {
      const errors = {
        ...control.errors,
      };

      delete errors['locationInvalid'];

      control.setErrors(Object.keys(errors).length ? errors : null);
    }
  }

  // =========================================================
  // Clear Address
  // =========================================================

  private clearAddressIfSearchChanged(): void {
    this.addressGroup.patchValue({
      postalCode: '',
      subDistrict: '',
      district: '',
      province: '',
      provCode: '',
    });
  }

  // =========================================================
  // Form Helpers
  // =========================================================

  get postalCodeLookupControl(): AbstractControl | null {
    return this.addressGroup.get('postalCodeLookup');
  }

  get locationError(): string | null {
    return this.postalCodeLookupControl?.errors?.['locationInvalid'] ?? null;
  }

  get showLocationError(): boolean {
    const control = this.postalCodeLookupControl;

    if (!control) {
      return false;
    }

    return !!control.errors?.['locationInvalid'];
  }
}
