import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * Si l'un des champs (line1, city, postalCode) est rempli,
 * alors les trois deviennent obligatoires. line2 est ignoré.
 * Ajoute l'erreur 'requiredIfStarted' sur les champs manquants,
 * et 'addressIncomplete' au niveau du groupe.
 */
export function addressValidator(
    fields = { line1: 'line1', city: 'city', postalCode: 'postalCode' }
): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const group = control as FormGroup;
        const get = (n: string) => (group.get(n)?.value ?? '').toString().trim();

        const line1 = get(fields.line1);
        const city = get(fields.city);
        const postalCode = get(fields.postalCode);

        const started = !!(line1 || city || postalCode);
        const complete = !!(line1 && city && postalCode);

        const toggleErr = (name: string, on: boolean) => {
            const c = group.get(name);
            if (!c) return;
            const errs = { ...(c.errors || {}) };
            if (on) errs['requiredIfStarted'] = true;
            else delete errs['requiredIfStarted'];
            c.setErrors(Object.keys(errs).length ? errs : null);
        };

        if (!started) {
            toggleErr(fields.line1, false);
            toggleErr(fields.city, false);
            toggleErr(fields.postalCode, false);
            return null;
        }

        toggleErr(fields.line1, !line1);
        toggleErr(fields.city, !city);
        toggleErr(fields.postalCode, !postalCode);

        return complete ? null : { addressIncomplete: true };
    };
}
