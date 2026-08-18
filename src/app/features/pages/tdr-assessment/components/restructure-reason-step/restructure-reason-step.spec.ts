import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestructureReasonStep } from './restructure-reason-step';

describe('RestructureReasonStep', () => {
  let component: RestructureReasonStep;
  let fixture: ComponentFixture<RestructureReasonStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestructureReasonStep],
    }).compileComponents();

    fixture = TestBed.createComponent(RestructureReasonStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
