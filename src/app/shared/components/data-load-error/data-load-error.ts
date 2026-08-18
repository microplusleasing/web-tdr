import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';

import {
  NgIcon,
  provideIcons
} from '@ng-icons/core';

import {
  lucideCircleAlert
} from '@ng-icons/lucide';

import { ZardEmptyComponent } from '../empty';

@Component({
  selector: 'app-data-load-error',
  imports: [
    NgIcon,
    ZardEmptyComponent
  ],
  templateUrl: './data-load-error.html',
  styleUrl: './data-load-error.css',
})
export class DataLoadError {

  readonly errorMessage = input.required<string>();
}
