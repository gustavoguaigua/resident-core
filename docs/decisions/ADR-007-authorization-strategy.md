# ADR-007 — Authorization Strategy: Tenant-Aware RBAC with Resource-Level Business Authorization

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                          |
| Documento       | ADR-007                                                                                                                                                                |
| Título          | Authorization Strategy: Tenant-Aware RBAC with Resource-Level Business Authorization                                                                                   |
| Ruta            | `docs/decisions/ADR-007-authorization-strategy.md`                                                                                                                     |
| Versión         | 0.1                                                                                                                                                                    |
| Estado          | Aceptado inicialmente                                                                                                                                                  |
| Fecha           | 2026-07-12                                                                                                                                                             |
| Relacionado con | `ADR-004-multitenancy-strategy.md`, `ADR-005-authentication-strategy.md`, `ADR-006-identity-provider-strategy.md`, `security.md`, `api-guidelines.md`, `domain-map.md` |

---

## 2. Contexto

RESIDENT Core será una plataforma multitenant para la administración de conjuntos residenciales.

La autenticación será evolutiva:

* Durante el MVP podrá existir autenticación propia temporal en NestJS.
* Como arquitectura objetivo, Keycloak será el proveedor central de identidad.
* Antes de migrar a microservicios físicos, Keycloak deberá estar implementado como Identity Provider.

Sin embargo, Keycloak no debe convertirse en la fuente principal de autorización de negocio de RESIDENT.

RESIDENT Core necesita tomar decisiones de acceso basadas en reglas propias del dominio residencial, financiero y administrativo.

Ejemplos:

* Un residente puede consultar su propio estado de cuenta, pero no el de otro residente.
* Un tesorero puede confirmar pagos dentro de su tenant, pero no en otro tenant.
* Un administrador puede crear cargos, pero no necesariamente reversar pagos.
* Un usuario puede ser tesorero en un conjunto y solo auditor en otro.
* Un propietario puede ver información de sus unidades, pero no de unidades ajenas.
* Un miembro de directiva puede ver reportes, pero no modificar pagos.
* Un guardia puede ver reservas autorizadas, pero no estados de cuenta.

Estas reglas dependen de tenant, rol, permiso, recurso, relación con unidad habitacional, estado del proceso y política interna.

---

## 3. Problema

Se debe definir cómo RESIDENT Core autorizará operaciones después de que el usuario haya sido autenticado.

La estrategia debe responder:

1. ¿Dónde vive la autorización de negocio?
2. ¿Qué papel tendrá Keycloak?
3. ¿Qué papel tendrá RESIDENT Core?
4. ¿Cómo se aplicarán roles por tenant?
5. ¿Cómo se aplicarán permisos específicos?
6. ¿Cómo se validará acceso a recursos concretos?
7. ¿Cómo se separarán roles globales y roles de tenant?
8. ¿Cómo se protegerán operaciones financieras críticas?
9. ¿Cómo se auditarán decisiones de autorización?
10. ¿Cómo se preparará esto para microservicios futuros?

---

## 4. Decisión

RESIDENT Core utilizará una estrategia de autorización basada en:

```text id="xzqv94"
Tenant-aware RBAC
+
Permission-based authorization
+
Resource-level authorization
+
Business rules
```

La decisión principal es:

```text id="fklau9"
Keycloak autentica.
RESIDENT Core autoriza.
```

Keycloak será responsable de identidad técnica.

RESIDENT Core será responsable de autorización funcional y autorización de negocio.

---

## 5. Separación de responsabilidades

### 5.1. Keycloak

Keycloak podrá gestionar:

* Login.
* Identidad técnica.
* Sesiones.
* MFA.
* Tokens.
* Refresh tokens.
* Password reset.
* SSO.
* Roles técnicos generales.
* Client scopes.
* Service accounts.
* Identity brokering.

### 5.2. RESIDENT Core

RESIDENT Core gestionará:

