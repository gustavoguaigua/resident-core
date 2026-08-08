# ADR-011 — Testing Strategy: Automated Testing for SDD, Multitenancy, Security and Financial Integrity

## 1. Información del documento

| Campo           | Valor                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                         |
| Documento       | ADR-011                                                                                                               |
| Título          | Testing Strategy: Automated Testing for SDD, Multitenancy, Security and Financial Integrity                           |
| Ruta            | `docs/decisions/ADR-011-testing-strategy.md`                                                                          |
| Versión         | 0.1                                                                                                                   |
| Estado          | Aceptado inicialmente                                                                                                 |
| Fecha           | 2026-07-12                                                                                                            |
| Relacionado con | `constitution.md`, `architecture.md`, `security.md`, `api-guidelines.md`, `data-governance.md`, `ADR-001` a `ADR-010` |

---

## 2. Contexto

RESIDENT Core será un sistema transaccional multitenant para administrar conjuntos residenciales.

El sistema gestionará información crítica como:

* Tenants.
* Usuarios.
* Roles.
* Permisos.
* Residentes.
* Propietarios.
* Unidades habitacionales.
* Alícuotas.
* Cargos.
* Pagos.
* Comprobantes.
* Estados de cuenta.
* Movimientos bancarios.
* Conciliaciones.
* Reservas.
* Multas.
* Reportes.
* Auditoría.
* Integraciones.
* Keycloak.
* n8n.
* WordPress.
* Futuros microservicios.

El sistema manejará dinero, datos personales, comprobantes y decisiones administrativas. Por tanto, las pruebas no pueden tratarse como una actividad secundaria.

En RESIDENT Core, una funcionalidad no se considera terminada si no tiene pruebas suficientes.

---

## 3. Problema

Se debe definir la estrategia de pruebas para RESIDENT Core.

La decisión debe responder:

1. ¿Qué tipos de pruebas son obligatorias?
2. ¿Qué se debe probar en cada módulo?
3. ¿Cómo se probará multitenancy?
4. ¿Cómo se probará autorización?
5. ¿Cómo se probarán pagos, cargos y saldos?
6. ¿Cómo se probarán migraciones?
7. ¿Cómo se probará integración con Keycloak?
8. ¿Cómo se probará integración con WordPress y n8n?
9. ¿Cómo se incorporarán pruebas en CI/CD?
10. ¿Cómo se usará SDD para derivar pruebas desde especificaciones?

---

## 4. Decisión

RESIDENT Core adoptará una estrategia de pruebas automatizadas basada en:

```text id="a1q93k"
Unit tests
+
Integration tests
+
API tests
+
E2E tests
+
Authorization tests
+
Multitenancy tests
+
Security tests
+
Financial regression tests
+
Contract tests
+
Migration tests
+
Smoke tests
```

La decisión central es:

```text id="mc4rmf"
Toda funcionalidad SDD debe tener pruebas derivadas de sus criterios de aceptación.
```

---

## 5. Principios de testing

### 5.1. Las pruebas derivan de la especificación

Cada especificación debe producir casos de prueba.

Flujo:

```text id="ti3zvc"
spec.md
    ↓
acceptance criteria
    ↓
test-plan.md
    ↓
unit tests
    ↓
integration tests
    ↓
API/E2E tests
```

---

### 5.2. Sin pruebas, no está terminado

Una funcionalidad no se considera terminada si:

* no tiene pruebas;
* las pruebas no cubren criterios de aceptación;
* las pruebas no cubren permisos;
* las pruebas no cubren tenant;
* las pruebas no cubren errores;
* las pruebas no cubren casos borde;
* las pruebas financieras no validan saldos;
* las pruebas fallan en CI.

---

### 5.3. Probar lo que puede romper negocio

Prioridad alta para:

* pagos;
* cargos;
* saldos;
* alícuotas;
* conciliación;
* permisos;
* multitenancy;
* archivos sensibles;
* auditoría;
* migraciones;
* reportes financieros.

---

### 5.4. Probar también lo negativo

Las pruebas no deben limitarse al camino feliz.

Deben probar:

* usuario sin permiso;
* usuario sin tenant;
* usuario de otro tenant;
* recurso inexistente;
* estado inválido;
* request inválido;
* operación duplicada;
* token expirado;
* archivo inválido;
* pago duplicado;
* reverso inválido;
* migración fallida.

---

### 5.5. Los agentes IA no sustituyen las pruebas

El código generado por IA debe pasar por:

* revisión;
* compilación;
* lint;
* typecheck;
* pruebas unitarias;
* pruebas de integración;
* pruebas de autorización;
* pruebas multitenant;
* pruebas financieras cuando aplique.

---

## 6. Pirámide de pruebas

RESIDENT Core usará una pirámide práctica:

```text id="jzbpcu"
          E2E tests
        API / Contract tests
      Integration tests
    Unit tests / Domain tests
 Static checks / Type checks
```

La mayoría de pruebas deben estar en niveles bajos y medios.

Las pruebas E2E deben cubrir flujos críticos, no todo el sistema exhaustivamente.

---

## 7. Tipos de pruebas

## 7.1. Static checks

Incluye:

* TypeScript typecheck.
* ESLint.
* Prettier o formato equivalente.
* Validación de imports.
* Reglas de arquitectura.
* Secret scanning.
* Dependency scanning.
* Verificación de OpenAPI.
* Validación de migraciones.

Comandos esperados:

```bash id="wn46oo"
npm run lint
npm run typecheck
npm run format:check
```

---

## 7.2. Unit tests

Prueban funciones, reglas y servicios aislados.

Deben cubrir:

* reglas de dominio;
* value objects;
* validaciones;
* cálculos;
* transiciones de estado;
* políticas de autorización;
* formateo;
* reglas de mora;
* asignación de pagos;
* generación de cargos;
* validaciones de fechas.

Herramienta base:

```text id="k98b97"
Jest
```

---

## 7.3. Domain tests

Son pruebas unitarias enfocadas en reglas de negocio.

Ejemplos:

```text id="qm1fr0"
Payment cannot be confirmed twice.
Paid charge cannot be cancelled directly.
Monthly fees cannot be generated twice for same tenant and period.
Resident cannot access another resident's statement.
Payment allocation cannot exceed payment amount.
Charge amount must use decimal precision.
```

Estas pruebas deben ser rápidas y no depender de base de datos cuando sea posible.

---

## 7.4. Integration tests

Prueban interacción real entre componentes.

Deben cubrir:

* API + base de datos;
* repositorios;
* Prisma;
* transacciones;
* Redis;
* colas;
* storage;
* Keycloak mock o test realm;
* auditoría;
* eventos;
* jobs.

Para integración con base real se recomienda usar contenedores de prueba o base de datos dedicada de testing.

---

## 7.5. API tests

Prueban endpoints REST.

Deben validar:

* método;
* ruta;
* request schema;
* response schema;
* status code;
* errores;
* autenticación;
* autorización;
* tenant;
* paginación;
* filtros;
* sorting;
* idempotencia;
* auditoría;
* OpenAPI.

Ejemplo:

```text id="qtx1xb"
POST /api/v1/payments/{paymentId}/confirm
- 200 si usuario tiene permiso y pago está pendiente.
- 403 si usuario no tiene permiso.
- 404 si pago pertenece a otro tenant.
- 409 si pago ya fue confirmado.
- 422 si estado no permite confirmación.
```

---

## 7.6. E2E tests

Cubren flujos completos.

Flujos críticos iniciales:

```text id="si3djc"
Crear tenant
Invitar administrador
Crear unidades
Crear residentes
Generar alícuotas
Registrar pago
Confirmar pago
Aplicar pago a cargos
Consultar estado de cuenta
Exportar reporte básico
Auditar operación
```

Los E2E deben ser pocos, estables y altamente representativos.

---

## 7.7. Contract tests

Garantizan que los contratos entre componentes no se rompan.

Aplican a:

* API REST;
* OpenAPI;
* WordPress;
* n8n;
* webhooks;
* microservicios futuros;
* Keycloak claims;
* service accounts.

Ejemplo:

```text id="6ga0rc"
WordPress espera GET /api/v1/public/tenants/{slug}
con campos name, logoUrl, slogan, accessUrl.
```

