# Skill conversion verification — 2026-09-06

No earlier conversion report was present in the allowed cheap lookup locations:
`D:\\tmp`, `C:\\Users\\Win10\\.gstack`, or the top level of
`C:\\Users\\Win10\\.codex\\skills`.

The current Codex skill directory contains 54 `*-codex` directories. Each
directory was checked at its top level for a `SKILL.md` with the Codex variant
marker. The verified variant names are:

`autoplan-codex`, `benchmark-codex`, `benchmark-models-codex`,
`browse-codex`, `canary-codex`, `caveman-compress-codex`,
`caveman-explore-codex`, `caveman-setup-codex`, `codex-codex`,
`context-restore-codex`, `context-save-codex`, `cso-codex`,
`design-consultation-codex`, `design-html-codex`, `design-review-codex`,
`design-shotgun-codex`, `devex-review-codex`, `document-generate-codex`,
`document-release-codex`, `gstack-codex`, `health-codex`, `investigate-codex`,
`ios-clean-codex`, `ios-design-review-codex`, `ios-fix-codex`,
`ios-qa-codex`, `ios-sync-codex`, `land-and-deploy-codex`,
`landing-report-codex`, `learn-codex`, `make-pdf-codex`, `office-hours-codex`,
`open-gstack-browser-codex`, `orchestrate-codex`, `pair-agent-codex`,
`plan-ceo-review-codex`, `plan-design-review-codex`, `plan-devex-review-codex`,
`plan-eng-review-codex`, `plan-tune-codex`, `qa-codex`, `qa-only-codex`,
`retro-codex`, `review-codex`, `risk-scan-codex`, `scrape-codex`,
`setup-browser-cookies-codex`, `setup-deploy-codex`, `setup-gbrain-codex`,
`ship-codex`, `skillify-codex`, `spec-codex`, `startproject-codex`,
`sync-gbrain-codex`.

The model mapping declared by the verified Codex orchestration variants is:

- orchestrator: `gpt-6-astra` at high reasoning;
- default worker: `gpt-5.6-luna` at xhigh reasoning;
- complex implementation or security worker: `gpt-5.6-terra` at high reasoning.

This verifies the installed variant files and their declared mapping. It does
not prove that every original Claude workflow has equivalent runtime behavior,
that every referenced external connector is installed, or that every skill has
been exercised. Several skill bodies still describe Codex App thread tools
(`mcp__codex_app__create_thread`, `send_message_to_thread`, and
`wait_threads`) and Claude-era Agent/AskUserQuestion flows. In this host,
actual internal subagent delegation takes precedence over those thread-tool
instructions; the tool names in a skill are therefore a compatibility
limitation, not evidence that a conversion was executed end to end.

No recursive disk scan and no new skill conversion was performed for this
verification.
