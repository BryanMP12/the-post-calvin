import { describe, expect, it } from "vitest";
import { parseArgs, STEPS } from "../src/steps.ts";

describe("parseArgs", () => {
  it("shows help with no arguments or a help flag", () => {
    expect(parseArgs([])).toEqual({ kind: "help" });
    expect(parseArgs(["--help"])).toEqual({ kind: "help" });
    expect(parseArgs(["-h"])).toEqual({ kind: "help" });
  });

  it.each(STEPS)("accepts the %s step", (step) => {
    expect(parseArgs([step])).toEqual({ kind: "step", step });
  });

  it("rejects an unknown step", () => {
    expect(parseArgs(["import"])).toMatchObject({ kind: "error" });
  });

  it("rejects extra arguments", () => {
    expect(parseArgs(["load", "--prod"])).toMatchObject({ kind: "error" });
  });
});
