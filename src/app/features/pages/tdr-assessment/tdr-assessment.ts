import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';

import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CustomerInformationStep } from './components/customer-information-step/customer-information-step';

import { ProductInformationStep } from './components/product-information-step/product-information-step';

import { EstimateIncomeStep } from './components/estimate-income-step/estimate-income-step';

import { EstimatePaymentStep } from './components/estimate-payment-step/estimate-payment-step';

import { RestructureReasonStep } from './components/restructure-reason-step/restructure-reason-step';

import { DocumentAttachStep } from './components/document-attach-step/document-attach-step';

import { CustomStepper, StepChangeEvent } from '@/shared/components/custom-stepper/custom-stepper';

import { Step } from '@/shared/components/custom-stepper/step';

import { TdrAssessmentService } from './services/tdr-assessment.service';

import {
  IAttachmentTypeDisplay,
  IAssessmentCategoryDisplay,
  IAssessmentItemDisplay,
  IMasterDataResponse,
  IMotorcyclePhotoTypeDisplay,
  IRestructureReasonDisplay,
  ILocationParameter,
} from './interfaces/master-data.interface';

import { ZardSpinnerComponent } from '@/shared/components/spinner';

import { DataLoadError } from '@/shared/components/data-load-error/data-load-error';
import {
  AddressForm,
  WorkplaceAddressForm,
} from './interfaces/location-lookup-form-field.interface';

@Component({
  selector: 'app-tdr-assessment',

  standalone: true,

  imports: [
    ReactiveFormsModule,

    CustomStepper,
    Step,

    CustomerInformationStep,
    ProductInformationStep,
    EstimateIncomeStep,
    EstimatePaymentStep,
    RestructureReasonStep,
    DocumentAttachStep,

    ZardSpinnerComponent,
    DataLoadError,
  ],

  templateUrl: './tdr-assessment.html',

  styleUrl: './tdr-assessment.css',
})
export class TdrAssessment implements OnInit {
  // =========================================================
  // Dependencies
  // =========================================================

  private readonly fb = inject(FormBuilder);

  private readonly tdrAssessmentService = inject(TdrAssessmentService);

  private readonly LOADING_DELAY = 300;

  private readonly destroyRef = inject(DestroyRef);

  // =========================================================
  // Main Form
  // =========================================================

  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;
  step5Form!: FormGroup;
  step6Form!: FormGroup;

  // =========================================================
  // Current step
  // =========================================================

  currentStepIndex = signal(0);

  // =========================================================
  // Master data
  // =========================================================

  masterData = signal<IMasterDataResponse | null>(null);

  motorcyclePhotoTypesDisplay = signal<IMotorcyclePhotoTypeDisplay[]>([]);

  step3Fields = signal<IAssessmentItemDisplay[]>([]);

  step4Fields = signal<IAssessmentCategoryDisplay[]>([]);

  restructureReasons = signal<IRestructureReasonDisplay[]>([]);

  attachmentTypesDisplay = signal<IAttachmentTypeDisplay[]>([]);

  // =========================================================
  // Loading / Error
  // =========================================================

  isLoading = signal(false);

  isLoaded = signal(false);

  errorMessage = signal<string | null>(null);

  // =========================================================
  // Step states
  // =========================================================

  // =========================================================
  // Step 1
  // =========================================================

  customerValid = signal(false);
  customerVisited = signal(false);

  // =========================================================
  // Step 2
  // =========================================================

  loanValid = signal(false);
  loanVisited = signal(false);

  // =========================================================
  // Step 3
  // =========================================================

  financialValid = signal(false);
  financialVisited = signal(false);

  // =========================================================
  // Step 4
  // =========================================================

  documentValid = signal(false);
  documentVisited = signal(false);

  // =========================================================
  // Step 5
  // =========================================================

  summaryValid = signal(false);
  summaryVisited = signal(false);

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    // 1. Build the form first
    this.buildForm();

