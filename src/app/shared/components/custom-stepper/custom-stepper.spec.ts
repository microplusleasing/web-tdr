import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomStepper } from './custom-stepper';

describe('CustomStepper', () => {
  let component: CustomStepper;
  let fixture: ComponentFixture<CustomStepper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomStepper],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomStepper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
