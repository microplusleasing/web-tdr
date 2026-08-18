export interface IMasterDataResponse {
  parameters: IMasterDataParameters;
  display: IMasterDataDisplay;
}

// ============================================================
// Parameters
// ============================================================

export interface IMasterDataParameters {
  // Currently no master data uses parameters.
  // Keep this interface for backward compatibility.
}

// ============================================================
// Display
// ============================================================

export interface IMasterDataDisplay {
  motorcyclePhotoTypes: IMotorcyclePhotoTypeDisplay[];
  restructureReasons: IRestructureReasonDisplay[];

  addressTypes: IAddressTypeDisplay[];
  assessment: IAssessmentGroupDisplay[];
  attachmentTypes: IAttachmentTypeDisplay[];
  documentTypes: IDocumentTypeDisplay[];
  statusCodes: IStatusCodeDisplay[];
}

// ============================================================
// Motorcycle Photo Type
// ============================================================

export interface IMotorcyclePhotoTypeDisplay {
  code: string;
  name: string;
  displayOrder: number;
}

// ============================================================
// Restructure Reason
// ============================================================

export interface IRestructureReasonDisplay {
  code: string;
  name: string;
  requireRemark: boolean;
  displayOrder: number;
}

// ============================================================
// Address
// ============================================================

export interface IAddressTypeDisplay {
  code: string;
  name: string;
  displayOrder: number;
}

// ============================================================
// Attachment
// ============================================================

export interface IAttachmentTypeDisplay {
  attachmentTypeId: number;
  attachmentCode: string;
  attachmentName: string;
  displayOrder: number;
  isRequired: boolean;
  allowMultiple: boolean;
  acceptFileType: string | null;
  maxFileSizeMb: number | null;
  labelRequired: string | null;
  labelRequiredColor: string | null;
}

// ============================================================
// Document
// ============================================================

export interface IDocumentTypeDisplay {
  documentCode: string;
  documentName: string;
  requireRemark: boolean;
  displayOrder: number;
  allowMultiple: boolean;
}

// ============================================================
// Status
// ============================================================

export interface IStatusCodeDisplay {
  statusId: number;
  statusCode: string;
  statusName: string;
  displayOrder: number;
}

// ============================================================
// Assessment
// ============================================================

export interface IAssessmentGroupDisplay {
  groupId: number;
  groupCode: string;
  groupName: string;
  displayOrder: number;
  categories: IAssessmentCategoryDisplay[];
}

export interface IAssessmentCategoryDisplay {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  displayOrder: number;
  items: IAssessmentItemDisplay[];
}

export interface IAssessmentItemDisplay {
  itemId: number;
  itemCode: string;
  itemName: string;
  displayOrder: number;
  requireRemark: boolean;
  remarkTextType: string | null;
}

/* ... display ... */
export interface IIncomeFormValue {
  amount: number;
  remark: string | null;
}

export interface IEstimateIncomeFormValue {
  incomes: Record<string, IIncomeFormValue>;
}