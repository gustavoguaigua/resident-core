# ADR-002 — Backend Framework: NestJS + TypeScript

## 1. Información del documento

| Campo           | Valor                                                                                  |
| --------------- | -------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                          |
| Documento       | ADR-002                                                                                |
| Título          | Backend Framework: NestJS + TypeScript                                                 |
| Ruta            | `docs/decisions/ADR-002-backend-framework.md`                                          |
| Versión         | 0.1                                                                                    |
| Estado          | Aceptado inicialmente                                                                  |
| Fecha           | 2026-07-10                                                                             |
| Relacionado con | `architecture.md`, `api-guidelines.md`, `security.md`, `ADR-001-architecture-style.md` |

---

## 2. Contexto

RESIDENT Core será el sistema transaccional central de la plataforma RESIDENT.

La arquitectura inicial definida en `ADR-001-architecture-style.md` establece que el sistema iniciará como un monolito modular contenerizado, API-first, preparado para evolucionar progresivamente hacia microservicios físicos si el dominio, la carga o la operación lo justifican.

Para implementar esta arquitectura se requiere seleccionar un framework backend que permita:

* Construir APIs REST seguras.
* Organizar el sistema por módulos.
* Trabajar con TypeScript o lenguaje fuertemente tipado.
* Integrarse con PostgreSQL.
* Documentar APIs mediante OpenAPI.
* Implementar autenticación y autorización.
* Mantener pruebas automatizadas.
* Aplicar patrones de arquitectura por capas.
* Facilitar desarrollo asistido por IA bajo SDD.
* Mantener buena comunidad y soporte.
* Reducir complejidad inicial.
* Permitir evolución futura hacia microservicios.

---

## 3. Problema

Se debe elegir el framework backend principal para RESIDENT Core.

La decisión debe considerar:

* Popularidad actual del ecosistema.
* Madurez técnica.
* Productividad.
* Facilidad de mantenimiento.
* Compatibilidad con arquitectura modular.
* Seguridad.
* Curva de aprendizaje.
* Disponibilidad de librerías.
* Compatibilidad con agentes IA.
* Facilidad para generar código desde especificaciones.
* Facilidad para pruebas.
* Compatibilidad con Docker, CI/CD y cloud.
* Futuro crecimiento del sistema.

---

## 4. Decisión

RESIDENT Core utilizará como stack backend principal:

```text id="o3jv73"
NestJS + TypeScript + Node.js LTS
```

La base de datos principal será PostgreSQL y el acceso a datos se realizará inicialmente mediante Prisma ORM, salvo que una decisión posterior justifique TypeORM u otra alternativa.

Stack recomendado:

```text id="t2ib2j"
Backend Framework: NestJS
Language: TypeScript
Runtime: Node.js LTS
Database: PostgreSQL
ORM: Prisma
API Style: REST v1
API Documentation: OpenAPI / Swagger
Testing: Jest
Containerization: Docker
Cache / Queues: Redis
Background Jobs: BullMQ or equivalent
```

---

## 5. Justificación principal

La decisión se basa en que NestJS ofrece un equilibrio adecuado entre popularidad, estructura, productividad y mantenibilidad para un sistema como RESIDENT Core.

RESIDENT Core no será una API pequeña ni un prototipo aislado. Será un sistema transaccional con módulos financieros, multitenancy, roles, auditoría, pagos, reservas, multas, reportes e integraciones.

Por tanto, se requiere un framework que ayude a mantener orden arquitectónico.

NestJS aporta:

* Arquitectura modular nativa.
* TypeScript como lenguaje principal.
* Buen soporte para REST APIs.
* Integración con OpenAPI.
* Buen ecosistema para autenticación y autorización.
* Buen soporte para testing.
* Integración con PostgreSQL mediante ORMs.
* Compatibilidad con Docker.
* Compatibilidad con Redis y colas.
* Posibilidad futura de patrones de microservicios.
* Buena adaptación a desarrollo asistido por IA.

---

## 6. Relación con SDD

Spec Driven Development necesita que el código generado por IA tenga una estructura predecible.

NestJS es favorable para SDD porque permite mapear cada especificación hacia una estructura clara:

```text id="rra7fs"
docs/specs/004-dues-fees/spec.md
        ↓
src/modules/financial/
        ├── financial.module.ts
        ├── controllers/
        ├── services/
        ├── use-cases/
        ├── dto/
        ├── entities/
        ├── repositories/
        └── tests/
```

