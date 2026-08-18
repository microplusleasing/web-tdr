import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  IAssessmentItemDisplay,
} from '../../interfaces/master-data.interface';

import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-estimate-income-step',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe
  ],
  templateUrl: './estimate-income-step.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimateIncomeStep {

  @Input({
    required: true,
  })
  form!: FormGroup;

  @Input({
    required: true,
  })
  items: IAssessmentItemDisplay[] = [];

  get incomes(): FormGroup {
    return this.form.get(
      'incomes',
    ) as FormGroup;
  }

  getIncomeGroup(
    itemCode: string,
  ): FormGroup {
    return this.incomes.get(
      itemCode,
    ) as FormGroup;
  }

  getAmountControl(
    itemCode: string,
  ): FormControl<number> {
    return this.getIncomeGroup(
      itemCode,
    ).get(
      'amount',
    ) as FormControl<number>;
  }

  getRemarkControl(
    itemCode: string,
  ): FormControl<string | null> {
    return this.getIncomeGroup(
      itemCode,
    ).get(
      'remark',
    ) as FormControl<string | null>;
  }

  get totalIncome(): number {
    return this.items.reduce(
      (total, item) => {
        const amount =
          this.getAmountControl(
            item.itemCode,
          ).value ?? 0;

        return total + amount;
      },
      0,
    );
  }
}