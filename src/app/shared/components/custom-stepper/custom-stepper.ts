import {
  AfterContentInit,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Step } from './step';
import { ICON_MAP } from '@/shared/constants/icon-map';
import { ZardButtonComponent } from '../button';
import { ZardPopoverImports } from '../popover';

export type HeaderStyle = 'under' | 'behind' | 'front' | 'top';

export interface StepChangeEvent {
  previousStepIndex: number;
  currentStepIndex: number;

  previousStepName?: string;
  currentStepName?: string;
}

@Component({
  selector: 'app-custom-stepper',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, ZardPopoverImports],
  templateUrl: './custom-stepper.html',
  styleUrl: './custom-stepper.css',
})
export class CustomStepper implements AfterContentInit, OnDestroy {
  // =========================================================
  // Compact label mode
  // =========================================================

  isCompactMode = false;

  private readonly compactBreakpoint = 1024;
  private readonly compactStepThreshold = 5;

  private updateCompactMode(): void {
    this.isCompactMode =
      window.innerWidth <= this.compactBreakpoint &&
      this.stepsArray.length > this.compactStepThreshold;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateCompactMode();

    // Recalculate sticky header height
    setTimeout(() => {
      this.captureStickyHeight();
    });
  }

  private readonly destroyRef = inject(DestroyRef);

  // =========================================================
  // Step collection
  // =========================================================

  @ContentChildren(Step)
  steps!: QueryList<Step>;

  stepsArray: Step[] = [];

  // =========================================================
  // Current step
  // =========================================================

  @Input()
  currentStepIndex = 0;

  @Output()
  currentStepIndexChange = new EventEmitter<number>();

  @Output()
  stepIndexChange = new EventEmitter<StepChangeEvent>();

  // =========================================================
  // Navigation labels
  // =========================================================

  @Input()
  previousLabel = 'Previous';

  @Input()
  nextLabel = 'Next';

  // =========================================================
  // Header configuration
  // =========================================================

  @Input()
  isHideHeader = false;

  @Input()
  headerStyle: HeaderStyle = 'under';

  // =========================================================
  // Step colors
  // =========================================================

  @Input()
  stepDefaultColor = '#d1d5db';

  @Input()
  stepValidColor = '#374151';

  @Input()
  stepInvalidColor = '#374151';

  @Input()
  stepCurrentColor = '#000000';

  // =========================================================
  // Sticky header
  // =========================================================

  isSticky = false;

  stickyThreshold = 100;

  stickyHeaderHeight = 0;

  private isTransitioning = false;

  @ViewChild('stickyHeader', { read: ElementRef })
  stickyHeaderRef?: ElementRef;

  @ViewChild('stickyHeaderMobile', { read: ElementRef })
  stickyHeaderMobileRef?: ElementRef;

  // =========================================================
  // Lifecycle
  // =========================================================

