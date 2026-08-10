# ADR-001 — Architecture Style: Modular Monolith First

## 1. Información del documento

| Campo           | Valor                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                           |
| Documento       | ADR-001                                                                 |
| Título          | Architecture Style: Modular Monolith First                              |
| Ruta            | `docs/decisions/ADR-001-architecture-style.md`                          |
| Versión         | 0.1                                                                     |
| Estado          | accepted                                                               |
| Fecha           | 2026-07-10                                                              |
| Relacionado con | `architecture.md`, `domain-map.md`, `security.md`, `data-governance.md` |

---

## 2. Contexto

RESIDENT Core será el sistema transaccional central del ecosistema RESIDENT.

El sistema deberá gestionar procesos administrativos, financieros, operativos y comunitarios de múltiples conjuntos residenciales bajo un modelo multitenant.

Los módulos previstos incluyen:

* Tenants / conjuntos residenciales.
* Usuarios, roles y permisos.
* Residentes, propietarios, arrendatarios y unidades habitacionales.
* Alícuotas ordinarias y extraordinarias.
* Estados de cuenta.
* Pagos.
* Comprobantes.
* Movimientos bancarios.
* Conciliación.
* Reservas de áreas comunales.
* Multas.
* Reuniones y asistencia.
* Comunicados y notificaciones.
* Reportes.
* Auditoría.
* Integración con WordPress.
* Automatizaciones con n8n.

Aunque la visión inicial del proyecto contempla microservicios, el sistema aún se encuentra en fase de diseño y MVP. En esta etapa, los límites reales de dominio todavía deben validarse mediante especificaciones SDD, pruebas funcionales y uso operativo.

---

## 3. Problema

Se debe decidir el estilo arquitectónico inicial de RESIDENT Core.

Las opciones principales son:

1. Monolito tradicional.
2. Monolito modular.
3. Microservicios desde el inicio.
4. Arquitectura serverless.
5. Arquitectura híbrida.

La decisión debe equilibrar:

* Velocidad de construcción del MVP.
* Claridad del dominio.
* Bajo costo inicial.
* Seguridad.
* Multitenancy.
* Trazabilidad financiera.
* Mantenibilidad.
* Capacidad futura de escalar.
* Uso de metodología SDD.
* Compatibilidad con agentes IA.
* Integración con WordPress.
* Posibilidad futura de microservicios.

---

## 4. Decisión

RESIDENT Core iniciará como:

```text id="ur9r5j"
Monolito modular contenerizado, API-first, con PostgreSQL como base de datos principal.
```

El sistema será una única aplicación backend desplegable, organizada internamente por módulos de dominio.

La separación inicial será lógica y modular, no física.

---

## 5. Arquitectura elegida

```text id="11xqad"
RESIDENT Core API
├── Platform Module
├── Tenants Module
├── Identity and Access Module
├── Residents and Properties Module
├── Financial Module
├── Payments Module
├── Reconciliation Module
├── Reservations Module
├── Fines Module
├── Meetings Module
├── Communications Module
├── Reports Module
├── Audit Module
└── Integrations Module
```

Todos los módulos se ejecutarán inicialmente dentro del mismo backend, pero deberán mantener límites internos claros.

Cada módulo deberá tener:

* Responsabilidad definida.
* Casos de uso propios.
* Servicios propios.
* DTOs propios.
* Reglas de negocio propias.
* Pruebas propias.
* Contratos API propios.
* Eventos internos cuando corresponda.
* Dependencias controladas hacia otros módulos.

---

## 6. Justificación

La decisión se toma por las siguientes razones.

### 6.1. Menor complejidad inicial

Un sistema de microservicios exige resolver desde el inicio problemas como:

* Comunicación entre servicios.
* Autenticación distribuida.
* Observabilidad distribuida.
* Redes.
* Service discovery.
* Tolerancia a fallos.
* Versionamiento entre servicios.
* Transacciones distribuidas.
* Despliegue independiente.
* Monitoreo avanzado.
* Costos operativos más altos.

Para el MVP de RESIDENT Core, esa complejidad sería prematura.

---

### 6.2. El dominio aún debe estabilizarse

Los límites definitivos entre módulos todavía deben validarse.

Por ejemplo:

* Financial y Payments podrían estar muy acoplados al inicio.
* Fines puede generar cargos financieros.
* Reservations puede generar cargos.
* Meetings puede generar resoluciones que generen alícuotas extraordinarias.
* Audit atraviesa todos los módulos.
* Notifications puede ser sincrónico o asíncrono según madurez.

