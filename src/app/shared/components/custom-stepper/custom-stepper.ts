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
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Step } from './step';
import { ICON_MAP } from '@/shared/constants/icon-map';
import { ZardButtonComponent } from '../button';
import { ZardPopoverImports } from '../popover';


export type HeaderStyle =
  | 'under'
  | 'behind'
  | 'front'
  | 'top';


export interface StepChangeEvent {

  previousStepIndex: number;

  currentStepIndex: number;

  previousStepName?: string;

  currentStepName?: string;
}


@Component({
  selector: 'app-custom-stepper',

  standalone: true,

  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardPopoverImports
  ],

  templateUrl: './custom-stepper.html',

  styleUrl: './custom-stepper.css'
})
export class CustomStepper
  implements AfterContentInit, OnDestroy {

  // ...existing fields...

  // =========================================================
  // Compact label mode (lg-and-below + >5 steps)
  // =========================================================

  isCompactMode = false;

  private readonly compactBreakpoint = 1024; // Tailwind `lg`
  private readonly compactStepThreshold = 5;

  private updateCompactMode(): void {
    this.isCompactMode =
      window.innerWidth <= this.compactBreakpoint &&
      this.stepsArray.length > this.compactStepThreshold;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateCompactMode();
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
  currentStepIndexChange =
    new EventEmitter<number>();

  @Output()
  stepIndexChange =
    new EventEmitter<StepChangeEvent>();


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

  /**
   * Color for a step that has not been visited.
   */
  @Input()
  stepDefaultColor = '#d1d5db';


  /**
   * Color for a visited + valid step.
   */
  @Input()
  stepValidColor = '#374151';


  /**
   * Color for a visited + invalid step.
   */
  @Input()
  stepInvalidColor = '#374151';


  /**
   * Color for the currently active step.
   */
  @Input()
  stepCurrentColor = '#000000';


  // =========================================================
  // Sticky header
  // =========================================================

  isSticky = false;

  stickyThreshold = 100;

  stickyHeaderHeight = 0;

  private isTransitioning = false;


  @ViewChild(
    'stickyHeader',
    { read: ElementRef }
  )
  stickyHeaderRef?: ElementRef;


  @ViewChild(
    'stickyHeaderMobile',
    { read: ElementRef }
  )
  stickyHeaderMobileRef?: ElementRef;


  // =========================================================
  // Lifecycle
  // =========================================================

  ngAfterContentInit(): void {

    this.updateStepsArray();

    this.steps.changes
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {

        this.updateStepsArray();

      });


    setTimeout(() => {

      this.captureStickyHeight();

    });
  }


  ngOnDestroy(): void {

    // No manual subscription cleanup needed.
    // takeUntilDestroyed() handles it.

  }


  // =========================================================
  // Scroll / sticky header
  // =========================================================

  @HostListener('window:scroll')
  onWindowScroll(): void {

    if (this.isTransitioning) {
      return;
    }

    this.handleStickyState();
  }


  private handleStickyState(): void {

    const currentScroll =
      window.pageYOffset ||
      document.documentElement.scrollTop;


    const stickThreshold =
      this.stickyThreshold;


    const unstickThreshold =
      this.stickyThreshold - 20;


    let shouldBeSticky: boolean;


    if (this.isSticky) {

      shouldBeSticky =
        currentScroll > unstickThreshold;

    } else {

      shouldBeSticky =
        currentScroll > stickThreshold;

    }


    if (
      this.isSticky !== shouldBeSticky
    ) {

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

    const desktopHeader =
      this.stickyHeaderRef?.nativeElement;


    const mobileHeader =
      this.stickyHeaderMobileRef?.nativeElement;


    if (
      desktopHeader &&
      window.innerWidth >= 640
    ) {

      this.stickyHeaderHeight =
        desktopHeader.offsetHeight;

    } else if (
      mobileHeader &&
      window.innerWidth < 640
    ) {

      this.stickyHeaderHeight =
        mobileHeader.offsetHeight;

    }
  }


  // =========================================================
  // Step helpers
  // =========================================================

  private updateStepsArray(): void {

    this.stepsArray = this.steps?.toArray() ?? [];
    this.updateCompactMode();
  }


  getCurrentStep(): Step | null {

    return (
      this.stepsArray[
      this.currentStepIndex
      ] ?? null
    );
  }


  // Keep this if existing code uses it.
  getcurrentStepIndex(): Step | null {

    return this.getCurrentStep();

  }


  // =========================================================
  // Step status
  // =========================================================

  getStepColor(index: number): string {

    const step =
      this.stepsArray[index];


    if (!step) {

      return this.stepDefaultColor;

    }


    // Current step
    if (
      index === this.currentStepIndex
    ) {

      return this.stepCurrentColor;

    }


    // Not visited yet
    if (!step.visited()) {

      return this.stepDefaultColor;

    }


    // Visited + valid / invalid
    return step.valid()
      ? this.stepValidColor
      : this.stepInvalidColor;
  }


  isStepValid(index: number): boolean {

    return (
      this.stepsArray[index]?.valid()
      ?? false
    );
  }


  isStepVisited(index: number): boolean {

    return (
      this.stepsArray[index]?.visited()
      ?? false
    );
  }


  // =========================================================
  // Navigation
  // =========================================================

  next(): void {

    const currentStep =
      this.getCurrentStep();


    if (!currentStep) {

      return;

    }


    /*
     * Current step must be valid
     * before moving forward.
     */
    if (!currentStep.valid()) {

      return;

    }


    if (
      this.currentStepIndex >=
      this.stepsArray.length - 1
    ) {

      return;

    }


    const previousIndex =
      this.currentStepIndex;


    const nextIndex =
      previousIndex + 1;


    const nextStep =
      this.stepsArray[nextIndex];


    if (
      !nextStep ||
      nextStep.disabled()
    ) {

      return;

    }


    this.currentStepIndex =
      nextIndex;


    this.emitStepChange(
      previousIndex,
      nextIndex
    );
  }


  prev(): void {

    if (
      this.currentStepIndex <= 0
    ) {

      return;

    }


    const previousIndex =
      this.currentStepIndex;


    const previousStepIndex =
      previousIndex - 1;


    const previousStep =
      this.stepsArray[
      previousStepIndex
      ];


    if (
      !previousStep ||
      previousStep.disabled()
    ) {

      return;

    }


    this.currentStepIndex =
      previousStepIndex;


    this.emitStepChange(
      previousIndex,
      previousStepIndex
    );
  }


  goToStep(index: number): void {

    if (
      index < 0 ||
      index >= this.stepsArray.length
    ) {

      return;

    }


    if (
      index === this.currentStepIndex
    ) {

      return;

    }


    const targetStep =
      this.stepsArray[index];


    if (
      !targetStep ||
      targetStep.disabled()
    ) {

      return;

    }


    /*
     * Going backwards is always allowed.
     */
    if (
      index < this.currentStepIndex
    ) {

      const previousIndex =
        this.currentStepIndex;


      this.currentStepIndex =
        index;


      this.emitStepChange(
        previousIndex,
        index
      );


      return;

    }


    /*
     * Going forward requires
     * every previous step to be valid.
     */
    if (
      !this.canNavigateForward(index)
    ) {

      return;

    }


    const previousIndex =
      this.currentStepIndex;


    this.currentStepIndex =
      index;


    this.emitStepChange(
      previousIndex,
      index
    );
  }


  private canNavigateForward(
    targetIndex: number
  ): boolean {

    for (
      let i = this.currentStepIndex;
      i < targetIndex;
      i++
    ) {

      const step =
        this.stepsArray[i];


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

  private emitStepChange(
    previousIndex: number,
    currentIndex: number
  ): void {

    this.currentStepIndexChange.emit(
      currentIndex
    );


    this.stepIndexChange.emit({

      previousStepIndex:
        previousIndex,

      currentStepIndex:
        currentIndex,

      previousStepName:
        this.stepsArray[
          previousIndex
        ]?.label() ?? '',

      currentStepName:
        this.stepsArray[
          currentIndex
        ]?.label() ?? ''
    });
  }


  // =========================================================
  // Icons
  // =========================================================

  getIcon(name?: string) {

    return ICON_MAP.find(
      icon => icon.name === name
    )?.icon;
  }


  // =========================================================
  // Progress line
  // =========================================================

  getProgressWidth(): number {

    if (
      this.stepsArray.length <= 1
    ) {

      return 0;

    }


    const progress =
      this.currentStepIndex /
      (this.stepsArray.length - 1);


    return progress * 80;
  }
}