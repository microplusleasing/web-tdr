import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressLocationFields } from './address-location-fields';

describe('AddressLocationFields', () => {
  let component: AddressLocationFields;
  let fixture: ComponentFixture<AddressLocationFields>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressLocationFields],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressLocationFields);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