Separar físicamente estos módulos demasiado pronto podría generar fronteras incorrectas y alto costo de refactorización.

---

### 6.3. Mejor compatibilidad con SDD

Spec Driven Development requiere trazabilidad entre:

```text id="vp7igc"
spec → plan → tasks → data model → API contract → tests → implementation
```

Un monolito modular facilita que cada especificación SDD se implemente como módulo interno verificable, sin introducir la complejidad operativa de múltiples servicios independientes.

---

### 6.4. Mayor velocidad para el MVP

El objetivo inicial es validar el núcleo transaccional:

* Tenants.
* Usuarios y roles.
* Residentes y propiedades.
* Alícuotas.
* Estados de cuenta.
* Pagos.
* Auditoría.
* Integración básica con WordPress.

Un monolito modular permite construir, probar y desplegar estos componentes más rápido.

---

### 6.5. Mejor consistencia transaccional inicial

Los módulos financieros requieren consistencia fuerte.

Ejemplos:

* Confirmar pago y aplicar a cargos.
* Generar alícuotas y actualizar estados.
* Reversar pagos.
* Aplicar multas como cargos.
* Conciliar movimientos bancarios.

En una arquitectura distribuida, estas operaciones podrían requerir sagas, eventos, compensaciones o transacciones distribuidas.

En la etapa inicial, una base de datos relacional centralizada con transacciones ACID reduce riesgo.

---

### 6.6. Menor costo de infraestructura

El proyecto está en etapa de arranque.

Un monolito modular contenerizado puede ejecutarse con menor costo en:

* Entorno local.
* VPS.
* PaaS simple.
* Railway.
* Render.
* DigitalOcean.
* AWS Lightsail.
* AWS ECS en fase posterior.

Microservicios físicos desde el inicio aumentarían los costos de cómputo, base de datos, observabilidad, CI/CD y operación.

---

### 6.7. Evolución futura controlada

La decisión no descarta microservicios.

El sistema deberá diseñarse para permitir extracción futura de módulos cuando exista evidencia de necesidad.

Candidatos futuros:

* Notifications.
* Reports.
* Payments.
* Audit.
* Files.
* Identity.

---

## 7. Alternativas evaluadas

### 7.1. Monolito tradicional

#### Descripción

Una sola aplicación sin separación modular rigurosa.

#### Ventajas

* Simple.
* Rápido de iniciar.
* Bajo costo.
* Menor complejidad técnica.

#### Desventajas

* Riesgo de código mezclado.
* Baja mantenibilidad.
* Difícil evolución.
* Difícil aplicar SDD por módulo.
* Alto riesgo de acoplamiento indebido.
* Más difícil extraer microservicios después.

#### Resultado

Descartado.

RESIDENT Core no debe ser un monolito desordenado. Debe tener estructura modular desde el inicio.

---

### 7.2. Monolito modular

#### Descripción

Una sola aplicación desplegable, organizada internamente por módulos de dominio.

#### Ventajas

* Bajo costo inicial.
* Buena mantenibilidad.
* Buena compatibilidad con SDD.
* Facilita pruebas.
* Facilita transacciones.
* Permite separar responsabilidades.
* Permite evolución futura.
* Reduce complejidad operativa.
* Adecuado para MVP.

#### Desventajas

* Requiere disciplina arquitectónica.
* Los límites modulares pueden romperse si no se controlan.
* Todos los módulos comparten despliegue.
* Escalamiento independiente limitado.
* Riesgo de dependencia interna excesiva.

#### Resultado

Aceptado como arquitectura inicial.

---

### 7.3. Microservicios desde el inicio

#### Descripción

Cada módulo principal se implementa como servicio independiente.

#### Ventajas

* Escalabilidad independiente.
* Despliegues independientes.
* Separación física.
* Posible autonomía por equipos.
* Mayor aislamiento entre servicios.

#### Desventajas

* Alta complejidad inicial.
* Mayor costo.
* Mayor esfuerzo DevOps.
* Transacciones distribuidas.
* Observabilidad más compleja.
* Pruebas más complejas.
* Versionamiento entre servicios.
* Riesgo de definir mal los límites del dominio.
* Mayor dificultad para un MVP rápido.

#### Resultado

