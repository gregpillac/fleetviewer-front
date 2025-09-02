import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function addressGroupValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const line1 = control.get('line1')?.value;
        const line2 = control.get('line2')?.value;
        const city = control.get('city')?.value;
        const postalCode = control.get('postalCode')?.value;

        const hasSomething = !!(line1 || line2 || city || postalCode);
        if (!hasSomething) return null; // tout vide → pas d’erreur

        const errors: any = {};
        if (!line1) errors.line1 = true;
        if (!city) errors.city = true;
        if (!postalCode) errors.postalCode = true;

        return Object.keys(errors).length > 0 ? { addressIncomplete: errors } : null;
    };
}