* Tenants.
* Membresía usuario-tenant.
* Roles funcionales por tenant.
* Permisos de negocio.
* Relación usuario-persona.
* Relación persona-unidad habitacional.
* Autorización por recurso.
* Autorización financiera.
* Restricciones por estado.
* Auditoría funcional.
* Reportes de acceso.
* Reglas administrativas propias del conjunto.

Regla central:

```text id="o2dt04"
Ninguna operación de negocio se autoriza únicamente porque el token de Keycloak sea válido.
```

---

## 6. Principios de autorización

### 6.1. Denegar por defecto

Toda operación debe denegarse si no existe autorización explícita.

```text id="8x6vcl"
Default: deny
```

---

### 6.2. Mínimo privilegio

Cada usuario debe tener solo los permisos necesarios para cumplir su función.

Un residente no debe recibir permisos administrativos.

Un tesorero no debe recibir permisos globales de plataforma.

Un administrador de tenant no debe recibir permisos de otros tenants.

---

### 6.3. Autorización por tenant

Todo permiso funcional debe evaluarse dentro del tenant activo.

Ejemplo:

```text id="kj45ko"
Usuario A:
- Tenant Villa Club: Treasurer
- Tenant Altos del Norte: Resident
```

El permiso `payments.confirm` en Villa Club no implica el mismo permiso en Altos del Norte.

---

### 6.4. Autorización por recurso

No basta con tener permiso general.

También debe validarse que el recurso pertenece al tenant y que el usuario puede operar sobre ese recurso específico.

Ejemplo:

```text id="7sj43f"
El usuario tiene permiso payments.read,
pero el paymentId solicitado pertenece a otro tenant.
Resultado: acceso denegado.
```

---

### 6.5. Autorización contextual

Algunas operaciones dependen del estado del proceso.

Ejemplos:

* Un pago `confirmed` no puede confirmarse otra vez.
* Un cargo `paid` no puede cancelarse directamente.
* Una reserva `cancelled` no puede aprobarse.
* Una multa `appealed` puede requerir rol especial.
* Un estado de cuenta cerrado no debe modificarse sin ajuste formal.

---

### 6.6. Separación de funciones

Para operaciones financieras críticas debe evitarse que una sola persona concentre todo el flujo si el tenant decide activar control reforzado.

Ejemplos:

* Quien registra un pago no necesariamente debe confirmarlo.
* Quien crea un ajuste financiero no necesariamente debe aprobarlo.
* Quien configura una cuenta bancaria no necesariamente debe conciliar.
* Quien emite una multa no necesariamente debe resolver una apelación.

---

## 7. Modelo general de autorización

La autorización se evaluará mediante una cadena de decisiones:

```text id="hz10yz"
1. ¿El token es válido?
2. ¿El usuario existe en RESIDENT Core?
3. ¿El tenant activo es válido?
4. ¿El usuario tiene membresía activa en el tenant?
5. ¿El rol del usuario tiene el permiso requerido?
6. ¿El recurso pertenece al tenant?
7. ¿El usuario tiene relación contextual con el recurso?
8. ¿El estado del recurso permite la operación?
9. ¿La regla de negocio permite la operación?
10. ¿La operación requiere step-up, MFA o aprobación adicional?
```

---

## 8. Roles globales

Los roles globales operan sobre la plataforma, no sobre un tenant específico.

Roles globales sugeridos:

```text id="x1ef4p"
SuperAdmin
PlatformOperator
PlatformSupport
PlatformAuditor
```

### 8.1. SuperAdmin

Puede administrar la plataforma.

Debe tener MFA obligatorio en fase Keycloak.

Debe usarse con alta restricción.

### 8.2. PlatformOperator

Puede operar configuraciones de plataforma, planes, features y tenants, según permisos.

### 8.3. PlatformSupport

Puede brindar soporte limitado.

No debe tener acceso financiero completo salvo autorización especial.

