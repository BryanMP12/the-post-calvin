/** The migration pipeline's steps, in the order they run (see docs/plan.md, M5). */
export const STEPS = ["extract", "transform", "load", "media", "verify"] as const;

export type Step = (typeof STEPS)[number];

export type ParsedArgs =
  | { readonly kind: "step"; readonly step: Step }
  | { readonly kind: "help" }
  | { readonly kind: "error"; readonly message: string };

function isStep(value: string): value is Step {
  return STEPS.some((step) => step === value);
}

/** Parses the CLI arguments (without `node` and the script path). */
export function parseArgs(args: readonly string[]): ParsedArgs {
  const [first, ...rest] = args;
  if (first === undefined || first === "--help" || first === "-h") {
    return { kind: "help" };
  }
  if (!isStep(first)) {
    return { kind: "error", message: `Unknown step "${first}". Expected one of: ${STEPS.join(", ")}.` };
  }
  if (rest.length > 0) {
    return { kind: "error", message: `Unexpected arguments after "${first}": ${rest.join(" ")}.` };
  }
  return { kind: "step", step: first };
}

export const USAGE = `Usage: pnpm migrate <step>\n\nSteps: ${STEPS.join(", ")}\nSee docs/migration.md.`;
