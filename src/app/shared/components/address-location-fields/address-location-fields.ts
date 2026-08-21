import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { ZardInputComponent } from '@/shared/components/input';

import { ZardComboboxImports } from '@/shared/components/combobox/combobox.imports';

import type {
  ZardComboboxOption,
} from '@/shared/components/combobox/combobox.types';

import {
  ILocationParameter,
} from '@/features/pages/tdr-assessment/interfaces/master-data.interface';


@Component({
  selector: 'app-address-location-fields',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    ZardInputComponent,
    ...ZardComboboxImports,
  ],

  templateUrl: './address-location-fields.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressLocationFields {

  // =========================================================
  // Inputs
  // =========================================================

  @Input({ required: true })
  addressGroup!: FormGroup;

  @Input()
  locations: ILocationParameter[] = [];


  // =========================================================
  // Combobox Options
  // =========================================================

  /**
   * Convert location master data into Zard Combobox options.
   *
   * The label intentionally contains all searchable fields:
   *
   * - label_text
   * - postal code
   * - sub district
   * - district
   * - province
   *
   * This allows Zard's internal filtering to search
   * all of these values without us manually rebuilding
   * the combobox items on every keystroke.
   */
  get locationOptions(): ZardComboboxOption[] {
    return this.locations.map(item => ({
      value: item.locationCode ?? '',

      label: [
        item.label_text,
        item.postCode,
        item.subDistrict,
        item.district,
        item.province,
      ]
        .filter(Boolean)
        .join(' '),
    }));
  }


  // =========================================================
  // Display Label
  // =========================================================

  /**
   * Get the clean display text.
   *
   * The actual option label contains searchable data,
   * but we only want to show label_text to the user.
   */
  getDisplayLabel(locationCode: string): string {

    const location = this.locations.find(
      item => item.locationCode === locationCode,
    );

    return location?.label_text ?? '';
  }


  // =========================================================
  // Selection
  // =========================================================

  onSelected(option: ZardComboboxOption): void {

    const selected = this.locations.find(
      item => item.locationCode === option.value,
    );

    if (!selected) {
      return;
    }

    this.addressGroup.patchValue({
      postalCode: selected.postCode,
      subDistrict: selected.subDistrict,
      district: selected.district,
      province: selected.province,
    });

  }
}