export type Database = {
  public: {
    Tables: {
      champions: {
        Row: {
          id: string;
          name: string;
          image_url: string | null;
          is_available: boolean | null;
          roles: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          image_url?: string | null;
          is_available?: boolean | null;
          roles?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string | null;
          is_available?: boolean | null;
          roles?: string[] | null;
          updated_at?: string | null;
        };
      };
    };
  };
};
