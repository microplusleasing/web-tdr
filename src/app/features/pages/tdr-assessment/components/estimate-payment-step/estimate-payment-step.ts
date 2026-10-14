import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  isDevMode,
} from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import {
  IAssessmentCategoryDisplay,
  IAssessmentItemDisplay,
} from '../../interfaces/master-data.interface';

import { ZardSeparatorComponent } from '@/shared/components/separator/separator.component';
import { ZardButtonComponent } from '@/shared/components/button';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-estimate-payment-step',

  standalone: true,

  imports: [ReactiveFormsModule, DecimalPipe, ZardSeparatorComponent, ZardButtonComponent],

  templateUrl: './estimate-payment-step.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimatePaymentStep implements OnInit, OnChanges, OnDestroy {
  readonly showMock = isDevMode();
  @Input({ required: true }) form!: FormGroup;

  @Input({ required: true }) categories: IAssessmentCategoryDisplay[] = [];

  private formSub?: Subscription;

  ngOnInit(): void {
    if (this.form) {
      this.formSub = this.form.valueChanges.subscribe(() => {
        this.logFormState();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    Object.keys(this.form.controls).forEach((fieldName) => {
      const control = this.form.get(fieldName);

      console.log(fieldName, {
        value: control?.value,
        valid: control?.valid,
        invalid: control?.invalid,
        status: control?.status,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty,
        disabled: control?.disabled,
        enabled: control?.enabled,
      });
    });
  }

  mockData() {
    // this.form.patchValue({
    //   incomes: {
    //     PRIMARY_INCOME: {
    //       amount: 25000,
    //       remark: null,
    //     },
    //     EXTRA_INCOME: {
    //       amount: 10000,
    //       remark: null,
    //     },
    //     BUSINESS_INCOME: {
    //       amount: 5000,
    //       remark: null,
    //     },
    //     INVESTMENT_INCOME: {
    //       amount: 2500,
    //       remark: null,
    //     },
    //     OTHER_INCOME: {
    //       amount: 500,
    //       remark: 'ขายกล้วยด่าง ',
    //     },
    //   },
    // });

    if (!this.showMock) return;
    this.form.patchValue({
      NECESSARY_EXPENSE: {
        EDUCATION_EXPENSE: {
          amount: 1000,
          remark: null,
        },
        FOOD_EXPENSE: {
          amount: 2000,
          remark: null,
        },
        HOUSING_EXPENSE: {
          amount: 3000,
          remark: null,
        },
        OTHER_EXPENSE_DESC: {
          amount: 4000,
          remark: 'ค่าเช่าบ้าน',
        },
        PERSONAL_FAMILY_EXPENSE: {
          amount: 5000,
          remark: null,
        },
        TRANSPORT_EXPENSE: {
          amount: 6000,
          remark: null,
        },
        UTILITIES_EXPENSE: {
          amount: 6000,
          remark: null,
        },
      },
      DEBT_OBLIGATION: {
        AUTO_LOAN_PAYMENT: {
          amount: 1000,
          remark: null,
        },
        CREDIT_CARD_PAYMENT: {
          amount: 2000,
          remark: null,
        },
        HOUSING_LOAN_PAYMENT: {
          amount: 3000,
          remark: null,
        },
        INFORMAL_LOAN_PAYMENT: {
          amount: 4000,
          remark: null,
        },
        OTHER_DEBT_DESC: {
          amount: 5000,
          remark: 'ค่าเทอมน้อง นศ',
        },
        PERSONAL_LOAN_PAYMENT: {
          amount: 6000,
          remark: null,
        },
      },
    });
  }

  private logFormState(): void {
    Object.keys(this.form.controls).forEach((fieldName) => {
      const control = this.form.get(fieldName);
      console.log(fieldName, {
        value: control?.value,
        valid: control?.valid,
        status: control?.status,
        touched: control?.touched,
        dirty: control?.dirty,
      });
    });
  }

  // =========================================================
  // Category Form
  // =========================================================

  getCategoryForm(categoryCode: string): FormGroup {
    return this.form.get(categoryCode) as FormGroup;
  }

  // =========================================================
  // Item Form
  // =========================================================

  getItemGroup(categoryCode: string, itemCode: string): FormGroup {
    return this.getCategoryForm(categoryCode).get(itemCode) as FormGroup;
  }

  // =========================================================
  // Amount Control
  // =========================================================

  getAmountControl(categoryCode: string, itemCode: string): FormControl<number | null> {
    return this.getItemGroup(categoryCode, itemCode).get('amount') as FormControl<number | null>;
  }

  // =========================================================
  // Remark Control
  // =========================================================

  getRemarkControl(categoryCode: string, itemCode: string): FormControl<string | null> {
    return this.getItemGroup(categoryCode, itemCode).get('remark') as FormControl<string | null>;
  }

  // =========================================================
  // Validation messages
  // =========================================================

  /** Error message (Thai) for the amount field, or null when it should not be shown. */
  getAmountErrorMessage(categoryCode: string, itemCode: string): string | null {
    const control = this.getAmountControl(categoryCode, itemCode);
    const remark = this.getRemarkControl(categoryCode, itemCode);

    if (!(control.touched || remark.touched) || !control.errors) return null;

    if (control.errors['required']) return 'กรุณาระบุจำนวนเงิน';
    if (control.errors['min']) return 'จำนวนเงินต้องไม่ติดลบ';

    const oracle = control.errors['oracleNumber'];

    if (oracle) {
      if (oracle.reason === 'precision') {
        return `จำนวนเงินต้องไม่เกิน ${oracle.maxIntegerDigits} หลักก่อนจุดทศนิยม`;
      }
      if (oracle.reason === 'scale') {
        return `ทศนิยมต้องไม่เกิน ${oracle.maxScale} ตำแหน่ง`;
      }
      return 'รูปแบบจำนวนเงินไม่ถูกต้อง';
    }

    return 'จำนวนเงินไม่ถูกต้อง';
  }

  /** Remark/amount errors are shown once either of the pair was touched. */
  showRemarkError(categoryCode: string, itemCode: string): boolean {
    const remark = this.getRemarkControl(categoryCode, itemCode);

    return (
      remark.invalid && (remark.touched || this.getAmountControl(categoryCode, itemCode).touched)
    );
  }

  // =========================================================
  // Category Total
  // =========================================================

  getCategoryTotal(category: IAssessmentCategoryDisplay): number {
    return category.items.reduce(
      (total, item) => {
        const amount = this.getAmountControl(category.categoryCode, item.itemCode).value ?? 0;

        return total + amount;
      },

      0,
    );
  }

  // =========================================================
  // Overall Total
  // =========================================================

  get totalPayment(): number {
    return this.categories.reduce(
      (total, category) => {
        return total + this.getCategoryTotal(category);
      },

      0,
    );
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }
}
