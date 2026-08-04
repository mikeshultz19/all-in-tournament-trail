import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SupplementalWorkflowEvidence {
  officialPublicationExists: boolean;
  aoyCalculationExists: boolean;
  aoyCurrentProjectionExists: boolean;
}

export interface SupplementalWorkflowEvidenceLoad {
  evidence: Record<string, SupplementalWorkflowEvidence>;
  warning: string | null;
}

type SupabaseQueryError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

function logEvidenceError(query: string, error: SupabaseQueryError) {
  console.error("Tournament workflow evidence query failed.", {
    query,
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function isUnavailableSchema(error: SupabaseQueryError) {
  return ["42P01", "42703", "PGRST204", "PGRST205"].includes(error.code ?? "");
}

export async function listSupplementalWorkflowEvidence(tournamentIds: string[]): Promise<SupplementalWorkflowEvidenceLoad> {
  if (!tournamentIds.length) return { evidence: {}, warning: null };
  const supabase = createSupabaseServerClient();
  const [publicationResult, calculationResult, currentResult] = await Promise.all([
    supabase.from("official_results_publication_audit").select("tournament_id").in("tournament_id", tournamentIds),
    supabase.from("aoy_tournament_performances").select("tournament_id,calculation_run_id").in("tournament_id", tournamentIds),
    supabase.from("aoy_current_projections").select("calculation_run_id"),
  ]);
  const failures = [
    ["official_results_publication_audit", publicationResult.error],
    ["aoy_tournament_performances", calculationResult.error],
    ["aoy_current_projections", currentResult.error],
  ] as const;
  for (const [query, error] of failures) {
    if (error) logEvidenceError(query, error);
  }
  const errors = failures.flatMap(([, error]) => error ? [error] : []);
  if (errors.some((error) => !isUnavailableSchema(error))) {
    throw new Error("Tournament workflow evidence could not be loaded.", { cause: errors[0] });
  }
  if (errors.length) {
    return {
      evidence: {},
      warning: "Tournament workflow status is temporarily unavailable. Verify that the latest database migration has been applied.",
    };
  }
  const publications = new Set((publicationResult.data ?? []).map((row) => row.tournament_id));
  const calculations = new Set((calculationResult.data ?? []).map((row) => row.tournament_id));
  const currentRunIds = new Set((currentResult.data ?? []).map((row) => row.calculation_run_id));
  const current = new Set(
    (calculationResult.data ?? [])
      .filter((row) => currentRunIds.has(row.calculation_run_id))
      .map((row) => row.tournament_id),
  );
  return { evidence: Object.fromEntries(tournamentIds.map((tournamentId) => [tournamentId, {
    officialPublicationExists: publications.has(tournamentId),
    aoyCalculationExists: calculations.has(tournamentId),
    aoyCurrentProjectionExists: current.has(tournamentId),
  }])), warning: null };
}
