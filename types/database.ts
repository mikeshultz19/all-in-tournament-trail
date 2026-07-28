import type {
  Angler,
  Membership,
  Season,
  Team,
  TeamMember,
} from "@/types/aoy";
import type {
  Tournament,
  TournamentUpdate,
} from "@/types/tournament";

type GeneratedTable<
  Row,
  Insert = Omit<Row, "id" | "created_at" | "updated_at"> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  },
  Update = Partial<Insert>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      tournaments: GeneratedTable<
        Tournament,
        Omit<Tournament, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        },
        TournamentUpdate
      >;
      seasons: GeneratedTable<Season>;
      anglers: GeneratedTable<Angler>;
      memberships: GeneratedTable<Membership>;
      teams: GeneratedTable<Team>;
      team_members: GeneratedTable<
        TeamMember,
        Omit<TeamMember, "created_at"> & { created_at?: string },
        Partial<Omit<TeamMember, "created_at">>
      >;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
