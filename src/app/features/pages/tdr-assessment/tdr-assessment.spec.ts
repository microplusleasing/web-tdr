import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdrAssessment } from './tdr-assessment';

describe('TdrAssessment', () => {
  let component: TdrAssessment;
  let fixture: ComponentFixture<TdrAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TdrAssessment],
    }).compileComponents();

    fixture = TestBed.createComponent(TdrAssessment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
