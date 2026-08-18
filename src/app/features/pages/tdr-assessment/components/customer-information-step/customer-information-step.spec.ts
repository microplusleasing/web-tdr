import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInformationStep } from './customer-information-step';

describe('CustomerInformationStep', () => {
  let component: CustomerInformationStep;
  let fixture: ComponentFixture<CustomerInformationStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerInformationStep],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerInformationStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