Esto facilita que los agentes IA trabajen con instrucciones claras:

* Crear módulo.
* Crear DTO.
* Crear controlador.
* Crear caso de uso.
* Crear servicio de dominio.
* Crear repositorio.
* Crear pruebas.
* Actualizar OpenAPI.
* Validar permisos.
* Validar tenant.
* Agregar auditoría.

---

## 7. Relación con arquitectura modular

NestJS se adapta bien al monolito modular porque su unidad organizativa principal es el módulo.

Ejemplo esperado:

```text id="6o8lxr"
src/modules/
├── platform/
├── tenants/
├── identity/
├── residents-properties/
├── financial/
├── payments/
├── reconciliation/
├── reservations/
├── fines/
├── meetings/
├── communications/
├── reports/
├── audit/
└── integrations/
```

Cada módulo puede encapsular:

* Controladores.
* DTOs.
* Servicios de aplicación.
* Reglas de dominio.
* Repositorios.
* Eventos.
* Guards.
* Pipes.
* Pruebas.
* Contratos API.

---

## 8. Alternativas evaluadas

### 8.1. NestJS + TypeScript

#### Ventajas

* Arquitectura modular nativa.
* TypeScript fuerte para reducir errores.
* Muy adecuado para APIs empresariales.
* Compatible con REST, GraphQL, WebSockets y microservicios.
* Buena integración con OpenAPI.
* Buen soporte para pruebas.
* Buena integración con PostgreSQL, Prisma y Redis.
* Comunidad activa.
* Estructura clara para agentes IA.
* Familiar para equipos que vienen del ecosistema JavaScript/TypeScript.
* Facilita compartir tipos con frontend TypeScript.

#### Desventajas

* Mayor estructura que Express.
* Requiere disciplina para no sobrecomplicar.
* Node.js no es ideal para cargas CPU-bound intensivas.
* El ecosistema npm exige controles fuertes de seguridad de dependencias.
* TypeScript requiere configuración adecuada para evitar deuda técnica.

#### Resultado

Aceptado como framework principal.

---

### 8.2. Express + TypeScript

#### Ventajas

* Muy popular.
* Simple.
* Amplio ecosistema.
* Flexible.
* Bajo overhead.

#### Desventajas

* No impone arquitectura.
* Puede derivar en código desordenado.
* Requiere construir manualmente estructura modular.
* Menos adecuado para un core transaccional grande si no se establecen muchas convenciones.
* Más riesgo de inconsistencia cuando se trabaja con agentes IA.

#### Resultado

Descartado como framework principal.

Podría usarse internamente porque NestJS puede apoyarse sobre Express por defecto.

---

### 8.3. FastAPI + Python

#### Ventajas

* Muy productivo.
* Excelente para APIs.
* Excelente integración con Python, IA y ciencia de datos.
* Tipado mediante type hints.
* Documentación automática.
* Buen rendimiento.
* Curva de aprendizaje razonable.

#### Desventajas

* Para un sistema transaccional modular grande puede requerir más decisiones arquitectónicas manuales.
* El tipado de Python no es tan estricto como TypeScript en tiempo de compilación.
* Menor alineación si el frontend también será TypeScript.
* Puede ser mejor para servicios de IA o analítica que para el core transaccional principal.

#### Resultado

Descartado como framework principal del Core.

Se mantiene como excelente candidato futuro para servicios especializados de IA, analítica o procesamiento de documentos.

---

### 8.4. Spring Boot + Java

#### Ventajas

* Muy robusto.
* Muy usado en entornos empresariales.
* Excelente para sistemas transaccionales.
* Gran ecosistema.
* Excelente soporte para seguridad, datos, testing y observabilidad.
* Muy maduro.

#### Desventajas

* Mayor complejidad inicial.
* Mayor curva de aprendizaje.
* Mayor verbosidad.
* Puede ralentizar el MVP.
* Menos flexible para desarrollo rápido asistido por IA en un proyecto pequeño o individual.

#### Resultado

Descartado para esta fase inicial.

Sería una excelente opción si RESIDENT Core naciera dentro de un equipo corporativo Java o con exigencias empresariales muy altas desde el primer día.

---

### 8.5. ASP.NET Core + C#

#### Ventajas