Si el backend cambia esa respuesta, el contract test debe fallar.

---

## 7.8. Security tests

Prueban controles de seguridad.

Deben cubrir:

* tokens inválidos;
* tokens expirados;
* usuario desactivado;
* permisos insuficientes;
* acceso cross-tenant;
* CORS;
* rate limiting;
* subida de archivos;
* validación de webhooks;
* mass assignment;
* datos sensibles en logs;
* endpoints públicos;
* autorización por recurso;
* service accounts.

---

## 7.9. Multitenancy tests

Obligatorias para cada módulo tenant-scoped.

Caso base:

```text id="qzahjx"
Dado un usuario del Tenant A
y un recurso del Tenant B
cuando intenta acceder o modificar ese recurso
entonces el sistema debe denegar acceso
y no debe revelar datos sensibles.
```

Deben cubrir:

* lectura;
* creación;
* modificación;
* eliminación lógica;
* descarga;
* exportación;
* reportes;
* jobs;
* cache;
* eventos;
* auditoría;
* archivos.

---

## 7.10. Authorization tests

Obligatorias para cada endpoint privado.

Deben cubrir:

* sin token;
* token inválido;
* token válido sin tenant;
* usuario sin membresía;
* usuario con rol insuficiente;
* usuario con permiso pero recurso de otro tenant;
* usuario con permiso pero estado inválido;
* residente accede a recurso ajeno;
* propietario accede a unidad no propia;
* service account fuera de scope;
* rol global usado indebidamente en tenant.

---

## 7.11. Financial regression tests

Pruebas especiales para evitar romper reglas financieras.

Deben cubrir:

* generación de alícuotas;
* generación duplicada;
* cargos ordinarios;
* cargos extraordinarios;
* pagos parciales;
* pagos completos;
* pagos excedentes;
* reversos;
* ajustes;
* mora;
* conciliación;
* saldos;
* estados de cuenta;
* reportes financieros;
* redondeo decimal;
* idempotencia;
* concurrencia.

Estas pruebas deben ejecutarse siempre antes de producción.

---

## 7.12. Migration tests

Prueban migraciones de base de datos.

Deben validar:

* migración aplica correctamente;
* migración no destruye datos críticos;
* migración conserva `tenant_id`;
* migración conserva relaciones;
* migración mantiene saldos;
* migración no elimina auditoría;
* rollback o migración compensatoria;
* compatibilidad con datos existentes;
* índices;
* constraints;
* enums;
* tiempos razonables.

---

## 7.13. Smoke tests

Pruebas rápidas post-deploy.

Deben validar:

* API responde;
* health check OK;
* DB conecta;
* Redis conecta;
* Keycloak conecta, si aplica;
* login básico;
* tenant público responde;
* endpoint privado responde con token;
* worker activo;
* storage disponible.

---

## 8. Testing por módulo

### 8.1. Tenants

Probar:

* crear tenant;
* slug único;
* estado activo;
* suspensión;
* reactivación;
* configuración inicial;
* roles base;
* integración WordPress;
* auditoría;
* tenant público;
* tenant no existente;
* tenant suspendido.

---

### 8.2. Identity

Probar:

* login;
* logout;
* refresh;
* token expirado;
* usuario desactivado;
* recuperación de contraseña, si auth propia temporal;
* integración Keycloak;
* subject no vinculado;
* claims inválidos;
* tenant selection;
* cambio de tenant;
* sesiones revocadas;
* MFA futuro.

---

### 8.3. Authorization

Probar:

* roles globales;
* roles tenant;
* permisos;
* asignación;
* revocación;
* cambio de rol;
* acceso por recurso;
* residentes;
* propietarios;
* permisos financieros;
* service accounts;
* intentos cross-tenant.

---

### 8.4. Residents and Properties

Probar:

* crear unidad;
* código único por tenant;
* propietario;
* arrendatario;
* residente;
* relación persona-unidad;
* cambio de residente;
* unidad inactiva;
* consulta por rol;
* acceso propio;
* acceso ajeno;
* importación futura.

---

### 8.5. Financial / Dues / Fees

