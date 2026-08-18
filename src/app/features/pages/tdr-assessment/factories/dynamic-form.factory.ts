import {
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms';

import { DynamicFieldDefinition } from './../models/dynamic-field-definition.model';

export class DynamicFormFactory {

    static createForm(
        fields: DynamicFieldDefinition[]
    ): FormGroup {

        const controls: Record<string, FormControl> = {};

        for (const field of fields) {

            const validators = [];

            if (field.display_require === 'Y') {
                validators.push(Validators.required);
            }

            switch (field.data_type) {

                case 'V':

                    controls[field.fieldname] =
                        new FormControl<string>(
                            '',
                            {
                                nonNullable: true,
                                validators
                            }
                        );

                    break;

                case 'N':

                    controls[field.fieldname] =
                        new FormControl<number | null>(
                            null,
                            {
                                validators
                            }
                        );

                    break;

                case 'D':

                    controls[field.fieldname] =
                        new FormControl<Date | null>(
                            null,
                            {
                                validators
                            }
                        );

                    break;

                case 'B':

                    controls[field.fieldname] =
                        new FormControl<boolean>(
                            false,
                            {
                                nonNullable: true,
                                validators
                            }
                        );

                    break;
            }
        }

        return new FormGroup(controls);
    }
}