* Muy robusto.
* Excelente rendimiento.
* Muy buena arquitectura.
* Buen soporte empresarial.
* Excelente tooling.
* Buen soporte para APIs, seguridad y testing.

#### Desventajas

* Requiere mayor alineación con ecosistema Microsoft.
* Puede aumentar curva de aprendizaje si el proyecto no está centrado en .NET.
* Menor continuidad con frontend TypeScript comparado con NestJS.

#### Resultado

Descartado para esta fase inicial.

Sigue siendo alternativa fuerte si se decide adoptar ecosistema Microsoft.

---

### 8.6. Laravel + PHP

#### Ventajas

* Muy productivo.
* Excelente para desarrollo rápido.
* Buen ecosistema.
* Conocido y económico.
* El proyecto RESIDENT ya usa WordPress en la FASE 1, lo que implica familiaridad con PHP.

#### Desventajas

* Podría mezclar mentalmente el Core transaccional con el portal WordPress.
* Menos alineado con arquitectura modular tipo SDD para un core financiero multitenant moderno.
* Menos adecuado si se busca stack TypeScript full-stack.
* Riesgo de tratar el Core como extensión del portal en vez de sistema independiente.

#### Resultado

Descartado para RESIDENT Core.

WordPress y PHP deben permanecer en la capa portal, no en el núcleo transaccional.

---

## 9. Comparación resumida

| Criterio                        |   NestJS |    FastAPI |       Spring Boot |               ASP.NET Core |    Laravel |
| ------------------------------- | -------: | ---------: | ----------------: | -------------------------: | ---------: |
| Popularidad ecosistema          |     Alta |       Alta |          Muy alta |                       Alta |       Alta |
| Modularidad nativa              |     Alta |      Media |              Alta |                       Alta |      Media |
| Productividad MVP               |     Alta |       Alta |             Media |                 Media-alta |       Alta |
| Tipado fuerte                   |     Alta |      Media |              Alta |                       Alta |      Media |
| APIs REST                       |     Alta |       Alta |              Alta |                       Alta |       Alta |
| OpenAPI                         |     Alta |       Alta |              Alta |                       Alta | Media-alta |
| Testing                         |     Alta |       Alta |              Alta |                       Alta | Media-alta |
| Multitenancy                    |     Alta |       Alta |              Alta |                       Alta |      Media |
| Core financiero                 |     Alta | Media-alta |          Muy alta |                   Muy alta | Media-alta |
| Agentes IA / SDD                |     Alta |       Alta |        Media-alta |                 Media-alta |      Media |
| Costo inicial                   |     Bajo |       Bajo |             Medio |                      Medio |       Bajo |
| Curva de aprendizaje            |    Media | Baja-media |              Alta |                 Media-alta | Baja-media |
| Alineación con frontend moderno |     Alta |      Media |             Media |                      Media |      Media |
| Recomendación para RESIDENT     | Muy alta | Media-alta | Alta, pero pesada | Alta, pero más corporativa |      Media |

---

## 10. Decisión sobre runtime Node.js

El runtime será Node.js en versión LTS.

Regla:

```text id="42x1ug"
Usar siempre una versión Active LTS o Maintenance LTS para producción.
```

Para julio de 2026, la versión recomendada para iniciar el proyecto es Node.js 24 LTS.

Node.js 26 podrá evaluarse cuando entre formalmente en LTS y las dependencias principales del proyecto lo soporten adecuadamente.

---

## 11. Decisión sobre TypeScript

TypeScript será obligatorio para el backend.

Configuración recomendada:

```text id="zous4j"
strict: true
noImplicitAny: true
strictNullChecks: true
noUncheckedIndexedAccess: true
exactOptionalPropertyTypes: true
```

Justificación:

* Reduce errores en tiempo de desarrollo.
* Mejora autocompletado.
* Mejora refactorización.
* Facilita generación asistida por IA.
* Facilita contratos compartidos.
* Hace más seguro el mantenimiento.
* Ayuda a detectar inconsistencias antes de producción.

---

## 12. Decisión sobre ORM

Se recomienda usar inicialmente:

```text id="h78f69"
Prisma ORM
```

### 12.1. Justificación

Prisma aporta:

* Tipado fuerte.
* Buen soporte con TypeScript.
* Migraciones.
* Cliente generado.
* Productividad.
* Integración clara con PostgreSQL.
* Buena experiencia para desarrollo asistido por IA.
* Facilidad para leer modelos en specs y código.

