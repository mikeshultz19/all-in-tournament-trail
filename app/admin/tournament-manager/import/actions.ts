"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WeighfishResultRow } from "@/lib/weighfishParser";

export interface WeighfishImportState {
  status: "idle" | "success" | "error";
  message: string;
}

interface SupabaseImportError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

function logImportFailure(
  error: SupabaseImportError,
  operation: string,
  table: string,
) {
  console.error("WeighFish import database operation failed.", {
    operation,
    table,
    code: error.code ?? "unknown",
    message: error.message ?? "No database message was returned.",
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
}

function importFailureReason(error: SupabaseImportError): string {
  const message = error.message?.trim() || "Unexpected database error. See server log.";
  if (error.code === "42501") return `Permission denied writing tournament results. ${message}`;
  if (error.code === "23505") return `Database constraint violation. Duplicate team entry detected. ${message}`;
  if (error.code === "23502") return `A required tournament result value is missing. ${message}`;
  if (error.code === "23503") return `The selected tournament could not be associated with these results. ${message}`;
  if (error.code === "23514" || error.code === "22023" || error.code === "22P02") return `Database validation rejected the imported results. ${message}`;
  return `${message}${error.code ? ` (Database code ${error.code}.)` : ""}`;
}

export async function importWeighfishResultsAction(
  tournamentId: string,
  rows: WeighfishResultRow[],
): Promise<WeighfishImportState> {
  const admin = await requireAdminUser();

  if (!tournamentId) {
    return {
      status: "error",
      message: "No tournament was selected.",
    };
  }

  if (!rows.length) {
    return {
      status: "error",
      message: "The CSV does not contain any result entries.",
    };
  }

  const supabase = createSupabaseServerClient();

  try {
    const { data: importedCount, error: importError } = await supabase.rpc(
      "import_working_results",
      {
        p_tournament_id: tournamentId,
        p_entries: rows,
        p_admin_user_id: admin.id,
      },
    );
    if (importError) {
      logImportFailure(
        importError,
        "RPC import_working_results",
        "tournament_result_entries transaction (with working_result_audit and tournaments)",
      );
      return {
        status: "error",
        message: `Import failed\n\nReason:\n${importFailureReason(importError)}\n\nNothing was imported.`,
      };
    }

    const { error: verificationResetError } = await supabase
      .from("tournaments")
      .update({ results_verified_at: null, results_verified_by: null })
      .eq("id", tournamentId);
    if (verificationResetError) {
      logImportFailure(
        verificationResetError,
        "UPDATE results_verified_at/results_verified_by",
        "tournaments",
      );
      return {
        status: "error",
        message: `Import incomplete\n\nReason:\n${importFailureReason(verificationResetError)}\n\nImported rows were saved, but verification state could not be reset. Use Reset Import before attempting another import.`,
      };
    }

    revalidatePath("/admin/tournament-manager");
    revalidatePath("/admin/tournament-manager/import");
    revalidatePath("/admin/tournament-manager/insurance");
    revalidatePath("/admin/tournament-manager/publish");
    revalidatePath("/admin");

    return {
      status: "success",
      message: `${importedCount ?? rows.length} working results imported.`,
    };
  } catch (error) {
    const unexpected = error instanceof Error ? error : new Error("Unexpected database error.");
    console.error("Unexpected WeighFish import failure.", {
      operation: "Import server action",
      table: "unknown",
      code: "unexpected",
      message: unexpected.message,
      details: null,
      hint: "See the complete server exception in the adjacent log entry.",
    });
    console.error(unexpected);

    return {
      status: "error",
      message: "Import failed\n\nReason:\nUnexpected database error. See server log.\n\nNothing was imported.",
    };
  }
}
