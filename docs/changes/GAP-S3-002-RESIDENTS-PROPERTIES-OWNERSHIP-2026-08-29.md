# GAP-S3-002 — Contrato canónico de residentes y propiedades

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-002` |
| Severidad | Crítica |
| Estado | `CLOSED` |
| Fecha | 2026-08-29 |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Decisión de readiness | `NO_GO` |
| Fase | `0 — readiness` |

Cerrar este gap no autoriza implementación ni cambia la decisión de readiness. Los
documentos de Spec 003 permanecen en `needs-review` hasta cerrar todos sus blockers y
ejecutar la aprobación documental de GAP-S3-001.

## 2. Causa raíz

Spec 003 describía alternativas sin una decisión única para identificación, vínculo de
identidad, ownership, residencia, arrendamiento, menores y autorización `.own`. El
modelo propuesto también mostraba extensiones de `Tenant` y `UserProfile` sin separar
claramente ownership de tabla y relaciones inversas. Esto impedía fijar un slice Prisma
reproducible y seguro para los módulos financieros de Sprint 3.

## 3. Ownership canónico

| Artefacto | Owner canónico |
| --- | --- |
| `Tenant` | Spec 001 |
| `UserProfile`, membership, roles y autorización persistida | Spec 002 |
| `Person`, `LegalEntity`, `PropertyUnit`, `PropertyOwnership`, `Residency`, `Lease` | Spec 003 |

Spec 003 puede añadir relaciones Prisma inversas a `Tenant` y `UserProfile`, pero no
redeclara sus tablas, columnas ni reglas de lifecycle. La FK opcional hacia
`UserProfile` pertenece a `Person`; la existencia de esa relación no transfiere a
Keycloak ni a Spec 003 el ownership de identidad o autorización.

## 4. Slice persistente exacto de Sprint 3

El slice autorizado contiene exclusivamente:

1. `Person` — persona natural tenant-scoped, vinculable de forma opcional a una
   identidad Core.
2. `LegalEntity` — persona jurídica tenant-scoped que puede participar como
   propietaria o parte contractual.
3. `PropertyUnit` — unidad física tenant-scoped y referencia canónica de los módulos
   financieros.
4. `PropertyOwnership` — historial temporal de ownership de una unidad por una
   `Person` o `LegalEntity`.
5. `Residency` — historial temporal de ocupación de una `Person` en una unidad.
6. `Lease` — contrato temporal entre una unidad, un arrendatario `Person` y exactamente
   un arrendador `Person` o `LegalEntity`.

Los enums canónicos del slice son:

- `PersonStatus`: `ACTIVE`, `INACTIVE`, `ARCHIVED`.
- `LegalEntityStatus`: `ACTIVE`, `INACTIVE`, `ARCHIVED`.
- `IdentificationType`: `CEDULA`, `RUC`, `PASSPORT`, `OTHER`; ausencia se representa
  con `null`, no con `NONE`.
- `PropertyUnitStatus`: `ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE`, `BLOCKED`,
  `ARCHIVED`.
- `PropertyUnitType`: `HOUSE`, `APARTMENT`, `SUITE`, `LOT`, `PARKING`, `STORAGE`,
  `COMMERCIAL`, `MIXED`, `OTHER`.
- `OwnershipStatus`: `ACTIVE`, `ENDED`, `DISPUTED`, `ARCHIVED`.
- `OwnershipType`: `OWNER`, `CO_OWNER`, `LEGAL_REPRESENTATIVE`, `USUFRUCTUARY`,
  `OTHER`.
- `ResidencyStatus`: `ACTIVE`, `ENDED`, `SUSPENDED`, `ARCHIVED`.
- `ResidencyType`: `OWNER_RESIDENT`, `TENANT`, `FAMILY_MEMBER`,
  `AUTHORIZED_OCCUPANT`, `CARETAKER`, `OTHER`.
- `LeaseStatus`: `DRAFT`, `ACTIVE`, `ENDED`, `CANCELLED`, `ARCHIVED`.

`Vehicle`, `Pet` y `EmergencyContact`, junto con sus enums y operaciones, quedan
fuera de Sprint 3. Los menores se representan únicamente como `Person` sin
`UserProfile`; no se introducen modelos ni datos especiales de tutela, salud,
biometría o consentimiento en este sprint.

## 5. Invariantes de datos y tenant

1. Los seis modelos tienen `tenantId`; no existe acceso ni relación cross-tenant.
2. Las entidades raíz exponen una clave compuesta lógica `(id, tenantId)`. Las
   relaciones entre modelos de Spec 003 deben incluir `tenantId` en sus FKs o una
   constraint PostgreSQL equivalente que demuestre pertenencia al mismo tenant.
3. `PropertyUnit.code` es único dentro del tenant, no globalmente.
4. `Person.userProfileId` es opcional. Cuando existe, `(tenantId, userProfileId)` es
   único; un perfil puede vincularse como máximo a una persona por tenant y a personas
   distintas en tenants distintos.
5. Vincular o usar un perfil exige `UserProfile` humano y activo y una membership
   activa en el mismo tenant. La comprobación pertenece a Core y falla cerrada.
6. La identificación es opcional. Si se informa, tipo y número normalizado son
   obligatorios y únicos por `(tenantId, identificationType, identificationNumber)`;
   el mismo documento puede existir en otro tenant. Sprint 3 no valida oficialmente
   documentos ante fuentes externas.
7. `PropertyOwnership` tiene exactamente un owner: `personId` XOR `legalEntityId`.
   `Lease` tiene exactamente un arrendador: `ownerPersonId` XOR
   `ownerLegalEntityId`; su arrendatario es una `Person` del mismo tenant.
8. Una unidad puede existir sin owner o residente activo durante onboarding o
   migración. Los cargos siguen perteneciendo a `PropertyUnit`, no a la persona.
9. `ownershipPercentage` es opcional; cuando existe, es mayor que 0 y menor o igual a
   100. La suma de porcentajes conocidos para ownerships activos de una unidad no puede
   superar 100. No se crea un setting nuevo para alterar esta regla.
10. Puede existir como máximo un owner primario activo y un residente primario activo
    por unidad. Ninguno es obligatorio al crear la unidad.
11. Al activar un `Lease` se crea o vincula en la misma transacción una `Residency`
    `TENANT` activa para su arrendatario y unidad. `Lease.residencyId` es opcional en
    borrador, único cuando se asigna y obligatorio desde `ACTIVE`; finalizar el lease
    finaliza esa residencia en la misma transacción.
12. Las relaciones históricas no se sobrescriben ni se eliminan físicamente. Las FKs
    usan comportamiento restrictivo y los estados terminales preservan trazabilidad.

## 6. Lifecycle canónico

- `Person` y `LegalEntity`: `ACTIVE <-> INACTIVE`; cualquiera de esos estados puede
  pasar a `ARCHIVED`; `ARCHIVED` es terminal.
- `PropertyUnit`: `ACTIVE` puede pasar a `INACTIVE`, `UNDER_MAINTENANCE` o `BLOCKED`;
  esos estados pueden volver a `ACTIVE`; cualquier estado no archivado puede pasar a
  `ARCHIVED`; `ARCHIVED` es terminal.
- `PropertyOwnership`: `ACTIVE -> ENDED | DISPUTED`; `DISPUTED -> ACTIVE | ENDED`;
  `ENDED -> ARCHIVED`; `ARCHIVED` es terminal.
- `Residency`: `ACTIVE -> SUSPENDED | ENDED`; `SUSPENDED -> ACTIVE | ENDED`;
  `ENDED -> ARCHIVED`; `ARCHIVED` es terminal.
- `Lease`: `DRAFT -> ACTIVE | CANCELLED`; `ACTIVE -> ENDED`; `ENDED | CANCELLED ->
  ARCHIVED`; `ARCHIVED` es terminal.

Toda transición fuera de estas listas falla cerrada. Las fechas de inicio y fin deben
ser coherentes y los cambios multi-entidad se realizan de manera atómica. Los permisos
y eventos Audit exactos se cerrarán en GAP-S3-007; la superficie API e idempotencia se
cerrarán en GAP-S3-006.

## 7. Semántica canónica de `.own`

La resolución `.own` sigue esta cadena, sin aceptar identidad, tenant, unidad o rol
desde parámetros o claims no autorizados:

```text
subject validado por Keycloak
  -> UserProfile HUMAN y ACTIVE
  -> membership ACTIVE en TenantContext
  -> Person ACTIVE única vinculada en ese tenant
  -> PropertyOwnership ACTIVE no disputada o Residency ACTIVE
  -> PropertyUnit del mismo tenant
