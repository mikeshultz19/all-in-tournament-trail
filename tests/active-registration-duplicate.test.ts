import { describe, expect, it } from "vitest";

import { findActiveRegistrationDuplicatePositions } from "@/lib/active-registration-duplicate";

describe("active registration duplicate guard", () => {
  const canonical = [{
    id: "angler-1",
    first_name: "Alex",
    last_name: "Mercer",
    email: "alex@example.com",
    phone: "8175551001",
  }];

  it("blocks an already-active angler by matching name and email", () => {
    expect(findActiveRegistrationDuplicatePositions(
      [{ firstName: "Alex", lastName: "Mercer", email: "alex@example.com", mobilePhone: "8175559999" }],
      canonical,
      new Set(["angler-1"]),
    )).toEqual([1]);
  });

  it("blocks an already-active angler by matching name and phone", () => {
    expect(findActiveRegistrationDuplicatePositions(
      [{ firstName: "Alex", lastName: "Mercer", email: "different@example.com", mobilePhone: "817-555-1001" }],
      canonical,
      new Set(["angler-1"]),
    )).toEqual([1]);
  });

  it("does not block a distinct person who shares an email", () => {
    expect(findActiveRegistrationDuplicatePositions(
      [{ firstName: "Jordan", lastName: "Mercer", email: "alex@example.com", mobilePhone: "8175552002" }],
      canonical,
      new Set(["angler-1"]),
    )).toEqual([]);
  });

  it("does not block a canceled registration because only active ids are supplied", () => {
    expect(findActiveRegistrationDuplicatePositions(
      [{ firstName: "Alex", lastName: "Mercer", email: "alex@example.com", mobilePhone: "8175551001" }],
      canonical,
      new Set(),
    )).toEqual([]);
  });
});
