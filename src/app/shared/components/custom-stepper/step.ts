import {
  Component,
  TemplateRef,
  ViewChild,
  input
} from '@angular/core';

@Component({
  selector: 'app-step',
  standalone: true,
  templateUrl: './step.html',
  styleUrl: './step.css'
})
export class Step {

   id = input.required<string>();

  /**
   * Text displayed in the step header.
   */
  label = input.required<string>();

  /**
   * Icon name used by CustomStepper.
   */
  iconName = input('');

  /**
   * Whether this step should display an icon.
   */
  showIcon = input(false);

  /**
   * Whether the form/content of this step is valid.
   */
  valid = input(false);

  /**
   * Whether the user has visited this step.
   *
   * This is useful because an untouched required form
   * is technically invalid, but we may not want to
   * display it as an "invalid" step yet.
   */
  visited = input(false);

  /**
   * Prevent navigation to this step.
   */
  disabled = input(false);

  /**
   * Template containing the actual step content.
   */
  @ViewChild('stepContent', { static: true })
  content!: TemplateRef<unknown>;
}