export interface QuotaDocument {
  id: string;
  quota_doc?: string;
  quota_doc_status?: string;
  quota_doc_refuse_reason?: string;
  user_data_id?: string;
  user_id?: number;
  user_data_display?: {
    user?: {
      first_name?: string;
      last_name?: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}
