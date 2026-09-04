# Sprint 3 — Fase 3 Secure Document Storage

## 1. Resultado

| Campo | Valor |
| --- | --- |
| Fecha | 2026-09-04 |
| Estado | `PASS` |
| Decisión Sprint 3 | `GO` |
| Fase anterior | `2` |
| Fase resultante | `3` |
| Siguiente fase permitida | `4` — dues-fees-foundation |

## 2. Alcance implementado

La fase incorpora exclusivamente almacenamiento documental privado para comprobantes
de pago futuros, sin crear `PaymentReceipt`, controladores ni endpoints:

- persistencia tenant-scoped para `SecureDocument`, `SecureDocumentVersion`,
  `SecureDocumentFile`, `SecureDocumentLink`, `SecureDocumentPolicy` y
  `SecureDocumentAccessLog`;
- puerto interno y adapter S3-compatible para MinIO local y storage privado no local;
- validación de PDF, JPEG y PNG hasta 10 MiB, magic bytes, MIME, extensión, filename,
  tamaño y SHA-256 calculado por Core;
- upload temporal, promoción, lectura autorizada, compensación y reconciliación de
  huérfanos expirados;
- idempotencia mediante el ledger transversal de Fase 2 y Audit sanitizado conforme a
  GAP-S3-007;
- gate reproducible `test:documents` con PostgreSQL y MinIO efímeros.

OpenAPI permanece diferido a Fase 9. Se excluyen APIs documentales, permisos
`documents.*`, signed URLs, antivirus, workers y dominios financieros.

## 3. Evidencia reproducible

```text
pnpm test:documents
PASS — 19 pruebas de persistencia, seguridad, autorización, idempotencia,
concurrencia, compensación y reconciliación
PASS — siete migraciones desde PostgreSQL vacío, status limpio, drift ausente y
segunda aplicación sin pendientes

pnpm sprint3:gates
PASS — frontera automática en fase 3 y gates acumulativos de fases 1–3
```

El gate usa credenciales sintéticas, PostgreSQL `17.10-bookworm`, MinIO privado,
proyecto Compose aislado y limpieza automática. No utiliza datos ni volúmenes locales
persistentes.

## 4. Garantías demostradas

- relaciones y referencias tenant-scoped con rechazo cross-tenant;
- sólo archivos validados quedan `AVAILABLE` con scan `NOT_REQUIRED`;
- claves UUID namespaced generadas por servidor y metadata interna nunca expuesta;
- autorización del recurso origen revalidada mediante un puerto, sin acceso implícito
  de PlatformAdmin;
- primer uso, replay, conflicto y concurrencia usan el ledger existente sin duplicar
  documento, objeto ni Audit;
- persistencia y Audit transaccionales, con compensación si una promoción precede a un
  rollback;
- detección y reconciliación tenant-aware sólo para objetos técnicos no referenciados
  expirados por 24 horas;
- resultados y Audit no contienen binarios, filename original, storage keys, hashes
  completos, secretos ni credenciales.

## 5. Decisión

La Fase `3` queda completada con `PASS`. Sprint 3 conserva `GO` y autoriza a
continuación únicamente la Fase `4 — dues-fees-foundation`.
