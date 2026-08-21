import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Admin authentication session behavior", () => {
  const loginSource = readFileSync(
    "components/admin/AdminLoginForm.tsx",
    "utf8",
  );
  const logoutSource = readFileSync(
    "components/admin/AdminLogoutButton.tsx",
    "utf8",
  );
  const middlewareSource = readFileSync("middleware.ts", "utf8");
  const browserClientSource = readFileSync(
    "lib/supabase/client.ts",
    "utf8",
  );

  it("uses the standard persistent Supabase browser session", () => {
    expect(loginSource).toContain("signInWithPassword");
    expect(browserClientSource).toContain("createBrowserClient");
    expect(browserClientSource).not.toContain("persistSession: false");
    expect(middlewareSource).toContain("supabase.auth.getUser()");
    expect(middlewareSource).toContain("setAll(cookiesToSet)");
  });

  it("accepts a full email while preserving the existing short-username alias", () => {
    expect(loginSource).toContain("Email or Username");
    expect(loginSource).toContain("name@example.com or username");
    expect(loginSource).toContain('normalizedUsername.includes("@")');
    expect(loginSource).toContain('`${normalizedUsername}@aitt.local`');
  });

  it("requires an active Admin role at login and at the Admin boundary", () => {
    for (const source of [loginSource, middlewareSource]) {
      expect(source).toMatch(/role\s*[!=]==?\s*"admin"/);
      expect(source).toContain("active");
    }
  });

  it("signs out and redirects to the Admin login page", () => {
    expect(logoutSource).toContain("supabase.auth.signOut()");
    expect(logoutSource).toContain('router.replace("/admin/login")');
    expect(logoutSource).toContain("router.refresh()");
    expect(middlewareSource).toContain('new URL("/admin/login"');
  });

  it("does not add password expiration, reset, or first-login prompts", () => {
    const combined = `${loginSource}\n${middlewareSource}`;

    expect(combined).not.toMatch(/resetPassword|updatePassword/i);
    expect(combined).not.toMatch(/password expiration|password expired/i);
    expect(combined).not.toMatch(/change password|first login/i);
  });
});
