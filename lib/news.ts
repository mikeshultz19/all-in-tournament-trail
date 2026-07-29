import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Announcement,
  AnnouncementInsert,
  AnnouncementUpdate,
} from "@/types/announcement";

export class AnnouncementDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AnnouncementDataError";
  }
}

function dataError(
  operation: string,
  error: unknown,
): AnnouncementDataError {
  console.error(
    `Supabase announcement ${operation} failed.`,
    error,
  );

  return new AnnouncementDataError(
    `We could not ${operation} announcement information.`,
    { cause: error },
  );
}

export async function getAnnouncements(): Promise<
  Announcement[]
> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase announcement load failed.", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return [];
  }

  return (data ?? []) as Announcement[];
}

export async function getAnnouncementById(
  id: string,
): Promise<Announcement | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dataError("load", error);
  }

  return data as Announcement | null;
}

export async function createAnnouncement(
  values: AnnouncementInsert,
): Promise<Announcement> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("news")
    .insert(values)
    .select("*")
    .single();

  if (error) {
    throw dataError("create", error);
  }

  return data as Announcement;
}

export async function updateAnnouncement(
  id: string,
  values: AnnouncementUpdate,
): Promise<Announcement> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("news")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw dataError("update", error);
  }

  return data as Announcement;
}

export async function deleteAnnouncement(
  id: string,
): Promise<void> {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("news")
    .delete()
    .eq("id", id);

  if (error) {
    throw dataError("delete", error);
  }
}