### 12.2. Riesgos

* Algunas consultas complejas pueden requerir SQL nativo.
* Debe controlarse cuidadosamente el manejo de transacciones.
* Deben revisarse migraciones antes de producción.
* Debe evitarse que el ORM oculte reglas importantes de dominio.
* Debe validarse rendimiento en reportes financieros.

### 12.3. Alternativa

TypeORM es alternativa posible si se requiere un estilo más cercano a entidades, decoradores y patrones clásicos de NestJS.

Sin embargo, para el MVP se prefiere Prisma por claridad de esquema, tipado y productividad.

---

## 13. Decisión sobre base de datos

La base de datos principal será PostgreSQL.

Esta decisión se formaliza en:

```text id="9fyxzk"
ADR-003-database-strategy.md
```

PostgreSQL se usará para:

* Tenants.
* Usuarios.
* Roles.
* Propiedades.
* Residentes.
* Cargos.
* Pagos.
* Estados de cuenta.
* Auditoría.
* Configuración.
* Conciliación.
* Reportes transaccionales.

---

## 14. Decisión sobre documentación API

NestJS deberá integrarse con OpenAPI / Swagger.

Cada módulo deberá documentar sus endpoints, requests, responses, errores, permisos y auditoría.

La documentación generada no sustituye a los documentos SDD, pero debe estar alineada con ellos.

---

## 15. Estructura backend esperada

```text id="8vy3do"
apps/api/src/
├── main.ts
├── app.module.ts
├── config/
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── pipes/
│   └── errors/
│
├── modules/
│   ├── platform/
│   ├── tenants/
│   ├── identity/
│   ├── residents-properties/
│   ├── financial/
│   ├── payments/
│   ├── reconciliation/
│   ├── reservations/
│   ├── fines/
│   ├── meetings/
│   ├── communications/
│   ├── reports/
│   ├── audit/
│   └── integrations/
│
└── bootstrap/
```

---

## 16. Estructura sugerida por módulo

```text id="h2voch"
modules/payments/
├── payments.module.ts
├── controllers/
│   └── payments.controller.ts
├── dto/
│   ├── create-payment.dto.ts
│   ├── confirm-payment.dto.ts
│   └── reject-payment.dto.ts
├── application/
│   ├── use-cases/
│   │   ├── register-payment.use-case.ts
│   │   ├── confirm-payment.use-case.ts
│   │   └── reverse-payment.use-case.ts
│   └── services/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── rules/
├── infrastructure/
│   ├── repositories/
│   └── mappers/
└── tests/
    ├── unit/
    ├── integration/
    └── api/
```

---

## 17. Reglas de implementación

### 17.1. Controladores

Los controladores deben:

* Recibir requests.
* Validar DTOs.
* Delegar a casos de uso.
* No contener reglas de negocio.
* Declarar permisos.
* Declarar documentación OpenAPI.
* Resolver tenant mediante guards o contexto.

### 17.2. Casos de uso

Los casos de uso deben:

* Orquestar la operación.
* Validar permisos contextuales.
* Ejecutar transacciones.
* Invocar repositorios.
* Emitir eventos.
* Registrar auditoría cuando corresponda.

### 17.3. Dominio

El dominio debe contener:

* Reglas de negocio.
* Entidades.
* Value objects.
* Validaciones financieras.
* Transiciones de estado.
* Eventos de dominio.

### 17.4. Infraestructura

La infraestructura debe contener:

* Acceso a base de datos.
* Repositorios.
* Mapeadores.
* Integración con storage.
* Integración con servicios externos.
* Implementaciones concretas.

---

## 18. Seguridad del stack Node.js/NestJS

El uso de Node.js y npm implica aplicar controles específicos:

1. Versiones fijadas mediante lockfile.
2. Revisión de dependencias.
3. Escaneo de vulnerabilidades.
4. Instalación de paquetes solo con justificación.
5. Evitar dependencias abandonadas.
6. Activar autenticación multifactor en npm cuando aplique.
7. Usar `npm audit` o herramienta equivalente.
8. Usar secret scanning.
9. Evitar paquetes sugeridos por IA sin revisión.
10. Mantener imágenes Docker actualizadas.
11. Usar Node.js LTS.
12. No ejecutar contenedores como root cuando sea viable.

---

## 19. Compatibilidad con agentes IA

NestJS + TypeScript es adecuado para agentes IA porque:

* La estructura del proyecto es predecible.
* El tipado reduce ambigüedad.
* Los DTOs ayudan a definir contratos.
* Los módulos se mapean bien a specs SDD.
* Los errores de compilación detectan inconsistencias.
* Los tests pueden generarse por módulo.
* Los controladores y servicios siguen patrones repetibles.
* OpenAPI puede generarse y validarse.

Regla:

```text id="m73iu2"
Todo agente IA debe leer constitution.md, domain-map.md, architecture.md, security.md y api-guidelines.md antes de generar código backend.
```

---

## 20. Impacto en frontend

Elegir TypeScript en backend facilita que el futuro frontend pueda usar también TypeScript.

Opciones futuras:

* React + Vite.
* Next.js.
* Angular.
* Vue / Nuxt.
* Admin template basado en React o Angular.

La decisión del frontend se tomará en un ADR posterior.

---

## 21. Impacto en pruebas

Se usará Jest como herramienta base de pruebas.

Tipos de pruebas:

* Unit tests.
* Integration tests.
* API tests.
* Authorization tests.
* Multitenant tests.
* Financial regression tests.

Los módulos financieros deben tener cobertura reforzada.

---

## 22. Impacto en CI/CD

El pipeline debe ejecutar:

```text id="5zgddo"
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
docker build
security checks
```

---

## 23. Consecuencias positivas

La decisión permite:

* Desarrollo rápido y ordenado.
* Arquitectura modular clara.
* Buena alineación con SDD.
* Buen soporte para IA.
* Tipado fuerte.
* Buen ecosistema.
* Integración con PostgreSQL.
* Integración con OpenAPI.
* Facilidad para Docker.
* Posibilidad futura de microservicios.
* Mejor continuidad con frontend TypeScript.

---

## 24. Consecuencias negativas

La decisión implica:

* Dependencia del ecosistema npm.
* Necesidad de control fuerte de dependencias.
* Requiere experiencia en TypeScript.
* Requiere disciplina para mantener límites modulares.
* No es ideal para procesamiento CPU-bound pesado.
* Puede requerir servicios separados para IA o analítica avanzada en Python.

---

## 25. Riesgos

| Riesgo                                     | Impacto    | Mitigación                                   |
| ------------------------------------------ | ---------- | -------------------------------------------- |
| Dependencias npm vulnerables               | Alto       | Lockfile, auditoría, escaneo y revisión      |
| Código generado por IA con malas prácticas | Alto       | SDD, revisión humana y tests                 |
| Módulos acoplados indebidamente            | Alto       | Arquitectura por capas y revisión            |
| Mal manejo de transacciones                | Crítico    | Use cases transaccionales y pruebas          |
| DTOs inseguros                             | Alto       | Validación estricta y evitar mass assignment |
| Errores por configuración TypeScript débil | Medio-alto | `strict` habilitado                          |
| Uso de Node no LTS                         | Alto       | Solo Active LTS o Maintenance LTS            |
| Consultas complejas con ORM                | Medio      | SQL nativo controlado cuando sea necesario   |

---

## 26. Criterios de aceptación de esta decisión

La implementación backend cumplirá este ADR si:

* Usa NestJS.
* Usa TypeScript estricto.
* Usa Node.js LTS.
* Organiza el código por módulos.
* Documenta APIs con OpenAPI.
* Usa PostgreSQL.
* Usa Prisma inicialmente.
* Tiene pruebas automatizadas.
* Aplica guards para autenticación, autorización y tenant.
* Evita lógica de negocio en controladores.
* Respeta la estructura SDD.
* Mantiene dependencias auditadas.

---

## 27. Decisión final

Se adopta NestJS + TypeScript como framework backend principal para RESIDENT Core.

Esta decisión busca maximizar equilibrio entre popularidad, productividad, estructura, seguridad, modularidad, compatibilidad con SDD y preparación para desarrollo asistido por IA.

FastAPI podrá utilizarse en el futuro para servicios especializados de IA, analítica o procesamiento de datos, pero no será el framework principal del Core transaccional.

Spring Boot y ASP.NET Core se reconocen como alternativas empresariales robustas, pero se descartan para el MVP por mayor complejidad inicial y menor alineación con el enfoque TypeScript full-stack.

Laravel se mantiene fuera del Core para evitar mezclar el sistema transaccional con la capa WordPress/PHP de la FASE 1.
