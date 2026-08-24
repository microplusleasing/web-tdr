import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoPreviewDialog } from './photo-preview-dialog';

describe('PhotoPreviewDialog', () => {
  let component: PhotoPreviewDialog;
  let fixture: ComponentFixture<PhotoPreviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoPreviewDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoPreviewDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
