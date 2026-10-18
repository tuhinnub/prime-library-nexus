import { describe, expect, it } from "vitest";
import { dueState } from "@/lib/due";

const now = new Date("2026-10-18T12:00:00Z");
describe("due state", () => {
  it("is overdue after the due date", () => expect(dueState("2026-10-17T12:00:00Z", null, now)).toBe("overdue"));
  it("is due soon within 3 days", () => expect(dueState("2026-10-21T12:00:00Z", null, now)).toBe("due_soon"));
  it("is active beyond 3 days", () => expect(dueState("2026-10-25T12:00:00Z", null, now)).toBe("active"));
  it("is returned once returned", () => expect(dueState("2026-10-17T12:00:00Z", "2026-10-18T00:00:00Z", now)).toBe("returned"));
});
