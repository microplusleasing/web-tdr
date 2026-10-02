import { FormControl } from '@angular/forms';
import { ILocationParameter } from './master-data.interface';

export interface AddressForm {
  // postalCodeLookup: FormControl<ILocationParameter | null>;
  postalCodeLookup: FormControl<string>;
  houseNo: FormControl<string>;
  alley: FormControl<string>;
  soi: FormControl<string>;
  road: FormControl<string>;
  postalCode: FormControl<string>;
  subDistrict: FormControl<string>;
  district: FormControl<string>;
  province: FormControl<string>;
  provCode: FormControl<string>;
}

export interface WorkplaceAddressForm extends AddressForm {
  workplacePhone: FormControl<string>;
  workplaceDescription: FormControl<string>;
}

export interface carUserAddress {
  postalCodeLookup: FormControl<string>;
  postalCode: FormControl<string>;
  subDistrict: FormControl<string>;
  district: FormControl<string>;
  province: FormControl<string>;
  provCode: FormControl<string>;
}