```

- Una relación histórica, suspendida, terminada, disputada o archivada no concede
  acceso ordinario `.own`.
- Un `Lease` no concede acceso por sí solo; lo concede su `Residency` activa asociada.
- Subject desconocido, perfil no humano/inactivo, membership inactiva, persona ausente
  o duplicada, tenant cruzado o relación no activa producen `DENY`.
- En Sprint 3 `.own` es exclusivamente de lectura. No autoriza autoedición de persona,
  unidad, ownership, residency ni lease.
- El acceso administrativo requiere permisos Core tenant-scoped definidos por
  GAP-S3-007. El acceso histórico, si se autoriza, requiere un permiso explícito que se
  definirá junto con la superficie API en GAP-S3-006/007.

## 8. Fuera de alcance y dependencias pendientes

Este cierre no define endpoints, DTOs, errores, claves de idempotencia, permisos ni
acciones Audit concretas. Tampoco implementa Prisma, migraciones o runtime. Esos
contratos permanecen bajo GAP-S3-006/007 y la implementación sólo podrá comenzar tras
una reevaluación `GO` separada.

## 9. Criterio de cierre demostrado

- slice Prisma conceptual exacto y enums fijados;
- ownership único entre Specs 001, 002 y 003;
- invariantes tenant y relaciones `UserProfile/Person/PropertyUnit` definidas;
- identificación, menores, ownership, residencia y lease sin alternativas abiertas;
- lifecycle y semántica `.own` fail-closed definidos;
- extensiones futuras excluidas de Sprint 3;
- readiness permanece `NO_GO`, fase 0.
