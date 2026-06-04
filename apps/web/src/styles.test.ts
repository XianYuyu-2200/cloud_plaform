import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("./src/styles.css", "utf8");

function ruleFor(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([\\s\\S]*?)\\}`));
  return match?.[1] ?? "";
}

describe("dashboard layout styles", () => {
  it("keeps full-page and panel overflow scrollable instead of clipping content", () => {
    expect(ruleFor(".platform-shell")).toContain("overflow-x: hidden");
    expect(ruleFor(".platform-shell")).toContain("overflow-y: auto");
    expect(ruleFor(".panel-content")).toContain("overflow-y: auto");
  });
});