### 8.4. PlatformAuditor

Puede consultar auditoría global o reportes de plataforma, según política.

---

## 9. Roles de tenant

Los roles de tenant operan dentro de un conjunto residencial específico.

Roles iniciales sugeridos:

```text id="xewknq"
TenantAdmin
Treasurer
BoardMember
TenantAuditor
Resident
PropertyOwner
TenantStaff
Guard
ExternalAccountant
```

### 9.1. TenantAdmin

Administrador del conjunto.

Puede gestionar configuración, usuarios, unidades, residentes y ciertos procesos administrativos.

No necesariamente debe tener permisos financieros absolutos.

### 9.2. Treasurer

Responsable financiero.

Puede gestionar cargos, pagos, estados de cuenta, reportes financieros y conciliación según permisos.

### 9.3. BoardMember

Miembro de directiva.

Puede consultar reportes, comunicados, reuniones y ciertos procesos administrativos.

### 9.4. TenantAuditor

Puede consultar información y auditoría según autorización.

No debe modificar datos financieros.

### 9.5. Resident

Usuario residente.

Puede consultar su información, estado de cuenta propio, pagos propios, reservas propias y comunicados.

### 9.6. PropertyOwner

Propietario.

Puede consultar información de sus unidades, estados de cuenta, pagos y documentos asociados a sus propiedades.

### 9.7. TenantStaff

Personal operativo del conjunto.

Puede gestionar procesos específicos según permisos asignados.

### 9.8. Guard

Puede consultar información operativa limitada, como reservas aprobadas, visitantes o autorizaciones futuras.

No debe acceder a datos financieros.

### 9.9. ExternalAccountant

Contador externo.

Puede acceder a reportes financieros y datos contables autorizados por el tenant.

---

## 10. Permisos

Los permisos serán acciones explícitas.

Formato recomendado:

```text id="4ol8jx"
resource.action
```

Ejemplos:

```text id="2v066q"
tenants.read
tenants.update
users.invite
users.disable
roles.assign
propertyUnits.create
propertyUnits.read
propertyUnits.update
residents.create
residents.read
charges.create
charges.read
charges.cancel
fees.generate
payments.register
payments.read
payments.confirm
payments.reject
payments.reverse
payments.allocate
accountStatements.read
accountStatements.export
bankMovements.import
bankMovements.read
reconciliations.create
reconciliations.approve
reservations.create
reservations.approve
reservations.cancel
fines.create
fines.approve
fines.reverse
meetings.create
meetings.attendance.record
reports.financial.read
reports.financial.export
audit.read
files.download
files.upload
```

---

## 11. Matriz inicial de permisos

La matriz definitiva se detallará en `docs/specs/002-users-roles/`, pero se establece una base inicial.

| Permiso                  | SuperAdmin |        TenantAdmin | Treasurer | BoardMember | Resident |    Guard |
| ------------------------ | ---------: | -----------------: | --------: | ----------: | -------: | -------: |
| tenants.read             |         Sí |      Tenant propio |        No |          No |       No |       No |
| users.invite             |         Sí |                 Sí |        No |          No |       No |       No |
| roles.assign             |         Sí |       Sí, limitado |        No |          No |       No |       No |
| propertyUnits.read       |         Sí |                 Sí |        Sí |          Sí |  Propias | Limitado |
| residents.read           |         Sí |                 Sí |        Sí |    Limitado |   Propio | Limitado |
| charges.create           |         Sí |                 Sí |        Sí |          No |       No |       No |
| charges.read             |         Sí |                 Sí |        Sí |          Sí |  Propias |       No |
| payments.register        |         Sí |                 Sí |        Sí |          No |  Propios |       No |
| payments.confirm         |         Sí |           Opcional |        Sí |          No |       No |       No |
| payments.reverse         |         Sí | Opcional reforzado | Reforzado |          No |       No |       No |
| reports.financial.read   |         Sí |                 Sí |        Sí |          Sí |       No |       No |
| reports.financial.export |         Sí |          Reforzado | Reforzado |          No |       No |       No |
| reservations.approve     |         Sí |                 Sí |        No |    Opcional |       No |       No |
| audit.read               |         Sí |                 Sí |  Opcional |    Opcional |       No |       No |

