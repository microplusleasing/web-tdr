import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductInformationStep } from './product-information-step';

describe('ProductInformationStep', () => {
  let component: ProductInformationStep;
  let fixture: ComponentFixture<ProductInformationStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductInformationStep],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductInformationStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
