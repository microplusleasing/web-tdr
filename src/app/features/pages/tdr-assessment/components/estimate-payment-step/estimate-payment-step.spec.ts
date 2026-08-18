import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimatePaymentStep } from './estimate-payment-step';

describe('EstimatePaymentStep', () => {
  let component: EstimatePaymentStep;
  let fixture: ComponentFixture<EstimatePaymentStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimatePaymentStep],
    }).compileComponents();

    fixture = TestBed.createComponent(EstimatePaymentStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
