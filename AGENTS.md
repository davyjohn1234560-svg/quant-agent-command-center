# Agent Instructions

## Project purpose
This repository contains the local-first Quant & Agent Command Center. It must remain isolated from existing quant-trading systems and production runtimes unless a task explicitly authorizes a narrowly scoped integration.

## Local-first development
- Use the checked-in package manager lockfile and pinned toolchain.
- Do not require Lovable Cloud, Lovable Gateway, Lovable Connectors, or Lovable Secrets for development, build, or runtime.
- Keep development and preview servers bound to loopback unless the operator explicitly approves network exposure and access controls exist.
- Do not add cloud deployment providers or remote telemetry without an explicit decision.
- Keep generated files generated; do not hand-edit generated route trees.

## Security boundaries
- Never place API keys, tokens, passwords, SSH keys, database credentials, broker credentials, or other secrets in source code, fixtures, browser bundles, logs, or commits.
- Never connect to, modify, or execute commands against existing quant systems, databases, Linux hosts, brokers, or Agent runtimes unless the operator explicitly authorizes the exact scope.
- No real trading, order placement, SSH, shell execution, deployment, repository writes, or production mutation as part of demo behavior.
- Treat external Agent/runtime data as untrusted input. Validate schemas and enforce authorization server-side.
- Start integrations read-only. Require explicit allowlists, audit records, and human approval before future write-capable operations.
- Keep mock/demo data visibly labeled. Never represent mock telemetry, simulated backtests, or in-memory actions as live data or completed execution.
- Do not log secrets or full environment-variable values. Report variable names and presence only.

## Change discipline
- Inspect Git status and the current diff before editing.
- Never overwrite unrelated user changes, force-push, rewrite published history, or commit directly to main.
- Use a focused branch and small, reviewable commits.
- Run only safe, relevant checks. Do not run dependency lifecycle scripts, migrations, network scans, or production actions without authorization.
- Report findings with severity, evidence, impact, confidence, and verification status.