Probar:

* conceptos de cobro;
* generación mensual;
* generación extraordinaria;
* duplicidad por periodo;
* cargos por unidad;
* reglas de mora;
* cargos vencidos;
* cancelación;
* reverso;
* auditoría;
* transacciones;
* saldos derivados.

---

### 8.6. Payments

Probar:

* registro de pago;
* comprobante;
* validación de monto;
* referencia;
* pago duplicado;
* confirmación;
* rechazo;
* reverso;
* asignación;
* pago parcial;
* pago excedente;
* idempotencia;
* concurrencia;
* auditoría;
* estado de cuenta actualizado.

---

### 8.7. Bank Reconciliation

Probar:

* importación de movimientos;
* movimiento duplicado;
* matching;
* conciliación manual;
* conciliación automática futura;
* cierre;
* reverso;
* auditoría;
* consistencia con pagos;
* movimientos no conciliados.

---

### 8.8. Reservations

Probar:

* crear área comunal;
* disponibilidad;
* solicitud;
* conflicto de horario;
* aprobación;
* rechazo;
* cancelación;
* cargo por reserva;
* pago de reserva;
* acceso de residente;
* reglas por tenant.

---

### 8.9. Fines

Probar:

* regla de multa;
* emisión;
* evidencia;
* notificación;
* apelación;
* aprobación;
* reverso;
* generación de cargo;
* auditoría;
* acceso del residente;
* permisos administrativos.

---

### 8.10. Meetings and Attendance

Probar:

* crear reunión;
* registrar asistencia;
* poderes;
* acta;
* votación futura;
* relación con unidad;
* reportes;
* acceso por rol;
* auditoría.

---

### 8.11. Communications

Probar:

* crear comunicado;
* público/privado;
* grupos destinatarios;
* notificación;
* entrega;
* error de entrega;
* acceso por tenant;
* integración n8n futura.

---

### 8.12. Reports

Probar:

* reportes financieros;
* filtros por tenant;
* exportación;
* permisos;
* auditoría;
* datos correctos;
* performance básica;
* reportes vacíos;
* periodos;
* paginación.

---

### 8.13. Audit

Probar:

* registro de evento;
* consulta;
* filtros;
* acceso restringido;
* exportación;
* protección contra eliminación;
* eventos financieros;
* eventos de autorización;
* eventos de identidad.

---

### 8.14. Integrations

Probar:

* WordPress endpoints públicos;
* n8n service account;
* webhooks;
* firma;
* timestamp;
* idempotencia;
* errores;
* reintentos;
* payload mínimo.

---

## 9. Datos de prueba

### 9.1. Principio

Los datos de prueba deben ser ficticios o anonimizados.

Prohibido:

* cédulas reales;
* comprobantes reales;
* datos bancarios reales;
* correos reales sin control;
* datos financieros reales;
* documentos reales de residentes.

---

### 9.2. Tenants de prueba

Crear al menos:

```text id="3k1mqd"
Tenant A: Villa Club Demo
Tenant B: Altos del Norte Demo
Tenant C: Tenant Suspendido Demo
```

Esto permite probar aislamiento.

---

### 9.3. Usuarios de prueba

Crear:

```text id="zgl3tp"
platformAdmin
tenantAdminA
tenantAdminB
treasurerA
residentA1
residentA2
ownerA1
guardA
auditorA
userWithoutTenant
disabledUser
```

---

### 9.4. Recursos de prueba

Crear:

* unidades;
* propietarios;
* residentes;
* cargos;
* pagos;
* reservas;
* multas;
* documentos;
* auditoría;
* reportes.

---

## 10. Pruebas multitenant obligatorias

Cada módulo debe incluir una prueba con dos tenants como mínimo.

Ejemplo para pagos:

```text id="tikg06"
Tenant A tiene Payment A.
Tenant B tiene Payment B.

Usuario Treasurer A intenta confirmar Payment B.
Resultado esperado: 403 o 404.
Payment B no cambia.
Audit registra intento denegado si aplica.
```

Ejemplo para reportes:

```text id="62mtl7"
Usuario de Tenant A genera reporte financiero.
Resultado no incluye cargos ni pagos de Tenant B.
```