  ngAfterContentInit(): void {
    this.updateStepsArray();

    this.steps.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateStepsArray();
    });

    setTimeout(() => {
      this.captureStickyHeight();
    });
  }

  ngOnDestroy(): void {
    // takeUntilDestroyed() handles subscriptions.
  }

  // =========================================================
  // Scroll / sticky
  // =========================================================

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isTransitioning) {
      return;
    }

    this.handleStickyState();
  }

  private handleStickyState(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    const stickThreshold = this.stickyThreshold;
    const unstickThreshold = this.stickyThreshold - 20;

    let shouldBeSticky: boolean;

    if (this.isSticky) {
      shouldBeSticky = currentScroll > unstickThreshold;
    } else {
      shouldBeSticky = currentScroll > stickThreshold;
    }

    if (this.isSticky !== shouldBeSticky) {
      if (!this.isSticky) {
        this.captureStickyHeight();
      }

      this.isTransitioning = true;
      this.isSticky = shouldBeSticky;

      setTimeout(() => {
        this.isTransitioning = false;
      }, 100);
    }
  }

  private captureStickyHeight(): void {
    const desktopHeader = this.stickyHeaderRef?.nativeElement;
    const mobileHeader = this.stickyHeaderMobileRef?.nativeElement;

    if (desktopHeader && window.innerWidth >= 640) {
      this.stickyHeaderHeight = desktopHeader.offsetHeight;
    } else if (mobileHeader && window.innerWidth < 640) {
      this.stickyHeaderHeight = mobileHeader.offsetHeight;
    }
  }

  // =========================================================
  // Step helpers
  // =========================================================

  private updateStepsArray(): void {
    this.stepsArray = this.steps?.toArray() ?? [];

    this.updateCompactMode();

    // Make sure current index is still valid.
    if (this.currentStepIndex >= this.stepsArray.length && this.stepsArray.length > 0) {
      this.currentStepIndex = this.stepsArray.length - 1;
    }
  }

  getCurrentStep(): Step | null {
    return this.stepsArray[this.currentStepIndex] ?? null;
  }

  // Keep this because existing code may use it.
  getcurrentStepIndex(): Step | null {
    return this.getCurrentStep();
  }

  // =========================================================
  // Navigation state
  // =========================================================

  isFirstStep(): boolean {
    return this.currentStepIndex <= 0;
  }

  isLastStep(): boolean {
    return this.stepsArray.length === 0 || this.currentStepIndex >= this.stepsArray.length - 1;
  }

  /**
   * Whether the current step can move forward.
   */
  canGoNext(): boolean {
    const currentStep = this.getCurrentStep();

    if (!currentStep) {
      return false;
    }

    // Already at last step
    if (this.currentStepIndex >= this.stepsArray.length - 1) {
      return false;
    }

    // Current step is disabled
    if (currentStep.disabled()) {
      return false;
    }

    // Current step must be valid
    if (!currentStep.valid()) {
      return false;
    }

    return true;
  }

  /**
   * Whether Previous button can be clicked.
   */
  canGoPrevious(): boolean {
    if (this.isFirstStep()) {
      return false;
    }

    const previousStep = this.stepsArray[this.currentStepIndex - 1];

    return !!previousStep && !previousStep.disabled();
  }

  // =========================================================
  // Step status
  // =========================================================

  getStepColor(index: number): string {
    const step = this.stepsArray[index];

    if (!step) {
      return this.stepDefaultColor;
    }

    // Current step
    if (index === this.currentStepIndex) {
      return this.stepCurrentColor;
    }

    // Not visited yet
    if (!step.visited()) {
      return this.stepDefaultColor;
    }

    // Visited + valid / invalid
    return step.valid() ? this.stepValidColor : this.stepInvalidColor;
  }

  isStepValid(index: number): boolean {
    return this.stepsArray[index]?.valid() ?? false;
  }

  isStepVisited(index: number): boolean {
    return this.stepsArray[index]?.visited() ?? false;
  }

  // =========================================================
  // Navigation
  // =========================================================

  next(): void {
    const currentStep = this.getCurrentStep();

    if (!currentStep) {
      return;
    }

    if (!currentStep.valid()) {
      return;
    }

    if (this.currentStepIndex >= this.stepsArray.length - 1) {
      return;
    }

    const previousIndex = this.currentStepIndex;
    const nextIndex = previousIndex + 1;

    const nextStep = this.stepsArray[nextIndex];

    if (!nextStep || nextStep.disabled()) {
      return;
    }

    this.currentStepIndex = nextIndex;

    this.emitStepChange(previousIndex, nextIndex);

    this.scrollContentToTop();
  }

  prev(): void {
    if (this.isFirstStep()) {
      return;
    }

    const previousIndex = this.currentStepIndex;
    const previousStepIndex = previousIndex - 1;

    const previousStep = this.stepsArray[previousStepIndex];

    if (!previousStep || previousStep.disabled()) {
      return;
    }

    this.currentStepIndex = previousStepIndex;

    this.emitStepChange(previousIndex, previousStepIndex);

    this.scrollContentToTop();
  }

  goToStep(index: number): void {
    if (index < 0 || index >= this.stepsArray.length) {
      return;
    }

    if (index === this.currentStepIndex) {
      return;
    }

    const targetStep = this.stepsArray[index];

    if (!targetStep || targetStep.disabled()) {
      return;
    }

    /*
     * Going backwards is always allowed.
     */
    if (index < this.currentStepIndex) {
      const previousIndex = this.currentStepIndex;

      this.currentStepIndex = index;

      this.emitStepChange(previousIndex, index);

      this.scrollContentToTop();

      return;
    }

    /*
     * Going forward requires
     * every previous step to be valid.
     */
    if (!this.canNavigateForward(index)) {
      return;
    }

    const previousIndex = this.currentStepIndex;

    this.currentStepIndex = index;

    this.emitStepChange(previousIndex, index);

    this.scrollContentToTop();
  }

  private canNavigateForward(targetIndex: number): boolean {
    for (let i = this.currentStepIndex; i < targetIndex; i++) {
      const step = this.stepsArray[i];

      if (!step) {
        return false;
      }

      if (step.disabled()) {
        return false;
      }

      if (!step.valid()) {
        return false;
      }
    }

    return true;
  }

  // =========================================================
  // Events
  // =========================================================

  private emitStepChange(previousIndex: number, currentIndex: number): void {
    this.currentStepIndexChange.emit(currentIndex);

    this.stepIndexChange.emit({
      previousStepIndex: previousIndex,

      currentStepIndex: currentIndex,

      previousStepName: this.stepsArray[previousIndex]?.label() ?? '',

      currentStepName: this.stepsArray[currentIndex]?.label() ?? '',
    });
  }

  // =========================================================
  // Scroll content
  // =========================================================

  private scrollContentToTop(): void {
    setTimeout(() => {
      const headerOffset = this.isSticky ? this.stickyHeaderHeight + 16 : 16;

      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      const targetScroll = Math.max(0, currentScroll - headerOffset);

      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    });
  }

  // =========================================================
  // Icons
  // =========================================================

  getIcon(name?: string) {
    return ICON_MAP.find((icon) => icon.name === name)?.icon;
  }

  // =========================================================
  // Progress line
  // =========================================================

  getProgressWidth(): number {
    if (this.stepsArray.length <= 1) {
      return 0;
    }

    const progress = this.currentStepIndex / (this.stepsArray.length - 1);

    return progress * 80;
  }
}