    // 2. Setup anything that depends on the form
    this.setupAddressCopyHandlers();
    this.setupStepValidityTracking();

    // 3. Load API/master data
    this.loadMasterData();
  }

  // =========================================================
  // Build Main Form
  // =========================================================

  private buildForm(): void {
    this.step2Form = this.fb.group({
      // =====================================================
      // STEP 1
      // Customer Information
      // =====================================================

      customerInformation: this.createCustomerInformationGroup(),

      // =====================================================
      // STEP 2
      // Product Information
      // =====================================================

      productInformation: this.createProductInformationGroup(),
    });
  }

  asFormGroup(control: AbstractControl | null): FormGroup {
    return control as FormGroup;
  }

  // =========================================================
  // Customer Information
  // =========================================================

  private createCustomerInformationGroup(): FormGroup {
    return this.fb.group({
      // -----------------------------------------------------
      // Customer information
      // -----------------------------------------------------

      contractNo: ['', Validators.required],

      title: ['', Validators.required],

      firstName: ['', Validators.required],

      lastName: ['', Validators.required],

      citizenId: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],

      // -----------------------------------------------------
      // ID Card Address
      // -----------------------------------------------------

      idCardAddress: this.createAddressGroup(),

      // -----------------------------------------------------
      // Registered Address
      // -----------------------------------------------------

      registeredAddressSameAsIdCard: [false],

      registeredAddress: this.createAddressGroup(),

      // -----------------------------------------------------
      // Current Address
      // -----------------------------------------------------

      currentAddressSameAsIdCard: [false],

      currentAddress: this.createAddressGroup(),

      // -----------------------------------------------------
      // Contact
      // -----------------------------------------------------

      phoneNo: ['', [Validators.required, Validators.pattern(/^0\d{9}$/)]],

      maritalStatus: ['', Validators.required],

      numberOfChildren: [null, [Validators.required, Validators.min(0)]],

      dependents: [null, [Validators.required, Validators.min(0)]],

      // -----------------------------------------------------
      // Employment
      // -----------------------------------------------------

      occupation: ['', Validators.required],

      position: ['', Validators.required],

      jobDescription: ['', Validators.required],

      workplaceName: ['', Validators.required],

      // -----------------------------------------------------
      // Workplace Address
      // -----------------------------------------------------

      workplaceAddress: this.createWorkplaceAddressGroup(),

      // -----------------------------------------------------
      // References
      // -----------------------------------------------------

      reference1: this.createReferenceGroup(true),

      reference2: this.createReferenceGroup(false),
    });
  }

  // =========================================================
  // Address Group
  // =========================================================

  private createAddressGroup(): FormGroup<AddressForm> {
    return this.fb.group({
      // postalCodeLookup: this.fb.control<ILocationParameter | null>(null, Validators.required),
      postalCodeLookup: this.fb.nonNullable.control<string>('', Validators.required),

      houseNo: this.fb.nonNullable.control('', Validators.required),
      alley: this.fb.nonNullable.control(''),
      soi: this.fb.nonNullable.control(''),
      road: this.fb.nonNullable.control(''),

      postalCode: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(/^\d{5}$/),
      ]),

      subDistrict: this.fb.nonNullable.control('', Validators.required),
      district: this.fb.nonNullable.control('', Validators.required),
      province: this.fb.nonNullable.control('', Validators.required),
    });
  }

  // =========================================================
  // Workplace Address Group
  // =========================================================

  private createWorkplaceAddressGroup(): FormGroup<WorkplaceAddressForm> {
    return this.fb.group({
      postalCodeLookup: this.fb.nonNullable.control<string>('', Validators.required),

      houseNo: this.fb.nonNullable.control('', Validators.required),
      alley: this.fb.nonNullable.control(''),
      soi: this.fb.nonNullable.control(''),
      road: this.fb.nonNullable.control(''),

      postalCode: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(/^\d{5}$/),
      ]),

      subDistrict: this.fb.nonNullable.control('', Validators.required),
      district: this.fb.nonNullable.control('', Validators.required),
      province: this.fb.nonNullable.control('', Validators.required),

      workplacePhone: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern('^[0-9]{9,10}$'),
        // Validators.pattern(/^0\d{9}$/),
      ]),

      workplaceDescription: this.fb.nonNullable.control('', Validators.required),
    });
  }

  // =========================================================
  // Reference Group
  // =========================================================

  private createReferenceGroup(required: boolean): FormGroup {
    return this.fb.group({
      name: ['', required ? Validators.required : []],

      // phone: ['', required ? [Validators.required, Validators.pattern(/^0\d{9}$/)] : []],
      phone: ['', required ? [Validators.required, Validators.pattern('^[0-9]{9,10}$')] : []],

      relationship: ['', required ? Validators.required : []],
    });
  }

  // =========================================================
  // Product Information
  // =========================================================

  private createProductInformationGroup(): FormGroup {
    return this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      color: ['', Validators.required],
      registrationNo: ['', Validators.required],

      purchaseStatus: ['', Validators.required],
      additionalInfo: [{ value: '', disabled: true }],

      currentUserName: ['', Validators.required],
      relationship: ['', Validators.required],
      currentUserPhone: ['', Validators.required],

      currentAddress: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
      district: [''],

      currentCondition: ['', Validators.required],
      currentMileage: ['', Validators.required],

      motorcyclePhotos: this.fb.array([]),
    });
  }

  // =========================================================
  // Motorcycle Photos FormArray
  // =========================================================

  get motorcyclePhotos(): FormArray {
    return this.step2Form.get('productInformation.motorcyclePhotos') as FormArray;
  }

  // step 3

  private createStep3Form(items: IAssessmentItemDisplay[]): FormGroup {
    const incomes = this.fb.group({});

    for (const item of items) {
      incomes.addControl(
        item.itemCode,
        this.fb.group({
          amount: this.fb.nonNullable.control<number | null>(null, {
            validators: [Validators.required, Validators.min(0)],
          }),

          remark: this.fb.control<string | null>(
            null,
            item.requireRemark ? [Validators.required] : [],
          ),
        }),
      );
    }

    return this.fb.group({
      incomes,
    });
  }

  /* ... use for step 4 ... */
  private createAssessmentForm(categories: IAssessmentCategoryDisplay[]): FormGroup {
    const assessmentForm = this.fb.group({});

    const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

    for (const category of sortedCategories) {
      const categoryForm = this.fb.group({});

      const sortedItems = [...category.items].sort((a, b) => a.displayOrder - b.displayOrder);

      for (const item of sortedItems) {
        categoryForm.addControl(
          item.itemCode,

          this.fb.group({
            itemId: this.fb.nonNullable.control(item.itemId),

            amount: this.fb.control<number | null>(null, {
              validators: [Validators.required, Validators.min(0)],
            }),

            remark: this.fb.control<string | null>(
              null,
              item.requireRemark ? [Validators.required] : [],
            ),
          }),
        );
      }

      assessmentForm.addControl(category.categoryCode, categoryForm);
    }

    return assessmentForm;
  }

  /* ... create form step 5 ... */
  private createStep5Form(reasons: IRestructureReasonDisplay[]): FormGroup {
    const reasonControls = reasons
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((reason) => {
        return this.fb.group({
          reasonCode: [reason.code, Validators.required],

          selected: [false],

          otherReason: [''],
        });
      });

    return this.fb.group({
      reasons: this.fb.array(reasonControls),
    });
  }

  get restructureReasonForms(): FormArray {
    return this.step5Form.get('reasons') as FormArray;
  }

  private setupRestructureReasonValidators(): void {
    this.restructureReasonForms.controls.forEach((control, index) => {
      const reason = this.restructureReasons()[index];

      const selectedControl = control.get('selected');

      const otherReasonControl = control.get('otherReason');

      if (!selectedControl || !otherReasonControl) {
        return;
      }

      selectedControl.valueChanges.subscribe((selected) => {
        if (selected && reason.requireRemark) {
          otherReasonControl.setValidators([Validators.required, Validators.maxLength(500)]);
        } else {
          otherReasonControl.clearValidators();

          otherReasonControl.setValue('', {
            emitEvent: false,
          });
        }

        otherReasonControl.updateValueAndValidity();
      });
    });
  }

  /* ... create form step 6 ... */
  private createStep6Form(attachmentTypes: IAttachmentTypeDisplay[]): FormGroup {
    const attachments = attachmentTypes.map((attachment) =>
      this.fb.group({
        attachmentCode: [attachment.attachmentCode, Validators.required],

        files: this.fb.control<File[] | null>(
          null,
          attachment.isRequired ? [Validators.required] : [],
        ),
      }),
    );

    return this.fb.group({
      attachments: this.fb.array(attachments),
    });
  }

  get attachmentForms(): FormArray {
    return this.step6Form.get('attachments') as FormArray;
  }

  // =========================================================
  // Load Master Data
  // =========================================================

  private loadMasterData(): void {
    this.isLoading.set(false);
    this.isLoaded.set(false);
    this.errorMessage.set(null);

    let apiCompleted = false;

    const loadingTimer = setTimeout(() => {
      if (!apiCompleted) {
        this.isLoading.set(true);
      }
    }, this.LOADING_DELAY);

    this.tdrAssessmentService.getMasterData().subscribe({
      next: (response) => {
        apiCompleted = true;

        clearTimeout(loadingTimer);

        // -------------------------------------------------
        // Save complete response
        // -------------------------------------------------

        this.masterData.set(response);

        // -------------------------------------------------
        // Motorcycle photo types
        // -------------------------------------------------

        const photoTypes = response.display?.motorcyclePhotoTypes ?? [];

        this.motorcyclePhotoTypesDisplay.set(photoTypes);

        // -------------------------------------------------
        // Create dynamic photo controls
        // -------------------------------------------------

        this.buildMotorcyclePhotoForms(photoTypes);

        // -------------------------------------------------
        // Create dynamic estimate income controls
        // -------------------------------------------------

        const step3Items = response.display.assessment[0].categories[0].items.sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        this.step3Fields.set(step3Items);

        this.step3Form = this.createStep3Form(step3Items);

        // Add Step 3 form into the main form
        this.step2Form.addControl('estimateIncome', this.step3Form);

        // -------------------------------------------------
        // Create dynamic estimate payment controls
        // -------------------------------------------------

        const assessments = response.display.assessment ?? [];

        const step4Categories = [...(assessments[1]?.categories ?? [])].sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        this.step4Fields.set(step4Categories);

        this.step4Form = this.createAssessmentForm(step4Categories);

        this.step2Form.addControl('estimatePayment', this.step4Form);

        // -------------------------------------------------
        // Restructure Reasons
        // -------------------------------------------------

        const restructureReasons = [...(response.display.restructureReasons ?? [])].sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        this.restructureReasons.set(restructureReasons);

        this.step5Form = this.createStep5Form(restructureReasons);

        this.step2Form.addControl('restructureReasons', this.step5Form);

        this.setupRestructureReasonValidators();

        // -------------------------------------------------
        // Attachment Types
        // -------------------------------------------------

        const attachmentTypes = [...(response.display?.attachmentTypes ?? [])].sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        this.attachmentTypesDisplay.set(attachmentTypes);

        this.step6Form = this.createStep6Form(attachmentTypes);

        this.step2Form.addControl('documentAttachments', this.step6Form);

        // -------------------------------------------------
        // Loading complete
        // -------------------------------------------------

        this.isLoading.set(false);
        this.isLoaded.set(true);
      },

      error: (error) => {
        apiCompleted = true;

        clearTimeout(loadingTimer);

        console.error('Failed to load master data', error);

        this.isLoading.set(false);

        this.isLoaded.set(false);

        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Master Data ได้ กรุณาลองใหม่อีกครั้ง');
      },
    });
  }

  // =========================================================
  // Tracks Forms
  // =========================================================
  private trackFormValidity(controlName: string, validitySignal: WritableSignal<boolean>): void {
    const control = this.step2Form.get(controlName);

    if (!control) {
      console.warn(`Cannot find form control: ${controlName}`);

      return;
    }

    // Initial value
    validitySignal.set(control.valid);

    // Future changes
    control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      validitySignal.set(control.valid);
    });
  }

  private setupStepValidityTracking(): void {
    this.trackFormValidity('customerInformation', this.customerValid);
    this.trackFormValidity('productInformation', this.loanValid);
    this.trackFormValidity('financialInformation', this.financialValid);
    this.trackFormValidity('documentInformation', this.documentValid);
  }

  // =========================================================
  // Tracks State
  // =========================================================
  onCustomerValidChange(valid: boolean): void {
    this.customerValid.set(valid);
  }

  // =========================================================
  // Build Dynamic Motorcycle Photo Forms
  // =========================================================

  private buildMotorcyclePhotoForms(photoTypes: IMotorcyclePhotoTypeDisplay[]): void {
    const photos = this.step2Form.get('productInformation.motorcyclePhotos') as FormArray;

    // Clear existing controls
    photos.clear();

    for (const photoType of photoTypes) {
      photos.push(
        this.fb.group({
          // Value from API
          photoType: [photoType.code, Validators.required],

          // Actual selected file
          file: [null, Validators.required],

          // File name for displaying in UI
          fileName: [''],
        }),
      );
    }
  }

  // =========================================================
  // Address Copy
  // =========================================================

  setupAddressCopyHandlers(): void {
    const customer = this.step2Form.get('customerInformation') as FormGroup;

    customer.get('registeredAddressSameAsIdCard')?.valueChanges.subscribe((checked) => {
      if (checked) {
        this.copyAddress(customer, 'idCardAddress', 'registeredAddress');

        customer.get('registeredAddress')?.disable();
      } else {
        customer.get('registeredAddress')?.enable();
      }
    });

    customer.get('currentAddressSameAsIdCard')?.valueChanges.subscribe((checked) => {
      if (checked) {
        this.copyAddress(customer, 'idCardAddress', 'currentAddress');

        customer.get('currentAddress')?.disable();
      } else {
        customer.get('currentAddress')?.enable();
      }
    });
  }

  private copyAddress(customer: FormGroup, source: string, target: string): void {
    const sourceGroup = customer.get(source);

    const targetGroup = customer.get(target);

    if (!sourceGroup || !targetGroup) {
      return;
    }

    targetGroup.patchValue(sourceGroup.getRawValue());
  }

  // =========================================================
  // Step Change
  // =========================================================

  onStepChange(event: StepChangeEvent): void {
    console.log('Step changed:', event);

    this.currentStepIndex.set(event.currentStepIndex);

    switch (event.currentStepIndex) {
      case 0:
        this.customerVisited.set(true);

        break;

      case 1:
        this.loanVisited.set(true);

        break;

      case 2:
        this.financialVisited.set(true);

        break;

      case 3:
        this.documentVisited.set(true);

        break;

      case 4:
        this.summaryVisited.set(true);

        break;
    }
  }

  // =========================================================
  // Submit
  // =========================================================

  submitStep2Form(): void {
    this.step2Form.markAllAsTouched();

    if (this.step2Form.invalid) {
      console.log('TDR Assessment form is invalid');

      console.log(this.step2Form);

      return;
    }

    console.log('TDR Assessment:', this.step2Form.getRawValue());
  }
}