Notas:

* “Tenant propio” significa que el permiso aplica solo dentro del tenant activo.
* “Propias” significa recursos relacionados con la persona, unidad o propiedad del usuario.
* “Reforzado” significa que puede requerir MFA, reautenticación, doble aprobación o auditoría extendida.
* “Opcional” significa que dependerá de configuración del tenant.

---

## 12. Autorización por recurso

Cada endpoint que opere sobre un recurso debe validar pertenencia del recurso al tenant.

Ejemplo:

```text id="vtkgem"
GET /api/v1/payments/{paymentId}
```

Debe validar:

```text id="c97dd0"
payment.tenantId == activeTenantId
```

Además, si el usuario es residente:

```text id="xdsl9p"
payment.propertyUnitId pertenece a una unidad relacionada con el usuario
```

---

## 13. Autorización para residentes y propietarios

Los residentes y propietarios tendrán acceso limitado a sus propios datos.

### 13.1. Resident

Puede acceder a:

* Perfil propio.
* Unidad donde reside.
* Estado de cuenta relacionado con su unidad, si la política del tenant lo permite.
* Pagos propios.
* Reservas propias.
* Multas propias o de su unidad, según política.
* Comunicados dirigidos a su grupo.
* Documentos propios autorizados.

### 13.2. PropertyOwner

Puede acceder a:

* Unidades de su propiedad.
* Estados de cuenta de sus unidades.
* Pagos asociados a sus unidades.
* Cargos asociados a sus unidades.
* Documentos relacionados con sus unidades.
* Comunicados dirigidos a propietarios.

### 13.3. Arrendatario

Puede acceder según política del tenant:

* Unidad arrendada.
* Cargos permitidos.
* Reservas.
* Comunicados.
* Pagos propios.
* Información limitada de la propiedad.

Regla:

```text id="olot7n"
La relación persona-unidad define límites de acceso para residentes, propietarios y arrendatarios.
```

---

## 14. Autorización financiera

Los módulos financieros requieren controles reforzados.

Operaciones críticas:

```text id="p589ej"
fees.generate
charges.create
charges.cancel
payments.confirm
payments.reject
payments.reverse
payments.allocate
adjustments.create
reconciliations.approve
reports.financial.export
bankAccounts.update
```

Estas operaciones deben:

* validar permiso explícito;
* validar tenant;
* validar estado del recurso;
* ejecutarse dentro de transacción cuando modifiquen dinero;
* registrar auditoría reforzada;
* aplicar idempotencia cuando corresponda;
* requerir MFA o reautenticación en fase Keycloak para roles críticos;
* soportar separación de funciones si el tenant lo activa.

---

## 15. Step-up authorization

Algunas acciones podrán requerir autorización reforzada.

Ejemplos:

* Reversar pago confirmado.
* Exportar cartera vencida.
* Cambiar cuenta bancaria del conjunto.
* Cambiar reglas de mora.
* Crear alícuota extraordinaria.
* Cerrar conciliación bancaria.
* Suspender tenant.
* Asignar rol de tesorero.

Fase MVP:

```text id="j3332n"
Auditoría reforzada obligatoria.
```

Fase Keycloak:

```text id="i6kyh6"
MFA, reautenticación o política step-up para acciones críticas.
```

---

## 16. Roles configurables por tenant

Los roles base existirán como plantilla, pero cada tenant podrá requerir variantes.

Ejemplos:

```text id="m1ht67"
TenantAdmin
Treasurer
AssistantTreasurer
BoardViewer
ReservationManager
FineReviewer
```

