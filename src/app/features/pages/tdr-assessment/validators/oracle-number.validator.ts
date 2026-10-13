import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** true when the value is something the user actually typed (0 counts as input). */
export function hasInputValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
}

export type OracleNumberErrorReason = 'invalid' | 'precision' | 'scale';

/**
 * Validates a value against Oracle NUMBER(precision, scale), non-negative.
 * NUMBER(14,2) => at most 12 integer digits and at most 2 decimal digits.
 *
 * - Empty value => valid (combine with Validators.required when needed)
 * - Negative values are NOT handled here (use Validators.min(0))
 * - Error: { oracleNumber: { reason, maxIntegerDigits, maxScale } }
 */
export function oracleNumberValidator(precision = 14, scale = 2): ValidatorFn {
  const maxIntegerDigits = precision - scale;
  const plainNumber = new RegExp(`^\\d{1,${maxIntegerDigits}}(\\.\\d{1,${scale}})?$`);

  const fail = (reason: OracleNumberErrorReason): ValidationErrors => ({
    oracleNumber: { reason, maxIntegerDigits, maxScale: scale },
  });

  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;

    if (!hasInputValue(raw)) return null;

    const num = typeof raw === 'number' ? raw : Number(String(raw).trim());

    if (!Number.isFinite(num)) return fail('invalid');

    if (num < 0) return null; // handled by Validators.min(0)

    const text = String(num);

    // String(1e21) -> "1e+21", String(1e-7) -> "1e-7"
    if (/e/i.test(text)) return fail(num >= 1 ? 'precision' : 'scale');

    if (plainNumber.test(text)) return null;

    const [intPart, decPart = ''] = text.split('.');

    if (intPart.length > maxIntegerDigits) return fail('precision');
    if (decPart.length > scale) return fail('scale');

    return fail('invalid');
  };
}

/**
 * For a control that has a sibling control in the same FormGroup:
 * this control is required ONLY when the sibling has a value.
 * Use it on both controls (amount <-> remark) to make them require each other, and
 * re-run `updateValueAndValidity({ emitEvent: false })` on the other one when one changes.
 */
export function requiredWhenSiblingFilled(siblingName = 'amount'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sibling = control.parent?.get(siblingName);

    if (!sibling || !hasInputValue(sibling.value)) return null;

    return hasInputValue(control.value) ? null : { required: true };
  };
}
