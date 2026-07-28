import "server-only";

import {
  normalizeAnglerDisplayName,
  normalizeAnglerName,
} from "@/lib/identity-normalization";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Angler, CreateAnglerInput } from "@/types/aoy";

export class AnglerDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AnglerDataError";
  }
}

export async function searchAnglers(query: string): Promise<Angler[]> {
  const normalizedQuery = normalizeAnglerName(query);

  if (!normalizedQuery) {
    return [];
  }

  const escapedQuery = normalizedQuery.replace(/[%_\\]/g, "\\$&");
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("anglers")
    .select("*")
    .is("merged_into_angler_id", null)
    .ilike("normalized_name", `%${escapedQuery}%`)
    .order("display_name", { ascending: true })
    .limit(50);

  if (error) {
    throw new AnglerDataError("We could not search anglers.", {
      cause: error,
    });
  }

  return (data ?? []) as Angler[];
}

export async function getAnglerById(id: string): Promise<Angler | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("anglers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new AnglerDataError("We could not load the angler.", {
      cause: error,
    });
  }

  return data as Angler | null;
}

export async function createAngler(
  input: CreateAnglerInput,
): Promise<Angler> {
  const firstName = normalizeAnglerDisplayName(input.first_name);
  const lastName = normalizeAnglerDisplayName(input.last_name);
  const displayName = normalizeAnglerDisplayName(
    input.display_name || `${firstName} ${lastName}`,
  );

  if (!firstName || !lastName || !displayName) {
    throw new AnglerDataError("First name and last name are required.");
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("anglers")
    .insert({
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
      normalized_name: normalizeAnglerName(displayName),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new AnglerDataError("We could not create the angler.", {
      cause: error,
    });
  }

  return data as Angler;
}
