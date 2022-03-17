import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class RegisterValidator {
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) {
        console.error('Form controls cat not found in the form group.');
        return {
          controlNotFound: false,
        };
      }

      const error =
        control.value === matchingControl.value ? null : { noMatch: true };

      // 相関チェックした結果をフォームコントロールに紐づける
      matchingControl.setErrors(error);

      return error;
    };
  }
}
