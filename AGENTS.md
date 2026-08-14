# AGENTS.md — RESIDENT Core Agent Guide

## Purpose

This file defines the default operating rules for AI coding agents working in the `resident-core` repository.

The goal is to preserve architectural consistency, security, and SDD traceability while minimizing unnecessary repository exploration, context usage, and execution.

## 1. Context loading

Always read this `AGENTS.md` first.

Then inspect only the files and documentation directly relevant to the current task.

Do not scan or reread the entire repository or `docs/` directory unless the task explicitly requires repository-wide analysis.

Prefer targeted file reads and searches over broad exploration.

Do not repeatedly reread files already inspected during the same task unless necessary.

## 2. Source of truth

Follow the existing repository documentation and implementation.

Consult documentation selectively:

- `README.md` for repository-level setup or project overview.
- `docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md` for project-wide product or architectural context.
- `docs/specs/` for feature-specific requirements, plans, contracts, tests, and tasks.
- `docs/sdd/architecture.md` when architecture is affected.
- `docs/sdd/security.md` when authentication, authorization, sensitive data, or security boundaries are affected.
- `docs/sdd/api-guidelines.md` when API contracts or endpoints are affected.
- `docs/sdd/data-governance.md` when persistence, tenant data, privacy, retention, or data ownership is affected.
- relevant ADRs when the task touches an established architectural decision.
- `docs/implementation/` when working on an active implementation milestone or sprint.

Do not load these documents merely because they exist. Read them only when relevant to the task.

When documentation conflicts, prefer the most specific applicable specification or ADR unless a higher-level repository rule explicitly overrides it.

## 3. Scope discipline

Implement only the requested task.

Do not:

- implement future tasks;
- expand the requested feature;
- perform unrelated cleanup;
- refactor unrelated code;
- rename unrelated files or symbols;
- reformat unrelated files;
- introduce speculative abstractions;
- modify documentation unrelated to the implementation;
- change established architectural decisions without explicit authorization.

Prefer the smallest coherent change that fully satisfies the task and its acceptance criteria.

## 4. Autonomous execution

Within the defined task scope, work autonomously.

Do not request confirmation for routine actions clearly required to complete the task, including:

- creating or modifying in-scope files;
- running relevant commands;
- running targeted tests;
- fixing errors introduced by the current implementation;
- rerunning relevant validation after a fix.

Ask for clarification only when the missing decision cannot be safely derived from existing specifications, ADRs, code, or repository conventions.

## 5. Stop conditions

Stop and report before proceeding if the task would require:

- changing an established architectural decision;
- changing the multitenancy strategy;
- weakening tenant isolation;
- changing authentication or authorization strategy;
- weakening a security control;
- making an undocumented breaking API change;
- making a destructive or irreversible data change;
- introducing a major new dependency or infrastructure component;
- materially expanding the requested scope;
- contradicting an applicable specification or ADR.

Do not guess through architectural or security ambiguity.

## 6. Architecture and multitenancy

RESIDENT Core is a multi-tenant system.

Preserve tenant isolation in every relevant change.

Never introduce data access that can bypass the established tenant boundary.

Respect existing architectural boundaries and module ownership.

Do not introduce cross-module coupling merely to simplify a local implementation.

Do not replace an established technology, pattern, or architectural decision without explicit authorization.

## 7. Security

Follow secure-by-default implementation practices.

Never:

- hardcode secrets, credentials, tokens, or private keys;
- expose sensitive information in logs or error responses;
- bypass authentication or authorization checks for convenience;
- weaken validation to make tests pass;
- disable security controls as a workaround.

When the task affects identity, permissions, tenant isolation, sensitive data, or public APIs, consult the relevant security documentation before implementation.

## 8. Dependencies

Prefer existing repository dependencies and platform capabilities.

Do not add a new dependency when the task can be reasonably completed with the existing stack.

Before adding a dependency:

1. verify that it is necessary;
2. prefer a dependency already used by the repository;
3. avoid introducing overlapping libraries.

Stop and report if a major dependency or infrastructure component would be required.

## 9. Testing and validation

Use the smallest relevant validation first.

Prefer:

1. targeted tests for the changed component;
2. relevant module or integration tests when necessary;
3. broader test suites only when the change affects shared behavior or when required by the task.

Do not repeatedly run the entire test suite after every small change.

Never remove, skip, weaken, or rewrite a valid test merely to make the implementation pass.

If the implementation changes expected behavior, update tests only when the specification clearly supports that behavior.

## 10. Failure loop limit

When validation fails because of the current implementation:

1. inspect the failure;
2. make the smallest justified correction;
3. rerun the relevant validation.

Avoid open-ended trial-and-error loops.

If the same problem remains unresolved after approximately three meaningful correction cycles, stop and report:

- the failing command or test;
- the observed error;
- the likely cause;
- the attempted fixes;
- the current state.

Do not continue consuming execution cycles without new evidence.

## 11. Documentation changes

Modify documentation only when:

- the task explicitly requires it;
- implementation changes a documented behavior;
- a specification or task requires status/traceability updates.

Do not rewrite large documentation sections for minor implementation changes.

Keep documentation changes focused and consistent with the existing SDD structure.

## 12. Generated and external files

Do not modify generated files, vendored code, lockfiles, build artifacts, or external dependencies unless the task requires it.

When a tool normally generates a file, prefer using the appropriate tool rather than manually recreating generated content.

## 13. Efficiency rules

Minimize unnecessary context and execution.

Prefer:

- targeted searches;
- targeted file reads;
- small coherent edits;
- targeted tests;
- existing repository patterns.

Avoid:

- repository-wide scans without need;
- rereading unrelated documentation;
- speculative investigation;
- unnecessary command repetition;
- verbose intermediate explanations;
- unrelated improvements discovered during implementation.

Finding a possible improvement does not automatically make it part of the current task.

## 14. Completion criteria

A task is complete when:

- the requested behavior is implemented;
- applicable acceptance criteria are satisfied;
- relevant tests or validations pass;
- no known in-scope regression remains;
- required documentation updates are complete.

Do not continue improving completed work unless explicitly requested.

## 15. Final response

Keep the final response concise.

Report only:

1. implementation result;
2. files created or modified;
3. tests or validations executed and their result;
4. unresolved issues or required decisions, if any.

Do not provide long explanations, tutorials, or restate the task unless explicitly requested.