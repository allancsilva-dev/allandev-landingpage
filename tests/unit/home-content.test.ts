import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { homeContent } from "@/lib/home-content";

function leaves(value: unknown, path = ""): [string, unknown][] {
  if (Array.isArray(value))
    return value.flatMap((item, i) => leaves(item, `${path}[${i}]`));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([key, child]) =>
      leaves(child, path ? `${path}.${key}` : key),
    );
  return [[path, value]];
}

/** Every leaf key, minus the array indices: `sobre.skills[0]` → `sobre.skills`. */
function fieldNames() {
  return new Set(
    leaves(homeContent).map(([path]) => path.replace(/\[\d+\]/g, "")),
  );
}

describe("homeContent", () => {
  it("has no empty strings", () => {
    const empty = leaves(homeContent).filter(
      ([, value]) => typeof value === "string" && value.trim() === "",
    );
    expect(empty).toEqual([]);
  });

  // A field nobody renders is how the module drifted from the page before:
  // page.tsx hardcoded labels while these sat unread.
  it("has no field that the app never reads", () => {
    const sources = [
      "src/app/page.tsx",
      "src/app/projetos/page.tsx",
      "src/components/hero-player-card.tsx",
      "src/components/site-footer.tsx",
      "src/components/contact-form.tsx",
    ]
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    const unread = [...fieldNames()].filter((path) => {
      const last = path.split(".").at(-1)!;
      return !new RegExp(`\\b${last}\\b`).test(sources);
    });
    expect(unread).toEqual([]);
  });
});
