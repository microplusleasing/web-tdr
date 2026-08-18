import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  CustomerInformationStep
} from './components/customer-information-step/customer-information-step';

import {
  ProductInformationStep
} from './components/product-information-step/product-information-step';

import {
  CustomStepper,
  StepChangeEvent
} from '@/shared/components/custom-stepper/custom-stepper';

import {
  Step
} from '@/shared/components/custom-stepper/step';

import {
  TdrAssessmentService
} from './services/tdr-assessment.service';

import {
  IMasterDataResponse,
  IMotorcyclePhotoTypeDisplay
} from './interfaces/master-data.interface';

import {
  ZardSpinnerComponent
} from '@/shared/components/spinner';

import {
  DataLoadError
} from '@/shared/components/data-load-error/data-load-error';


@Component({
  selector: 'app-tdr-assessment',

  standalone: true,

  imports: [
    ReactiveFormsModule,

    CustomStepper,
    Step,

    CustomerInformationStep,
    ProductInformationStep,

    ZardSpinnerComponent,
    DataLoadError
  ],

  templateUrl: './tdr-assessment.html',

  styleUrl: './tdr-assessment.css'
})
export class TdrAssessment implements OnInit {

  // =========================================================
  // Dependencies
  // =========================================================

  private readonly fb =
    inject(FormBuilder);

  private readonly tdrAssessmentService =
    inject(TdrAssessmentService);


  private readonly LOADING_DELAY = 300;


  // =========================================================
  // Main Form
  // =========================================================

  form!: FormGroup;


  // =========================================================
  // Current step
  // =========================================================

  currentStepIndex =
    signal(0);


  // =========================================================
  // Master data
  // =========================================================

  masterData =
    signal<IMasterDataResponse | null>(null);


  motorcyclePhotoTypesDisplay =
    signal<IMotorcyclePhotoTypeDisplay[]>([]);


  // =========================================================
  // Loading / Error
  // =========================================================

  isLoading =
    signal(false);

  isLoaded =
    signal(false);

  errorMessage =
    signal<string | null>(null);


  // =========================================================
  // Step states
  // =========================================================

  customerValid = true;
  customerVisited = true;

  loanValid = false;
  loanVisited = false;

  financialValid = false;
  financialVisited = false;

  documentValid = false;
  documentVisited = false;

  summaryValid = false;
  summaryVisited = false;


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {

    // IMPORTANT:
    // Build the form before loading API data.

    this.buildForm();

    this.loadMasterData();

  }


  // =========================================================
  // Build Main Form
  // =========================================================

  private buildForm(): void {

    this.form = this.fb.group({

      // =====================================================
      // STEP 1
      // Customer Information
      // =====================================================

      customerInformation:
        this.createCustomerInformationGroup(),


      // =====================================================
      // STEP 2
      // Product Information
      // =====================================================

      productInformation:
        this.createProductInformationGroup()

    });

  }


  // =========================================================
  // Customer Information
  // =========================================================

  private createCustomerInformationGroup(): FormGroup {

    return this.fb.group({

      // -----------------------------------------------------
      // Customer information
      // -----------------------------------------------------

      contractNo: [
        '',
        Validators.required
      ],

      title: [
        '',
        Validators.required
      ],

      firstName: [
        '',
        Validators.required
      ],

      lastName: [
        '',
        Validators.required
      ],

      citizenId: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{13}$/)
        ]
      ],


      // -----------------------------------------------------
      // ID Card Address
      // -----------------------------------------------------

      idCardAddress:
        this.createAddressGroup(),


      // -----------------------------------------------------
      // Registered Address
      // -----------------------------------------------------

      registeredAddressSameAsIdCard: [
        false
      ],

      registeredAddress:
        this.createAddressGroup(),


      // -----------------------------------------------------
      // Current Address
      // -----------------------------------------------------

      currentAddressSameAsIdCard: [
        false
      ],