Ejemplo para archivos:

```text id="kgfuwk"
Usuario de Tenant A intenta descargar comprobante de Tenant B.
Resultado: denegado.
No se genera URL firmada.
```

---

## 11. Pruebas de autorización obligatorias

Cada endpoint privado debe tener matriz mínima:

| Caso                     | Resultado esperado |
| ------------------------ | ------------------ |
| Sin token                | 401                |
| Token inválido           | 401                |
| Token válido sin permiso | 403                |
| Usuario sin tenant       | 403                |
| Usuario de otro tenant   | 403/404            |
| Recurso inexistente      | 404                |
| Estado inválido          | 409/422            |
| Request inválido         | 400/422            |
| Caso válido              | 200/201/204        |

---

## 12. Pruebas financieras obligatorias

### 12.1. Dinero

Validar:

* decimal;
* redondeo;
* moneda;
* monto positivo;
* monto cero inválido cuando aplique;
* monto negativo solo en ajustes/reversos permitidos;
* suma de asignaciones;
* saldo final.

---

### 12.2. Pagos

Casos:

```text id="5xmy81"
Pago completo.
Pago parcial.
Pago excedente.
Pago duplicado.
Pago rechazado.
Pago reversado.
Pago confirmado dos veces.
Pago con comprobante inválido.
Pago con referencia repetida.
Pago concurrente.
```

---

### 12.3. Cargos

Casos:

```text id="7i9fqb"
Cargo ordinario.
Cargo extraordinario.
Cargo vencido.
Cargo pagado.
Cargo parcialmente pagado.
Cargo cancelado.
Cargo reversado.
Cargo duplicado por periodo.
```

---

### 12.4. Estado de cuenta

Validar:

```text id="8le2ah"
saldo inicial
cargos
pagos
ajustes
reversos
mora
saldo final
orden cronológico
filtros por periodo
filtros por unidad
tenant
```

---

## 13. Pruebas de concurrencia

Procesos críticos:

* confirmar pago dos veces;
* generar alícuotas dos veces;
* reservar la misma área simultáneamente;
* conciliar el mismo movimiento dos veces;
* aplicar mora dos veces;
* exportar reporte mientras se actualizan pagos;
* asignar rol simultáneamente.

Controles esperados:

* transacciones;
* constraints;
* idempotency key;
* locks controlados;
* respuestas `409 Conflict`;
* consistencia final.

---

## 14. Pruebas de idempotencia

Obligatorias para:

* generación de alícuotas;
* registro de pagos;
* webhooks;
* importación bancaria;
* jobs;
* confirmación de procesos críticos;
* n8n retries.

Ejemplo:

```text id="5l6f9h"
Dado el mismo Idempotency-Key
cuando se envía dos veces la misma solicitud de pago
entonces el sistema no debe crear dos pagos.
```

---

## 15. Pruebas de API contract

Cada endpoint documentado en OpenAPI debe tener pruebas de contrato.

Validar:

* request schema;
* response schema;
* status codes;
* error codes;
* required fields;
* nullable fields;
* enums;
* paginación;
* filtros;
* ejemplos.

Regla:

```text id="xcb3qy"
Si cambia el contrato público, debe cambiar la spec y OpenAPI.
```

---

## 16. Pruebas de OpenAPI

El pipeline debe validar:

* OpenAPI generado;
* rutas documentadas;
* schemas válidos;
* errores documentados;
* tags correctos;
* auth declarada;
* permisos declarados en extensión o descripción;
* no endpoints privados sin auth.

---

## 17. Pruebas con Keycloak

Cuando se incorpore Keycloak, probar:

* token válido;
* token expirado;
* issuer inválido;
* audience inválida;
* firma inválida;
* subject no registrado;
* usuario sin perfil local;
* usuario sin tenant;
* usuario con tenant;
* cambio de tenant;
* roles técnicos;
* service account;
* redirect URI;
* logout;
* refresh;
* MFA para roles críticos, fase posterior.

---

## 18. Pruebas con WordPress

Probar:

* endpoint público de tenant;
* slug válido;
* slug inválido;
* tenant suspendido;
* campos permitidos;
* no exposición de datos sensibles;
* CORS permitido para portal;
* CORS denegado para origen no autorizado;
* botón de acceso con tenant slug;
* no acceso a endpoints privados sin token.

---

## 19. Pruebas con n8n

Probar:

* service account válida;
* service account sin scope;
* tenant incorrecto;
* webhook con firma válida;
* webhook con firma inválida;
* timestamp expirado;
* reintento;
* idempotencia;
* payload mínimo;
* auditoría;
* rate limiting.

---

## 20. Pruebas de archivos

Probar:

* upload válido;
* tipo inválido;
* tamaño excedido;
* archivo sin tenant;
* descarga autorizada;
* descarga no autorizada;
* descarga de otro tenant;
* URL firmada expirada;
* auditoría de acceso;
* storage privado;
* hash registrado;
* metadata registrada.

---

## 21. Pruebas de performance básica

No se requiere performance testing avanzado en MVP, pero sí pruebas básicas para endpoints críticos.

Probar:

* listados paginados;
* reportes financieros básicos;
* generación de alícuotas;
* confirmación de pagos;
* estado de cuenta;
* importación bancaria futura;
* exportaciones.

Criterios iniciales sugeridos:

```text id="e4d9ky"
Endpoints normales: respuesta menor a 500ms en entorno controlado.
Reportes: usar jobs si exceden tiempo razonable.
Procesos pesados: asíncronos.
```

Los valores definitivos se ajustarán con datos reales.

---

## 22. Pruebas de resiliencia básica

Probar:

* PostgreSQL no disponible;
* Redis no disponible;
* storage no disponible;
* Keycloak no disponible;
* worker caído;
* timeout de servicio externo;
* fallo de webhook;
* reintentos;
* degradación controlada.

---

## 23. Pruebas de backup y restore

No basta con crear backups.

Debe probarse:

* backup de PostgreSQL;
* restore de PostgreSQL;
* backup de storage;
* restore de archivos;
* backup de Keycloak;
* restore de realm/config;
* consistencia post-restore;
* recuperación de tenant;
* recuperación de auditoría.

Frecuencia inicial:

```text id="8rhasv"
Trimestral
```

Y antes de migraciones críticas.

---

## 24. Pruebas de migraciones

Antes de producción:

* aplicar en staging;
* validar datos;
* validar índices;
* validar constraints;
* validar saldos;
* validar auditoría;
* validar performance básica;
* validar rollback o compensación.

Migraciones críticas requieren evidencia.

---

## 25. Pruebas de observabilidad

Validar:

* logs estructurados;
* traceId en requests;
* traceId en errores;
* traceId en jobs;
* health checks;
* métricas;
* alertas críticas;
* no secretos en logs;
* no datos sensibles en logs;
* eventos de auditoría;
* correlación log-audit.

---

## 26. Pruebas en CI/CD

Pipeline mínimo:

```text id="kgvxqm"
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
docker build
openapi validation
migration check
security checks
```

Pipeline para producción:

```text id="5w1u6x"
tests completos
financial regression tests
multitenancy tests
authorization tests
migration validation
manual approval
backup before deploy
smoke tests after deploy
```

---

## 27. Gates de calidad

No se permite merge si falla:

* typecheck;
* lint;
* unit tests;
* integration tests críticos;
* multitenancy tests;
* authorization tests;
* financial regression tests cuando el cambio afecta módulos financieros;
* OpenAPI validation cuando cambia API;
* migration validation cuando cambia DB.

---

## 28. Cobertura

La cobertura no debe ser el único indicador.

Mínimos sugeridos:

| Tipo               | Meta inicial |
| ------------------ | -----------: |
| Dominio financiero |         Alta |
| Autorización       |         Alta |
| Multitenancy       |         Alta |
| Use cases críticos |         Alta |
| Utilidades simples |        Media |
| Controladores      |        Media |
| DTO validation     |   Media-alta |

Regla:

```text id="r6bwed"
Mejor pocas pruebas críticas bien diseñadas que alta cobertura superficial.
```

---

## 29. Organización de pruebas

Estructura sugerida:

