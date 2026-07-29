import "server-only";

import type { User } from "@supabase/supabase-js";

import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

export class AdminAuthorizationError extends Error {
  constructor(
    message: string,
    readonly reason: "unauthenticated" | "forbidden",
  ) {
    super(message);
    this.name = "AdminAuthorizationError";
  }
}

export function isAdminUser(user: User): boolean {
  return (
    user.app_metadata?.role === "admin" &&
    user.app_metadata?.active === true
  );
}

export function getAdminDisplayName(user: User): string {
  const configuredName = user.app_metadata?.display_name;

  if (typeof configuredName === "string" && configuredName.trim()) {
    return configuredName.trim();
  }

  return user.email?.split("@")[0] || "Admin";
}

export async function requireAdminUser(): Promise<User> {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AdminAuthorizationError(
      "Sign in with an Admin account to continue.",
      "unauthenticated",
    );
  }

  if (!isAdminUser(user)) {
    throw new AdminAuthorizationError(
      "This account does not have Admin permission.",
      "forbidden",
    );
  }

  return user;
}
