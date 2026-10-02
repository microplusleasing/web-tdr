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

import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { IRestructureReasonDisplay } from '../../interfaces/master-data.interface';

import { ZardCheckboxComponent } from '@/shared/components/checkbox/checkbox.component';
import { ZardButtonComponent } from '@/shared/components/button';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-restructure-reason-step',

  standalone: true,

  imports: [ReactiveFormsModule, ZardCheckboxComponent, ZardButtonComponent],

  templateUrl: './restructure-reason-step.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestructureReasonStep implements OnInit, OnChanges, OnDestroy {
  readonly showMock = isDevMode();
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
    const reasons = this.form.get('reasons') as FormArray;

    reasons.controls.forEach((control) => {
      const reasonCode = control.get('reasonCode')?.value;

      if (reasonCode === 'R001') {
        control.patchValue({
          selected: true,
        });
      }

      if (reasonCode === 'R011') {
        control.patchValue({
          selected: true,
          otherReason: 'โดนฉ้อโกง',
        });
      }
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
  // Reasons FormArray
  // =========================================================

  get reasonForms(): FormArray {
    return this.form.get('reasons') as FormArray;
  }

  // =========================================================
  // Individual Reason FormGroup
  // =========================================================

  getReasonForm(index: number): FormGroup {
    return this.reasonForms.at(index) as FormGroup;
  }

  // =========================================================
  // Selected Control
  // =========================================================

  getSelectedControl(index: number): FormControl<boolean> {
    return this.getReasonForm(index).get('selected') as FormControl<boolean>;
  }

  // =========================================================
  // Other Reason Control
  // =========================================================

  getOtherReasonControl(index: number): FormControl<string> {
    return this.getReasonForm(index).get('otherReason') as FormControl<string>;
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }
}
