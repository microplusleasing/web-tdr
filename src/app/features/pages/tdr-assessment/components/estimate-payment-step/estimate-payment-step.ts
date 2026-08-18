import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import {
  DecimalPipe,
} from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  IAssessmentCategoryDisplay,
  IAssessmentItemDisplay,
} from '../../interfaces/master-data.interface';

import {
  ZardSeparatorComponent
} from '@/shared/components/separator/separator.component';


@Component({
  selector: 'app-estimate-payment-step',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    ZardSeparatorComponent
  ],

  templateUrl: './estimate-payment-step.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstimatePaymentStep {

  @Input({
    required: true,
  })
  form!: FormGroup;


  @Input({
    required: true,
  })
  categories: IAssessmentCategoryDisplay[] = [];


  // =========================================================
  // Category Form
  // =========================================================

  getCategoryForm(
    categoryCode: string,
  ): FormGroup {

    return this.form.get(
      categoryCode,
    ) as FormGroup;
  }


  // =========================================================
  // Item Form
  // =========================================================

  getItemGroup(
    categoryCode: string,
    itemCode: string,
  ): FormGroup {

    return this.getCategoryForm(
      categoryCode,
    ).get(
      itemCode,
    ) as FormGroup;
  }


  // =========================================================
  // Amount Control
  // =========================================================

  getAmountControl(
    categoryCode: string,
    itemCode: string,
  ): FormControl<number | null> {

    return this.getItemGroup(
      categoryCode,
      itemCode,
    ).get(
      'amount',
    ) as FormControl<number | null>;
  }


  // =========================================================
  // Remark Control
  // =========================================================

  getRemarkControl(
    categoryCode: string,
    itemCode: string,
  ): FormControl<string | null> {

    return this.getItemGroup(
      categoryCode,
      itemCode,
    ).get(
      'remark',
    ) as FormControl<string | null>;
  }


  // =========================================================
  // Category Total
  // =========================================================

  getCategoryTotal(
    category: IAssessmentCategoryDisplay,
  ): number {

    return category.items.reduce(
      (total, item) => {

        const amount =
          this.getAmountControl(
            category.categoryCode,
            item.itemCode,
          ).value ?? 0;

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

        return total +
          this.getCategoryTotal(category);

      },

      0,
    );
  }

}