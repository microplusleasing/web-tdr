import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  isDevMode,
} from '@angular/core';

import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ZardButtonComponent } from '@/shared/components/button';

import { IAttachmentTypeDisplay } from '../../interfaces/master-data.interface';
import { Subscription } from 'rxjs';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-document-attach-step',

  standalone: true,

  imports: [ReactiveFormsModule, ZardButtonComponent],

  templateUrl: './document-attach-step.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentAttachStep implements OnInit, OnChanges, OnDestroy {
  readonly showMock = isDevMode();
  // =========================================================
  // Form
  // =========================================================

  @Input({ required: true }) form!: FormGroup;

  // =========================================================
  // Dynamic Attachment Definitions
  // =========================================================

  @Input({ required: true }) attachments: IAttachmentTypeDisplay[] = [];

  private formSub?: Subscription;

  private readonly imageService = inject(ImageService);

  ngOnInit(): void {
    if (this.form) {
      this.formSub = this.form.valueChanges.subscribe(() => {
        this.logFormState();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    Object.keys(this.form.controls).forEach((fieldName) => {
      const control = this.form.get(fieldName);

      console.log(fieldName, {
        value: control?.value,
        valid: control?.valid,
        invalid: control?.invalid,
        status: control?.status,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty,
        disabled: control?.disabled,
        enabled: control?.enabled,
      });
    });
  }

  mockData() {
    if (!this.showMock) return;
    this.mockAttachments();
  }

  private mockAttachments(): void {
    this.attachmentForms.controls.forEach((control, index) => {
      const attachmentType = this.attachments[index];

      if (!attachmentType) {
        return;
      }

      const file = this.imageService.createMockImageFile(
        `${attachmentType.attachmentCode}.jpg`,
        index % 2 === 0 ? '#2563eb' : '#16a34a',
      );

      // In this form, `files` is File[] (not a single `file` like the motorcycle photos)
      control.patchValue({ files: [file] });

      control.get('files')?.markAsTouched();
      control.get('files')?.markAsDirty();
    });

    this.attachmentForms.updateValueAndValidity();
  }

  private logFormState(): void {
    Object.keys(this.form.controls).forEach((fieldName) => {
      const control = this.form.get(fieldName);
      console.log(fieldName, {
        value: control?.value,
        valid: control?.valid,
        status: control?.status,
        touched: control?.touched,
        dirty: control?.dirty,
      });
    });
  }

  // =========================================================
  // Attachment FormArray
  // =========================================================

  get attachmentForms(): FormArray {
    return this.form.get('attachments') as FormArray;
  }

  // =========================================================
  // Get Attachment FormGroup
  // =========================================================

  getAttachmentForm(index: number): FormGroup {
    return this.attachmentForms.at(index) as FormGroup;
  }

  // =========================================================
  // Get Files Control
  // =========================================================

  getFilesControl(index: number): FormControl<File[] | null> {
    return this.getAttachmentForm(index).get('files') as FormControl<File[] | null>;
  }

  // =========================================================
  // Check Has Files
  // =========================================================

  hasFiles(index: number): boolean {
    const files = this.getFilesControl(index).value;

    return !!files && files.length > 0;
  }

  // =========================================================
  // Get File Names
  // =========================================================

  getFileNames(index: number): string[] {
    const files = this.getFilesControl(index).value;

    if (!files) {
      return [];
    }

    return files.map((file) => file.name);
  }

  // =========================================================
  // File Selected
  // =========================================================

  onFilesSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;

    const fileList = input.files;

    if (!fileList || fileList.length === 0) {
      return;
    }

    const attachment = this.attachments[index];

    const selectedFiles = Array.from(fileList);

    // =======================================================
    // Multiple / Single
    // =======================================================

    const finalFiles = attachment.allowMultiple ? selectedFiles : selectedFiles.slice(0, 1);

    // =======================================================
    // Validate Files
    // =======================================================

    const invalidFile = finalFiles.find((file) => !this.isValidFile(file, attachment));

    const control = this.getFilesControl(index);

    // =======================================================
    // Invalid
    // =======================================================

    if (invalidFile) {
      control.setValue(null);

      control.setErrors({
        ...(control.errors ?? {}),
        fileInvalid: true,
      });

      control.markAsTouched();

      // Reset input so the user can select
      // the same file again.

      input.value = '';

      return;
    }

    // =======================================================
    // Valid
    // =======================================================

    control.setValue(finalFiles);

    control.markAsTouched();

    control.updateValueAndValidity();

    // Reset input so selecting the same file again
    // triggers the change event.

    input.value = '';
  }

  // =========================================================
  // Validate File
  // =========================================================

  private isValidFile(file: File, attachment: IAttachmentTypeDisplay): boolean {
    // =======================================================
    // File Type
    // =======================================================

    if (attachment.acceptFileType) {
      const allowedExtensions = attachment.acceptFileType
        .split(',')
        .map((type) => type.trim().toLowerCase().replace('.', ''))
        .filter((type) => type.length > 0);

      // If API has acceptFileType but it produces
      // no valid values, don't reject the file.

      if (allowedExtensions.length > 0) {
        const fileName = file.name.toLowerCase();

        const extension = fileName.split('.').pop() ?? '';

        if (!allowedExtensions.includes(extension)) {
          return false;
        }
      }
    }

    // =======================================================
    // File Size
    // =======================================================

    if (attachment.maxFileSizeMb !== null) {
      const maxBytes = attachment.maxFileSizeMb * 1024 * 1024;

      if (file.size > maxBytes) {
        return false;
      }
    }

    return true;
  }

  // =========================================================
  // Accept Attribute
  // =========================================================

  getAcceptAttribute(attachment: IAttachmentTypeDisplay): string {
    if (!attachment.acceptFileType) {
      return '';
    }

    return attachment.acceptFileType
      .split(',')
      .map((type) => type.trim())
      .filter((type) => type.length > 0)
      .map((type) => (type.startsWith('.') ? type : `.${type}`))
      .join(',');
  }

  // =========================================================
  // Status
  // =========================================================

  getStatus(index: number): 'waiting' | 'uploaded' {
    return this.hasFiles(index) ? 'uploaded' : 'waiting';
  }

  // =========================================================
  // Validation
  // =========================================================

  isInvalid(index: number): boolean {
    const control = this.getFilesControl(index);

    return control.touched && control.invalid;
  }

  // =========================================================
  // File Invalid Error
  // =========================================================

  hasFileInvalidError(index: number): boolean {
    return !!this.getFilesControl(index).errors?.['fileInvalid'];
  }

  // =========================================================
  // File Error Message
  // =========================================================

  getFileErrorMessage(attachment: IAttachmentTypeDisplay): string {
    if (attachment.acceptFileType && attachment.maxFileSizeMb !== null) {
      return `
        กรุณาเลือกไฟล์ประเภท
        ${this.formatFileTypes(attachment.acceptFileType)}
        และขนาดไม่เกิน
        ${attachment.maxFileSizeMb} MB
      `;
    }

    if (attachment.acceptFileType) {
      return `
        กรุณาเลือกไฟล์ประเภท
        ${this.formatFileTypes(attachment.acceptFileType)}
      `;
    }

    if (attachment.maxFileSizeMb !== null) {
      return `
        ขนาดไฟล์ต้องไม่เกิน
        ${attachment.maxFileSizeMb} MB
      `;
    }

    return 'ไฟล์ไม่ถูกต้อง';
  }

  // =========================================================
  // Format File Types
  // =========================================================

  private formatFileTypes(fileTypes: string): string {
    return fileTypes
      .split(',')
      .map((type) => type.trim().replace('.', '').toUpperCase())
      .filter((type) => type.length > 0)
      .join(', ');
  }

  // =========================================================
  // Footer - Maximum File Size
  // =========================================================

  getMaxFileSize(): number | null {
    const values = this.attachments
      .map((attachment) => attachment.maxFileSizeMb)
      .filter((value): value is number => value !== null);

    if (values.length === 0) {
      return null;
    }

    return Math.max(...values);
  }

  // =========================================================
  // Footer - Allowed File Types
  // =========================================================

  getAllowedFileTypes(): string {
    const types = this.attachments.flatMap(
      (attachment) =>
        attachment.acceptFileType
          ?.split(',')
          .map((type) => type.trim().replace('.', '').toUpperCase())
          .filter((type) => type.length > 0) ?? [],
    );

    return [...new Set(types)].join(', ');
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }
}
