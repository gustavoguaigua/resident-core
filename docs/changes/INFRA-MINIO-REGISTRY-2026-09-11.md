# Infra — Transición del registry oficial de MinIO

## 1. Estado

| Campo | Valor |
| --- | --- |
| Fecha | 2026-09-11 |
| Estado | `CLOSED` |
| Alcance | Referencia descargable de MinIO para entorno local y gates |
| Cambio funcional | Ninguno |

## 2. Causa

La referencia `minio/minio:RELEASE.2025-09-07T16-13-09Z` dejó de ser descargable desde
Docker Hub por un runner limpio y bloqueó los gates antes de su ejecución. No existe
evidencia de que el fallo requiera autenticación: el repositorio/tag de origen responde
como no disponible incluso fuera de CI.

## 3. Decisión

Los artefactos ejecutables usan desde este cambio:

```text
quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z
```

MinIO documenta `quay.io/minio/minio` como fuente oficial para contenedores. El tag
exacto existe y su manifest multi-arquitectura remoto tiene el digest:

```text
sha256:14cea493d9a34af32f524e538b8346cf79f3321eff8e708c1e2960462bd8936e
```

El digest coincide con el conocido para la imagen local anterior. El manifest
`linux/amd64` es
`sha256:a1a8bd4ac40ad7881a245bab97323e18f971e4d4cba2c2007ec1bedd21cbaba2`.
Por tanto, cambia únicamente el registry: release, contenido, comando, healthcheck,
puertos, volúmenes, credenciales sintéticas y comportamiento S3-compatible permanecen
sin cambios.

Fuente oficial:
`https://min.io/docs/minio/container/index.html`.

## 4. Archivos activos

- `docker-compose.yml`;
- `tools/documents/run-phase-3-gate.mjs`;
- `tools/payments/run-phase-6-gate.mjs`;
- `docs/decisions/ADR-009-deployment-strategy.md`.

## 5. Evidencia histórica preservada

No se reescriben las referencias originales de estos documentos cerrados:

- `docs/changes/READINESS-031-2026-08-09.md`, estado `superseded`;
- `docs/implementation/sprint-0-foundation.md`, Sprint 0 completo;
- `docs/specs/031-implementation-readiness/spec.md`, estado `complete`.

Este documento registra la transición posterior y evita alterar la evidencia de la
fuente usada en su momento.

## 6. Validación

- `docker pull quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z`: `PASS`; digest
  `sha256:14cea493d9a34af32f524e538b8346cf79f3321eff8e708c1e2960462bd8936e`.
- `docker compose config --quiet`: `PASS`.
- `pnpm sprint3:boundary`: `PASS`; fase 9, `GO`, 35 documentos y 0
  `needs-review`.
- Los gates `test:documents` (19/19) y `test:payments` (5/5) ejecutaron la misma
  release desde Quay con resultado `PASS`.
- `pnpm sprint2:gates`: bloqueado después de superar los gates previos por dos
  timeouts y un conflicto transaccional en Invitations/Memberships, sin relación con
  MinIO.
- `pnpm sprint3:gates`: superó todos los gates de Fases 1–8 y `test:api`; se bloqueó
  después en la suite general de integración por ausencia local de `DATABASE_URL`, sin
  relación con MinIO.
- `pnpm openapi:check`: bloqueado por el error ambiental conocido
  `uv_os_get_passwd ENOMEM`; OpenAPI no fue modificado.
- `pnpm security:dependencies`: `PASS`; 0 vulnerabilidades altas o críticas y 4
  moderadas.
- `pnpm security:secrets`: `PASS`; sin filtraciones.

## 7. Frontera

El cambio no añade autenticación de registry, mirrors, dependencias, servicios ni
infraestructura. No modifica aplicación, Prisma, OpenAPI, permisos, Audit, gates,
credenciales, `currentPhase` ni el cierre funcional de Sprint 3.
