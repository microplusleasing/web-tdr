import { TestBed } from '@angular/core/testing';

import { TdrAssessmentService } from './tdr-assessment.service';

describe('TdrAssessmentService', () => {
  let service: TdrAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TdrAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
