export interface AcademicMerit {
  id: string | number;
  document?: string;
  created_at: string;
  updated_at?: string;
  status?: string;
  user_data_id?: string;
  user_data_display?: {
    user?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

