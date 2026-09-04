# Sprint 3 — Fase 2 Residents/Properties API

## 1. Resultado

| Campo | Valor |
| --- | --- |
| Fecha | 2026-09-03 |
| Estado | `PASS` |
| Decisión Sprint 3 | `GO` |
| Fase anterior | `1` |
| Fase resultante | `2` |
| Siguiente fase permitida | `3` — secure-document-storage |

## 2. Alcance implementado

La fase incorpora exclusivamente la API tenant-scoped aprobada de Spec 003 para
`PropertyUnit`, `Person`, `LegalEntity`, `PropertyOwnership`, `Residency` y `Lease`:

- 31 operaciones administrativas y tres lecturas `.own` de la allowlist canónica;
- autenticación, tenant activo, identidad y membership activas, permisos Core exactos
  y resolución `.own` fail-closed;
- vínculo `Person.userProfileId` mediante `link-user`, con validación de perfil humano
  activo, membership activa del mismo tenant y unicidad;
- eventos Audit `SUCCESS` sanitizados del catálogo de GAP-S3-007;
- ledger transversal `IdempotencyOperation`, migración y servicio reutilizable conforme
  a GAP-S3-010 para todos los `POST` y `PATCH`;
- gates reproducibles `test:residents` y `test:residents:authorization`.

OpenAPI permanece diferido a la Fase 9. Se excluyen UI, API pública/platform, storage
documental y todos los dominios financieros de fases posteriores.

## 3. Evidencia reproducible

```text
pnpm test:residents
PASS — tres pruebas funcionales; cuatro pruebas de autorización omitidas por selección
PASS — seis migraciones desde PostgreSQL vacío, status limpio y drift ausente

pnpm test:residents:authorization
PASS — cuatro pruebas de autorización; tres pruebas funcionales omitidas por selección
PASS — seis migraciones desde PostgreSQL vacío, status limpio y drift ausente

pnpm sprint3:gates
PASS — frontera automática en fase 2
PASS — test:residents:persistence
PASS — test:residents
PASS — test:residents:authorization
```

Los gates usan secretos sintéticos, PostgreSQL `17.10-bookworm`, almacenamiento
temporal y limpieza automática. No utilizan datos ni volúmenes locales persistentes.

## 4. Garantías demostradas

- acceso administrativo sólo con permiso Core persistido, sin elevación por claims;
- contexto `X-Tenant-Id` validado y recursos cross-tenant no revelados;
- `.own` resuelto desde `UserProfile -> Person` y relaciones activas del mismo tenant;
- `link-user` cerrado ante tipo, estado, membership, tenant o duplicidad inválidos;
- transiciones de estado y campos prohibidos rechazados;
- primer uso, replay equivalente, conflictos, concurrencia, expiración y reutilización
  idempotentes sin persistir clave ni payload originales;
- mutación, Audit y finalización del ledger atómicos, con rollback ante fallo;
- respuesta y Audit sin tokens, secretos, payloads ni PII fuera del DTO autorizado.

## 5. Decisión

La Fase `2` queda completada con `PASS`. Sprint 3 conserva `GO` y autoriza a
continuación únicamente la Fase `3 — secure-document-storage`.
