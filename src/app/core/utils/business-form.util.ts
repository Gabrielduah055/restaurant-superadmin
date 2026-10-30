import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function parseLineSeparatedValues(value: string): string[] {
  return [...new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))];
}

export const httpsUrlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  try {
    return new URL(String(control.value)).protocol === 'https:' ? null : { httpsUrl: true };
  } catch {
    return { httpsUrl: true };
  }
};

export function localPathValidator(requireProductId = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) return null;
    if (!value.startsWith('/') || value.startsWith('//')) return { localPath: true };
    return requireProductId && !value.includes('{productId}') ? { productIdPlaceholder: true } : null;
  };
}

export function originListValidator(control: AbstractControl): ValidationErrors | null {
  const values = parseLineSeparatedValues(String(control.value ?? ''));
  if (values.length > 20) return { maxItems: true };
  const invalid = values.some((value) => {
    try {
      const url = new URL(value);
      return !['http:', 'https:'].includes(url.protocol) || url.origin !== value.replace(/\/$/, '');
    } catch {
      return true;
    }
  });
  return invalid ? { invalidOrigin: true } : null;
}

export function hostnameListValidator(control: AbstractControl): ValidationErrors | null {
  const values = parseLineSeparatedValues(String(control.value ?? ''));
  if (!values.length) return { required: true };
  if (values.length > 20) return { maxItems: true };
  const hostnamePattern = /^(?=.{1,253}$)(?!-)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)*[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i;
  return values.some((value) => !hostnamePattern.test(value)) ? { invalidHostname: true } : null;
}
