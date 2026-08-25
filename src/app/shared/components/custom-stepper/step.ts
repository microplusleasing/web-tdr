import { Component, TemplateRef, ViewChild, input } from '@angular/core';

@Component({
  selector: 'app-step',
  standalone: true,
  templateUrl: './step.html',
  styleUrl: './step.css',
})
export class Step {
  // Unique identifier for the step
  id = input.required<string>();

  // Text displayed in the step header
  label = input.required<string>();

  // Icon used by CustomStepper
  iconName = input('');

  // Whether to display the icon
  showIcon = input(false);

  // Whether this step is currently valid
  valid = input(false);

  // Whether this step has been visited
  visited = input(false);

  // Prevent navigation to this step
  disabled = input(false);

  /**
   * Template containing everything inside <app-step>.
   *
   * Example:
   *
   * <app-step>
   *   <app-customer-form />
   * </app-step>
   *
   * The content above becomes this TemplateRef.
   */
  @ViewChild('stepContent', { static: true })
  content!: TemplateRef<unknown>;
}
