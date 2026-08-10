# Documentation Standard — RESIDENT Core

## 1. Información del documento

| Campo      | Valor                                |
| ---------- | ------------------------------------ |
| Proyecto   | RESIDENT Core                        |
| Documento  | Documentation Standard               |
| Ruta       | `docs/sdd/documentation-standard.md` |
| Versión    | 0.1                                  |
| Estado     | Estándar interno inicial             |
| Fecha      | 2026-08-06                           |
| Fase       | FASE 2 — RESIDENT Core               |
| Naturaleza | Estándar documental interno SDD      |

---

## 2. Propósito

Este documento define el estándar documental interno que RESIDENT Core usará para organizar, mantener y validar su documentación bajo el enfoque Spec-Driven Development.

La estructura definida aquí no pretende representar un estándar universal de SDD. Representa la convención oficial adoptada para RESIDENT Core, inspirada en prácticas modernas de Spec-Driven Development, GitHub Spec Kit, Architecture Decision Records, API-first, OpenAPI, Domain-Driven Design, security-by-design, testing strategy y documentación enterprise.

Regla central:

```text id="doc-standard-rule"
Toda decisión, especificación, contrato, modelo, tarea, prueba, nota de seguridad, cambio transversal y runbook de implementación de RESIDENT Core debe estar documentado, versionado y ubicado en la ruta correspondiente antes de implementarse código productivo, manteniendo trazabilidad desde la especificación hasta la implementación.
```

---

## 3. Principios documentales

```text id="doc-standard-principles"
1. La especificación precede al código.
2. Cada módulo funcional debe tener documentación propia.
3. Las decisiones arquitectónicas relevantes deben registrarse como ADR.
4. Los contratos API deben documentarse antes de implementar endpoints.
5. Los modelos de datos deben documentarse antes de crear tablas o migraciones.
6. Los módulos críticos deben tener plan de pruebas.
7. Los módulos críticos deben tener notas de seguridad.
8. Los cambios transversales deben registrarse explícitamente.
9. Los documentos consolidados no reemplazan las fuentes oficiales.
10. La documentación debe ser útil para humanos y agentes de código.
11. La documentación debe mantenerse dentro del repositorio.
12. Ningún código productivo debe implementarse fuera de la especificación aprobada.
```

---

## 4. Estructura documental oficial

La documentación oficial de RESIDENT Core se organiza bajo la carpeta:

```text id="doc-standard-root"
docs/
```

Estructura oficial:

```text id="doc-standard-structure"
docs/
├── sdd/
├── decisions/
├── specs/
├── changes/
├── implementation/
└── consolidated/
```

---

## 5. `docs/sdd/`

La carpeta `docs/sdd/` contiene los documentos globales de dirección, principios, arquitectura, seguridad, APIs, datos y estándar documental.

Estructura esperada:

```text id="doc-standard-sdd"
docs/sdd/
├── constitution.md
├── domain-map.md
├── architecture.md
├── security.md
├── api-guidelines.md
├── data-governance.md
└── documentation-standard.md
```

### 5.1. `constitution.md`

Define los principios rectores del proyecto.

Debe incluir:

```text id="doc-standard-constitution"
- principios SDD;
- reglas de arquitectura;
- reglas de multitenancy;
- reglas de seguridad;
- reglas de datos;
- reglas de API-first;
- reglas de auditoría;
- reglas de uso de IA;
- límites WordPress/Core;
- rol de Keycloak y autorización Core.
```

### 5.2. `domain-map.md`

Define el mapa de dominios, bounded contexts y módulos principales de RESIDENT Core.

Debe incluir:

```text id="doc-standard-domain-map"
- dominios funcionales;
- subdominios;
- relaciones entre módulos;
- límites de responsabilidad;
- dependencias conceptuales;
- módulos core;
- módulos extendidos;
- módulos avanzados.
```

### 5.3. `architecture.md`

Define la arquitectura objetivo.

Debe incluir:

```text id="doc-standard-architecture"
- estilo arquitectónico;
- monolito modular inicial;
- evolución futura a microservicios;
- stack tecnológico;
- interacción WordPress/Core;
- interacción Keycloak/Core;
- API-first;
- base de datos;
- Redis/colas;
- frontends;
- observabilidad;
- despliegue progresivo.
```

### 5.4. `security.md`

Define la postura global de seguridad.

Debe incluir:

```text id="doc-standard-security"
- autenticación;
- autorización;
- multitenancy;
- protección de datos;
- auditoría;
- CORS;
- errores seguros;
- rate limiting;
- storage seguro;
- límites WordPress/Core;
- uso seguro de IA;
- secretos;
- datos reales;
- endpoints prohibidos.
```

### 5.5. `api-guidelines.md`

Define reglas globales de API.

Debe incluir:

```text id="doc-standard-api-guidelines"
- versionado /api/v1;
- JSON conventions;
- response envelope;
- error envelope;
- autenticación Bearer;
- tenant resolution;
- paginación;
- filtros;
- idempotencia;
- validaciones;
- errores;
- OpenAPI;
- campos prohibidos;
- endpoints prohibidos.
```

### 5.6. `data-governance.md`

Define reglas globales de datos.

Debe incluir:

```text id="doc-standard-data-governance"
- tenant isolation;
- minimización de datos;
- clasificación de datos;
- datos personales;
- datos financieros;
- auditoría;
- retención;
- eliminación lógica;
- uso de IA;
- Keycloak/UserProfile;
- storage de documentos;
- trazabilidad.
```

### 5.7. `documentation-standard.md`

Define este estándar documental.

Debe incluir:

```text id="doc-standard-self"
- estructura documental oficial;
- reglas de nombres;
- estructura de specs;
- reglas de ADR;
- reglas de cambios;
- reglas de consolidación;
- reglas de implementación;
- controles mínimos antes de código.
```

---

## 6. `docs/decisions/`

La carpeta `docs/decisions/` contiene Architecture Decision Records.

Estructura esperada:

```text id="doc-standard-decisions"
docs/decisions/
├── ADR-001-architecture-style.md
├── ADR-002-backend-framework.md
├── ADR-003-database-strategy.md
├── ADR-004-multitenancy-strategy.md
├── ADR-005-authentication-strategy.md
├── ADR-006-identity-provider-strategy.md
├── ADR-007-authorization-strategy.md
├── ADR-008-api-gateway-strategy.md
├── ADR-009-deployment-strategy.md
├── ADR-010-observability-strategy.md
├── ADR-011-testing-strategy.md
└── ADR-012-ci-cd-strategy.md
```

---

## 7. Reglas para ADRs

Todo ADR debe seguir esta estructura mínima:

```text id="doc-standard-adr-template"
# ADR-XXX — Título de la decisión

## Estado

Proposed | Accepted | Superseded | Deprecated

## Contexto

Descripción del problema, restricciones y fuerzas de decisión.

## Decisión

Decisión adoptada.

## Consecuencias

Impactos positivos, negativos y tradeoffs.

## Alternativas consideradas

Opciones evaluadas y razones de descarte.

## Relación con documentos

Referencias a specs, SDD, security, architecture o cambios afectados.
```

Reglas:

```text id="doc-standard-adr-rules"
- No modificar la decisión histórica sin registrar cambio.
- Si una decisión cambia, crear nuevo ADR o marcar el anterior como superseded.
- Las decisiones aceptadas prevalecen sobre preferencias informales.
- Las specs deben alinearse con los ADR vigentes.
- Los ADRs no reemplazan specs funcionales.
```

---

## 8. `docs/specs/`

La carpeta `docs/specs/` contiene los paquetes SDD por módulo funcional o técnico.

Estructura esperada:

```text id="doc-standard-specs"
docs/specs/
├── SPECS_INDEX.md
├── 001-tenants/
├── 002-users-roles/
├── 003-residents-properties/
├── ...
└── 031-implementation-readiness/
```

Cada paquete debe tener un número secuencial de tres dígitos y un slug descriptivo en kebab-case.

Ejemplos válidos:

```text id="doc-standard-valid-spec-names"
001-tenants
002-users-roles
003-residents-properties
031-implementation-readiness
```

