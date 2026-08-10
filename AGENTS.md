# AGENTS.md — RESIDENT Core Repository Guide

## Scope

These instructions apply to the entire `resident-core` repository.

All work performed by an AI coding agent in this repository must follow this guide.

## Project status

RESIDENT Core is currently transitioning from SDD documentation to Sprint 0 technical foundation.

Sprint 0 is infrastructure and engineering-foundation work only.

Business functionality starts in later sprints and must not be implemented unless explicitly authorized by the corresponding specification and implementation plan.

## Active source of truth

Before making changes, read:

1. `README.md`
2. `docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md`
3. `docs/specs/SPECS_INDEX.md`
4. `docs/sdd/constitution.md`
5. `docs/sdd/architecture.md`
6. `docs/sdd/security.md`
7. `docs/sdd/api-guidelines.md`
8. `docs/sdd/data-governance.md`
9. `docs/sdd/documentation-standard.md`
10. `docs/implementation/sprint-0-foundation.md`

When a task affects a specific domain or capability, also read the corresponding documents under:

* `docs/specs/`
* `docs/decisions/`
* `docs/changes/`

before implementing the change.

## Source-of-truth precedence

When documents appear to conflict, use the following precedence:

1. `docs/sdd/constitution.md`
2. Approved ADRs under `docs/decisions/`
3. `docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md`
4. Domain specifications under `docs/specs/`
5. `docs/sdd/architecture.md`
6. `docs/sdd/security.md`
7. `docs/sdd/api-guidelines.md`
8. `docs/sdd/data-governance.md`
9. Current sprint implementation document
10. Existing implementation code

Do not silently resolve architectural contradictions.

If a relevant contradiction is found, report it before introducing a design decision that would change the architecture.

## Repository layout

Create implementation code only in these locations:

* `apps/api/`
* `apps/admin-web/`
* `apps/resident-web/`
* `packages/shared/`
* `packages/config/`
* `packages/auth/`
* `packages/openapi-client/`
* `packages/testing/`
* `infra/`
* `prisma/`
* `tools/`
* `.github/workflows/`

Keep SDD documentation in:

* `docs/sdd/`
* `docs/decisions/`
* `docs/specs/`
* `docs/changes/`
* `docs/implementation/`
* `docs/consolidated/`
* `docs/templates/`

Do not introduce a new top-level directory without an explicit architectural reason.

## Implementation discipline

Follow Spec-Driven Development.

Before implementing a requested feature or technical capability:

1. Identify the specification, ADR, architecture rule or Sprint task that authorizes the change.
2. Inspect the existing repository before creating new files or structures.
3. Prefer the smallest change that satisfies the requirement.
4. Preserve existing architecture and naming conventions.
5. Reuse existing packages and abstractions when appropriate.
6. Avoid speculative abstractions or infrastructure not required by the current task.
7. Do not implement future Sprint functionality opportunistically.

The specification is the contract.

Code must conform to the specification; the specification must not be silently changed to match the code.

## Architectural decisions

Do not make major architectural decisions implicitly.

Examples include:

* changing the authentication strategy;
* changing the multitenancy model;
* changing database strategy;
* introducing a new framework;
* introducing a new infrastructure service;
* changing API style or conventions;
* changing service boundaries;
* changing security assumptions;
* changing deployment architecture.

If such a decision is necessary and is not already covered by an approved ADR, report it and recommend creating or updating an ADR before implementation.

## Security rules

Security requirements in `docs/sdd/security.md` are mandatory.

In particular:

* Never commit real credentials, tokens or secrets.
* Never use real resident data.
* Never expose internal storage identifiers such as `storageKey`.
* Never weaken tenant isolation.
* Never bypass authentication or authorization for convenience.
* Never hard-code tenant identity where tenant context is required.
* Never expose implementation details that contradict the API guidelines.

Use example, generated or synthetic data only.

## Do not

* Do not rewrite existing SDD documents unless explicitly asked.
* Do not move `docs/`.
* Do not implement business logic before Sprint 1.
* Do not create payments, residents, dues, account statements, reservations or documents logic during Sprint 0.
* Do not use WordPress as a transactional backend.
* Do not expose `storageKey`.
* Do not use real resident data.
* Do not commit real secrets.
* Do not create files outside the current workspace.
* Do not introduce dependencies that are not necessary for the current task.
* Do not change architectural decisions simply because another approach appears preferable.
* Do not perform unrelated refactors while completing a task.
* Do not silently change public API contracts.

## Sprint 0 goal

Implement only the technical foundation described in:

`docs/implementation/sprint-0-foundation.md`

Sprint 0 work must remain infrastructure-focused and must not introduce RESIDENT business workflows.

## Working procedure

For each implementation task:

1. Read the relevant source-of-truth documents.
2. Inspect the affected repository structure.
3. Identify the smallest compliant implementation.
4. Make the changes.
5. Run the relevant validation commands.
6. Fix failures caused by the change when possible.
7. Review the diff for unintended modifications.
8. Report the result.

Do not modify unrelated files unless necessary to complete the task.

## Validation

After changes, run the relevant available checks, which may include:

* dependency installation validation;
* formatting;
* linting;
* type checking;
* unit tests;
* integration tests;
* build;
* Prisma validation;
* Docker configuration validation;
* infrastructure configuration validation.

Do not claim a validation succeeded unless the corresponding command was actually executed successfully.

## Completion report

After changes, report:

* task/specification implemented;
* files created;
* files modified;
* files deleted, if any;
* commands run;
* validation results;
* commands that failed;
* unresolved issues;
* assumptions made;
* architectural decisions encountered;
* next recommended steps.

If no files were modified, state that explicitly.
