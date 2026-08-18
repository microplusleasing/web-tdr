import {
  Component,
  OnInit
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ZardInputComponent } from '@/shared/components/input';
import { ZardSelectImports } from '@/shared/components/select';
import { ZardCheckboxComponent } from '@/shared/components/checkbox';

@Component({
  selector: 'app-customer-information-step',
  imports: [
    ReactiveFormsModule,
    ZardInputComponent,
    ZardSelectImports,
    ZardCheckboxComponent
  ],
  templateUrl: './customer-information-step.html',
  styleUrl: './customer-information-step.css',
})
export class CustomerInformationStep implements OnInit {

  private readonly fb = new FormBuilder();

  // =========================================================
  // Form
  // =========================================================

  form!: FormGroup;


  // =========================================================
  // Master data / options
  // =========================================================

  titleOptions = [
    {
      value: 'mr',
      label: 'นาย'
    },
    {
      value: 'mrs',
      label: 'นาง'
    },
    {
      value: 'ms',
      label: 'นางสาว'
    }
  ];

  maritalStatusOptions = [
    {
      value: 'single',
      label: 'โสด'
    },
    {
      value: 'married',
      label: 'สมรส'
    },
    {
      value: 'divorced',
      label: 'หย่า'
    },
    {
      value: 'widowed',
      label: 'หม้าย'
    }
  ];


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {

    this.buildForm();

    this.setupAddressCopyHandlers();
  }


  // =========================================================
  // Build form
  // =========================================================

  private buildForm(): void {

    this.form = this.fb.group({

      // -------------------------------------------------------
      // Customer information
      // -------------------------------------------------------

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


      // -------------------------------------------------------
      // ID card address
      // -------------------------------------------------------

      idCardAddress: this.createAddressGroup(),


      // -------------------------------------------------------
      // Registered address
      // -------------------------------------------------------

      registeredAddressSameAsIdCard: [
        false
      ],

      registeredAddress: this.createAddressGroup(),


      // -------------------------------------------------------
      // Current address
      // -------------------------------------------------------

      currentAddressSameAsIdCard: [
        false
      ],

      currentAddress: this.createAddressGroup(),


      // -------------------------------------------------------
      // Contact information
      // -------------------------------------------------------

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


      // -------------------------------------------------------
      // Employment
      // -------------------------------------------------------

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


      // -------------------------------------------------------
      // Workplace address
      // -------------------------------------------------------

      // workplaceAddress: this.createAddressGroup(),


      // workplacePhone: [
      //   '',
      //   [
      //     Validators.required,
      //     Validators.pattern(/^0\d{9}$/)
      //   ]
      // ],

      // workplaceDescription: [
      //   '',
      //   Validators.required
      // ],
      workplaceAddress: this.fb.group({
        ...this.createAddressGroup().controls,

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
        ],
      }),


      // -------------------------------------------------------
      // Emergency / reference contacts
      // -------------------------------------------------------

      reference1: this.createReferenceGroup(
        true
      ),

      reference2: this.createReferenceGroup(
        false
      )

    });
  }


  // =========================================================
  // Address group
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
  // Reference contact group
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
  // Address copy
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
  // Form helpers
  // =========================================================

  control(
    path: string
  ): AbstractControl | null {

    return this.form.get(path);
  }


  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);

    return !!control &&
      control.invalid &&
      (control.touched || control.dirty);
  }


  // =========================================================
  // Submit
  // =========================================================

  submit(): void {

    this.form.markAllAsTouched();

    if (this.form.invalid) {

      console.log(
        'Form invalid',
        this.form
      );

      return;
    }

    console.log(
      'Step One:',
      this.form.getRawValue()
    );
  }

}
