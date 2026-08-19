import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAttachStep } from './document-attach-step';

describe('DocumentAttachStep', () => {
  let component: DocumentAttachStep;
  let fixture: ComponentFixture<DocumentAttachStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentAttachStep],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentAttachStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