```text id="b7xqw3"
apps/api/src/modules/payments/tests/
├── unit/
├── integration/
├── api/
├── authorization/
├── multitenancy/
└── financial-regression/
```

Pruebas globales:

```text id="49h0qz"
tests/
├── e2e/
├── contracts/
├── migrations/
├── security/
├── performance/
└── fixtures/
```

---

## 30. Fixtures y factories

Usar factories para datos de prueba.

Ejemplos:

```text id="p0u1hx"
createTenant()
createUser()
createMembership()
createPropertyUnit()
createCharge()
createPayment()
createConfirmedPayment()
createReservation()
```

Las factories deben permitir crear datos de varios tenants fácilmente.

---

## 31. Test database

Las pruebas de integración deben usar base separada.

Reglas:

* no usar producción;
* no usar staging compartido;
* limpiar entre pruebas;
* usar transacciones o reset controlado;
* datos deterministas;
* migraciones aplicadas;
* seeds mínimos.

---

## 32. Testing de agentes IA

Código generado por agentes IA debe cumplir:

* compila;
* pasa lint;
* pasa typecheck;
* incluye pruebas;
* actualiza spec si cambia comportamiento;
* actualiza OpenAPI si cambia API;
* no reduce pruebas existentes;
* no elimina controles de seguridad;
* no omite tenant;
* no omite autorización;
* no cambia modelos financieros sin pruebas.

Regla:

```text id="qxfqkn"
Ningún código generado por IA entra a main sin CI exitoso.
```

---

## 33. Test plan por spec SDD

Cada spec debe incluir:

```text id="or3319"
test-plan.md
```

Estructura:

```text id="d1riog"
# Test Plan — Nombre del módulo

## 1. Scope
## 2. Acceptance criteria covered
## 3. Unit tests
## 4. Integration tests
## 5. API tests
## 6. Authorization tests
## 7. Multitenancy tests
## 8. Security tests
## 9. Financial tests
## 10. Migration tests
## 11. E2E tests
## 12. Test data
## 13. Edge cases
## 14. Regression cases
## 15. CI requirements
```

---

## 34. Definition of Done

Una funcionalidad está terminada si:

* spec aprobada;
* criterios de aceptación claros;
* implementación completa;
* tests unitarios;
* tests integración;
* tests autorización;
* tests multitenant;
* tests financieros si aplica;
* OpenAPI actualizado;
* migraciones probadas;
* auditoría implementada;
* observabilidad implementada;
* CI exitoso;
* revisión humana completada.

---

## 35. Herramientas recomendadas

### 35.1. Backend

```text id="7uzuzk"
Jest
Supertest
Prisma test database
Testcontainers o Docker Compose para integración
ts-jest o configuración equivalente
```

### 35.2. API / Contract

```text id="pdgxiu"
OpenAPI validation
Schemathesis o herramienta equivalente
Postman/Newman opcional
Pact opcional para contract testing futuro
```

### 35.3. E2E frontend futuro

```text id="o7yh6k"
Playwright
Cypress como alternativa
```

### 35.4. Seguridad

```text id="ghmcl2"
npm audit
dependency scanning
secret scanning
OWASP ZAP en fase posterior
SAST del proveedor CI
```

---

## 36. Pruebas por ambiente

### 36.1. Local

* unit tests;
* integration tests seleccionados;
* API tests;
* desarrollo rápido.

### 36.2. CI

* lint;
* typecheck;
* unit tests;
* integration tests;
* API tests;
* OpenAPI validation;
* security checks básicos.

### 36.3. Staging

* E2E;
* smoke;
* migraciones;
* Keycloak;
* WordPress integration;
* n8n integration;
* backup/restore en ciclos planificados.

### 36.4. Production

* smoke post-deploy;
* health checks;
* monitoreo;
* alertas;
* no ejecutar tests destructivos.

---

## 37. Datos reales en pruebas

Regla:

```text id="dm76jt"
No usar datos reales de residentes en pruebas.
```

Excepciones solo con:

* autorización;
* anonimización;
* ambiente controlado;
* justificación;
* registro;
* eliminación posterior.

---

## 38. Manejo de fallos en pruebas

Si una prueba falla:

