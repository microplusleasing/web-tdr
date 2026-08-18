import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateIncomeStep } from './estimate-income-step';

describe('EstimateIncomeStep', () => {
  let component: EstimateIncomeStep;
  let fixture: ComponentFixture<EstimateIncomeStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimateIncomeStep],
    }).compileComponents();

    fixture = TestBed.createComponent(EstimateIncomeStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
