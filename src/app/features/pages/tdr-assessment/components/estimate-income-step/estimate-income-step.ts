import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
  SimpleChanges,
  isDevMode,
} from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { IAssessmentItemDisplay } from '../../interfaces/master-data.interface';

import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ZardButtonComponent } from '@/shared/components/button';

@Component({
  selector: 'app-estimate-income-step',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, ZardButtonComponent],
  templateUrl: './estimate-income-step.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateIncomeStep implements OnInit, OnChanges, OnDestroy {
  readonly showMock = isDevMode();
  @Input({ required: true }) form!: FormGroup;

  @Input({ required: true }) assessment: IAssessmentItemDisplay[] = [];

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
    if (!this.showMock) return;
    this.form.patchValue({
      incomes: {
        PRIMARY_INCOME: {
          amount: 25000,
          remark: null,
        },
        EXTRA_INCOME: {
          amount: 10000,
          remark: null,
        },
        BUSINESS_INCOME: {
          amount: 5000,
          remark: null,
        },
        INVESTMENT_INCOME: {
          amount: 2500,
          remark: null,
        },
        OTHER_INCOME: {
          amount: 500,
          remark: 'ขายกล้วยด่าง ',
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

  get incomes(): FormGroup {
    return this.form.get('incomes') as FormGroup;
  }

  getIncomeGroup(itemCode: string): FormGroup {
    return this.incomes.get(itemCode) as FormGroup;
  }

  getAmountControl(itemCode: string): FormControl<number> {
    return this.getIncomeGroup(itemCode).get('amount') as FormControl<number>;
  }

  getRemarkControl(itemCode: string): FormControl<string | null> {
    return this.getIncomeGroup(itemCode).get('remark') as FormControl<string | null>;
  }

  get totalIncome(): number {
    return this.assessment.reduce((total, item) => {
      const amount = this.getAmountControl(item.itemCode).value ?? 0;

      return total + amount;
    }, 0);
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }
}
