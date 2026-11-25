import { describe, expect, it } from "vitest";

import { daysInApp, removeAccount, upsertAccount, type SavedAccount } from "./accounts";

const acc = (id: string, label = id): SavedAccount => ({ id, email: `${id}@x.ro`, label, access_token: "a", refresh_token: "r" });

describe("zile în aplicație", () => {
  it("prima zi arată 0", () => {
    expect(daysInApp("2026-11-25T08:00:00Z", new Date("2026-11-25T20:00:00Z"))).toBe(0);
  });
  it("numără zilele întregi", () => {
    expect(daysInApp("2026-11-01T10:00:00Z", new Date("2026-11-25T10:00:00Z"))).toBe(24);
  });
});

describe("mai multe conturi", () => {
  it("adaugă un cont nou fără să le șteargă pe celelalte", () => {
    expect(upsertAccount([acc("a")], acc("b")).map((a) => a.id)).toEqual(["a", "b"]);
  });
  it("nu dublează același cont", () => {
    expect(upsertAccount([acc("a"), acc("b")], acc("a")).length).toBe(2);
  });
  it("scoate un cont din listă", () => {
    expect(removeAccount([acc("a"), acc("b")], "a").map((a) => a.id)).toEqual(["b"]);
  });
});