Ejemplos no válidos:

```text id="doc-standard-invalid-spec-names"
1-tenants
001_Tenants
001 tenants
031-implementation-readinnes
users-roles
```

---

## 9. Estructura estándar de cada paquete SDD

Cada paquete debe contener siete documentos:

```text id="doc-standard-package-files"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

Estructura:

```text id="doc-standard-package-structure"
docs/specs/XXX-module-name/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 10. Propósito de cada archivo de paquete

### 10.1. `spec.md`

Define el problema, objetivo, alcance funcional, actores, reglas de negocio, criterios de aceptación y no aceptación.

Debe responder:

```text id="doc-standard-spec-purpose"
- qué se quiere construir;
- por qué se necesita;
- qué incluye;
- qué excluye;
- quién lo usa;
- qué reglas debe cumplir;
- cuándo se considera aceptado.
```

---

### 10.2. `plan.md`

Define el plan técnico de implementación del módulo.

Debe responder:

```text id="doc-standard-plan-purpose"
- cómo se implementará;
- con qué componentes;
- en qué fases;
- qué dependencias tiene;
- qué servicios o módulos intervienen;
- qué colas o procesos async requiere;
- qué feature flags aplica;
- qué riesgos técnicos existen.
```

---

### 10.3. `data-model.md`

Define entidades, atributos, relaciones, tablas, índices, reglas de persistencia y campos prohibidos.

Debe responder:

```text id="doc-standard-data-model-purpose"
- qué datos se almacenan;
- qué entidades existen;
- qué tablas o modelos se proponen;
- qué relaciones hay;
- qué campos son obligatorios;
- qué datos no se deben almacenar;
- cómo se respeta tenant isolation;
- cómo se auditan cambios críticos.
```

---

### 10.4. `api-contract.md`

Define endpoints, requests, responses, permisos, errores, idempotencia, auditoría y campos prohibidos.

Debe responder:

```text id="doc-standard-api-contract-purpose"
- qué endpoints existen;
- qué permisos requieren;
- qué headers usan;
- qué payloads aceptan;
- qué respuestas devuelven;
- qué errores pueden producir;
- qué campos están prohibidos;
- qué endpoints están prohibidos;
- qué reglas OpenAPI deben cumplirse.
```

---

### 10.5. `test-plan.md`

Define estrategia de pruebas del módulo.

Debe responder:

```text id="doc-standard-test-plan-purpose"
- qué se debe probar;
- qué tipos de pruebas aplican;
- qué casos críticos existen;
- qué casos de seguridad existen;
- qué casos multitenant existen;
- qué casos de autorización existen;
- qué criterios hacen fallar CI;
- qué cobertura mínima se espera.
```

---

### 10.6. `tasks.md`

Define el backlog ejecutable del módulo.

Debe responder:

```text id="doc-standard-tasks-purpose"
- qué tareas deben realizarse;
- en qué épicas se agrupan;
- qué orden sugerido tienen;
- qué PRs se recomiendan;
- qué dependencias hay;
- qué Definition of Done aplica.
```

Regla:

```text id="doc-standard-tasks-rule"
Las casillas [ ] de tasks.md representan tareas implementables. Deben marcarse como completadas únicamente cuando el trabajo real esté implementado, probado y revisado.
```

---

### 10.7. `security-notes.md`

Define riesgos, amenazas, controles, gates, campos prohibidos y restricciones de seguridad del módulo.

Debe responder:

```text id="doc-standard-security-notes-purpose"
- qué activos protege;
- qué amenazas existen;
- qué controles aplican;
- qué no se debe permitir;
- qué datos están prohibidos;
- qué endpoints están prohibidos;
- qué pruebas de seguridad se requieren;
- qué hace fallar el módulo.
```

---

## 11. `SPECS_INDEX.md`

El archivo:

```text id="doc-standard-specs-index-path"
docs/specs/SPECS_INDEX.md
```

es el índice maestro de specs.

Debe incluir:

```text id="doc-standard-specs-index-content"
- lista de specs;
- módulo;
- dominio;
- prioridad;
- estado;
- sprint sugerido;
- dependencias principales;
- orden recomendado de implementación;
- reglas obligatorias;
- instrucciones para agentes de código.
```

Regla:

```text id="doc-standard-specs-index-rule"
SPECS_INDEX.md debe actualizarse cuando se agregue, renombre, difiera, cierre o cambie la prioridad de una spec.
```

---

## 12. `docs/changes/`

La carpeta `docs/changes/` contiene cambios transversales que afectan varios documentos.

Ejemplo:

```text id="doc-standard-changes"
docs/changes/
└── KEYCLOAK-001-docs-impact.md
```

Debe usarse cuando:

```text id="doc-standard-changes-when"
- una decisión afecta varios documentos;
- se introduce un cambio transversal;
- se cambia una estrategia relevante;
- se modifica autenticación, autorización, arquitectura, datos o seguridad;
- se requiere trazabilidad de impacto.
```

Reglas:

```text id="doc-standard-changes-rules"
- Un change document no reemplaza los documentos fuente.
- Debe listar documentos afectados.
- Debe indicar impacto.
- Debe indicar si requiere actualización directa.
- Debe indicar decisión final.
```

---

## 13. `docs/implementation/`

La carpeta `docs/implementation/` contiene runbooks operativos para pasar de documentación a implementación.

Ejemplo:

```text id="doc-standard-implementation"
docs/implementation/
└── sprint-0-foundation.md
```

Debe incluir:

```text id="doc-standard-implementation-content"
- objetivo del sprint;
- alcance;
- no alcance;
- estructura esperada;
- comandos sugeridos;
- archivos sugeridos;
- checklist;
- Definition of Done;
- no aceptación;
- siguiente paso.
```

Regla:

```text id="doc-standard-implementation-rule"
Los runbooks de implementación deben respetar las specs, ADRs y documentos SDD. No pueden introducir decisiones arquitectónicas nuevas sin ADR o cambio documentado.
```

---

## 14. `docs/consolidated/`

La carpeta `docs/consolidated/` contiene documentos de lectura consolidada.

Ejemplos:

```text id="doc-standard-consolidated"
docs/consolidated/
├── RESIDENT_Core_Keycloak_Docs_Consolidated.md
└── RESIDENT_Core_Project_Blueprint_v0.1.md
```

Uso permitido:

```text id="doc-standard-consolidated-allowed"
- resumen ejecutivo;
- visión general;
- contexto para nuevos colaboradores;
- contexto para agentes de código;
- snapshot de estado;
- documentación de lectura.
```

Regla crítica:

```text id="doc-standard-consolidated-rule"
Los documentos consolidados no son la fuente oficial si contradicen a los documentos individuales. La fuente oficial son docs/sdd, docs/decisions, docs/specs, docs/changes y docs/implementation.
```

---

## 15. Reglas de nombres

### 15.1. Carpetas

Usar kebab-case:

```text id="doc-standard-folder-names"
resident-self-service-basic
implementation-readiness
secure-document-storage
```

No usar:

```text id="doc-standard-folder-names-invalid"
ResidentSelfService
resident_self_service
Resident Self Service
residentSelfService
```

---

### 15.2. Specs

Formato:

```text id="doc-standard-spec-folder-format"
NNN-module-name
```

Ejemplo:

```text id="doc-standard-spec-folder-example"
030-resident-self-service-basic
```

Reglas:

```text id="doc-standard-spec-folder-rules"
- NNN debe tener tres dígitos.
- El slug debe estar en kebab-case.
- El número no debe reutilizarse para otro módulo.
- No cambiar rutas después de iniciar implementación sin registrar impacto.
```

---

### 15.3. ADRs

Formato:

```text id="doc-standard-adr-format"
ADR-NNN-decision-name.md
```

Ejemplo:

```text id="doc-standard-adr-example"
ADR-006-identity-provider-strategy.md
```

---

### 15.4. Consolidated docs

Formato recomendado:

```text id="doc-standard-consolidated-format"
RESIDENT_Core_<Topic>_vX.Y.md
```

Ejemplo:

```text id="doc-standard-consolidated-example"
RESIDENT_Core_Project_Blueprint_v0.1.md
```

---

## 16. Estados documentales

Estados permitidos:

```text id="doc-standard-status-values"
draft
in-review
accepted
superseded
deprecated
complete
deferred
blocked
needs-review
```

Uso recomendado:

| Estado         | Significado                               |
| -------------- | ----------------------------------------- |
| `draft`        | Documento inicial, puede cambiar          |
| `in-review`    | En revisión                               |
| `accepted`     | Decisión o documento aprobado             |
| `complete`     | Documento completo para referencia        |
| `deferred`     | Documentado pero no implementable todavía |
| `blocked`      | No puede avanzar por gap crítico          |
| `needs-review` | Requiere revisión antes de implementar    |
| `superseded`   | Reemplazado por otro documento            |
| `deprecated`   | Ya no debe usarse                         |

---

## 17. Regla de fuente de verdad

Orden de autoridad documental:

```text id="doc-standard-source-of-truth"
1. docs/sdd/constitution.md
2. ADRs aceptados en docs/decisions/
3. docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md
4. Especificaciones de dominio en docs/specs/
5. docs/sdd/architecture.md
6. docs/sdd/security.md
7. docs/sdd/api-guidelines.md
8. docs/sdd/data-governance.md
9. Documento de implementación del sprint vigente
10. Código de implementación existente
```

Regla:

```text id="doc-standard-conflict-rule"
Esta jerarquía debe mantenerse alineada con AGENTS.md. Los documentos de cambio,
otros documentos consolidados y README.md aportan trazabilidad y contexto, pero no
alteran por sí solos el orden de autoridad anterior. Si existe conflicto entre
documentos, debe resolverse mediante ADR, change document o actualización explícita
de la fuente afectada. No debe resolverse informalmente solo en código.
```

---

## 18. Reglas para implementación

Antes de implementar cualquier módulo:

```text id="doc-standard-before-implementation"
[ ] Revisar constitution.md.
[ ] Revisar architecture.md.
[ ] Revisar security.md.
[ ] Revisar api-guidelines.md.
[ ] Revisar data-governance.md.
[ ] Revisar ADRs aplicables.
[ ] Revisar spec.md del módulo.
[ ] Revisar plan.md del módulo.
[ ] Revisar data-model.md del módulo.
[ ] Revisar api-contract.md del módulo.
[ ] Revisar test-plan.md del módulo.
[ ] Revisar tasks.md del módulo.
[ ] Revisar security-notes.md del módulo.
```

No permitido:

```text id="doc-standard-implementation-forbidden"
- crear endpoints sin api-contract.md;
- crear tablas sin data-model.md;
- crear lógica financiera sin test-plan.md;
- crear módulo crítico sin security-notes.md;
- implementar comportamiento no especificado;
- permitir tenantId editable como autoridad final;
- aceptar actor fields desde cliente;
- exponer storageKey;
- usar WordPress como backend transaccional;
- crear rutas públicas administrativas;
- enviar datos reales a IA externa.
```

---

## 19. Reglas para agentes de código

Cuando se use Codex, Claude Code, Cursor u otro agente, la instrucción mínima debe ser:

```text id="doc-standard-agent-instruction"
Lee primero:
1. docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md
2. docs/specs/SPECS_INDEX.md
3. docs/sdd/constitution.md
4. docs/sdd/documentation-standard.md
5. docs/sdd/architecture.md
6. docs/sdd/security.md
7. docs/sdd/api-guidelines.md
8. docs/sdd/data-governance.md
9. docs/decisions/
10. docs/specs/<módulo solicitado>/
11. docs/implementation/<runbook solicitado>

Implementa únicamente el alcance solicitado.
No inventes endpoints, tablas, permisos, rutas ni reglas fuera de las specs.
```

Reglas para agentes:

```text id="doc-standard-agent-rules"
- No modificar documentos fuente sin instrucción explícita.
- No implementar lógica fuera del sprint solicitado.
- No crear endpoints no documentados.
- No crear tablas no documentadas.
- No introducir librerías críticas sin justificación.
- No exponer secretos.
- No usar datos reales.
- No cambiar arquitectura sin ADR.
- No cambiar reglas de seguridad sin security review.
```

