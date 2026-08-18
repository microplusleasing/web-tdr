export interface DynamicFieldDefinition {
  fieldname: string;
  display_order: number;
  data_type: 'V' | 'N' | 'D' | 'B';
  display_require: 'Y' | 'N';

  display_name?: string;
  max_length?: number;
  min_length?: number;
  default_value?: unknown;
}