# GAP-S2-007 — Semántica canónica de Audit base

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Gap | `GAP-S2-007` |
| Fecha | 2026-08-13 |
| Estado | `closed` |
| Specs afectadas | 001 — Tenants; 002 — Identity and Access; 007 — Audit |
| Decisión de readiness | Continúa `NO_GO` |

## 2. Causa raíz

Spec 007 describía a la vez escritura, consulta, exportación, dominios futuros y un
modelo extensible. Además proponía escrituras `critical` y `best effort` sin fijar qué
eventos de Sprint 2 compartían transacción con la mutación de negocio. El runbook sólo
autorizaba una base durable para Specs 001/002, pero no cerraba su modelo mínimo,
catálogo, payload, causalidad ni garantía append-only.

## 3. Ownership canónico

- Spec 007 y el módulo Audit son propietarios de `AuditLog`, sus enums, sanitización,
  persistencia append-only y puerto de escritura.
- El módulo productor de Spec 001 o 002 decide que ocurrió el hecho de dominio y
  construye el evento con identificadores obtenidos del contexto validado.
- El caso de uso que realiza una mutación crítica es propietario de la atomicidad:
  mutación y auditoría se insertan en la misma transacción PostgreSQL.
- Los logs técnicos continúan perteneciendo a observabilidad conforme a ADR-010. No
  sustituyen `AuditLog` ni se almacenan como evidencia funcional.
- El interceptor técnico no persistente de Sprint 1 no satisface este contrato y no se
  usa para auditar mutaciones de dominio.

## 4. Modelo Prisma exacto de Sprint 2

La porción autorizada contiene una sola entidad `AuditLog` y estos enums:

```text
AuditActorType = USER | SYSTEM | ANONYMOUS
AuditCategory  = PLATFORM | TENANT | IDENTITY | ACCESS | SECURITY
AuditOutcome   = SUCCESS | DENIED
```

Campos exactos:

| Campo | Regla |
| --- | --- |
| `id` | UUID requerido, generado por Core |
| `tenantId` | UUID nullable; sólo procede de `TenantContext` validado |
| `actorType` | Enum requerido |
| `actorUserProfileId` | Nullable; requerido para actor `USER` ya resuelto |
| `actorMembershipId` | Nullable; sólo membership validada del tenant activo |
| `action` | Nombre canónico requerido del catálogo de la sección 6 |
| `category` | Enum requerido |
| `outcome` | `SUCCESS` o `DENIED` |
| `resourceType` | Tipo estable requerido |
| `resourceId` | Identificador nullable cuando aún no existe recurso |
| `reasonCode` | Código estable nullable; nunca texto libre sensible |
| `metadata` | JSON nullable, sanitizado y limitado por allowlist del evento |
| `traceId` | Requerido; se genera también para comandos no HTTP |
| `correlationId` | Nullable; se conserva cuando existe |
| `occurredAt` | Timestamp UTC requerido del hecho |
| `createdAt` | Timestamp UTC requerido de persistencia |

Relaciones opcionales con `Tenant`, `UserProfile` y `UserTenantMembership` usan
`onDelete: Restrict`. El modelo no contiene `updatedAt`, `archivedAt`, snapshots
`oldValue`/`newValue`, display names, IP, user agent, request payloads ni archivos.
Esos campos y los enums/categorías adicionales del modelo completo quedan diferidos.

## 5. Semántica de escritura y causalidad

### 5.1 Mutaciones confirmadas

Todo evento `SUCCESS` de las secciones 6.1–6.3 se inserta con el mismo cliente
transaccional que la mutación que evidencia. Si la sanitización, validación o inserción
de `AuditLog` falla, la transacción completa hace rollback. No existe escritura
`best effort` para una mutación confirmada.

Una operación compuesta escribe todos sus eventos dentro de la misma transacción. El
bootstrap one-shot y el onboarding fijados por GAP-S2-003 sólo se confirman cuando sus
eventos mínimos también quedaron persistidos.

### 5.2 Denegaciones

Los eventos de la sección 6.4 se intentan persistir de forma durable en una transacción
corta e independiente, porque no existe una mutación de dominio que confirmar. Si esa
escritura falla, la decisión permanece denegada y se emite únicamente un log técnico
sanitizado y una métrica de fallo; nunca se concede acceso ni se cambia el error público.

`tenantId` sólo se registra si ya existe un `TenantContext` validado. El valor no
confiable de `X-Tenant-Id` nunca se copia a `tenantId`; antes de validar el contexto, el
evento es platform/pre-tenant con `tenantId = null`.

## 6. Catálogo mínimo canónico

### 6.1 Plataforma y bootstrap

```text
platformAdmin.bootstrap.completed
```

### 6.2 Spec 001 — Tenants

```text
tenant.created
tenant.baseRoles.created
tenant.updated
tenant.activated
tenant.suspended
tenant.reactivated
tenant.archived
tenant.profile.updated
tenant.branding.updated
tenant.wordpressMapping.updated
```