1. No ignorarla sin causa.
2. No eliminarla para pasar CI.
3. Identificar si falla la prueba o el código.
4. Corregir el origen.
5. Documentar si cambió comportamiento esperado.
6. Actualizar spec si corresponde.

---

## 39. Pruebas de regresión

Cada bug crítico corregido debe generar prueba de regresión.

Ejemplos:

* pago duplicado;
* fuga cross-tenant;
* saldo incorrecto;
* error de reverso;
* acceso indebido a comprobante;
* reporte con datos de otro tenant;
* migración defectuosa.

---

## 40. Testing en microservicios futuros

Cuando se extraigan microservicios:

* contract tests obligatorios;
* service-to-service tests;
* consumer-driven contracts;
* tracing validation;
* token validation;
* authorization tests por servicio;
* integration environment;
* test data isolation;
* compatibility tests;
* migration tests por servicio;
* E2E de flujos distribuidos.

Regla:

```text id="dj6i2u"
Extraer un microservicio sin pruebas de contrato está prohibido.
```

---

## 41. Riesgos

| Riesgo                              | Impacto | Mitigación                       |
| ----------------------------------- | ------- | -------------------------------- |
| Falta de pruebas multitenant        | Crítico | Tests obligatorios por módulo    |
| Saldos incorrectos                  | Crítico | Financial regression tests       |
| Permisos mal aplicados              | Crítico | Authorization tests              |
| Migraciones destructivas            | Crítico | Migration tests y backups        |
| Tests superficiales                 | Alto    | Criterios por spec               |
| CI lento                            | Medio   | Separar suites rápidas y pesadas |
| Datos reales en pruebas             | Alto    | Datos sintéticos                 |
| Agentes IA generan código sin tests | Alto    | CI obligatorio                   |
| Contratos API rotos                 | Alto    | Contract/OpenAPI tests           |
| Falta de pruebas E2E críticas       | Alto    | Flujos mínimos obligatorios      |
| Tests frágiles                      | Medio   | Fixtures estables                |
| Cobertura mal interpretada          | Medio   | Priorizar riesgo                 |

---

## 42. Consecuencias positivas

Esta decisión permite:

* reducir errores financieros;
* evitar fugas entre tenants;
* validar permisos;
* mejorar confianza en releases;
* facilitar SDD;
* controlar código generado por IA;
* reducir regresiones;
* proteger migraciones;
* validar contratos API;
* preparar microservicios;
* mejorar calidad técnica.

---

## 43. Consecuencias negativas

Esta decisión implica:

* más tiempo inicial;
* más mantenimiento de pruebas;
* pipeline más largo;
* necesidad de fixtures;
* necesidad de cultura de testing;
* pruebas financieras más complejas;
* mayor disciplina con SDD;
* necesidad de separar suites rápidas y lentas.

---

## 44. Criterios de aceptación

La estrategia se considera implementada si:

* existe framework de pruebas configurado;
* CI ejecuta lint, typecheck y tests;
* cada módulo tiene test-plan.md;
* módulos tenant-scoped tienen tests multitenant;
* endpoints privados tienen tests de autorización;
* módulos financieros tienen financial regression tests;
* migraciones críticas se prueban en staging;
* OpenAPI se valida;
* Keycloak se prueba cuando se incorpore;
* WordPress y n8n tienen pruebas de integración;
* smoke tests se ejecutan post-deploy;
* bugs críticos generan pruebas de regresión;
* código generado por IA pasa CI antes de merge.

---

## 45. Decisión final

RESIDENT Core adoptará una estrategia de pruebas automatizadas orientada a SDD, seguridad, multitenancy y consistencia financiera.

Las pruebas serán obligatorias para aceptar funcionalidades, especialmente en módulos de pagos, cargos, alícuotas, saldos, autorización, tenants, archivos, auditoría e integraciones.

El pipeline de CI/CD deberá ejecutar pruebas y validaciones antes de permitir despliegues.

La estrategia prioriza pruebas de alto valor sobre cobertura superficial, con énfasis en evitar errores financieros, accesos indebidos entre tenants y regresiones generadas por cambios manuales o por agentes IA.
