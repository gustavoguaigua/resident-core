# Sprint 3 — Fase 1 Residents/Properties persistence

## 1. Resultado

| Campo | Valor |
| --- | --- |
| Fecha | 2026-08-31 |
| Estado | `PASS` |
| Decisión Sprint 3 | `GO` |
| Fase anterior | `0` |
| Fase resultante | `1` |
| Siguiente fase permitida | `2` — Residents/Properties API |

## 2. Alcance implementado

La fase incorpora exclusivamente la persistencia tenant-scoped aprobada de Spec 003:

- `Person`, `LegalEntity`, `PropertyUnit`, `PropertyOwnership`, `Residency`
  y `Lease`;
- enums, relaciones compuestas, constraints históricas y unicidades parciales;
- FK opcional `UserProfile -> Person` y vínculo único por tenant; la validación
  fail-closed de perfil humano activo y membership activa corresponde a la Fase 2;
- migración aditiva y gate reproducible `test:residents:persistence`.

Se excluyen módulos runtime, casos de uso, autorización `.own`, endpoints, OpenAPI y
los dominios financieros o documentales de fases posteriores.

## 3. Evidencia reproducible

```text
pnpm test:residents:persistence
PASS — cinco migraciones aplicadas desde PostgreSQL vacío
PASS — migrate status sin pendientes
PASS — migrate diff sin drift
PASS — Prisma Client generado
PASS — constraints, relaciones tenant-scoped e historial restrictivo
PASS — segunda aplicación sin migraciones pendientes

pnpm sprint3:gates
PASS — frontera automática en fase 1
PASS — test:residents:persistence
```

El gate usa secretos sintéticos, PostgreSQL `17.10-bookworm`, almacenamiento temporal
y limpieza automática. No utiliza datos ni volúmenes locales persistentes.

## 4. Garantías demostradas

- código de unidad e identificación únicos dentro del tenant, no globalmente;
- un único vínculo `UserProfile -> Person` por tenant;
- FKs compuestas que rechazan relaciones cross-tenant;
- XOR de propietarios de ownership y lease;
- porcentaje individual válido y suma activa no mayor a 100;
- un owner y un residente primario activos por unidad;
- lease activo únicamente con residency `TENANT` activa y coincidente;
- fechas coherentes y eliminación restrictiva de relaciones históricas.

## 5. Decisión

La Fase `1` queda completada con `PASS`. Sprint 3 conserva `GO` y autoriza a
continuación únicamente la Fase `2 — residents-properties-api`.
