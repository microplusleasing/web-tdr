import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
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
export class AddressLocationFields implements OnChanges {

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
   * Minimum number of digits required before searching.
   */
  readonly minimumSearchLength = 5;


  /**
   * Maximum number of results displayed in the combobox.
   *
   * We don't want to render thousands of records.
   */
  readonly maximumResults = 50;


  // =========================================================
  // Filtered Options
  // =========================================================

  /**
   * Options currently displayed by the combobox.
   *
   * IMPORTANT:
   *
   * This is NOT all 30,000 records.
   *
   * It only contains the records matching the
   * postal-code search.
   */
  locationOptions: ZardComboboxOption[] = [];


  // =========================================================
  // Search State
  // =========================================================

  searchValue = '';


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['locations']) {

      /**
       * Master data has been loaded.
       *
       * We intentionally do NOT put all 30,000 records
       * into locationOptions.
       */
      this.locationOptions = [];

    }

  }


  // =========================================================
  // Search
  // =========================================================

  /**
   * Search locations by POSTAL CODE ONLY.
   *
   * Example:
   *
   * 10260
   *
   * will search:
   *
   * item.postCode
   *
   * It will NOT search:
   *
   * - province
   * - district
   * - subDistrict
   * - label_text
   */
  onSearch(value: string): void {

    this.searchValue = value.trim();


    // -------------------------------------------------------
    // Less than 5 digits
    // -------------------------------------------------------

    if (
      this.searchValue.length <
      this.minimumSearchLength
    ) {

      this.locationOptions = [];

      return;

    }


    // -------------------------------------------------------
    // Search POST CODE only
    // -------------------------------------------------------

    const search = this.searchValue;


    const results =
      this.locations
        .filter(item => {

          const postCode =
            item.postCode?.toString() ?? '';

          return postCode.includes(search);

        })
        .slice(
          0,
          this.maximumResults
        );


    // -------------------------------------------------------
    // Convert to Zard options
    // -------------------------------------------------------

    this.locationOptions =
      results.map(item => ({

        value:
          item.locationCode ?? '',

        /**
         * The label shown internally to Zard.
         *
         * We can include the information needed
         * by the option, but the visible template
         * below will show our desired display text.
         */
        label: [
          item.postCode,
          item.label_text,
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
   * Get the clean display text for a selected option.
   */
  getDisplayLabel(
    locationCode: string,
  ): string {

    const location =
      this.locations.find(
        item =>
          item.locationCode ===
          locationCode,
      );


    return location?.label_text ?? '';

  }


  // =========================================================
  // Selection
  // =========================================================

  onSelected(
    option: ZardComboboxOption,
  ): void {

    const selected =
      this.locations.find(
        item =>
          item.locationCode ===
          option.value,
      );


    if (!selected) {

      return;

    }


    // -------------------------------------------------------
    // Populate address fields
    // -------------------------------------------------------

    this.addressGroup.patchValue({

      postalCode:
        selected.postCode,

      subDistrict:
        selected.subDistrict,

      district:
        selected.district,

      province:
        selected.province,

    });

  }

}