### 6.3 Spec 002 — Identity and Access

```text
user.created
user.updated
user.disabled
user.enabled
user.keycloakLinked
globalRole.assigned
globalRole.removed
invitation.created
invitation.accepted
invitation.revoked
invitation.expired
membership.created
membership.suspended
membership.revoked
membership.roleAssigned
membership.roleRemoved
```

En este catálogo `user.*` identifica operaciones sobre `UserProfile`; no representa una
credencial local. Los eventos que no correspondan a una operación autorizada por la
superficie máxima del runbook no habilitan endpoints adicionales.

### 6.4 Seguridad y acceso

```text
authentication.denied
authorization.denied
tenantAccess.denied
```

La clasificación es determinista: bootstrap usa `PLATFORM`; `tenant.*` usa `TENANT`;
`user.*` usa `IDENTITY`; roles, invitaciones y memberships usan `ACCESS`;
`authentication.denied` usa `SECURITY`; y las otras dos denegaciones usan `ACCESS`.
Los eventos de las secciones 6.1–6.3 usan `SUCCESS` y los de 6.4 usan `DENIED`.

El actor es `USER` cuando existe un `UserProfile` autenticado y validado, `SYSTEM` para
el bootstrap one-shot y expiraciones automáticas, y `ANONYMOUS` únicamente cuando no
puede resolverse una identidad válida. Ningún actor se infiere de datos suministrados
por el cliente.

## 7. Payload y sanitización

Todo evento registra sólo los campos del modelo. La allowlist exacta de `metadata` es:

| Eventos | Claves permitidas |
| --- | --- |
| `*.updated` | `changedFields: string[]` con nombres canónicos, nunca valores |
| Transiciones de estado | `previousStatus`, `newStatus` |
| Asignación/retiro de rol | `roleId` |
| `invitation.created` | `roleId`, `expiresAt` |
| Los demás eventos | Ninguna; `metadata = null` |

Las claves no aplicables y cualquier clave adicional se rechazan. `metadata` no
almacena valores completos, emails, nombres, invitation tokens o hashes, contraseñas,
secretos, Bearer tokens, headers, cookies, claims completos, payloads, archivos ni
datos bancarios.

Los códigos de denegación son estables y no revelan si existe el tenant, usuario,
membership, rol o invitación. Los datos de actor, tenant y membership provienen del
contexto resuelto por Core, nunca del body, query o header sin validar.

Los recursos canónicos son `UserProfile` para bootstrap y `user.*`; `Tenant`,
`TenantProfile`, `TenantBranding` o `TenantWordPressMapping` para `tenant.*` según la
entidad mutada; `UserGlobalRole`, `Invitation`, `UserTenantMembership` o
`MembershipRole` para eventos de acceso; y `Authentication`, `Authorization` o
`TenantAccess` sin `resourceId` para denegaciones.

## 8. Garantía append-only

- El puerto y repositorio de Sprint 2 sólo exponen inserción; no existe update/delete.
- No existen endpoints de lectura, modificación, eliminación o exportación.
- La migración debe instalar una protección PostgreSQL que rechace `UPDATE` y `DELETE`
  ordinarios sobre `audit_logs`.
- La credencial runtime usa mínimo privilegio y no posee `TRUNCATE`, DDL ni ownership de
  `audit_logs`.
- Las relaciones no usan cascade delete y los registros no se archivan ni purgan en
  Sprint 2.

WORM, hash encadenado, legal hold, SIEM, almacenamiento frío y política avanzada de
retención permanecen fuera de alcance.

## 9. Pruebas obligatorias después de `GO`

- rollback total cuando falla la inserción audit de una mutación;
- atomicidad de todos los eventos de bootstrap y onboarding;
- persistencia durable del catálogo mínimo;
- denegación conservada cuando falla su escritura de auditoría;
- `tenantId` derivado sólo de contexto validado y casos cross-tenant negativos;
- sanitización y rechazo de claves/valores prohibidos;
- rechazo PostgreSQL de update/delete y ausencia de métodos/endpoints equivalentes;
- propagación o generación de `traceId` y conservación de `correlationId`;
- prueba de que el interceptor técnico de Sprint 1 no cuenta como auditoría funcional.

## 10. Elementos diferidos

Quedan fuera de Sprint 2 las APIs de consulta, detalle y exportación, UI, `AuditExport`,
categorías financieras o de dominios posteriores, búsqueda, filtros, paginación,
snapshots old/new, eventos de lectura, auditoría técnica operacional y cualquier
capacidad del catálogo completo no enumerada en la sección 6.

## 11. Consecuencia para readiness

`GAP-S2-007` queda cerrado documentalmente. Este cierre no autoriza implementar Prisma,
migraciones, adaptadores ni endpoints mientras la compuerta continúe en `NO_GO`.
Permanecen abiertos `GAP-S2-001` y `GAP-S2-008`; por tanto, Sprint 2 no cambia a `GO`.
