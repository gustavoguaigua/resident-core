---
name: resident-gap-workflow
description: Use when diagnosing, implementing, validating, or closing a RESIDENT Core readiness GAP such as GAP-S2-005 or GAP-S2-006. Applies only inside the resident-core repository. Enforces SDD traceability, gap isolation, tenant safety, targeted documentation loading, validation, and CLOSED/BLOCKED completion.
---

# RESIDENT Core Gap Workflow

Use this workflow for one RESIDENT Core readiness GAP at a time.

Always follow the repository `AGENTS.md` in addition to this skill.

## 1. One GAP per execution scope

Work exclusively on the requested GAP.

Do not:

- implement the next GAP;
- combine unrelated readiness items;
- advance the Sprint automatically;
- broaden the task into general cleanup or refactoring.

A GAP must reach either:

- `CLOSED`; or
- `BLOCKED`.

Then stop.

## 2. Establish current state

Before modifying files:

1. inspect the current Git branch and working tree;
2. locate the requested GAP in the relevant readiness document;
3. identify its severity, evidence, closure criteria, and directly referenced artifacts;
4. inspect only the code, configuration, specs, ADRs, or SDD documents necessary for that GAP.

Do not reread the entire RESIDENT documentation set.

## 3. Load documentation selectively

Use the readiness GAP as the context router.

Read only when relevant:

- the affected `docs/specs/` specification;
- directly applicable ADRs;
- `docs/sdd/architecture.md` for architectural boundaries;
- `docs/sdd/security.md` for identity, authorization, sensitive data, or tenant isolation;
- `docs/sdd/api-guidelines.md` for API contracts;
- `docs/sdd/data-governance.md` for persistence or tenant data;
- the active Sprint implementation document;
- directly affected change records.

Do not load unrelated historical documents.

## 4. Respect SDD source-of-truth order

When resolving implementation behavior:

1. applicable repository rules;
2. accepted ADRs;
3. active feature specification and contracts;
4. active Sprint implementation/readiness documents;
5. existing implementation where it does not contradict the above.

If authoritative artifacts conflict and the conflict materially affects architecture, security, tenant isolation, data ownership, or API compatibility, stop and report the ambiguity.

Do not invent a new architectural decision.

## 5. Preserve RESIDENT architectural constraints

RESIDENT Core is multi-tenant.

For every relevant change:

- preserve tenant isolation;
- prevent cross-tenant access;
- respect established module ownership;
- preserve current database and tenancy strategy;
- preserve approved authentication and identity strategy;
- preserve public API compatibility unless the GAP explicitly requires a documented contract change.

Do not weaken security or tenancy controls to close a GAP.

## 6. Diagnose before implementing

Determine:

- the concrete root cause;
- the conflicting or duplicate source of truth;
- current consumers;
- the minimal safe correction;
- the validation that proves closure.

Do not begin broad implementation before ownership and expected behavior are clear.

## 7. Implement minimally

Make only changes required to satisfy the GAP closure criteria.

Prefer:

- consolidation over parallel definitions;
- existing repository patterns;
- existing dependencies;
- targeted updates to affected consumers.

Avoid:

- broad refactors;
- speculative architecture;
- unrelated documentation rewrites;
- premature work for later Sprint tasks.

## 8. Prisma and persistence

When the GAP affects Prisma or persistence:

- identify the canonical schema/model owner;
- eliminate overlapping model definitions only when ownership is established;
- preserve tenant-related keys, relations, and isolation constraints;
- avoid destructive schema operations;
- do not execute destructive database commands;
- do not create migrations against assumptions not supported by the specifications;
- validate the affected Prisma schema using repository tooling.

Stop before any irreversible data operation.

## 9. Identity and Keycloak

When the GAP affects identity:

- treat Keycloak as the established Sprint 2 IdP where current ADR/spec documentation requires it;
- preserve fail-closed token validation;
- preserve issuer, audience, JWKS, client, mapper, and tenant-boundary contracts;
- do not introduce local authentication paths or temporary authentication mocks unless explicitly authorized by current specifications.

Do not redesign the Keycloak contract while solving an unrelated GAP.

## 10. Validation

Use targeted validation.

Depending on the GAP, this may include:

- schema validation;
- typecheck;
- focused tests;
- configuration validation;
- contract consistency searches;
- documentation formatting;
- secret scanning;
- `git diff --check`.

Do not run the full monorepo suite unless the GAP affects shared behavior that requires it.

If environment limitations prevent a secondary validation, determine whether that validation is a true closure blocker. Report the limitation explicitly rather than altering the environment unnecessarily.

## 11. Correction loop

When validation fails because of the GAP changes:

1. inspect the failure;
2. correct the smallest justified cause;
3. rerun the relevant check.

After approximately three meaningful unsuccessful cycles on the same issue, stop and report `BLOCKED` unless new evidence justifies another attempt.

## 12. Readiness and traceability

When closure criteria are satisfied:

- update only the readiness/change artifacts necessary to record closure;
- mark the requested GAP as closed;
- preserve evidence of relevant validation.

Do not change Sprint readiness to `GO` merely because one GAP closed.

Sprint remains `NO_GO` while any required blocking GAP remains open.

## 13. Git discipline

Unless explicitly instructed otherwise:

- do not stage;
- do not commit;
- do not push;
- do not merge;
- do not change branches.

Leave the completed GAP in a reviewable working tree.

## 14. Final response

At completion return only:

- `GAP-... CLOSED` or `GAP-... BLOCKED`;
- root cause;
- solution applied;
- files modified;
- validation results;
- remaining blocker, if any;
- next recommended GAP, without implementing it.

Then stop.
