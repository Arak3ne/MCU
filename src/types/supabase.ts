export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          pseudo: string;
          discord: string;
          riot_id: string | null;
          participation_type: string;
          primary_role: string | null;
          secondary_role: string | null;
          champion_pool: string[] | null;
          champion_signature: string | null;
          rank: string | null;
          playstyle: string | null;
          mindset: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pseudo: string;
          discord: string;
          riot_id?: string | null;
          participation_type?: string;
          primary_role?: string | null;
          secondary_role?: string | null;
          champion_pool?: string[] | null;
          champion_signature?: string | null;
          rank?: string | null;
          playstyle?: string | null;
          mindset?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pseudo?: string;
          discord?: string;
          riot_id?: string | null;
          participation_type?: string;
          primary_role?: string | null;
          secondary_role?: string | null;
          champion_pool?: string[] | null;
          champion_signature?: string | null;
          rank?: string | null;
          playstyle?: string | null;
          mindset?: string | null;
          created_at?: string;
        };
      };
      live_match: {
        Row: {
          id: number;
          team1_name: string | null;
          team2_name: string | null;
          team1_score: number | null;
          team2_score: number | null;
          title: string | null;
          subtitle: string | null;
          draft_url: string | null;
        };
        Insert: {
          id?: number;
          team1_name?: string | null;
          team2_name?: string | null;
          team1_score?: number | null;
          team2_score?: number | null;
          title?: string | null;
          subtitle?: string | null;
          draft_url?: string | null;
        };
        Update: {
          id?: number;
          team1_name?: string | null;
          team2_name?: string | null;
          team1_score?: number | null;
          team2_score?: number | null;
          title?: string | null;
          subtitle?: string | null;
          draft_url?: string | null;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          wins: number | null;
          losses: number | null;
          points: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          wins?: number | null;
          losses?: number | null;
          points?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          wins?: number | null;
          losses?: number | null;
          points?: number | null;
        };
      };
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
      playoff_matches: {
        Row: {
          id: string;
          stage: string;
          round: number;
          match_order: number;
          team1_id: string | null;
          team2_id: string | null;
          team1_score: number | null;
          team2_score: number | null;
          winner_to_match_id: string | null;
          is_completed: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          stage: string;
          round: number;
          match_order: number;
          team1_id?: string | null;
          team2_id?: string | null;
          team1_score?: number | null;
          team2_score?: number | null;
          winner_to_match_id?: string | null;
          is_completed?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          stage?: string;
          round?: number;
          match_order?: number;
          team1_id?: string | null;
          team2_id?: string | null;
          team1_score?: number | null;
          team2_score?: number | null;
          winner_to_match_id?: string | null;
          is_completed?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
};

export const _dummy = true;