La configuración avanzada de roles podrá ser una fase posterior.

MVP recomendado:

```text id="yn62qh"
Roles base predefinidos + permisos controlados por sistema.
```

Fase posterior:

```text id="051k9f"
Roles personalizados por tenant.
```

---

## 17. Autorización global versus autorización tenant

### 17.1. Operación global

Ejemplo:

```text id="3x58dv"
POST /api/v1/platform/tenants
```

Requiere:

```text id="jzj6qw"
platform.tenants.create
```

### 17.2. Operación tenant-scoped

Ejemplo:

```text id="1wwn2p"
POST /api/v1/payments/{paymentId}/confirm
```

Requiere:

```text id="n8nfda"
payments.confirm
+
tenant activo
+
membresía activa
+
payment.tenantId == activeTenantId
```

---

## 18. Autorización en APIs

Cada endpoint privado debe declarar:

* tipo de autenticación;
* permiso requerido;
* si requiere tenant;
* si requiere recurso;
* si requiere relación contextual;
* si requiere auditoría;
* si requiere step-up.

Ejemplo documental:

```text id="5w4j24"
Endpoint: POST /api/v1/payments/{paymentId}/confirm
Auth: Required
Tenant: Required
Permission: payments.confirm
Resource check: payment.tenantId == activeTenantId
State check: payment.status == pendingReview
Audit: Required
Step-up: Future MFA for critical roles
```

---

## 19. Autorización en NestJS

La implementación en NestJS debe usar guards, decorators y policies.

Componentes sugeridos:

```text id="nj1v7v"
AuthGuard
TenantGuard
PermissionGuard
ResourceOwnershipGuard
PolicyGuard
CurrentUser decorator
CurrentTenant decorator
RequirePermission decorator
RequirePolicy decorator
```

Ejemplo conceptual:

```text id="90t4i1"
@RequirePermission('payments.confirm')
@Post(':paymentId/confirm')
confirmPayment()
```

Pero el decorator de permiso no es suficiente. El caso de uso debe validar también el recurso y la regla de negocio.

---

## 20. Políticas de autorización

Para operaciones complejas se recomienda usar policies.

Ejemplos:

```text id="fqa81a"
CanConfirmPaymentPolicy
CanViewAccountStatementPolicy
CanReversePaymentPolicy
CanApproveReservationPolicy
CanExportFinancialReportPolicy
CanAssignRolePolicy
```

Una policy puede evaluar:

* usuario;
* tenant;
* roles;
* permisos;
* recurso;
* estado;
* relaciones;
* configuración del tenant;
* riesgo de la operación.

---

## 21. Autorización en jobs

Los jobs asíncronos deben conservar contexto de autorización.

Ejemplo:

```json id="h32qs1"
{
  "jobType": "generateMonthlyFees",
  "tenantId": "tenant_uuid",
  "requestedBy": "user_uuid",
  "requestedPermission": "fees.generate",
  "traceId": "req_123456"
}
```

Reglas:

* El job debe registrar quién lo solicitó.
* El job debe validar tenant antes de ejecutar.
* El job debe registrar auditoría.
* Los jobs financieros deben ejecutarse con contexto claro.
* Un job global debe estar explícitamente autorizado como global.

---

## 22. Autorización en eventos

Los eventos de dominio no reemplazan la autorización.

Ejemplo:

```text id="ng3kse"
PaymentConfirmed event
```

Debe emitirse después de que:

* el usuario esté autenticado;
* tenga permiso;
* el pago pertenezca al tenant;
* el estado permita confirmación;
* la operación financiera haya sido persistida correctamente.

---

## 23. Autorización en archivos

Los archivos deben validar autorización antes de carga y descarga.

Ejemplos:

* Comprobante de pago.
* Evidencia de multa.
* Acta de reunión.
* Reporte exportado.
* Documento administrativo.

Reglas:

* Validar tenant.
* Validar permiso.
* Validar relación con recurso.
* Validar sensibilidad.
* Registrar acceso a documentos sensibles.
* No exponer rutas internas.
* Usar descarga autenticada o URL firmada de corta duración.

---

## 24. Autorización en reportes

Los reportes financieros y administrativos requieren permisos explícitos.

Ejemplos:

```text id="a6gwge"
reports.financial.read
reports.financial.export
reports.audit.read
reports.residents.export
reports.payments.export
```

Reglas:

* Los reportes siempre filtran por tenant.
* Los reportes globales usan namespace de plataforma.
* Las exportaciones sensibles se auditan.
* Los reportes financieros no se exponen a residentes.
* Los reportes masivos pueden requerir step-up.
* Los archivos exportados deben expirar si son temporales.

---

## 25. Autorización en WordPress

WordPress no autoriza operaciones transaccionales.

Reglas:

* WordPress puede mostrar información pública.
* WordPress puede redirigir al login de Keycloak/Core.
* WordPress puede pasar una pista de tenant.
* WordPress no decide si el usuario puede ver pagos.
* WordPress no decide si el usuario puede ver estados de cuenta.
* WordPress no debe almacenar tokens sensibles.
* WordPress no debe actuar como fuente de roles del Core.

Flujo:

```text id="wzc7n9"
WordPress → Keycloak Login → RESIDENT Core → autorización de negocio
```

---

## 26. Autorización en n8n

n8n debe operar mediante service account o client técnico limitado.

Reglas:

* No usar cuentas humanas para automatizaciones.
* No dar permisos amplios innecesarios.
* Asociar operación a tenant cuando aplique.
* Registrar auditoría.
* No acceder directo a PostgreSQL en producción.
* No modificar dinero sin endpoint autorizado.
* No omitir permisos por workflow.
* No guardar datos sensibles innecesarios en ejecuciones.

---

## 27. Autorización en microservicios futuros

En una arquitectura de microservicios:

* Keycloak emitirá tokens.
* Cada microservicio validará token.
* Cada microservicio validará issuer y audience.
* Cada microservicio aplicará permisos técnicos mínimos.
* La autorización de negocio seguirá usando reglas de dominio.
* Los servicios financieros deberán validar tenant y recurso.
* Los permisos compartidos deberán estar documentados en contratos.
* Podrá existir un servicio central de autorización o librería común si se justifica.

Regla:

```text id="esfwgw"
Validar token no equivale a autorizar operación.
```

---

## 28. Claims de autorización en tokens

El token puede incluir roles técnicos mínimos.

Permitido:

```text id="r7bqwi"
sub
email
realm roles generales
client roles generales
scopes
```

No recomendado:

```text id="3t4p0k"
permisos financieros detallados
saldos
deudas
comprobantes
todos los permisos por tenant
información sensible
```

Razón:

Los permisos de negocio pueden cambiar y dependen del tenant, recurso y estado.

---

## 29. Service accounts

Las integraciones técnicas deberán usar cuentas de servicio.

Ejemplos:

* n8n.
* WordPress server-to-server.
* Importadores bancarios.
* Jobs externos.
* Microservicios internos.

Reglas:

* Scope mínimo.
* Tenant limitado cuando corresponda.
* Secretos rotables.
* Auditoría.
* No usar permisos humanos.
* No usar SuperAdmin técnico por comodidad.
* Revocación posible.
* Registro de uso.

---

## 30. Auditoría de autorización

Deben auditarse:

* Accesos denegados críticos.
* Cambios de rol.
* Cambios de permisos.
* Asignación de usuarios a tenant.
* Confirmación de pagos.
* Reversos.
* Exportaciones.
* Cambios de configuración financiera.
* Descarga de documentos sensibles.
* Acceso a auditoría.
* Operaciones globales de plataforma.
* Intentos de acceso cross-tenant.

Campos mínimos:

```text id="h9itsg"
tenantId
userId
action
permission
resourceType
resourceId
result
reason
occurredAt
traceId
ipAddress
userAgent
```

---

## 31. Respuestas de error

La autorización debe evitar revelar información sensible.

### 31.1. No autenticado

```text id="q7noss"
401 Unauthorized
```

### 31.2. Autenticado sin permiso

```text id="gmemzz"
403 Forbidden
```

### 31.3. Recurso de otro tenant

Puede responder:

```text id="ba56yt"
404 Not Found
```

o

```text id="q3cmt2"
403 Forbidden
```

La decisión específica debe documentarse por endpoint.

Para evitar enumeración de recursos, en muchos casos es preferible `404 Not Found`.

---

## 32. Datos y tablas sugeridas

Tablas iniciales:

```text id="6qbv8f"
roles
permissions
role_permissions
user_tenant_memberships
membership_roles
authorization_audit_logs
```

Campos sugeridos para `roles`:

```text id="y279r4"
id
tenant_id nullable
name
description
scope
is_system
created_at
updated_at
```

Campos sugeridos para `permissions`:

```text id="v34d1l"
id
code
description
resource
action
risk_level
created_at
updated_at
```

Campos sugeridos para `user_tenant_memberships`:

```text id="pvpmr5"
id
user_profile_id
tenant_id
status
created_at
updated_at
```

Campos sugeridos para `membership_roles`:

```text id="o651yn"
id
membership_id
role_id
assigned_by
assigned_at
revoked_at
```

---

## 33. Relación con Keycloak

Keycloak podrá manejar roles técnicos generales, pero RESIDENT Core conservará la matriz funcional.

Ejemplo:

```text id="3s0zzk"
Keycloak role:
resident_user

RESIDENT Core membership:
Tenant Villa Club → PropertyOwner
Tenant Altos del Norte → Resident
```

Esto permite que el mismo usuario tenga acceso distinto por conjunto.

---

## 34. Configuración inicial recomendada

Para el MVP:

```text id="lttqkw"
Roles base no editables por tenant.
Permisos predefinidos.
Asignación simple de rol por usuario y tenant.
Autorización por recurso en módulos críticos.
Auditoría de cambios de roles.
```

Para fase posterior:

```text id="7nxb8k"
Roles personalizados por tenant.
Permisos configurables.
Aprobaciones duales.
Step-up MFA.
Políticas más granulares.
Servicio de autorización centralizado.
```

---

## 35. Pruebas obligatorias

Cada módulo debe incluir pruebas de autorización.

Casos mínimos:

* Usuario sin token.
* Usuario con token inválido.
* Usuario autenticado sin tenant.
* Usuario sin membresía en tenant.
* Usuario con rol insuficiente.
* Usuario con permiso pero recurso de otro tenant.
* Usuario residente accede a recurso ajeno.
* Usuario propietario accede a unidad no propia.
* Usuario intenta operación financiera sin permiso.
* Usuario intenta reversar pago sin permiso reforzado.
* Usuario intenta exportar reporte sin permiso.
* Service account con scope insuficiente.
* WordPress intenta endpoint privado sin token.
* n8n intenta operación fuera de scope.
* Cambio de rol se audita.
* Acceso denegado crítico se audita.

---

## 36. Impacto en SDD

Cada spec funcional debe incluir una sección de autorización:

```text id="c40cfz"
## Authorization

- Actors
- Required permissions
- Tenant requirements
- Resource ownership rules
- State restrictions
- Step-up requirements
- Audit events
- Negative test cases
```

Ninguna spec financiera puede considerarse completa si no define autorización.

---

## 37. Impacto en agentes IA

Los agentes IA deben respetar:

1. No crear endpoints privados sin permiso declarado.
2. No asumir que token válido autoriza operación.
3. No omitir validación de tenant.
4. No buscar recursos solo por ID global.
5. No permitir que residentes vean datos ajenos.
6. No permitir operaciones financieras sin permiso explícito.
7. No omitir auditoría en cambios de roles.
8. No crear roles globales para usuarios de tenant.
9. No poner permisos sensibles completos dentro del JWT.
10. No usar WordPress como fuente de autorización.
11. No permitir service accounts con permisos totales por defecto.
12. No eliminar controles de autorización para simplificar pruebas.

---

## 38. Consecuencias positivas

Esta decisión permite:

* Separar autenticación de autorización.
* Mantener Keycloak enfocado en identidad.
* Mantener reglas de negocio dentro de RESIDENT Core.
* Soportar usuarios en múltiples tenants.
* Soportar roles distintos por tenant.
* Proteger operaciones financieras.
* Evitar fugas cross-tenant.
* Facilitar microservicios futuros.
* Auditar decisiones críticas.
* Aplicar mínimo privilegio.
* Mantener flexibilidad para roles personalizados.

---

## 39. Consecuencias negativas

Esta decisión implica:

* Mayor lógica de autorización en el Core.
* Necesidad de matriz de permisos clara.
* Necesidad de pruebas negativas extensas.
* Riesgo de inconsistencia si los módulos no siguen el patrón.
* Necesidad de mantener sincronía entre Keycloak y perfiles locales.
* Necesidad de diseñar bien roles por tenant.
* Mayor esfuerzo en módulos financieros.

---

## 40. Riesgos

| Riesgo                                    | Impacto | Mitigación                                    |
| ----------------------------------------- | ------- | --------------------------------------------- |
| Confundir autenticación con autorización  | Crítico | Documentar separación Keycloak/Core           |
| Usuario accede a otro tenant              | Crítico | TenantGuard, repositorios tenant-aware, tests |
| Permisos demasiado amplios                | Alto    | Mínimo privilegio y matriz de permisos        |
| Roles globales mal asignados              | Crítico | Separación global/tenant                      |
| Residente ve datos ajenos                 | Crítico | Resource-level authorization                  |
| Operación financiera sin control          | Crítico | Permisos explícitos y auditoría               |
| Service account con exceso de privilegios | Alto    | Scopes mínimos                                |
| Claims demasiado grandes o sensibles      | Alto    | Token mínimo                                  |
| Módulos con autorización inconsistente    | Alto    | Guards, policies y pruebas obligatorias       |
| Exportaciones indebidas                   | Alto    | Permisos específicos, auditoría y step-up     |

---

## 41. Criterios de aceptación

La implementación cumple este ADR si:

* Keycloak o auth propia solo autentica.
* RESIDENT Core autoriza operaciones de negocio.
* Existen roles globales y roles de tenant separados.
* Existen permisos explícitos.
* Cada endpoint privado declara permiso requerido.
* Cada recurso tenant-scoped valida `tenant_id`.
* Los residentes solo acceden a recursos propios.
* Los propietarios solo acceden a unidades propias.
* Las operaciones financieras tienen permisos reforzados.
* Los cambios de rol se auditan.
* Los intentos cross-tenant se deniegan.
* Los service accounts tienen scopes mínimos.
* Los reportes sensibles requieren permisos específicos.
* Existen pruebas de autorización negativas.
* La documentación SDD de cada módulo incluye autorización.

---

## 42. Decisión final

RESIDENT Core adoptará una estrategia de autorización tenant-aware basada en roles, permisos, reglas de negocio y validación a nivel de recurso.

Keycloak será responsable de autenticar usuarios y emitir tokens en la arquitectura objetivo, pero no será la fuente principal de autorización de negocio.

RESIDENT Core conservará la autorización funcional por tenant, recurso, rol, permiso, relación con unidad habitacional, estado financiero y regla administrativa.

Esta decisión permite proteger datos sensibles, evitar acceso cruzado entre tenants, controlar operaciones financieras críticas y preparar el sistema para una futura arquitectura de microservicios.