      currentAddress:
        this.createAddressGroup(),


      // -----------------------------------------------------
      // Contact
      // -----------------------------------------------------

      phoneNo: [
        '',
        [
          Validators.required,
          Validators.pattern(/^0\d{9}$/)
        ]
      ],

      maritalStatus: [
        '',
        Validators.required
      ],

      numberOfChildren: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      dependents: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],


      // -----------------------------------------------------
      // Employment
      // -----------------------------------------------------

      occupation: [
        '',
        Validators.required
      ],

      position: [
        '',
        Validators.required
      ],

      jobDescription: [
        '',
        Validators.required
      ],

      workplaceName: [
        '',
        Validators.required
      ],


      // -----------------------------------------------------
      // Workplace Address
      // -----------------------------------------------------

      workplaceAddress:
        this.createWorkplaceAddressGroup(),


      // -----------------------------------------------------
      // References
      // -----------------------------------------------------

      reference1:
        this.createReferenceGroup(true),

      reference2:
        this.createReferenceGroup(false)

    });

  }


  // =========================================================
  // Address Group
  // =========================================================

  private createAddressGroup(): FormGroup {

    return this.fb.group({

      houseNo: [
        '',
        Validators.required
      ],

      alley: [
        '',
        Validators.required
      ],

      soi: [
        '',
        Validators.required
      ],

      road: [
        '',
        Validators.required
      ],

      postalCode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{5}$/)
        ]
      ],

      subDistrict: [
        ''
      ],

      district: [
        ''
      ],

      province: [
        ''
      ]

    });

  }


  // =========================================================
  // Workplace Address Group
  // =========================================================

  private createWorkplaceAddressGroup(): FormGroup {

    return this.fb.group({

      houseNo: [
        '',
        Validators.required
      ],

      alley: [
        '',
        Validators.required
      ],

      soi: [
        '',
        Validators.required
      ],

      road: [
        '',
        Validators.required
      ],

      postalCode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{5}$/)
        ]
      ],

      subDistrict: [
        ''
      ],

      district: [
        ''
      ],

      province: [
        ''
      ],

      workplacePhone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^0\d{9}$/)
        ]
      ],

      workplaceDescription: [
        '',
        Validators.required
      ]

    });

  }


  // =========================================================
  // Reference Group
  // =========================================================

  private createReferenceGroup(
    required: boolean
  ): FormGroup {

    return this.fb.group({

      name: [
        '',
        required
          ? Validators.required
          : []
      ],

      phone: [
        '',
        required
          ? [
            Validators.required,
            Validators.pattern(/^0\d{9}$/)
          ]
          : []
      ],

      relationship: [
        '',
        required
          ? Validators.required
          : []
      ]

    });

  }


  // =========================================================
  // Product Information
  // =========================================================

  private createProductInformationGroup(): FormGroup {

    return this.fb.group({

      brand: [
        '',
        Validators.required
      ],

      model: [
        '',
        Validators.required
      ],

      color: [
        '',
        Validators.required
      ],

      registrationNo: [
        '',
        Validators.required
      ],

      engineNo: [
        '',
        Validators.required
      ],

      chassisNo: [
        '',
        Validators.required
      ],


      // Dynamic motorcycle photo controls
      motorcyclePhotos:
        this.fb.array([])

    });

  }


  // =========================================================
  // Motorcycle Photos FormArray
  // =========================================================

  get motorcyclePhotos(): FormArray {

    return this.form.get(
      'productInformation.motorcyclePhotos'
    ) as FormArray;

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


    this.tdrAssessmentService
      .getMasterData()
      .subscribe({

        next: (response) => {

          apiCompleted = true;

          clearTimeout(loadingTimer);


          console.log(
            'Master Data:',
            response
          );


          // -------------------------------------------------
          // Save complete response
          // -------------------------------------------------

          this.masterData.set(
            response
          );


          // -------------------------------------------------
          // Motorcycle photo types
          // -------------------------------------------------

          const photoTypes =
            response.display
              ?.motorcyclePhotoTypes ?? [];


          this.motorcyclePhotoTypesDisplay.set(
            photoTypes
          );


          // -------------------------------------------------
          // Create dynamic photo controls
          // -------------------------------------------------

          this.buildMotorcyclePhotoForms(
            photoTypes
          );


          // -------------------------------------------------
          // Loading complete
          // -------------------------------------------------

          this.isLoading.set(false);
          this.isLoaded.set(true);

        },


        error: (error) => {

          apiCompleted = true;

          clearTimeout(loadingTimer);


          console.error(
            'Failed to load master data',
            error
          );


          this.isLoading.set(false);

          this.isLoaded.set(false);


          this.errorMessage.set(
            'ไม่สามารถโหลดข้อมูล Master Data ได้ กรุณาลองใหม่อีกครั้ง'
          );

        }

      });

  }


  // =========================================================
  // Build Dynamic Motorcycle Photo Forms
  // =========================================================

  private buildMotorcyclePhotoForms(
    photoTypes: IMotorcyclePhotoTypeDisplay[]
  ): void {

    const photos =
      this.form.get(
        'productInformation.motorcyclePhotos'
      ) as FormArray;


    // Clear existing controls
    photos.clear();


    for (
      const photoType of photoTypes
    ) {

      photos.push(

        this.fb.group({

          // Value from API
          photoType: [
            photoType.code,
            Validators.required
          ],

          // Actual selected file
          file: [
            null,
            Validators.required
          ],

          // File name for displaying in UI
          fileName: [
            ''
          ]

        })

      );

    }


    console.log(
      'Motorcycle photo forms:',
      photos.getRawValue()
    );

  }


  // =========================================================
  // Address Copy
  // =========================================================

  setupAddressCopyHandlers(): void {

    const customer =
      this.form.get(
        'customerInformation'
      ) as FormGroup;


    customer
      .get(
        'registeredAddressSameAsIdCard'
      )
      ?.valueChanges
      .subscribe((checked) => {

        if (checked) {

          this.copyAddress(
            customer,
            'idCardAddress',
            'registeredAddress'
          );


          customer
            .get('registeredAddress')
            ?.disable();

        } else {

          customer
            .get('registeredAddress')
            ?.enable();

        }

      });


    customer
      .get(
        'currentAddressSameAsIdCard'
      )
      ?.valueChanges
      .subscribe((checked) => {

        if (checked) {

          this.copyAddress(
            customer,
            'idCardAddress',
            'currentAddress'
          );


          customer
            .get('currentAddress')
            ?.disable();

        } else {

          customer
            .get('currentAddress')
            ?.enable();

        }

      });

  }


  private copyAddress(
    customer: FormGroup,
    source: string,
    target: string
  ): void {

    const sourceGroup =
      customer.get(source);

    const targetGroup =
      customer.get(target);


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
  // Step Change
  // =========================================================

  onStepChange(
    event: StepChangeEvent
  ): void {

    console.log(
      'Step changed:',
      event
    );


    this.currentStepIndex.set(
      event.currentStepIndex
    );


    switch (
      event.currentStepIndex
    ) {

      case 0:

        this.customerVisited = true;

        break;


      case 1:

        this.loanVisited = true;

        break;


      case 2:

        this.financialVisited = true;

        break;


      case 3:

        this.documentVisited = true;

        break;


      case 4:

        this.summaryVisited = true;

        break;

    }

  }


  // =========================================================
  // Submit
  // =========================================================

  submit(): void {

    this.form.markAllAsTouched();


    if (this.form.invalid) {

      console.log(
        'TDR Assessment form is invalid'
      );

      console.log(
        this.form
      );

      return;

    }


    console.log(
      'TDR Assessment:',
      this.form.getRawValue()
    );

  }

}