"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const TOURNAMENT_FILES_BUCKET = "tournament-photos";

export async function uploadTournamentFile(
  file: File,
  path: string,
) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.storage
    .from(TOURNAMENT_FILES_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(TOURNAMENT_FILES_BUCKET)
    .getPublicUrl(path);

  return {
    path,
    url: data.publicUrl,
  };
}

export async function uploadTournamentPhoto(
  file: File,
  path: string,
) {
  return uploadTournamentFile(file, path);
}

export async function uploadTournamentCsv(
  file: File,
  tournamentId: string,
) {
  return uploadTournamentFile(
    file,
    `tournaments/${tournamentId}/weighfish.csv`,
  );
}

export async function deleteTournamentPhoto(path: string) {
  if (!path) {
    return;
  }

  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.storage
    .from(TOURNAMENT_FILES_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}