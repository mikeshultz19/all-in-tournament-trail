import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminUser = vi.fn();
const createMemberAtomically = vi.fn();

vi.mock("@/lib/admin-auth", () => ({
  AdminAuthorizationError: class AdminAuthorizationError extends Error {
    constructor(
      message: string,
      readonly reason: "unauthenticated" | "forbidden",
    ) {
      super(message);
    }
  },
  requireAdminUser,
}));

vi.mock("@/lib/admin-members", () => ({
  AdminMemberDataError: class AdminMemberDataError extends Error {},
  createMemberAtomically,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("createMemberAction authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests before any database write", async () => {
    const { AdminAuthorizationError } = await import("@/lib/admin-auth");
    const { createMemberAction } = await import(
      "@/app/admin/members/new/actions"
    );
    requireAdminUser.mockRejectedValue(
      new AdminAuthorizationError(
        "Sign in with an Admin account to continue.",
        "unauthenticated",
      ),
    );

    const result = await createMemberAction(
      { status: "idle", message: "", errors: {} },
      new FormData(),
    );

    expect(result.message).toContain("Sign in");
    expect(createMemberAtomically).not.toHaveBeenCalled();
  });

  it("rejects non-Admin requests before any database write", async () => {
    const { AdminAuthorizationError } = await import("@/lib/admin-auth");
    const { createMemberAction } = await import(
      "@/app/admin/members/new/actions"
    );
    requireAdminUser.mockRejectedValue(
      new AdminAuthorizationError(
        "This account does not have Admin permission.",
        "forbidden",
      ),
    );

    const result = await createMemberAction(
      { status: "idle", message: "", errors: {} },
      new FormData(),
    );

    expect(result.message).toContain("Admin permission");
    expect(createMemberAtomically).not.toHaveBeenCalled();
  });
});
