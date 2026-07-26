export interface Announcement {
  id: string;
  tournament_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  featured_image_url: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementInsert {
  tournament_id?: string | null;
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  featured_image_url?: string | null;
  is_pinned?: boolean;
}

export type AnnouncementUpdate = Partial<
  Pick<
    Announcement,
    | "tournament_id"
    | "title"
    | "slug"
    | "summary"
    | "content"
    | "featured_image_url"
    | "is_pinned"
  >
>;