---

## 20. Reglas de actualización documental

Se debe actualizar documentación cuando:

```text id="doc-standard-update-when"
- cambia una decisión arquitectónica;
- cambia un contrato API;
- cambia un modelo de datos;
- cambia una regla de seguridad;
- se agrega una dependencia crítica;
- se agrega un módulo;
- se cambia el orden de implementación;
- se difiere un módulo;
- se detecta un gap;
- se modifica el alcance MVP;
- se cambia la relación WordPress/Core;
- se modifica Keycloak/autorización.
```

Flujo recomendado:

```text id="doc-standard-update-flow"
1. Identificar documento afectado.
2. Registrar gap o cambio si es transversal.
3. Actualizar documento fuente.
4. Actualizar SPECS_INDEX.md si aplica.
5. Actualizar Project Blueprint si cambia la visión general.
6. Revisar impacto en ADRs.
7. Confirmar que implementación no contradice documentación.
```

---

## 21. Regla sobre documentos consolidados

Los documentos consolidados son útiles para lectura, pero no sustituyen los documentos fuente.

Reglas:

```text id="doc-standard-consolidated-rules"
- No editar solo consolidated si cambió una spec.
- No corregir solo Blueprint si cambió architecture.md.
- No corregir solo README si cambió una decisión.
- No considerar consolidated como fuente primaria de verdad.
- Actualizar consolidated después de actualizar fuentes oficiales.
```

---

## 22. Control mínimo antes de Sprint 0

Antes de iniciar Sprint 0:

```text id="doc-standard-before-sprint0"
[ ] docs/sdd completo.
[ ] docs/decisions completo.
[ ] docs/specs/001-031 completo.
[ ] SPECS_INDEX.md creado.
[ ] RESIDENT_Core_Project_Blueprint_v0.1.md creado.
[ ] sprint-0-foundation.md creado.
[ ] documentation-standard.md creado.
[ ] README.md actualizado.
[ ] No hay rutas mal nombradas.
[ ] No hay specs faltantes.
[ ] No hay documentos críticos vacíos.
```

---

## 23. Definition of Done de este estándar

```text id="doc-standard-dod"
[ ] Define propósito documental.
[ ] Define estructura docs/.
[ ] Define docs/sdd.
[ ] Define docs/decisions.
[ ] Define docs/specs.
[ ] Define estructura estándar de paquetes.
[ ] Define propósito de cada archivo.
[ ] Define docs/changes.
[ ] Define docs/implementation.
[ ] Define docs/consolidated.
[ ] Define reglas de nombres.
[ ] Define estados documentales.
[ ] Define fuente de verdad.
[ ] Define reglas para implementación.
[ ] Define reglas para agentes de código.
[ ] Define reglas de actualización.
[ ] Define control mínimo antes de Sprint 0.
```

---

## 24. No aceptación

Este estándar no se acepta si permite:

```text id="doc-standard-no-acceptance"
- implementar sin specs;
- implementar sin ADRs aplicables;
- implementar endpoints sin api-contract;
- implementar tablas sin data-model;
- implementar módulos críticos sin test-plan;
- implementar módulos críticos sin security-notes;
- usar consolidated como fuente única de verdad;
- modificar arquitectura sin ADR;
- modificar seguridad sin registro;
- usar WordPress como backend transaccional;
- exponer storageKey;
- usar datos reales en desarrollo;
- enviar datos reales a IA externa;
- crear estructura documental inconsistente.
```

---

## 25. Resultado esperado

Con este estándar, RESIDENT Core queda formalmente alineado a una convención documental interna:

```text id="doc-standard-expected-result"
SDD interno definido
estructura docs oficial definida
paquetes SDD normalizados
ADRs normalizados
cambios transversales controlados
runbooks de implementación separados
documentos consolidados subordinados a fuentes
reglas de nombres definidas
fuente de verdad definida
agentes de código guiados
Sprint 0 preparado
trazabilidad spec-to-code habilitada
```
