// ============================================================
// Master Data Response
// ============================================================

export interface IMasterDataResponse {
  parameters: IMasterDataParameters;

  display: IMasterDataDisplay;
}

// ============================================================
// Parameters
// ============================================================

export interface IMasterDataParameters {
  titles: ITitleParameter[];

  locations: ILocationParameter[];

  marriedStatus: IMarriedStatusParameter[];

  brands: IBrandsParameter[];

  models: IModelsParameter[];
}

// ============================================================
// Title
// ============================================================

export interface ITitleParameter {
  titleId: string;

  titleName: string;

  sex: string | null;

  statusShowRect: string | null;

  statusShowVat: string | null;

  statusShowDealer: string | null;
}

// ============================================================
// Location
// ============================================================

export interface ILocationParameter {
  postCode: string;

  subDistrict: string;

  district: string;

  province: string;

  locationCode: string | null;

  provinceCode: string | null;

  floodEffect: string | null;

  label_text: string;
}

// ============================================================
// Married Status
// ============================================================

export interface IMarriedStatusParameter {
  code: string;

  name: string;
}

// ============================================================
// Brands
// ============================================================

export interface IBrandsParameter {
  brand_code: string;

  brand_name: string;
}

// ============================================================
// Models
// ============================================================

export interface IModelsParameter {
  brand_code: string;
  model_code: string;
  model_name: string;
  model_key: string;
}

// ============================================================
// Display
// ============================================================

export interface IMasterDataDisplay {
  motorcyclePhotoTypes: IMotorcyclePhotoTypeDisplay[];

  vehicleUserTypes: IVehicleUserTypeDisplay[];

  restructureReasons: IRestructureReasonDisplay[];

  addressTypes: IAddressTypeDisplay[];

  assessment: IAssessmentGroupDisplay[];

  attachmentTypes: IAttachmentTypeDisplay[];

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
// Vehicle User Type
// ============================================================

export interface IVehicleUserTypeDisplay {
  code: string;

  name: string;

  displayOrder: number;

  remarkTextType: string;
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

// ============================================================
// Estimate Income Form
// ============================================================

export interface IIncomeFormValue {
  amount: number;

  remark: string | null;
}

export interface IEstimateIncomeFormValue {
  incomes: Record<string, IIncomeFormValue>;
}