Descartado para el inicio.

Podrá considerarse en fases posteriores.

---

### 7.4. Serverless

#### Descripción

Implementar funcionalidades mediante funciones serverless y servicios gestionados.

#### Ventajas

* Escalamiento automático.
* Menor gestión de servidores.
* Pago por uso.
* Útil para procesos event-driven.

#### Desventajas

* Mayor fragmentación.
* Menor control transaccional.
* Complejidad para desarrollo local.
* Riesgo de vendor lock-in.
* Observabilidad más compleja.
* No ideal para modelar inicialmente un core financiero complejo.

#### Resultado

Descartado como arquitectura principal inicial.

Podrá usarse en procesos auxiliares futuros.

---

### 7.5. Arquitectura híbrida desde el inicio

#### Descripción

Combinar backend modular con algunos servicios externos separados desde el primer día.

#### Ventajas

* Flexibilidad.
* Permite separar algunos procesos pesados.
* Puede adaptarse a integraciones.

#### Desventajas

* Puede introducir complejidad prematura.
* Requiere definir límites antes de validar dominio.
* Puede dispersar la implementación inicial.

#### Resultado

No se adopta como arquitectura base inicial.

Sí se permite integrar componentes auxiliares controlados como Redis, storage y n8n.

---

## 8. Consecuencias positivas

Esta decisión permitirá:

* Construir el MVP más rápido.
* Mantener menor costo inicial.
* Probar el dominio antes de distribuirlo.
* Centralizar transacciones financieras.
* Reducir riesgos de consistencia.
* Facilitar pruebas de integración.
* Simplificar despliegue.
* Facilitar trabajo con agentes IA.
* Aplicar SDD de manera ordenada.
* Documentar specs por módulo.
* Preparar extracción futura de servicios.

---

## 9. Consecuencias negativas

Esta decisión también implica:

* No habrá escalamiento independiente por módulo al inicio.
* Todos los módulos se desplegarán juntos.
* Se requiere disciplina para evitar acoplamiento interno.
* Los módulos podrían depender indebidamente unos de otros.
* El equipo debe respetar límites arquitectónicos.
* Será necesario revisar periódicamente si algún módulo debe extraerse.

---

## 10. Controles para evitar degradación arquitectónica

Para que el monolito modular no se convierta en un monolito desordenado, se establecen estos controles:

1. Cada módulo debe tener carpeta propia.
2. Cada módulo debe tener spec SDD propia.
3. Cada módulo debe exponer contratos internos claros.
4. No se permite acceso directo indiscriminado a datos de otros módulos.
5. Las dependencias entre módulos deben justificarse.
6. Los casos de uso deben residir en la capa de aplicación.
7. Las reglas de negocio deben residir en la capa de dominio.
8. La infraestructura debe aislarse detrás de repositorios o servicios.
9. Los módulos financieros deben tener pruebas reforzadas.
10. Los cambios entre módulos deben revisarse mediante pull request.
11. Las decisiones estructurales deben registrarse como ADR.
12. Los agentes IA deben leer los documentos SDD antes de generar código.

---

## 11. Estructura inicial esperada

```text id="3dtu6v"
resident-core/
├── docs/
│   ├── sdd/
│   ├── specs/
│   └── decisions/
│
├── apps/
│   ├── api/
│   └── worker/
│
├── packages/
│   ├── shared/
│   ├── config/
│   └── testing/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docker/
├── scripts/
├── tests/
├── docker-compose.yml
└── README.md
```

---

## 12. Criterios para extraer microservicios en el futuro

Un módulo podrá considerarse candidato a microservicio cuando cumpla una o varias condiciones:

1. Tiene alto volumen de carga independiente.
2. Requiere despliegues independientes.
3. Tiene modelo de datos suficientemente separado.
4. Tiene un equipo responsable propio.
5. Tiene necesidades de escalamiento propias.
6. Tiene riesgos de seguridad que justifican aislamiento.
7. Genera demasiada carga en el backend principal.
8. Tiene integración externa compleja.
9. Su ciclo de vida cambia más rápido que el resto del sistema.
10. Su extracción no rompe consistencia financiera crítica.

---

## 13. Candidatos futuros a microservicio

