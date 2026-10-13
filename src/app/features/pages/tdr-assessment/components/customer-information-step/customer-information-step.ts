import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  isDevMode,
} from '@angular/core';

import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ZardInputComponent } from '@/shared/components/input';

import { ZardSelectImports } from '@/shared/components/select';

import { ZardCheckboxComponent } from '@/shared/components/checkbox';

import { ZardTextareaComponent } from '@/shared/components/textarea/textarea.component';

import {
  ITitleParameter,
  ILocationParameter,
  IMarriedStatusParameter,
} from '../../interfaces/master-data.interface';
import { AddressLocationFields } from '@/shared/components/address-location-fields/address-location-fields';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, tap } from 'rxjs';
import { TdrAssessmentService } from '../../services/tdr-assessment.service';
import { ZardSpinnerComponent } from '@/shared/components/spinner';
import { ZardButtonComponent } from '@/shared/components/button';

@Component({
  selector: 'app-customer-information-step',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    ZardInputComponent,
    ZardSelectImports,
    ZardCheckboxComponent,
    AddressLocationFields,
    ZardTextareaComponent,
    ZardSpinnerComponent,
    ZardButtonComponent,
  ],

  templateUrl: './customer-information-step.html',

  styleUrl: './customer-information-step.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerInformationStep implements OnInit {
  readonly showMock = isDevMode();
  // =========================================================
  // Inputs
  // =========================================================

  @Input({ required: true }) form!: FormGroup;

  private readonly destroyRef = inject(DestroyRef);

  private readonly tdrAssessmentService = inject(TdrAssessmentService);

  contractChecking = signal(false);
  contractNoValid = signal(false);

  @Output() validChange = new EventEmitter<boolean>();

  /**
   * Title master data from API
   *
   * response.parameters.title
   */
  @Input() titleOptions: ITitleParameter[] = [];

  /**
   * Married Status master data from API
   *
   * response.parameters.title
   */
  @Input() marriedStatusOptions: IMarriedStatusParameter[] = [];

  /**
   * Location master data from API
   *
   * Currently not used.
   *
   * We keep it here so the component is ready
   * when postcode / district / province lookup
   * is implemented later.
   */
  @Input() locations: ILocationParameter[] = [];

  // =========================================================
  // Address Group
  // =========================================================

  addressGroup(addressName: string): FormGroup {
    return this.form.get(addressName) as FormGroup;
  }

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.setupAddressCopyHandlers();
    this.setupContractNoValidation();

    this.validChange.emit(this.form.valid);

    this.form.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.validChange.emit(this.form.valid);
    });
  }

  // =========================================================
  // Mock data button (remove on production)
  // =========================================================
  mockData() {
    if (!this.showMock) return;

    this.form.get('contractNo')?.setValue('110202206010013');
    this.form.get('title')?.setValue('001');
    this.form.get('firstName')?.setValue('ณภัทร');
    this.form.get('lastName')?.setValue('รอดเนียม');
    this.form.get('citizenId')?.setValue('1229900584011');

    this.form.get('idCardAddress.houseNo')?.setValue('309');
    this.form.get('idCardAddress.postalCodeLookup')?.setValue('110504');
    this.form.get('idCardAddress.subDistrict')?.setValue('ในคลองบางปลากด');
    this.form.get('idCardAddress.district')?.setValue('พระสมุทรเจดีย์');
    this.form.get('idCardAddress.province')?.setValue('สมุทรปราการ');
    this.form.get('idCardAddress.provCode')?.setValue('11');
    this.form.get('idCardAddress.postalCode')?.setValue('10290');

    this.form.get('registeredAddressSameAsIdCard')?.setValue(true);
    this.form.get('currentAddressSameAsIdCard')?.setValue(true);

    this.form.get('registeredAddress.houseNo')?.setValue('309');
    this.form.get('registeredAddress.postalCodeLookup')?.setValue('110504');
    this.form.get('registeredAddress.subDistrict')?.setValue('ในคลองบางปลากด');
    this.form.get('registeredAddress.district')?.setValue('พระสมุทรเจดีย์');
    this.form.get('registeredAddress.province')?.setValue('สมุทรปราการ');
    this.form.get('registeredAddress.provCode')?.setValue('11');
    this.form.get('registeredAddress.postalCode')?.setValue('10290');

    this.form.get('currentAddress.houseNo')?.setValue('309');
    this.form.get('currentAddress.postalCodeLookup')?.setValue('110504');
    this.form.get('currentAddress.subDistrict')?.setValue('ในคลองบางปลากด');
    this.form.get('currentAddress.district')?.setValue('พระสมุทรเจดีย์');
    this.form.get('currentAddress.province')?.setValue('สมุทรปราการ');
    this.form.get('currentAddress.provCode')?.setValue('11');
    this.form.get('currentAddress.postalCode')?.setValue('10290');

    this.form.get('phoneNo')?.setValue('0952483338');
    this.form.get('maritalStatus')?.setValue('2');
    this.form.get('numberOfChildren')?.setValue('2');
    this.form.get('dependents')?.setValue('1');

    this.form.get('occupation')?.setValue('Programmer');
    this.form.get('position')?.setValue('พนักงานประจำ');
    this.form.get('jobDescription')?.setValue('งาน Office');
    this.form.get('workplaceName')?.setValue('mpls leasing.co');

    this.form.get('workplaceAddress.houseNo')?.setValue('214');
    this.form.get('workplaceAddress.road')?.setValue('เพชรเกษม');
    this.form.get('workplaceAddress.postalCodeLookup')?.setValue('104002');
    this.form.get('workplaceAddress.subDistrict')?.setValue('บางแคเหนือ');
    this.form.get('workplaceAddress.district')?.setValue('บางแค');
    this.form.get('workplaceAddress.province')?.setValue('กรุงเทพฯ');
    this.form.get('workplaceAddress.postalCode')?.setValue('10160');
    this.form.get('workplaceAddress.provCode')?.setValue('10');
    this.form.get('workplaceAddress.workplacePhone')?.setValue('021143459');
    this.form.get('workplaceAddress.workplaceDescription')?.setValue('ใหญ่โต อลังการ');

    this.form.get('reference1.name')?.setValue('พลวัต');
    this.form.get('reference1.phone')?.setValue('0999999999');
    this.form.get('reference1.relationship')?.setValue('เพื่อน');
  }

  private setupContractNoValidation(): void {
    const contractNoControl = this.form.get('contractNo');

    if (!contractNoControl) {
      return;
    }

    contractNoControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((value) => {
          this.removeContractErrors(contractNoControl);
          this.contractNoValid.set(false);

          // show spinner the instant 15 digits are typed, hide it otherwise
          this.contractChecking.set(/^\d{15}$/.test(value ?? ''));
        }),
        debounceTime(700),
        distinctUntilChanged(), // before filter, so backspace-then-retype still emits (see previous fix)
        filter((value) => /^\d{15}$/.test(value ?? '')),
        switchMap((contractNo) =>
          this.tdrAssessmentService.checkContractExists(contractNo).pipe(
            finalize(() => {
              this.contractChecking.set(false);
            }),
          ),
        ),
      )
      .subscribe({
        next: (response) => {
          if (response.flag) {
            this.contractNoValid.set(true);
            this.removeContractNotFoundError(contractNoControl);
          } else {
            this.contractNoValid.set(false);
            this.setContractNotFoundError(contractNoControl);
          }
        },
        error: () => {
          this.setContractCheckFailedError(contractNoControl);
        },
      });
  }

  private setContractNotFoundError(control: AbstractControl): void {
    control.setErrors({
      ...(control.errors ?? {}),
      contractNotFound: true,
    });

    Object.keys(this.form.controls).forEach((fieldName) => {
      const control = this.form.get(fieldName);

      console.log(fieldName, {
        value: control?.value,
        valid: control?.valid,
        status: control?.status,
        errors: control?.errors,
      });
    });

    console.log('FORM VALID:', this.form.valid);
  }

  private removeContractNotFoundError(control: AbstractControl): void {
    if (!control.hasError('contractNotFound')) {
      return;
    }

    const errors = {
      ...(control.errors ?? {}),
    };

    delete errors['contractNotFound'];

    control.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  private setContractCheckFailedError(control: AbstractControl): void {
    control.setErrors({
      ...(control.errors ?? {}),
      contractCheckFailed: true,
    });
  }

  private removeContractErrors(control: AbstractControl): void {
    const errors = {
      ...(control.errors ?? {}),
    };

    delete errors['contractNotFound'];
    delete errors['contractCheckFailed'];

    control.setErrors(Object.keys(errors).length > 0 ? errors : null);
  }

  // =========================================================
  // Address Copy
  // =========================================================

  private setupAddressCopyHandlers(): void {
    this.form.get('idCardAddress.subDistrict')?.disable();
    this.form.get('idCardAddress.district')?.disable();
    this.form.get('idCardAddress.province')?.disable();
    this.form.get('idCardAddress.postalCode')?.disable();

    this.form.get('registeredAddress.subDistrict')?.disable();
    this.form.get('registeredAddress.district')?.disable();
    this.form.get('registeredAddress.province')?.disable();
    this.form.get('registeredAddress.postalCode')?.disable();

    this.form.get('currentAddress.subDistrict')?.disable();
    this.form.get('currentAddress.district')?.disable();
    this.form.get('currentAddress.province')?.disable();
    this.form.get('currentAddress.postalCode')?.disable();

    this.form.get('workplaceAddress.subDistrict')?.disable();
    this.form.get('workplaceAddress.district')?.disable();
    this.form.get('workplaceAddress.province')?.disable();
    this.form.get('workplaceAddress.postalCode')?.disable();

    this.form
      .get('registeredAddressSameAsIdCard')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((checked) => {
        if (checked) {
          this.copyAddress('idCardAddress', 'registeredAddress');
          this.form.get('registeredAddress')?.disable();
        } else {
          this.form.get('registeredAddress')?.enable();
        }
      });

    this.form
      .get('currentAddressSameAsIdCard')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((checked) => {
        if (checked) {
          this.copyAddress('idCardAddress', 'currentAddress');
          this.form.get('currentAddress')?.disable();
        } else {
          this.form.get('currentAddress')?.enable();
        }
      });
  }

  private copyAddress(source: string, target: string): void {
    const sourceGroup = this.form.get(source);

    const targetGroup = this.form.get(target);

    if (!sourceGroup || !targetGroup) {
      return;
    }

    targetGroup.patchValue(sourceGroup.getRawValue());
  }

  // =========================================================
  // Form Helpers
  // =========================================================

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

  isAddressInvalid(address: string, controlName: string): boolean {
    const control = this.form.get(`${address}.${controlName}`);

    return !!control && control.invalid && (control.touched || control.dirty);
  }

  // =========================================================
  // Title Helper
  // =========================================================

  getTitleLabel(titleId: string): string {
    const title = this.titleOptions.find((item) => item.titleId === titleId);

    return title?.titleName ?? '';
  }
}
