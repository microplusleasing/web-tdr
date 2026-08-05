import { Component } from '@angular/core';

import {
  CustomStepper,
  StepChangeEvent
} from '@/shared/components/custom-stepper/custom-stepper';

import { Step } from '@/shared/components/custom-stepper/step';

@Component({
  selector: 'app-tdr-assessment',
  standalone: true,
  imports: [
    CustomStepper,
    Step
  ],
  templateUrl: './tdr-assessment.html',
  styleUrl: './tdr-assessment.css',
})
export class TdrAssessment {

  currentStepIndex = 0;

  /**
   * These will eventually be replaced by
   * your actual Reactive Forms.
   */
  // customerValid = false;
  // customerVisited = false;

  // loanValid = false;
  // loanVisited = false;

  // financialValid = false;
  // financialVisited = false;

  // documentValid = false;
  // documentVisited = false;

  // summaryValid = false;
  // summaryVisited = false;

  customerValid = true;
  customerVisited = true;

  loanValid = true;
  loanVisited = true;

  financialValid = false;
  financialVisited = false;

  documentValid = false;
  documentVisited = false;

  summaryValid = false;
  summaryVisited = false;

  onStepChange(event: StepChangeEvent): void {

    console.log('Step changed:', event);

    switch (event.currentStepIndex) {

      case 0:
        this.customerVisited = true;
        break;

      case 1:
        this.loanVisited = true;
        break;

      case 2:
        this.financialVisited = true;
        break;

      case 3:
        this.documentVisited = true;
        break;

      case 4:
        this.summaryVisited = true;
        break;
    }
  }
}