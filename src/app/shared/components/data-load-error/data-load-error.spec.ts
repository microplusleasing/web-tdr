import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLoadError } from './data-load-error';

describe('DataLoadError', () => {
  let component: DataLoadError;
  let fixture: ComponentFixture<DataLoadError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataLoadError],
    }).compileComponents();

    fixture = TestBed.createComponent(DataLoadError);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
