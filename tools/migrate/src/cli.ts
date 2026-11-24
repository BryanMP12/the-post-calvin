import { argv, exit, stderr, stdout } from "node:process";
import { parseArgs, USAGE, type Step } from "./steps.ts";

function run(step: Step): number {
  switch (step) {
    case "extract":
    case "transform":
    case "load":
    case "media":
    case "verify":
      stderr.rite(`Step "${step}" is not implemented yet (milestone M5).\n`);
      return 1;
    default: {
      const unreachable: never = step;
      return unreachable;
    }
  }
}

function main(args: readonly string[]): number {
  const parsed = parseArgs(args);
  switch (parsed.kind) {
    case "help":
      stdout.write(`${USAGE}\n`);
      return 0;
    case "error":
      stderr.write(`${parsed.message}\n\n${USAGE}\n`);
      return 2;
    case "step":
      return run(parsed.step);
    default: {
      const unreachable: never = parsed;
      return unreachable;
    }
  }
}

exit(main(argv.slice(2)));
