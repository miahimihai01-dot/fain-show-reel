import { describe, expect, it } from "vitest";

import { EMPTY_TAB_TEXT, clipsForIds, profileUrl, videoUrl } from "./library";
import { shareHref } from "./share";

describe("Profile tabs", () => {
  it("shows the requested empty messages", () => {
    expect(EMPTY_TAB_TEXT.favorite).toBe("Nu ai niciun video salvat încă.");
    expect(EMPTY_TAB_TEXT.aprecieri).toBe("Nu ai apreciat niciun video încă.");
  });

  it("a tab shows only its own videos, newest first", () => {
    const known = [{ id: "a" }, { id: "b" }, { id: "c" }] as never[];
    expect(clipsForIds(["c", "a"], known).map((c: { id: string }) => c.id)).toEqual(["c", "a"]);
  });
});

describe("Own links", () => {
  it("each profile has its own link", () => {
    expect(profileUrl("https://fainshow.app", "ana.filme")).toBe("https://fainshow.app/@ana.filme");
  });

  it("each video has its own link", () => {
    expect(videoUrl("https://fainshow.app", "12345")).toBe("https://fainshow.app/video/12345");
  });

  it("WhatsApp shares the video's own link", () => {
    expect(shareHref("whatsapp", "https://fainshow.app/video/12345", "Uite")).toContain(
      encodeURIComponent("https://fainshow.app/video/12345"),
    );
  });
});