| Módulo         | Motivo potencial                         |
| -------------- | ---------------------------------------- |
| Notifications  | Alto volumen de mensajes y reintentos    |
| Reports        | Consultas pesadas y generación asíncrona |
| Payments       | Integraciones con pasarelas y bancos     |
| Audit          | Alto volumen de eventos                  |
| Files          | Gestión de comprobantes y documentos     |
| Identity       | Seguridad centralizada                   |
| Reconciliation | Procesamiento financiero especializado   |

---

## 14. Condiciones antes de extraer un microservicio

Antes de extraer un módulo se debe contar con:

* Spec actualizada.
* ADR específico.
* Contrato API o contrato de eventos.
* Modelo de datos separado o estrategia de separación.
* Pruebas de contrato.
* Estrategia de despliegue.
* Estrategia de observabilidad.
* Estrategia de seguridad.
* Manejo de fallos.
* Plan de migración.
* Plan de rollback.
* Justificación de costo-beneficio.

---

## 15. Impacto en la base de datos

La decisión implica iniciar con:

```text id="xx4h4j"
Single PostgreSQL database
+
Shared schema
+
tenant_id obligatorio
```

Esto se documenta formalmente en un ADR separado:

```text id="nmvgne"
ADR-003-database-strategy.md
ADR-004-multitenancy-strategy.md
```

---

## 16. Impacto en despliegue

La aplicación podrá desplegarse inicialmente como uno o dos contenedores principales:

```text id="1dlkf0"
resident-api
resident-worker
```

Servicios auxiliares:

```text id="dmswpz"
postgres
redis
storage
mail
```

En producción, PostgreSQL y storage pueden migrar a servicios administrados.

---

## 17. Impacto en pruebas

El enfoque modular exige pruebas por niveles:

* Unit tests por módulo.
* Integration tests por módulo.
* API tests.
* Authorization tests.
* Multitenant tests.
* Financial regression tests.
* Contract tests para integraciones.
* E2E tests para flujos críticos.

Cada módulo debe poder probarse de forma aislada en la mayor medida posible.

---

## 18. Impacto en SDD

Cada módulo deberá tener su propia carpeta SDD.

Ejemplo:

```text id="r8frbc"
docs/specs/004-dues-fees/
├── spec.md
├── plan.md
├── tasks.md
├── data-model.md
├── api-contract.md
├── test-plan.md
└── security-notes.md
```

El código del módulo debe poder rastrearse hacia esa especificación.

---

## 19. Riesgos de la decisión

| Riesgo                                   | Impacto    | Mitigación                                      |
| ---------------------------------------- | ---------- | ----------------------------------------------- |
| Acoplamiento excesivo                    | Alto       | Reglas de dependencia entre módulos             |
| Módulos sin límites claros               | Alto       | Specs SDD por módulo                            |
| Crecimiento desordenado                  | Alto       | ADRs, revisión técnica y arquitectura por capas |
| Dificultad futura para extraer servicios | Medio-alto | Eventos internos y contratos claros             |
| Escalamiento limitado                    | Medio      | Extraer microservicios cuando exista evidencia  |
| Base de datos demasiado compartida       | Medio-alto | Definir ownership de tablas por módulo          |
| Agentes IA mezclan capas                 | Alto       | Instrucciones SDD y revisión humana             |

---

## 20. Estado de la decisión

```text id="x2r0lx"
accepted
```

Esta decisión deberá revisarse cuando:

* Existan más de varios tenants reales activos.
* Exista alto volumen de pagos o notificaciones.
* Un módulo requiera escalamiento independiente.
* Un módulo tenga un ciclo de despliegue propio.
* El equipo de desarrollo crezca.
* Se incorporen integraciones bancarias o pasarelas complejas.
* Los reportes afecten el rendimiento transaccional.
* Se detecte acoplamiento excesivo.

---

## Relación con documentos

- `docs/sdd/constitution.md`
- `docs/sdd/architecture.md`
- `docs/sdd/domain-map.md`
- `docs/sdd/security.md`
- `docs/sdd/data-governance.md`
- `docs/decisions/ADR-002-backend-framework.md`
- `docs/decisions/ADR-009-deployment-strategy.md`

## 21. Decisión final

RESIDENT Core iniciará como monolito modular contenerizado.

Esta decisión busca maximizar velocidad, seguridad, trazabilidad, mantenibilidad y control de costos durante el MVP, sin cerrar la puerta a una futura evolución hacia microservicios físicos.

La arquitectura deberá mantenerse modular desde el primer día para evitar deuda técnica y permitir evolución progresiva.
