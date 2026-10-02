export interface CreateTdrAssessmentFormValue {
  customerInformation: CustomerInformation;
  productInformation: ProductInformation;
  estimateIncome: EstimateIncome;
  estimatePayment: EstimatePayment;
  restructureReason: RestructureReason;
  documentAttachments: DocumentAttachments;
}

/* ============================================================
 * Customer Information
 * ============================================================ */

export interface CustomerInformation {
  contractNo: string;
  title: string;
  firstName: string;
  lastName: string;
  citizenId: string;

  idCardAddress: Address;
  registeredAddressSameAsIdCard: boolean;
  registeredAddress: Address;

  currentAddressSameAsIdCard: boolean;
  currentAddress: Address;

  phoneNo: string;
  maritalStatus: string;
  numberOfChildren: string;
  dependents: string;

  occupation: string;
  position: string;
  jobDescription: string;
  workplaceName: string;

  workplaceAddress: WorkplaceAddress;

  reference1: ReferencePerson;
  reference2: ReferencePerson;
}

export interface Address {
  postalCodeLookup: string;
  houseNo: string;
  alley: string;
  soi: string;
  road: string;
  postalCode: string;
  subDistrict: string;
  district: string;
  province: string;
}

export interface WorkplaceAddress extends Address {
  workplacePhone: string;
  workplaceDescription: string;
}

export interface ReferencePerson {
  name: string;
  phone: string;
  relationship: string;
}

/* ============================================================
 * Product Information
 * ============================================================ */

export interface ProductInformation {
  brand: string;
  model: string;
  color: string;
  registrationNo: string;
  vehicleUserType: string;

  additionalInfo: string;

  currentUserName: string;
  relationship: string;
  currentUserPhone: string;
  currentCondition: string;

  carUserAddress: Address;

  currentMileage: string;

  motorcyclePhoto: MotorcyclePhoto[];
}

export interface MotorcyclePhoto {
  photoType: string;
  file: File;
  fileName: string;
}

/* ============================================================
 * Estimate Income
 * ============================================================ */

export interface EstimateIncome {
  incomes: Record<string, IncomeItem>;
}

export interface IncomeItem {
  amount: number;
  remark: string | null;
}

/* ============================================================
 * Estimate Payment
 * ============================================================ */

export interface EstimatePayment {
  NECESSARY_EXPENSE: Record<string, PaymentItem>;
  DEBT_OBLIGATION: Record<string, PaymentItem>;
}

export interface PaymentItem {
  itemId: string;
  amount: number;
  remark: string | null;
}

/* ============================================================
 * Restructure Reason
 * ============================================================ */

export interface RestructureReason {
  reasons: RestructureReasonItem[];
}

export interface RestructureReasonItem {
  reasonCode: string;
  selected: boolean;
  otherReason: string;
}

/* ============================================================
 * Document Attachments
 * ============================================================ */

export interface DocumentAttachments {
  attachments: Attachment[];
}

export interface Attachment {
  attachmentTypeId: string;
  attachmentCode: string;
  files: File[];
  fileName: string;
}

// export interface AttachmentFile {
//   file: File;
//   fileName: string;
// }
