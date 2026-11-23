import { describe, expect, it } from "vitest";

import { MAX_MESSAGE_LENGTH, canSendMessage, formatChatTime } from "./chat";

describe("Sending chat messages", () => {
  it("refuses an empty or blank message", () => {
    expect(canSendMessage("")).toBe(false);
    expect(canSendMessage("   ")).toBe(false);
  });

  it("allows a normal message", () => {
    expect(canSendMessage("Salut!")).toBe(true);
  });

  it("caps messages at 2000 characters", () => {
    expect(MAX_MESSAGE_LENGTH).toBe(2000);
    expect(canSendMessage("a".repeat(2000))).toBe(true);
    expect(canSendMessage("a".repeat(2001))).toBe(false);
  });
});

describe("Conversation list times", () => {
  const now = new Date(2026, 10, 23, 22, 0);

  it("shows the hour for today", () => {
    expect(formatChatTime(new Date(2026, 10, 23, 9, 5).toISOString(), now)).toBe("09:05");
  });

  it("shows Ieri for yesterday", () => {
    expect(formatChatTime(new Date(2026, 10, 22, 18, 0).toISOString(), now)).toBe("Ieri");
  });

  it("shows the date for older messages", () => {
    expect(formatChatTime(new Date(2026, 10, 2, 18, 0).toISOString(), now)).toBe("02.11.2026");
  });
});
