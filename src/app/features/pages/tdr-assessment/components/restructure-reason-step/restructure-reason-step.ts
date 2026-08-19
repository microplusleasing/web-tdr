import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  IRestructureReasonDisplay,
} from '../../interfaces/master-data.interface';

import {
  ZardCheckboxComponent,
} from '@/shared/components/checkbox/checkbox.component';


@Component({
  selector: 'app-restructure-reason-step',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    ZardCheckboxComponent,
  ],

  templateUrl: './restructure-reason-step.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestructureReasonStep {

  // =========================================================
  // Form
  // =========================================================

  @Input({
    required: true,
  })
  form!: FormGroup;


  // =========================================================
  // Dynamic reasons
  // =========================================================

  @Input({
    required: true,
  })
  reasons: IRestructureReasonDisplay[] = [];


  // =========================================================
  // Reasons FormArray
  // =========================================================

  get reasonForms(): FormArray {

    return this.form.get(
      'reasons',
    ) as FormArray;

  }


  // =========================================================
  // Individual Reason FormGroup
  // =========================================================

  getReasonForm(
    index: number,
  ): FormGroup {

    return this.reasonForms.at(
      index,
    ) as FormGroup;

  }


  // =========================================================
  // Selected Control
  // =========================================================

  getSelectedControl(
    index: number,
  ): FormControl<boolean> {

    return this.getReasonForm(
      index,
    ).get(
      'selected',
    ) as FormControl<boolean>;

  }


  // =========================================================
  // Other Reason Control
  // =========================================================

  getOtherReasonControl(
    index: number,
  ): FormControl<string> {

    return this.getReasonForm(
      index,
    ).get(
      'otherReason',
    ) as FormControl<string>;

  }

}