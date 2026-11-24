# migrate

The WordPress → EmDash migration tool (a separate workspace package, Node only, never imported by the site).
Run it from the repo root with `pnpm migrate <step>`. The pipeline is designed in M5; see docs/plan.md
(and docs/migration.md once it exists). Its dependencies stay in this package's `package.json`.
