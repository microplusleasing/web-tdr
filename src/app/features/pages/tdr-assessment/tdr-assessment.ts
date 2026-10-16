import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';

import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CustomerInformationStep } from './components/customer-information-step/customer-information-step';

import { ProductInformationStep } from './components/product-information-step/product-information-step';

import { EstimateIncomeStep } from './components/estimate-income-step/estimate-income-step';

import {
  oracleNumberValidator,
  requiredWhenSiblingFilled,
} from './validators/oracle-number.validator';

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
  IVehicleUserTypeDisplay,
  IModelsParameter,
  IBrandsParameter,
  ITitleParameter,
  IMarriedStatusParameter,
  ICurrentVehicleConditionTypeParameter,
} from './interfaces/master-data.interface';

import { ZardSpinnerComponent } from '@/shared/components/spinner';
import { ZardButtonComponent } from '@/shared/components/button';

import { DataLoadError } from '@/shared/components/data-load-error/data-load-error';
import {
  AddressForm,
  carUserAddress,
  WorkplaceAddressForm,
} from './interfaces/location-lookup-form-field.interface';

// inteface form typesafe
import {
  MotorcyclePhoto,
  Attachment,
  // AttachmentFile,
} from './interfaces/tdr-assessment-form.interface';
import { ZardDialogService } from '@/shared/components/dialog';

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
    ZardButtonComponent,
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
  private readonly dialogService = inject(ZardDialogService);
  private readonly LOADING_DELAY = 300;
  private readonly destroyRef = inject(DestroyRef);

  isSubmitting = signal(false);
  isSubmitted = signal(false);
  isSuccessSubmitted = signal(false);

  /**
   * True from the moment the save button is clicked (and after a successful save).
   * Drives: save button, every <app-step> `disabled`, Previous/Next buttons,
   * and the `locked` input of the step that is on screen.
   */
  readonly isLocked = computed(() => this.isSubmitting() || this.isSubmitted());

  /** Controls that were enabled before submit, so unlockForm() restores exactly that state. */
  private lockedControls: AbstractControl[] = [];

  // =========================================================
  // Main Form
  // =========================================================

  mainForm!: FormGroup;
  estimateIncomeForm!: FormGroup;
  estimatePaymentForm!: FormGroup;
  reStructureReasonForm!: FormGroup;
  documentAttachForm!: FormGroup;

  // =========================================================
  // Current step
  // =========================================================

  currentStepIndex = signal(0);

  // =========================================================
  // Master data
  // =========================================================

  masterData = signal<IMasterDataResponse | null>(null);
  titles = signal<ITitleParameter[]>([]);
  marriedStatus = signal<IMarriedStatusParameter[]>([]);
  locations = signal<ILocationParameter[]>([]);
  motorcyclePhotoTypes = signal<IMotorcyclePhotoTypeDisplay[]>([]);
  vehicleUserTypes = signal<IVehicleUserTypeDisplay[]>([]);
  brands = signal<IBrandsParameter[]>([]);
  models = signal<IModelsParameter[]>([]);
  currentVehicleConditionTypes = signal<ICurrentVehicleConditionTypeParameter[]>([]);
  assessmentIncome = signal<IAssessmentItemDisplay[]>([]);
  categories = signal<IAssessmentCategoryDisplay[]>([]);
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
  customerVisited = signal(true);

  // =========================================================
  // Step 2
  // =========================================================

  productInformationValid = signal(false);
  productInformationVisited = signal(false);

  // =========================================================
  // Step 3
  // =========================================================

  estimateIncomeValid = signal(false);
  estimateIncomeVisited = signal(false);

  // =========================================================
  // Step 4
  // =========================================================

  estimatePaymentValid = signal(false);
  estimatePaymentVisited = signal(false);

  // =========================================================
  // Step 5
  // =========================================================

  restuructureReasonValid = signal(false);
  restuructureReasonVisited = signal(false);

  // =========================================================
  // Step 6 Document-attach
  // =========================================================

  documentAttachValid = signal(false);
  documentAttachVisited = signal(false);

  // Drives the save button: true only when EVERY step is valid
  mainFormValid = signal(false);

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    // 1. Build the form first
    this.buildForm();

    this.mainForm.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.mainFormValid.set(this.mainForm.valid));

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
    this.mainForm = this.fb.group({
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

      contractNo: ['', [Validators.required, Validators.pattern(/^\d{15}$/)]],

      title: ['', Validators.required],

      firstName: ['', [Validators.required, Validators.maxLength(50)]],

      lastName: ['', [Validators.required, Validators.maxLength(50)]],

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

      numberOfChildren: [
        null,
        [Validators.required, Validators.min(0), Validators.max(99), Validators.pattern(/^\d+$/)],
      ],

      dependents: [
        null,
        [Validators.required, Validators.min(0), Validators.max(99), Validators.pattern(/^\d+$/)],
      ],

      // -----------------------------------------------------
      // Employment
      // -----------------------------------------------------

      occupation: ['', [Validators.required, Validators.maxLength(50)]],

      position: ['', [Validators.required, Validators.maxLength(50)]],

      jobDescription: ['', [Validators.required, Validators.maxLength(150)]],

      workplaceName: ['', [Validators.required, Validators.maxLength(150)]],

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

      houseNo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
      alley: this.fb.nonNullable.control('', [Validators.maxLength(50)]),
      soi: this.fb.nonNullable.control('', [Validators.maxLength(50)]),
      road: this.fb.nonNullable.control('', [Validators.maxLength(50)]),

      postalCode: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(/^\d{5}$/),
      ]),

      subDistrict: this.fb.nonNullable.control('', Validators.required),
      district: this.fb.nonNullable.control('', Validators.required),
      province: this.fb.nonNullable.control('', Validators.required),
      provCode: this.fb.nonNullable.control('', Validators.required),
    });
  }

  // =========================================================
  // car user Address Group
  // =========================================================

  private createCarUserAddressGroup(): FormGroup<carUserAddress> {
    return this.fb.group({
      // postalCodeLookup: this.fb.control<ILocationParameter | null>(null, Validators.required),
      postalCodeLookup: this.fb.nonNullable.control<string>('', Validators.required),

      postalCode: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(/^\d{5}$/),
      ]),

      subDistrict: this.fb.nonNullable.control('', Validators.required),
      district: this.fb.nonNullable.control('', Validators.required),
      province: this.fb.nonNullable.control('', Validators.required),
      provCode: this.fb.nonNullable.control('', Validators.required),
    });
  }

  // =========================================================
  // Workplace Address Group
  // =========================================================

  private createWorkplaceAddressGroup(): FormGroup<WorkplaceAddressForm> {
    return this.fb.group({
      postalCodeLookup: this.fb.nonNullable.control<string>('', Validators.required),

      houseNo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
      alley: this.fb.nonNullable.control('', [Validators.maxLength(50)]),
      soi: this.fb.nonNullable.control('', [Validators.maxLength(50)]),
      road: this.fb.nonNullable.control('', [Validators.maxLength(50)]),

      postalCode: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(/^\d{5}$/),
      ]),

      subDistrict: this.fb.nonNullable.control('', Validators.required),
      district: this.fb.nonNullable.control('', Validators.required),
      province: this.fb.nonNullable.control('', Validators.required),
      provCode: this.fb.nonNullable.control('', Validators.required),

      workplacePhone: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern('^[0-9]{9,10}$'),
        // Validators.pattern(/^0\d{9}$/),
      ]),

      workplaceDescription: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.maxLength(250),
      ]),
    });
  }

  // =========================================================
  // Reference Group Validator
  // =========================================================
  private referenceGroupValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const { name, phone, relationship } = control.value;

      const hasAnyValue = [name, phone, relationship].some(
        (value) => value != null && String(value).trim() !== '',
      );

      if (!hasAnyValue) {
        return null;
      }

      const missingFields = {
        name: !name?.trim(),
        phone: !phone?.trim(),
        relationship: !relationship?.trim(),
      };

      return Object.values(missingFields).some(Boolean)
        ? { referenceFieldsRequired: missingFields }
        : null;
    };
  }

  // =========================================================
  // Reference Group
  // =========================================================

  private createReferenceGroup(required: boolean): FormGroup {
    return this.fb.group(
      {
        /* ชื่อ-นามสกุล */
        name: [
          '',
          required ? [Validators.required, Validators.maxLength(60)] : [Validators.maxLength(60)],
        ],

        /* เบอร์โทรศัพท์ */
        phone: [
          '',
          required
            ? [Validators.required, Validators.pattern('^[0-9]{9,10}$')]
            : [Validators.pattern('^[0-9]{9,10}$')],
        ],

        /* ความสัมพันธ์ */
        relationship: [
          '',
          required ? [Validators.required, Validators.maxLength(60)] : [Validators.maxLength(60)],
        ],
      },
      {
        validators: required ? [] : [this.referenceGroupValidator()],
      },
    );
  }

  // =========================================================
  // Product Information
  // =========================================================

  private createProductInformationGroup(): FormGroup {
    return this.fb.group({
      brand: ['', Validators.required] /* maxLength(15) */,
      model: ['', Validators.required] /* maxLength(15) */,
      color: ['', [Validators.required, Validators.maxLength(20)]],
      registrationNo: ['', [Validators.required, Validators.maxLength(100)]],

      vehicleUserType: ['', Validators.required] /* maxLength(20) */,
      additionalInfo: [{ value: '', disabled: true }],

      currentUserName: [
        '',
        [Validators.required, Validators.maxLength(200)],
      ] /* ชื่อผู้ใช้รถปัจจุบัน */,
      relationship: [
        '',
        [Validators.required, Validators.maxLength(100)],
      ] /* ความสัมพันธ์กับผู้ขอสินเชื่อ */,
      currentUserPhone: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9,10}$')],
      ] /* เบอร์โทรผู้ใช้รถปัจจุบัน */,

      vehicleUsageAddress: [
        '',
        [Validators.required, Validators.maxLength(500)],
      ] /* สถานที่ใช้รถปัจจุบัน */,

      currentVehicleCondition: [
        '',
        [Validators.required],
      ] /* สภาพรถปัจจุบัน (Validators.maxLength(200)) */,

      carUserAddress: this.createCarUserAddressGroup(),
      currentMileage: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.max(9999999999),
          Validators.pattern(/^\d+$/),
        ],
      ],

      motorcyclePhoto: this.fb.array([]),
    });
  }

  // =========================================================
  // Motorcycle Photos FormArray
  // =========================================================

  get motorcyclePhoto(): FormArray {
    return this.mainForm.get('productInformation.motorcyclePhoto') as FormArray;
  }

  /**
   * Shared by step 3 (income) and step 4 (payment).
   * - Amount always fits Oracle NUMBER(14,2) and is >= 0.
   * - requireRemark = false -> amount is required, remark is not used.
   * - requireRemark = true  -> amount and remark are optional, but if EITHER one is
   *                            filled, the other becomes required (both ways).
   */
  private createAmountRemarkControls(item: IAssessmentItemDisplay): {
    amount: FormControl<number | null>;
    remark: FormControl<string | null>;
  } {
    const amountValidators: ValidatorFn[] = [
      item.requireRemark ? requiredWhenSiblingFilled('remark') : Validators.required,
      Validators.min(0),
      oracleNumberValidator(14, 2),
    ];

    const amount = this.fb.control<number | null>(null, amountValidators);

    const remark = this.fb.control<string | null>(
      null,
      item.requireRemark ? [requiredWhenSiblingFilled('amount')] : [],
    );

    if (item.requireRemark) {
      // Re-evaluate the other field whenever one changes.
      // emitEvent:false prevents the two subscriptions from triggering each other forever;
      // the field being edited still emits, so parent/step validity updates normally.
      amount.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        remark.updateValueAndValidity({ emitEvent: false });
      });

      remark.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        amount.updateValueAndValidity({ emitEvent: false });
      });
    }

    return { amount, remark };
  }

  /* create form on step 3 (estimate income) */

  private createestimateIncomeForm(items: IAssessmentItemDisplay[]): FormGroup {
    const incomes = this.fb.group({});

    const sortedItems = [...items].sort((a, b) => a.displayOrder - b.displayOrder);

    for (const item of sortedItems) {
      const { amount, remark } = this.createAmountRemarkControls(item);

      incomes.addControl(
        item.itemCode,
        this.fb.group({
          itemId: this.fb.nonNullable.control(item.itemId),
          amount,
          remark,
        }),
      );
    }

    return this.fb.group({
      incomes,
    });
  }

  /* create form on step 4 (estimate payment) */
  private createAssessmentForm(categories: IAssessmentCategoryDisplay[]): FormGroup {
    const assessmentForm = this.fb.group({});

    const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

    for (const category of sortedCategories) {
      const categoryForm = this.fb.group({});

      const sortedItems = [...category.items].sort((a, b) => a.displayOrder - b.displayOrder);

      for (const item of sortedItems) {
        const { amount, remark } = this.createAmountRemarkControls(item);

        categoryForm.addControl(
          item.itemCode,

          this.fb.group({
            itemId: this.fb.nonNullable.control(item.itemId),

            amount,

            remark,
          }),
        );
      }

      assessmentForm.addControl(category.categoryCode, categoryForm);
    }

    return assessmentForm;
  }

  /* ... create Restructure Reason Form ... */
  private createRestructureReasonForm(reasons: IRestructureReasonDisplay[]): FormGroup {
    const reasonControls = reasons
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((reason) => {
        return this.fb.group({
          reasonCode: [reason.code, Validators.required],
          selected: [false],
          otherReason: [''],
        });
      });

    const reasonsFormArray = this.fb.array(reasonControls, [this.atLeastOneSelectedValidator()]);

    return this.fb.group({
      reasons: reasonsFormArray,
    });
  }

  get restructureReasonForms(): FormArray {
    return this.reStructureReasonForm.get('reasons') as FormArray;
  }

  // =========================================================
  // Motorcycle Photos FormArray
  // =========================================================

  private atLeastOneSelectedValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;

      const hasSelected = formArray.controls.some(
        (control) => control.get('selected')?.value === true,
      );

      return hasSelected ? null : { atLeastOneRequired: true };
    };
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

        otherReasonControl.updateValueAndValidity({
          emitEvent: false,
        });

        // Recalculate the FormArray validation
        this.restructureReasonForms.updateValueAndValidity({
          emitEvent: false,
        });
      });
    });
  }

  /* ... create form step 6 ... */
  private createdocumentAttachForm(attachmentTypes: IAttachmentTypeDisplay[]): FormGroup {
    const attachments = attachmentTypes.map((attachment) =>
      this.fb.group({
        attachmentCode: [attachment.attachmentCode, Validators.required],
        attachmentTypeId: [attachment.attachmentTypeId, Validators.required],

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
    return this.documentAttachForm.get('attachments') as FormArray;
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
        // Create dynamic photo controls
        // -------------------------------------------------
        const titles = response.parameters?.titles ?? [];
        const marriedStatus = response.parameters?.marriedStatus ?? [];
        const locations = response.parameters?.locations ?? [];
        const photoTypes = response.display?.motorcyclePhotoTypes ?? [];
        const vehicleUserTypes = response.display?.vehicleUserTypes ?? [];
        const brands = response.parameters.brands ?? [];
        const models = response.parameters.models ?? [];
        const currentVehicleConditionTypes = response.parameters.currentVehicleConditionTypes ?? [];

        this.titles.set(titles);
        this.marriedStatus.set(marriedStatus);
        this.locations.set(locations);
        this.motorcyclePhotoTypes.set(photoTypes);
        this.vehicleUserTypes.set(vehicleUserTypes);
        this.brands.set(brands);
        this.models.set(models);
        this.currentVehicleConditionTypes.set(currentVehicleConditionTypes);

        this.buildMotorcyclePhotoForms(photoTypes);

        // -------------------------------------------------
        // Create dynamic estimate income controls
        // -------------------------------------------------

        const assessmentIncomeItems = response.display.assessment[0].categories[0].items.sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        this.assessmentIncome.set(assessmentIncomeItems);

        this.estimateIncomeForm = this.createestimateIncomeForm(assessmentIncomeItems);

        // Add Step 3 form into the main form
        this.mainForm.addControl('estimateIncome', this.estimateIncomeForm);

        this.trackFormValidity('estimateIncome', this.estimateIncomeValid);

        // -------------------------------------------------
        // Create dynamic estimate payment controls
        // -------------------------------------------------

        const assessments = response.display.assessment ?? [];

        const step4Categories = [...(assessments[1]?.categories ?? [])].sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        this.categories.set(step4Categories);

        this.estimatePaymentForm = this.createAssessmentForm(step4Categories);

        this.mainForm.addControl('estimatePayment', this.estimatePaymentForm);

        this.trackFormValidity('estimatePayment', this.estimatePaymentValid);

        // -------------------------------------------------
        // Restructure Reasons
        // -------------------------------------------------

        const restructureReasons = [...(response.display.restructureReasons ?? [])].sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        this.restructureReasons.set(restructureReasons);

        this.reStructureReasonForm = this.createRestructureReasonForm(restructureReasons);

        this.mainForm.addControl('restructureReason', this.reStructureReasonForm);

        this.setupRestructureReasonValidators();

        this.trackFormValidity('restructureReason', this.restuructureReasonValid);

        // -------------------------------------------------
        // Attachment Types
        // -------------------------------------------------

        const attachmentTypes = [...(response.display?.attachmentTypes ?? [])].sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );

        this.attachmentTypesDisplay.set(attachmentTypes);

        this.documentAttachForm = this.createdocumentAttachForm(attachmentTypes);

        this.mainForm.addControl('documentAttachments', this.documentAttachForm);

        this.trackFormValidity('documentAttachments', this.documentAttachValid);

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
    const control = this.mainForm.get(controlName);

    if (!control) {
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
    this.trackFormValidity('productInformation', this.productInformationValid);
    // this.trackFormValidity('estimateIncome', this.estimateIncomeValid);
    // this.trackFormValidity('documentInformation', this.estimatePaymentValid);
  }

  // =========================================================
  // Tracks State
  // =========================================================
  // onCustomerValidChange(valid: boolean): void {
  //   this.customerValid.set(valid);
  // }

  // =========================================================
  // Build Dynamic Motorcycle Photo Forms
  // =========================================================

  private buildMotorcyclePhotoForms(photoTypes: IMotorcyclePhotoTypeDisplay[]): void {
    const photos = this.mainForm.get('productInformation.motorcyclePhoto') as FormArray;

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
    const customer = this.mainForm.get('customerInformation') as FormGroup;

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
        this.productInformationVisited.set(true);

        break;

      case 2:
        this.estimateIncomeVisited.set(true);

        break;

      case 3:
        this.estimatePaymentVisited.set(true);

        break;

      case 4:
        this.restuructureReasonVisited.set(true);

        break;
    }
  }

  // =========================================================
  // Submit
  // =========================================================

  submitmainForm(): void {
    // Block double click / re-entry
    if (this.isSubmitting() || this.isSubmitted()) {
      return;
    }

    this.mainForm.markAllAsTouched();

    if (this.mainForm.invalid) {
      console.log('TDR Assessment form is invalid');
      console.log(this.mainForm);
      return;
    }

    // Disable the button + steps + form immediately (before any heavy work / request)
    this.isSubmitting.set(true);
    this.lockForm();

    const value = this.mainForm.getRawValue();

    const formData = new FormData();

    formData.append(
      'data',
      JSON.stringify({
        ...value,
        productInformation: {
          ...value.productInformation,
          motorcyclePhoto: value.productInformation.motorcyclePhoto.map(
            (photo: MotorcyclePhoto) => ({
              photoType: photo.photoType,
              fileName: photo.fileName,
            }),
          ),
          documentAttachments: value.documentAttachments.attachments.map(
            (attachment: Attachment) => ({
              attachmentTypeId: attachment.attachmentTypeId,
              fileName: attachment.fileName,
            }),
          ),
        },
      }),
    );

    value.productInformation.motorcyclePhoto.forEach((photo: MotorcyclePhoto) => {
      if (photo.file instanceof File) {
        const extension = photo.file.name.split('.').pop()?.toLowerCase() ?? '';

        const fileName = `${photo.photoType}.${extension}`;

        formData.append('motorcyclePhoto', photo.file, fileName);
      }
    });

    value.documentAttachments.attachments.forEach((attachment: Attachment) => {
      if (!attachment.files || attachment.files.length === 0) {
        return;
      }

      const file = attachment.files[0];

      if (!(file instanceof File)) {
        return;
      }

      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

      const fileName = `${attachment.attachmentTypeId}.${extension}`;

      formData.append('documentAttach', file, fileName);
    });

    this.tdrAssessmentService
      .createAssessment(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('TDR Assessment created:', response);
          this.isSubmitting.set(false);
          this.isSubmitted.set(true); // hides the steps (see template)
          this.isSuccessSubmitted.set(true); // template shows the success card
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error) => {
          console.error('Create TDR Assessment failed:', error);
          this.isSubmitting.set(false); // allow retry (steps + button unlock via isLocked)
          this.unlockForm();

          this.dialogService.create({
            zTitle: 'เกิดข้อผิดพลาด',
            zDescription: 'ไม่สามารถส่งใบคำขอได้ กรุณาลองใหม่อีกครั้ง',
            zOkText: 'ตกลง',
            zCancelText: null,
          });
        },
      });
  }

  // =========================================================
  // Lock / unlock form while saving
  // =========================================================

  /**
   * Disable every control that is currently enabled.
   *
   * Why leaf controls instead of mainForm.disable():
   *  - mainForm.enable() on error would also enable controls that were disabled on purpose
   *    (e.g. productInformation.additionalInfo, or registered/current address when
   *    "same as ID card" is ticked). Remembering only the enabled leaves restores the exact state.
   *
   * Why emitEvent:false:
   *  - A disabled group has status DISABLED (valid === false). Emitting would flip the
   *    step/main valid signals to false, hide the save button (@if documentAttachValid())
   *    and the button would flash "disabled" for the wrong reason.
   *  - Native inputs / ControlValueAccessors still get disabled (setDisabledState runs
   *    regardless of emitEvent). getRawValue() still returns disabled values for the payload.
   */
  private lockForm(): void {
    this.lockedControls = [];

    const collect = (control: AbstractControl): void => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach(collect);
      } else if (control instanceof FormArray) {
        control.controls.forEach(collect);
      } else if (control.enabled) {
        this.lockedControls.push(control);
      }
    };

    collect(this.mainForm);

    this.lockedControls.forEach((control) => control.disable({ emitEvent: false }));
  }

  /** Re-enable only the controls lockForm() disabled (used when the request fails). */
  private unlockForm(): void {
    this.lockedControls.forEach((control) => control.enable({ emitEvent: false }));

    this.lockedControls = [];
  }

  /** Success card -> start a fresh form (reloads the page so every step is reset) */
  // startNewAssessment(): void {
  //   window.location.reload();
  // }
}
