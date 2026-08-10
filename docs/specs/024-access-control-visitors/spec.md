# Specification — 024 Access Control and Visitors

## 1. Información del documento

| Campo                 | Valor                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                                         |
| Spec ID               | 024                                                                                                                   |
| Módulo                | Access Control and Visitors                                                                                           |
| Documento             | Functional Specification                                                                                              |
| Ruta                  | `docs/specs/024-access-control-visitors/spec.md`                                                                      |
| Versión               | 0.1                                                                                                                   |
| Estado                | needs-review                                                                                                          |
| Fecha                 | 2026-07-24                                                                                                            |
| Fase                  | FASE 2 — RESIDENT Core                                                                                                |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                                        |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                        |
| Naturaleza            | Tenant-scoped / Security-sensitive / Visitor-driven / Resident-authorized / Guard-operated / Audit-heavy / Non-public |

---

## 2. Propósito

El módulo `024-access-control-visitors` gestiona el control básico de accesos y visitantes para cada conjunto residencial.

Permite registrar visitantes, autorizaciones de ingreso, códigos temporales, entradas, salidas, vehículos visitantes, proveedores visitantes, entregas, visitas recurrentes básicas, registros de garita, incidentes de acceso, reportes y auditoría.

Este módulo busca responder preguntas operativas como:

```text id="vgcksh"
- ¿Quién ingresó al conjunto?
- ¿A qué unidad visitó?
- ¿Quién autorizó el ingreso?
- ¿A qué hora ingresó?
- ¿A qué hora salió?
- ¿Qué guardia registró el evento?
- ¿Qué vehículo ingresó?
- ¿El visitante tenía autorización previa?
- ¿Hubo una novedad o incidente?
- ¿Qué accesos ocurrieron en un periodo determinado?
```

Regla central del módulo:

```text id="bjjz6t"
Todo visitante, autorización, código temporal, ingreso, salida, vehículo visitante, entrega, proveedor visitante, evento de garita, incidente, reporte y exportación de Access Control and Visitors debe pertenecer a un tenant, estar vinculado a una unidad, residente, proveedor o motivo válido, respetar autorización por rol o relación propia, proteger datos personales, registrar trazabilidad completa, no exponer datos en endpoints públicos, no permitir acceso desde WordPress público, no reemplazar sistemas físicos de control de acceso en MVP, no abrir puertas automáticamente en MVP, no realizar reconocimiento facial, no usar biometría, no enviar datos reales a IA externa y no permitir acceso cross-tenant.
```

---

## 3. Contexto funcional

En un conjunto residencial, la administración y el personal de seguridad necesitan controlar visitantes, proveedores, entregas y accesos eventuales.

El sistema debe permitir:

```text id="r80xpc"
- que un residente autorizado registre o preautorice visitantes propios;
- que un guardia registre ingresos y salidas en garita;
- que administración revise el historial de accesos;
- que se registren placas de vehículos visitantes;
- que se registre la unidad o persona visitada;
- que se documenten novedades de acceso;
- que se consulten reportes por fecha, unidad, visitante, guardia, vehículo o estado;
- que se audite toda acción crítica;
- que se proteja la información personal de visitantes y residentes.
```

El módulo no sustituye necesariamente al hardware físico de portones, lectoras, cámaras, barreras vehiculares o sistemas biométricos. En MVP opera como sistema administrativo y registral.

---

## 4. Objetivos

### 4.1. Objetivos funcionales

```text id="k2dwa2"
1. Registrar visitantes.
2. Registrar vehículos visitantes.
3. Permitir preautorizaciones de ingreso.
4. Permitir autorizaciones de ingreso por residente o administración.
5. Permitir registro de ingreso en garita.
6. Permitir registro de salida.
7. Registrar entregas y deliveries.
8. Registrar proveedores visitantes.
9. Registrar visitas recurrentes básicas.
10. Registrar incidencias de acceso.
11. Consultar historial de accesos.
12. Emitir reportes básicos.
13. Exportar reportes mediante Secure Document Storage.
14. Auditar acciones críticas.
```

---

### 4.2. Objetivos técnicos

```text id="s7x3jj"
1. Mantener tenant isolation estricto.
2. Separar visitante de evento de acceso.
3. Separar autorización de ingreso efectivo.
4. Proteger datos personales.
5. Evitar exposición pública.
6. Evitar acceso desde WordPress público.
7. Evitar biometría en MVP.
8. Evitar apertura automática de portones en MVP.
9. Mantener trazabilidad completa.
10. Preparar integración futura con hardware de control de acceso.
```

---

## 5. No objetivos

El módulo no busca implementar en MVP:

```text id="gkfejs"
- apertura automática de puertas o portones;
- integración directa con torniquetes;
- integración directa con cámaras;
- reconocimiento facial;
- biometría;
- lectura automática de placas;
- control físico en tiempo real;
- app móvil offline de guardias;
- tracking GPS de visitantes;
- verificación gubernamental de identidad;
- antecedentes penales;
- listas negras globales compartidas entre tenants;
- sistema policial;
- vigilancia masiva;
- exposición pública de visitantes;
- publicación en WordPress;
- IA externa con datos reales de acceso;
- acceso de proveedores externos a un portal propio;
- facturación de parqueaderos;
- cobros automáticos por visitas.
```

---

## 6. Alcance MVP

### 6.1. Incluido

```text id="p17wxo"
- VisitorProfile.
- VisitorVehicle.
- AccessAuthorization.
- AccessPass.
- AccessEvent.
- AccessCheckIn.
- AccessCheckOut.
- VisitorDelivery.
- VisitorSupplierVisit.
- VisitorRecurringAuthorization.
- AccessIncident.
- AccessGate.
- AccessGuardShift basic reference.
- AccessComment.
- AccessDocument.
- AccessReportExport.
- API tenant administrativa.
- API /me para residentes autorizados.
- API guard para personal de garita.
- Reportes básicos.
- Exportaciones vía Secure Document Storage.
- Auditoría.
- Observabilidad.
```

---

### 6.2. Fuera de alcance MVP

```text id="n3p5er"
- control físico de portones;
- control de cerraduras inteligentes;
- integración con cámaras CCTV;
- reconocimiento facial;
- biometría;
- OCR automático de placas;
- códigos QR escaneados por hardware externo;
- credenciales NFC/RFID;
- pases permanentes complejos;
- listas negras globales multi-tenant;
- verificación externa de identidad;
- portal de proveedores;
- app móvil offline;
- pagos por parqueadero;
- facturación;
- integración contable;
- conciliación bancaria;
- IA externa con datos reales;
- exposición pública en WordPress.
```

---

## 7. Actores

### 7.1. TenantAdmin

Administrador del conjunto.

Puede:

```text id="o9ztjx"
- configurar puertas o puntos de acceso;
- consultar todos los visitantes del tenant;
- consultar historial de accesos;
- crear autorizaciones administrativas;
- cancelar autorizaciones;
- registrar incidentes;
- exportar reportes;
- revisar auditoría operativa.
```

---

### 7.2. SecurityManager

Responsable de seguridad.

Puede:

```text id="qmbo23"
- administrar reglas operativas de acceso;
- revisar ingresos y salidas;
- administrar novedades;
- validar incidentes;
- consultar reportes;
- gestionar guardias o turnos básicos si aplica.
```

---

### 7.3. Guard

Personal de garita o seguridad.

Puede:

```text id="qxwswn"
- consultar autorizaciones vigentes;
- registrar ingreso;
- registrar salida;
- registrar vehículo visitante;
- registrar entrega;
- registrar incidente;
- agregar observaciones;
- consultar eventos recientes de su punto de acceso.
```

No puede:

```text id="fl93bg"
- consultar reportes financieros;
- consultar módulos no relacionados;
- exportar información masiva salvo permiso explícito;
- modificar auditoría;
- borrar eventos de acceso;
- cambiar tenant.
```

---

### 7.4. Resident

Residente vinculado a una unidad.

Puede:

```text id="lj8tuo"
- preautorizar visitantes para su unidad;
- consultar sus autorizaciones propias;
- cancelar autorizaciones propias futuras;
- consultar accesos propios limitados;
- crear visitantes frecuentes propios si la política lo permite.
```

No puede:

```text id="pvjtkf"
- ver visitantes de otras unidades;
- ver historial completo del conjunto;
- ver datos internos de guardias;
- modificar check-in/check-out;
- borrar eventos;
- exportar reportes administrativos.
```

---

### 7.5. PropertyOwner

Propietario no residente.

Puede acceder solo si:

```text id="std34m"
- está vinculado a la unidad;
- el tenant habilita permisos para propietarios;
- tiene UserProfile activo;
- tiene permiso correspondiente.
```

---

### 7.6. Visitor

Persona externa que ingresa al conjunto.

En MVP:

```text id="sq0cqm"
- no tiene cuenta de usuario propia;
- no accede directamente al sistema;
- puede tener datos registrados por residente, guardia o administrador;
- puede presentar documento o placa según política del tenant.
```

---

### 7.7. SupplierRepresentative

Representante de proveedor.

En MVP:

```text id="syn5fk"
- se registra como visitante/proveedor visitante;
- no tiene portal externo;
- puede estar referenciado desde Supplier Payments si corresponde;
- no accede directamente al sistema.
```

---

### 7.8. PlatformAdmin

Administrador de plataforma.

No accede automáticamente al historial de visitantes.

Acceso excepcional requiere:

```text id="f3lalp"
- tenant context explícito;
- permiso explícito;
- justificación;
- auditoría reforzada.
```

---

## 8. Entidades funcionales

### 8.1. VisitorProfile

Representa una persona visitante.

Atributos conceptuales:

```text id="xuf0p8"
- tenantId.
- fullName.
- identificationType opcional.
- identificationNumberMasked opcional.
- identificationNumberHash opcional.
- phoneMasked opcional.
- visitorType.
- status.
- notes.
- createdBy.
- archivedAt.
```

Reglas:

```text id="m96ytj"
- VisitorProfile pertenece a un tenant.
- Debe minimizar datos personales.
- El número de identificación completo no debe exponerse por defecto.
- Se recomienda guardar hash y valor enmascarado.
- No debe compartirse entre tenants.
```

---

### 8.2. VisitorVehicle

Vehículo asociado a visitante o evento.

Atributos conceptuales:

```text id="xecft0"
- tenantId.
- visitorId opcional.
- plateMasked.
- plateHash.
- vehicleType.
- vehicleColor opcional.
- vehicleBrand opcional.
- status.
```

Reglas:

```text id="j0pmdf"
- La placa completa no se expone por defecto.
- Plate hash permite búsqueda segura.
- Una placa puede aparecer en múltiples eventos.
- No se debe crear lista global multi-tenant.
```

---

### 8.3. AccessGate

Punto de acceso físico o lógico.

Ejemplos:

```text id="e4lqku"
- Garita principal.
- Entrada vehicular.
- Entrada peatonal.
- Puerta de proveedores.
- Acceso secundario.
```

Reglas:

```text id="c4sg6f"
- Pertenece al tenant.
- Puede estar activo/inactivo/archivado.
- No abre puertas automáticamente en MVP.
```

---

### 8.4. AccessAuthorization

Autorización previa o administrativa para ingreso.

Atributos conceptuales:

```text id="ac8lwb"
- tenantId.
- authorizationNumber.
- visitorId.
- propertyUnitId.
- authorizedByUserId.
- authorizedByPersonId.
- authorizationType.
- validFrom.
- validUntil.
- maxEntries.
- status.
- reason.
```

Tipos:

```text id="boya28"
- oneTime.
- dateRange.
- recurringBasic.
- delivery.
- supplierVisit.
- administrative.
```

Reglas:

```text id="zjcz9x"
- Toda autorización debe pertenecer a una unidad, residente, proveedor o motivo administrativo válido.
- Resident solo puede autorizar visitantes para unidades propias.
- Guard no crea autorizaciones residentes salvo política administrativa explícita.
- Autorización expirada no permite ingreso.
- Autorización cancelada no permite ingreso.
```

---

### 8.5. AccessPass

Código o token temporal asociado a una autorización.

En MVP puede ser:

```text id="qftvs5"
- código alfanumérico temporal;
- QR lógico generado por backend;
- token corto de validación interna.
```

Reglas:

```text id="cyka5p"
- Debe expirar.
- Debe estar asociado a un tenant.
- Debe estar asociado a una autorización.
- No debe contener datos personales en claro.
- No debe ser reutilizable si la autorización es oneTime.
- No debe operar como apertura automática de puerta en MVP.
```

---

### 8.6. AccessEvent

Evento de acceso.

Puede representar:

```text id="oi57ns"
- checkIn.
- checkOut.
- deniedAccess.
- manualReview.
- incident.
```

Atributos conceptuales:

```text id="olr08s"
- tenantId.
- eventNumber.
- visitorId.
- vehicleId opcional.
- authorizationId opcional.
- propertyUnitId opcional.
- gateId.
- eventType.
- eventStatus.
- occurredAt.
- recordedByUserId.
- guardShiftId opcional.
- notes.
```

Reglas:

```text id="o1wiyl"
- AccessEvent es fuente de trazabilidad.
- No se elimina físicamente.
- Check-in y check-out deben quedar auditados.
- Eventos cross-tenant están prohibidos.
```

---

### 8.7. AccessCheckIn

Registro específico de ingreso.

Atributos conceptuales:

```text id="uvrsdb"
- tenantId.
- accessEventId.
- visitorId.
- propertyUnitId.
- gateId.
- authorizationId opcional.
- vehicleId opcional.
- checkedInAt.
- checkedInBy.
- entryMethod.
- status.
```

---

### 8.8. AccessCheckOut

Registro específico de salida.

Atributos conceptuales:

```text id="rj818g"
- tenantId.
- checkInId.
- accessEventId.
- visitorId.
- gateId.
- checkedOutAt.
- checkedOutBy.
- exitMethod.
- status.
```

Reglas:

```text id="qack5w"
- Un check-in abierto debe poder cerrarse con check-out.
- No debe existir doble check-out activo para el mismo check-in.
- Salida sin ingreso previo requiere evento manual con razón.
```

---

### 8.9. VisitorDelivery

Entrega, delivery o mensajería.

Atributos conceptuales:

```text id="u3t6hu"
- tenantId.
- visitorId opcional.
- deliveryCompany opcional.
- propertyUnitId.
- recipientPersonId opcional.
- packageDescription opcional.
- status.
- receivedAt.
- deliveredAt.
```

Reglas:

```text id="uihv6q"
- La entrega debe vincularse a una unidad.
- No debe exponer contenido sensible del paquete.
- Puede generar evento de acceso si ingresa al conjunto.
```

---

### 8.10. VisitorSupplierVisit

Visita de proveedor.

Atributos conceptuales:

```text id="r8rz5q"
- tenantId.
- supplierId opcional.
- visitorId.
- propertyUnitId opcional.
- commonAreaId opcional.
- maintenanceWorkOrderId opcional.
- reason.
- status.
```

Reglas:

```text id="hwh1a8"
- supplierId debe pertenecer al tenant si se informa.
- Puede relacionarse con Maintenance Work Orders.
- No crea SupplierPayable.
- No crea SupplierPaymentOrder.
- No crea pagos.
```

---

### 8.11. VisitorRecurringAuthorization

Autorización recurrente básica.

Ejemplos:

```text id="s1eagt"
- empleada doméstica autorizada de lunes a viernes;
- jardinero semanal;
- familiar frecuente;
- proveedor recurrente.
```

Reglas:

```text id="qxjmx4"
- Debe tener vigencia.
- Debe tener días o patrón simple.
- Debe tener unidad o motivo válido.
- Puede cancelarse.
- No debe convertirse en pase permanente sin control.
```

---

### 8.12. AccessIncident

Novedad o incidente de acceso.

Ejemplos:

```text id="ht5x3j"
- visitante rechazado;
- autorización vencida;
- documento no presentado;
- placa no coincide;
- intento de ingreso no autorizado;
- salida no registrada;
- incidente con guardia;
- novedad vehicular.
```

Reglas:

```text id="w3rh58"
- Debe ser tenant-scoped.
- Debe estar vinculado a evento, visitante, unidad o gate cuando aplique.
- Debe tener severidad.
- Debe auditarse.
```

---

### 8.13. AccessComment

Comentario interno relacionado con autorización, visitante o evento.

Reglas:

```text id="piy69v"
- Comentarios internos no se exponen a Resident salvo política explícita.
- Deben ser sanitizados.
- No deben contener datos sensibles innecesarios.
```

---

### 8.14. AccessDocument

Documento relacionado con acceso.

Ejemplos:

```text id="kedcpj"
- foto de autorización firmada;
- soporte administrativo;
- documento de incidente;
- reporte exportado.
```

Reglas:

```text id="vz4lb4"
- Todo documento usa Secure Document Storage.
- No se almacena storageKey.
- No se almacena base64.
- No se expone URL persistente.
```

---

### 8.15. AccessReportExport

Exportación de reportes de accesos.

Reglas:

```text id="l6svb1"
- Debe generar secureDocumentId.
- Debe estar tenant-scoped.
- Debe auditarse.
- No debe exponer storageKey.
```

---

## 9. Estados

### 9.1. VisitorProfileStatus

```text id="wcd8q3"
active
watchlistedTenant
blockedTenant
archived
```

Nota:

```text id="vow721"
watchlistedTenant y blockedTenant son locales al tenant, no listas globales compartidas.
```

---

### 9.2. VisitorVehicleStatus

```text id="tf9das"
active
watchlistedTenant
blockedTenant
archived
```

---

### 9.3. AccessAuthorizationStatus

```text id="vxmz4a"
draft
active
used
expired
cancelled
revoked
archived
```

---

### 9.4. AccessPassStatus

```text id="dix7v6"
active
used
expired
revoked
archived
```

---

### 9.5. AccessEventType

```text id="czzpf3"
checkIn
checkOut
deniedAccess
manualReview
incident
systemNote
```

---

### 9.6. AccessEventStatus

```text id="jr6h21"
recorded
corrected
voided
archived
```

---

### 9.7. CheckInStatus

```text id="jvfa7z"
open
closed
voided
archived
```

---

### 9.8. CheckOutStatus

```text id="t37wz4"
recorded
voided
archived
```

---

### 9.9. DeliveryStatus

```text id="qjeaad"
registered
receivedAtGate
deliveredToUnit
returned
cancelled
archived
```

---

### 9.10. SupplierVisitStatus

```text id="smfcww"
scheduled
checkedIn
checkedOut
cancelled
denied
archived
```

---

### 9.11. AccessIncidentSeverity

```text id="cn8ddt"
info
low
medium
high
critical
```

---

### 9.12. AccessIncidentStatus

```text id="ny96ao"
open
underReview
resolved
dismissed
archived
```

---

## 10. Reglas de negocio

### 10.1. Reglas generales

```text id="divtvm"
BR-001 Todo registro de acceso debe pertenecer a un tenant.
BR-002 Todo visitante debe pertenecer a un tenant.
BR-003 Todo vehículo visitante debe pertenecer a un tenant.
BR-004 Todo evento de acceso debe pertenecer a un tenant.
BR-005 Ningún residente puede ver visitantes de otra unidad.
BR-006 Ningún guardia puede cambiar tenant.
BR-007 Ningún endpoint público debe exponer visitantes, accesos o autorizaciones.
BR-008 WordPress público no puede acceder a información de accesos.
BR-009 Los datos personales deben minimizarse.
BR-010 Los datos sensibles deben enmascararse por defecto.
```

---

### 10.2. Visitantes

```text id="mpjtny"
BR-011 VisitorProfile debe tener nombre o identificador mínimo.
BR-012 El número de identificación completo no debe exponerse por defecto.
BR-013 Si se almacena identificación, debe guardarse enmascarada y/o hasheada.
BR-014 Un visitante blockedTenant no puede recibir autorización activa.
BR-015 Un visitante archived no puede usarse en nuevos accesos.
BR-016 Watchlist es local al tenant.
BR-017 No existe lista negra global en MVP.
```

---

### 10.3. Vehículos

```text id="mfz29x"
BR-018 La placa completa no debe exponerse por defecto.
BR-019 Plate hash permite búsqueda exacta segura.
BR-020 Vehículo blockedTenant no puede ingresar salvo override administrativo auditado.
BR-021 Vehículo archived no puede usarse en nuevos registros.
BR-022 Un vehículo puede vincularse a visitante o solo al evento.
```

---

### 10.4. Autorizaciones

```text id="ty1zpl"
BR-023 Una autorización debe tener visitorId o datos mínimos de visitante.
BR-024 Una autorización debe tener propertyUnitId, supplierId, commonAreaId o motivo administrativo.
BR-025 Resident solo puede autorizar para unidades vinculadas.
BR-026 TenantAdmin puede crear autorización administrativa.
BR-027 Guard no puede crear autorización residente salvo permiso explícito.
BR-028 Autorización active debe tener validFrom y validUntil.
BR-029 Autorización expirada no permite ingreso.
BR-030 Autorización cancelled no permite ingreso.
BR-031 Autorización revoked no permite ingreso.
BR-032 Autorización oneTime pasa a used después del ingreso si la política lo indica.
BR-033 Autorización recurrente debe tener patrón y vigencia.
BR-034 Toda cancelación o revocación requiere razón.
```

---

### 10.5. Pases y códigos temporales

```text id="gwuim0"
BR-035 AccessPass debe asociarse a AccessAuthorization.
BR-036 AccessPass debe expirar.
BR-037 AccessPass usado no debe reutilizarse si es oneTime.
BR-038 AccessPass no debe contener datos personales en claro.
BR-039 AccessPass no abre puertas automáticamente en MVP.
BR-040 AccessPass revocado no permite ingreso.
```

---

### 10.6. Ingreso

```text id="q4vgm9"
BR-041 Todo check-in debe registrar guardia o actor.
BR-042 Todo check-in debe registrar gateId.
BR-043 Todo check-in debe registrar fecha/hora server-side.
BR-044 Si hay autorización, debe estar active y vigente.
BR-045 Si no hay autorización, el ingreso debe clasificarse como manualReview o deniedAccess salvo override autorizado.
BR-046 Check-in no debe modificar datos financieros.
BR-047 Check-in no debe crear pagos.
BR-048 Check-in debe auditarse.
```

---

### 10.7. Salida

```text id="r1v80f"
BR-049 Todo check-out debe vincularse a check-in abierto cuando exista.
BR-050 Check-out debe registrar guardia o actor.
BR-051 Check-out debe registrar fecha/hora server-side.
BR-052 No debe existir doble check-out activo para el mismo check-in.
BR-053 Salida sin check-in debe requerir razón.
BR-054 Check-out debe auditarse.
```

---

### 10.8. Entregas

```text id="vcog54"
BR-055 Toda entrega debe estar vinculada a unidad o destinatario válido.
BR-056 La descripción del paquete debe ser mínima.
BR-057 No se debe registrar contenido sensible innecesario.
BR-058 Entrega puede estar asociada a evento de acceso.
BR-059 Entrega retornada debe tener razón.
```

---

### 10.9. Proveedores visitantes

```text id="r6xfju"
BR-060 supplierId debe pertenecer al tenant si se informa.
BR-061 supplier blocked no puede registrarse como visita autorizada salvo override auditado.
BR-062 Supplier visit puede vincularse a Maintenance Work Order.
BR-063 Supplier visit no crea SupplierPayable.
BR-064 Supplier visit no crea SupplierPaymentOrder.
BR-065 Supplier visit no crea Payment.
```

---

### 10.10. Incidentes

```text id="beie3h"
BR-066 Todo incidente debe tener severidad.
BR-067 Todo incidente debe tener descripción sanitizada.
BR-068 Incidente crítico debe notificar a roles configurados si Notifications está habilitado.
BR-069 Incidente resuelto debe tener resolutionReason.
BR-070 Incidente dismissed debe tener dismissReason.
```

---

### 10.11. Reportes

```text id="i8ua7u"
BR-071 Reportes deben ser tenant-scoped.
BR-072 Reportes deben aplicar filtros de fecha.
BR-073 Reportes masivos deben paginarse.
BR-074 Exportaciones deben ir por Secure Document Storage.
BR-075 Reportes no deben exponer datos completos de identificación o placas por defecto.
```

---

### 10.12. Seguridad y privacidad

```text id="ousmn9"
BR-076 No se permite endpoint público de visitantes.
BR-077 No se permite endpoint público de accesos.
BR-078 No se permite acceso desde WordPress público.
BR-079 No se permite biometría en MVP.
BR-080 No se permite reconocimiento facial en MVP.
BR-081 No se permite IA externa con datos reales.
BR-082 No se permite acceso cross-tenant.
BR-083 No se permite borrar físicamente eventos críticos.
```

---

## 11. Casos de uso principales

### 11.1. Resident preautoriza visitante

```text id="fm3351"
1. Resident inicia sesión.
2. Sistema resuelve tenant y unidades vinculadas.
3. Resident selecciona unidad propia.
4. Resident registra visitante.
5. Resident define fecha/hora o rango de validez.
6. Sistema crea AccessAuthorization.
7. Sistema puede crear AccessPass temporal.
8. Sistema audita accessAuthorization.created.
```

Resultado:

```text id="w0b1bx"
Visitante queda preautorizado para ingreso según vigencia y reglas del tenant.
```

---

### 11.2. Guardia registra ingreso con autorización

```text id="o4yic7"
1. Guard consulta autorización por código, visitante, placa o unidad.
2. Sistema valida tenant.
3. Sistema valida vigencia.
4. Sistema valida status active.
5. Guard registra ingreso.
6. Sistema crea AccessEvent checkIn.
7. Sistema crea AccessCheckIn open.
8. Sistema marca pass used si aplica.
9. Sistema audita access.checkIn.recorded.
```

---

### 11.3. Guardia registra ingreso sin autorización

```text id="qbnmc4"
1. Visitante llega sin preautorización.
2. Guard busca o crea VisitorProfile mínimo.
3. Guard registra unidad destino o motivo.
4. Sistema aplica política del tenant.
5. Si requiere confirmación, se registra manualReview o deniedAccess.
6. Si se permite override, se registra ingreso con razón.
7. Sistema audita evento.
```

---

### 11.4. Guardia registra salida

```text id="oa5tcz"
1. Guard busca check-in abierto.
2. Sistema valida tenant.
3. Guard registra salida.
4. Sistema crea AccessEvent checkOut.
5. Sistema crea AccessCheckOut.
6. Sistema cierra AccessCheckIn.
7. Sistema audita access.checkOut.recorded.
```

---

### 11.5. Resident cancela autorización propia

```text id="kdtaaj"
1. Resident consulta autorizaciones futuras propias.
2. Resident selecciona autorización active.
3. Resident cancela con razón.
4. Sistema valida unidad propia.
5. Sistema cambia status a cancelled.
6. Sistema revoca AccessPass activo.
7. Sistema audita accessAuthorization.cancelled.
```

---

### 11.6. Guardia registra incidente

```text id="lv76xk"
1. Guard identifica novedad.
2. Guard selecciona visitante, evento o unidad si aplica.
3. Guard registra descripción.
4. Guard clasifica severidad.
5. Sistema crea AccessIncident.
6. Sistema notifica si aplica.
7. Sistema audita accessIncident.created.
```

---

### 11.7. Administración consulta reportes

```text id="wpf8la"
1. TenantAdmin selecciona periodo.
2. Sistema consulta eventos tenant-scoped.
3. Sistema aplica filtros por unidad, gate, visitante, placa, estado o guardia.
4. Sistema devuelve reporte paginado.
5. Si exporta, crea AccessReportExport y SecureDocument.
6. Sistema audita accessReport.exported.
```

---

## 12. User stories

### 12.1. Resident

```text id="rcqk24"
US-001 Como residente, quiero preautorizar un visitante para mi unidad, para que pueda ingresar sin llamadas adicionales.
US-002 Como residente, quiero cancelar una autorización futura, para impedir un ingreso ya no deseado.
US-003 Como residente, quiero ver mis autorizaciones vigentes, para controlar quién puede visitarme.
US-004 Como residente, quiero ver accesos relacionados con mi unidad de forma limitada, para tener trazabilidad básica.
```

---

### 12.2. Guard

```text id="wvlrm7"
US-005 Como guardia, quiero consultar autorizaciones vigentes, para validar si un visitante puede ingresar.
US-006 Como guardia, quiero registrar ingreso de visitante, para dejar evidencia de acceso.
US-007 Como guardia, quiero registrar salida, para cerrar la visita.
US-008 Como guardia, quiero registrar vehículo visitante, para controlar placas de ingreso.
US-009 Como guardia, quiero registrar incidentes, para reportar novedades de seguridad.
US-010 Como guardia, quiero ver eventos recientes de mi garita, para operar el turno.
```

---

### 12.3. TenantAdmin / SecurityManager

```text id="iovyk7"
US-011 Como administrador, quiero revisar historial de accesos, para auditar la seguridad del conjunto.
US-012 Como administrador, quiero configurar puntos de acceso, para clasificar eventos por garita o entrada.
US-013 Como responsable de seguridad, quiero consultar incidentes, para hacer seguimiento.
US-014 Como administrador, quiero exportar reportes de accesos, para controles internos.
US-015 Como administrador, quiero bloquear un visitante dentro del tenant, para prevenir futuros ingresos no autorizados.
```

---

### 12.4. Supplier visit

```text id="ehbgux"
US-016 Como administrador, quiero registrar visita de proveedor, para controlar ingresos técnicos o de servicios.
US-017 Como guardia, quiero registrar ingreso de proveedor vinculado a mantenimiento, para dejar trazabilidad operativa.
```

---

## 13. Requerimientos funcionales

### 13.1. Visitantes

```text id="r9ph3a"
FR-001 El sistema debe permitir crear VisitorProfile tenant-scoped.
FR-002 El sistema debe permitir actualizar datos mínimos de VisitorProfile.
FR-003 El sistema debe permitir archivar VisitorProfile.
FR-004 El sistema debe permitir marcar VisitorProfile como watchlistedTenant.
FR-005 El sistema debe permitir marcar VisitorProfile como blockedTenant con razón.
FR-006 El sistema debe permitir buscar visitantes por nombre, documento enmascarado/hash o teléfono enmascarado según permisos.
```

---

### 13.2. Vehículos visitantes

```text id="ua09q4"
FR-007 El sistema debe permitir registrar VisitorVehicle.
FR-008 El sistema debe permitir asociar VisitorVehicle a VisitorProfile.
FR-009 El sistema debe permitir buscar vehículo por placa usando hash seguro.
FR-010 El sistema debe enmascarar placas por defecto.
FR-011 El sistema debe permitir marcar vehículo como blockedTenant con razón.
```

---

### 13.3. Puntos de acceso

```text id="frri9k"
FR-012 El sistema debe permitir crear AccessGate.
FR-013 El sistema debe permitir activar, inactivar y archivar AccessGate.
FR-014 El sistema debe permitir asociar AccessEvent a AccessGate.
```

---

### 13.4. Autorizaciones

```text id="grcjvq"
FR-015 El sistema debe permitir crear AccessAuthorization.
FR-016 El sistema debe permitir autorización por residente para unidad propia.
FR-017 El sistema debe permitir autorización administrativa.
FR-018 El sistema debe validar vigencia de autorización.
FR-019 El sistema debe permitir cancelar autorización.
FR-020 El sistema debe permitir revocar autorización.
FR-021 El sistema debe permitir autorización recurrente básica.
FR-022 El sistema debe limitar autorizaciones según maxEntries.
```

---

### 13.5. Pases

```text id="jrbjbr"
FR-023 El sistema debe generar AccessPass temporal si aplica.
FR-024 El sistema debe validar AccessPass por tenant.
FR-025 El sistema debe expirar AccessPass.
FR-026 El sistema debe marcar AccessPass usado si corresponde.
FR-027 El sistema debe revocar AccessPass al cancelar autorización.
```

---

### 13.6. Ingresos

```text id="nnxz8n"
FR-028 El sistema debe registrar AccessCheckIn.
FR-029 El sistema debe crear AccessEvent checkIn.
FR-030 El sistema debe validar autorización si se informa.
FR-031 El sistema debe permitir check-in manual con razón y permiso.
FR-032 El sistema debe registrar guardia o actor.
FR-033 El sistema debe registrar gate.
FR-034 El sistema debe permitir vehículo opcional.
```

---

### 13.7. Salidas

```text id="uwrpq6"
FR-035 El sistema debe registrar AccessCheckOut.
FR-036 El sistema debe cerrar check-in abierto.
FR-037 El sistema debe crear AccessEvent checkOut.
FR-038 El sistema debe impedir doble check-out.
FR-039 El sistema debe permitir salida manual sin check-in solo con razón y permiso.
```

---

### 13.8. Entregas

```text id="z7n6kp"
FR-040 El sistema debe registrar VisitorDelivery.
FR-041 El sistema debe asociar entrega a unidad.
FR-042 El sistema debe registrar estado de entrega.
FR-043 El sistema debe permitir marcar entrega como entregada o retornada.
```

---

### 13.9. Proveedores visitantes

```text id="mnamow"
FR-044 El sistema debe registrar VisitorSupplierVisit.
FR-045 El sistema debe validar supplierId si existe.
FR-046 El sistema debe permitir vincular supplier visit a Maintenance Work Order.
FR-047 El sistema no debe crear pagos ni obligaciones por registrar visita.
```

---

### 13.10. Incidentes

```text id="enrr1w"
FR-048 El sistema debe registrar AccessIncident.
FR-049 El sistema debe permitir resolver incidente.
FR-050 El sistema debe permitir descartar incidente.
FR-051 El sistema debe permitir filtrar incidentes por severidad y estado.
```

---

### 13.11. Comentarios y documentos

```text id="fnt5u1"
FR-052 El sistema debe permitir comentarios internos.
FR-053 El sistema debe permitir documentos vía Secure Document Storage.
FR-054 El sistema no debe exponer storageKey.
FR-055 El sistema no debe aceptar base64.
```

---

### 13.12. Reportes

```text id="q1c7kc"
FR-056 El sistema debe generar reporte de ingresos y salidas.
FR-057 El sistema debe generar reporte de visitantes por unidad.
FR-058 El sistema debe generar reporte de visitantes por gate.
FR-059 El sistema debe generar reporte de incidentes.
FR-060 El sistema debe generar reporte de autorizaciones.
FR-061 El sistema debe exportar reportes vía Secure Document Storage.
```

---

## 14. Requerimientos no funcionales

### 14.1. Seguridad

```text id="yauacs"
NFR-001 Todos los endpoints deben requerir autenticación salvo que explícitamente se prohíba su existencia pública.
NFR-002 Todas las consultas deben filtrar por tenantId.
NFR-003 Cross-tenant debe responder 404.
NFR-004 Los DTOs no deben aceptar tenantId.
NFR-005 Los DTOs no deben aceptar actor fields.
NFR-006 Los datos personales deben minimizarse.
NFR-007 Identificación y placas deben enmascararse por defecto.
NFR-008 No debe existir endpoint público de accesos.
NFR-009 WordPress público no debe tener acceso.
NFR-010 No debe existir biometría en MVP.
```

---

### 14.2. Privacidad

```text id="ju31cr"
NFR-011 Los visitantes son datos personales.
NFR-012 El sistema debe evitar almacenar datos innecesarios.
NFR-013 El sistema debe evitar mostrar documentos completos por defecto.
NFR-014 El sistema debe auditar consultas sensibles si aplica.
NFR-015 El sistema debe permitir archivo lógico sujeto a política de retención.
```

---

### 14.3. Auditoría

```text id="z5s7yd"
NFR-016 Todo check-in debe auditarse.
NFR-017 Todo check-out debe auditarse.
NFR-018 Toda autorización creada/cancelada/revocada debe auditarse.
NFR-019 Todo incidente debe auditarse.
NFR-020 Toda exportación debe auditarse.
```

---

### 14.4. Performance

```text id="v4l8hj"
NFR-021 Listar eventos paginados debe responder p95 < 1200 ms con índices adecuados.
NFR-022 Consultar autorizaciones vigentes debe responder p95 < 800 ms.
NFR-023 Registrar check-in debe responder p95 < 1000 ms.
NFR-024 Registrar check-out debe responder p95 < 1000 ms.
NFR-025 Reportes paginados deben limitar pageSize a 100.
```

---

### 14.5. Disponibilidad operacional

```text id="ffcx3b"
NFR-026 El módulo debe favorecer operación rápida de garita.
NFR-027 Errores deben ser claros y no filtrar información sensible.
NFR-028 El sistema debe mantener trazabilidad aun cuando una autorización no exista.
NFR-029 El sistema debe permitir registrar deniedAccess.
```

---

## 15. Permisos preliminares

### 15.1. Visitantes

```text id="wm6qjq"
accessVisitors.create
accessVisitors.read
accessVisitors.update
accessVisitors.archive
accessVisitors.block
accessVisitors.watchlist
```

---

### 15.2. Vehículos

```text id="yeo816"
accessVisitorVehicles.create
accessVisitorVehicles.read
accessVisitorVehicles.update
accessVisitorVehicles.archive
accessVisitorVehicles.block
```

---

### 15.3. Gates

```text id="xv09aj"
accessGates.create
accessGates.read
accessGates.update
accessGates.archive
```

---

### 15.4. Autorizaciones

```text id="w9p2hh"
accessAuthorizations.create
accessAuthorizations.read
accessAuthorizations.cancel
accessAuthorizations.revoke
accessAuthorizations.own.create
accessAuthorizations.own.read
accessAuthorizations.own.cancel
```

---

### 15.5. Pases

```text id="pdmcyb"
accessPasses.create
accessPasses.read
accessPasses.validate
accessPasses.revoke
```

---

### 15.6. Eventos, check-in y check-out

```text id="fpt65h"
accessEvents.read
accessEvents.correct
accessEvents.void

accessCheckIns.create
accessCheckIns.read
accessCheckIns.manualOverride
accessCheckIns.void

accessCheckOuts.create
accessCheckOuts.read
accessCheckOuts.manualOverride
accessCheckOuts.void
```

---

### 15.7. Entregas y proveedores

```text id="gpnktj"
accessDeliveries.create
accessDeliveries.read
accessDeliveries.update
accessDeliveries.close

accessSupplierVisits.create
accessSupplierVisits.read
accessSupplierVisits.update
accessSupplierVisits.close
```

---

### 15.8. Incidentes

```text id="se347l"
accessIncidents.create
accessIncidents.read
accessIncidents.update
accessIncidents.resolve
accessIncidents.dismiss
```

---

### 15.9. Reportes y exportaciones

```text id="uykb2x"
accessReports.events
accessReports.visitors
accessReports.authorizations
accessReports.incidents
accessReports.exports
```

---

## 16. API preliminar

### 16.1. Base path

```text id="ur4obs"
/api/v1
```

---

### 16.2. Tenant Admin API

```text id="wzw88k"
GET    /api/v1/tenant/access-visitors
POST   /api/v1/tenant/access-visitors
GET    /api/v1/tenant/access-visitors/{visitorId}
PATCH  /api/v1/tenant/access-visitors/{visitorId}
POST   /api/v1/tenant/access-visitors/{visitorId}/watchlist
POST   /api/v1/tenant/access-visitors/{visitorId}/block
POST   /api/v1/tenant/access-visitors/{visitorId}/archive

GET    /api/v1/tenant/access-visitor-vehicles
POST   /api/v1/tenant/access-visitor-vehicles
GET    /api/v1/tenant/access-visitor-vehicles/{vehicleId}
PATCH  /api/v1/tenant/access-visitor-vehicles/{vehicleId}
POST   /api/v1/tenant/access-visitor-vehicles/{vehicleId}/block
POST   /api/v1/tenant/access-visitor-vehicles/{vehicleId}/archive

GET    /api/v1/tenant/access-gates
POST   /api/v1/tenant/access-gates
GET    /api/v1/tenant/access-gates/{gateId}
PATCH  /api/v1/tenant/access-gates/{gateId}
POST   /api/v1/tenant/access-gates/{gateId}/archive

GET    /api/v1/tenant/access-authorizations
POST   /api/v1/tenant/access-authorizations
GET    /api/v1/tenant/access-authorizations/{authorizationId}
POST   /api/v1/tenant/access-authorizations/{authorizationId}/cancel
POST   /api/v1/tenant/access-authorizations/{authorizationId}/revoke

GET    /api/v1/tenant/access-events
GET    /api/v1/tenant/access-events/{eventId}
POST   /api/v1/tenant/access-events/{eventId}/void
POST   /api/v1/tenant/access-events/{eventId}/correct

GET    /api/v1/tenant/access-check-ins
POST   /api/v1/tenant/access-check-ins
GET    /api/v1/tenant/access-check-ins/{checkInId}
POST   /api/v1/tenant/access-check-ins/{checkInId}/void

GET    /api/v1/tenant/access-check-outs
POST   /api/v1/tenant/access-check-outs
GET    /api/v1/tenant/access-check-outs/{checkOutId}
POST   /api/v1/tenant/access-check-outs/{checkOutId}/void
```

---

### 16.3. Guard API

La Guard API sigue estando bajo `/tenant`, pero con permisos de guardia:

```text id="bg7ky6"
GET    /api/v1/tenant/guard/access-authorizations/active
POST   /api/v1/tenant/guard/access-check-ins
POST   /api/v1/tenant/guard/access-check-outs
GET    /api/v1/tenant/guard/access-events/recent
POST   /api/v1/tenant/guard/access-incidents
POST   /api/v1/tenant/guard/access-deliveries
```

Regla:

```text id="f93com"
La Guard API no es pública; requiere AuthGuard, TenantGuard y permisos de guardia.
```

---

### 16.4. `/me` API para residentes

Permitida de forma limitada:

```text id="q4w672"
GET    /api/v1/me/access-authorizations
POST   /api/v1/me/access-authorizations
GET    /api/v1/me/access-authorizations/{authorizationId}
POST   /api/v1/me/access-authorizations/{authorizationId}/cancel
GET    /api/v1/me/access-events
GET    /api/v1/me/access-visitors
POST   /api/v1/me/access-visitors
```

Reglas:

```text id="qwnz0j"
- Solo datos propios.
- Solo unidades vinculadas al usuario.
- No datos de otras unidades.
- No datos internos de guardias.
- No exportación masiva.
- No edición de check-in/check-out.
```

---

### 16.5. Public API prohibida

No implementar:

```text id="s7plht"
GET    /api/v1/public/access-visitors
GET    /api/v1/public/access-events
GET    /api/v1/public/access-authorizations
GET    /api/v1/public/tenants/{slug}/access-visitors
GET    /api/v1/public/tenants/{slug}/access-events
POST   /api/v1/public/access-check-ins
```

Respuesta:

```http id="q6ab9x"
404 Not Found
```

---

## 17. Integraciones internas

### 17.1. `001-tenants`

Uso:

```text id="xsn46p"
- tenant isolation;
- tenant status;
- currentTenant;
- configuración por tenant;
- respuesta 404 cross-tenant.
```

---

### 17.2. `002-users-roles`

Uso:

```text id="n58cd9"
- Keycloak authentication;
- UserProfile;
- TenantMembership;
- permisos;
- roles;
- actor server-side;
- residentes autorizadores;
- guardias;
- administradores.
```

---

### 17.3. `003-residents-properties`

Uso:

```text id="ser5ld"
- propertyUnitId;
- Person;
- residencies;
- ownerships;
- relación usuario-persona-unidad;
- validación de acceso /me.
```

Regla:

```text id="sn1o7q"
Resident solo puede operar autorizaciones relacionadas con unidades propias o autorizadas.
```

---

### 17.4. `010-reservations-common-areas`

Uso opcional:

```text id="hlevea"
- visitantes asociados a reservas de áreas comunales;
- ingreso a salón comunal;
- proveedores para eventos.
```

No debe:

```text id="k6e3x1"
- crear reservas automáticamente;
- cobrar reservas;
- modificar cargos.
```

---

### 17.5. `012-communications-notifications`

Uso:

```text id="g7rknw"
- notificar a residente sobre visitante en garita;
- notificar incidente;
- enviar código temporal si se habilita;
- notificar autorización cancelada.
```

Regla:

```text id="uu9p2r"
Las notificaciones no deben incluir datos sensibles completos.
```

---

### 17.6. `016-secure-document-storage`

Uso:

```text id="kl5z8j"
- documentos de incidentes;
- soportes administrativos;
- exportaciones;
- evidencias si se habilitan.
```

Regla:

```text id="ezrxuj"
Access Control no almacena storageKey, signedUrl persistente, base64 ni binarios.
```

---

### 17.7. `021-supplier-payments`

Uso referencial:

```text id="zm2xni"
- validar supplierId para proveedor visitante;
- consultar resumen mínimo del proveedor.
```

No debe:

```text id="s625n8"
- crear SupplierPayable;
- crear SupplierPaymentOrder;
- marcar paid;
- crear Payment.
```

---

### 17.8. `022-maintenance-work-orders`

Uso referencial:

```text id="p1fp5c"
- visitas de técnicos o proveedores asociadas a orden de mantenimiento.
```

No debe:

```text id="xntbuq"
- cerrar orden;
- cambiar estado;
- crear costos;
- crear pagos.
```

---

### 17.9. `007-audit`

Uso:

```text id="sg4us7"
- auditoría de visitantes;
- auditoría de autorizaciones;
- auditoría de check-in;
- auditoría de check-out;
- auditoría de incidentes;
- auditoría de exportaciones.
```

---

### 17.10. `008-basic-reports`

Uso:

```text id="jlnyg6"
- reportes de accesos;
- reportes de visitantes;
- reportes de incidentes;
- exportaciones.
```

---

## 18. Seguridad

### 18.1. Principios

```text id="m4ywwr"
- Keycloak autentica.
- RESIDENT Core autoriza.
- Tenant isolation obligatorio.
- Datos personales minimizados.
- Identificación y placas enmascaradas.
- No public endpoints.
- WordPress público sin acceso.
- Audit obligatorio.
- No biometría en MVP.
- No reconocimiento facial en MVP.
```

---

### 18.2. Campos prohibidos en DTOs externos

```text id="vf5kcv"
tenantId
createdBy
updatedBy
authorizedBy
checkedInBy
checkedOutBy
recordedBy
cancelledBy
revokedBy
archivedBy
status directo fuera de transición
identificationNumberRaw
plateRaw en responses generales
fullDocumentImage
storageKey
signedUrl
base64
rawFilePayload
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
paymentId
journalEntryId
bankTransactionId
externalAiEnabled
```

---

### 18.3. Datos que deben enmascararse

```text id="gf9k36"
identificationNumber
phone
email opcional
vehiclePlate
accessPassCode
```

---

### 18.4. Prohibiciones explícitas

```text id="tkdg6q"
- No recognition facial.
- No biometría.
- No gate opening.
- No hardware control.
- No camera stream.
- No public visitor lookup.
- No WordPress access.
- No external AI with real data.
- No global watchlist.
- No cross-tenant sharing.
```

---

## 19. Auditoría

Eventos mínimos:

```text id="zwk0mw"
accessVisitor.created
accessVisitor.updated
accessVisitor.watchlisted
accessVisitor.blocked
accessVisitor.archived

accessVehicle.created
accessVehicle.updated
accessVehicle.blocked
accessVehicle.archived

accessGate.created
accessGate.updated
accessGate.archived

accessAuthorization.created
accessAuthorization.activated
accessAuthorization.cancelled
accessAuthorization.revoked
accessAuthorization.expired
accessAuthorization.used

accessPass.created
accessPass.used
accessPass.expired
accessPass.revoked

accessCheckIn.recorded
accessCheckIn.voided
accessCheckOut.recorded
accessCheckOut.voided

accessEvent.recorded
accessEvent.corrected
accessEvent.voided

accessDelivery.created
accessDelivery.received
accessDelivery.delivered
accessDelivery.returned

accessSupplierVisit.created
accessSupplierVisit.checkedIn
accessSupplierVisit.checkedOut
accessSupplierVisit.cancelled
accessSupplierVisit.denied

accessIncident.created
accessIncident.updated
accessIncident.resolved
accessIncident.dismissed

accessReport.generated
accessReport.exported
```

Metadata permitida:

```text id="as7laf"
visitorId
vehicleId
authorizationId
accessPassId
eventId
checkInId
checkOutId
propertyUnitId
gateId
visitorType
authorizationType
eventType
eventStatus
incidentSeverity
incidentStatus
supplierId
maintenanceWorkOrderId
reportType
format
traceId
```

Metadata prohibida:

```text id="dl5jf6"
identificationNumberRaw
plateRaw
accessPassCodeRaw
storageKey
signedUrl
base64
biometricTemplate
faceEmbedding
cameraStreamUrl
tokens
secrets
passwords
raw file payload
datos cross-tenant
```

---

## 20. Observabilidad

### 20.1. Logs

Eventos loggeables:

```text id="s3dybk"
accessAuthorization.created
accessAuthorization.cancelled
accessCheckIn.recorded
accessCheckOut.recorded
accessDenied.recorded
accessIncident.created
accessReport.exported
```

Campos permitidos:

```text id="gn8cjx"
traceId
requestId
correlationId
action
outcome
eventType
authorizationType
visitorType
gateType
incidentSeverity
reportType
durationMs
errorCode
```

Campos prohibidos:

```text id="zjvcat"
tenantId como label
visitorId como label de métrica
identificationNumberRaw
plateRaw
accessPassCodeRaw
storageKey
signedUrl
base64
faceEmbedding
biometricTemplate
raw payload
```

---

### 20.2. Métricas

```text id="s417tz"
access_authorizations_total
access_authorizations_active_total
access_checkins_total
access_checkouts_total
access_denied_total
access_open_checkins_total
access_incidents_total
access_reports_exported_total
```

Labels permitidos:

```text id="ki1u8x"
eventType
authorizationType
visitorType
gateType
incidentSeverity
status
outcome
reportType
```

Labels prohibidos:

```text id="qb4mgq"
tenantId
visitorId
vehicleId
propertyUnitId
personId
identificationNumber
plate
traceId
```

---

## 21. Reportes MVP

### 21.1. Reporte de ingresos y salidas

Filtros:

```text id="amsych"
dateFrom
dateTo
gateId
propertyUnitId
visitorType
eventType
status
```

Incluye:

```text id="pco7nv"
- visitante enmascarado;
- unidad;
- gate;
- hora de ingreso;
- hora de salida;
- estado;
- guardia opcional según permiso.
```

---

### 21.2. Reporte de visitantes por unidad

Filtros:

```text id="l9a64j"
dateFrom
dateTo
propertyUnitId
visitorType
```

---

### 21.3. Reporte de autorizaciones

Filtros:

```text id="mydzkr"
dateFrom
dateTo
authorizationType
status
authorizedBy
propertyUnitId
```

---

### 21.4. Reporte de incidentes

Filtros:

```text id="hld0hq"
dateFrom
dateTo
severity
status
gateId
propertyUnitId
```

---

### 21.5. Reporte de accesos abiertos

Objetivo:

```text id="x3rfks"
Identificar check-ins sin check-out registrado.
```

---

### 21.6. Exportaciones

Formatos MVP:

```text id="tfkce6"
csv
xlsx si export engine existe
pdf si export engine existe
```

Regla:

```text id="npi8nl"
Toda exportación debe almacenarse mediante Secure Document Storage.
```

---

## 22. OpenAPI

Tags:

```text id="jvrcq5"
Access Visitors
Access Visitor Vehicles
Access Gates
Access Authorizations
Access Passes
Access Events
Access Check Ins
Access Check Outs
Access Deliveries
Access Supplier Visits
Access Incidents
Access Reports
```

Extensiones obligatorias:

```yaml id="r5m6e8"
x-tenant-scope: true
x-auth-required: true
x-access-control-visitors: true
x-public-exposure: false
x-wordpress-access: false
x-biometric-processing: false
x-face-recognition: false
x-gate-opening: false
x-external-ai-real-data: false
```

Para `/me`:

```yaml id="kcqnec"
x-own-resource-scope: true
x-resident-visible: true
x-admin-only: false
```

Para guard API:

```yaml id="bhyz9v"
x-guard-operated: true
x-public-exposure: false
```

---

## 23. Riesgos

| Riesgo                                       | Mitigación                                              |
| -------------------------------------------- | ------------------------------------------------------- |
| Exposición de datos personales de visitantes | Enmascaramiento, minimización, permisos, no public      |
| Acceso cross-tenant                          | tenantId obligatorio, tests, 404                        |
| Residente ve visitantes de otra unidad       | own-scope por UserProfile → Person → Unit               |
| Guardia modifica historial                   | eventos inmutables, void/correct auditado               |
| Uso indebido de listas negras                | listas locales por tenant, auditoría, razón obligatoria |
| Registro falso de ingreso/salida             | actor server-side, audit, timestamps server-side        |
| Reutilización de pase temporal               | status used/expired/revoked                             |
| Portón abierto indebidamente                 | no gate opening en MVP                                  |
| Biometría no autorizada                      | prohibición explícita                                   |
| Reporte masivo con datos sensibles           | permisos, enmascaramiento, SDS, audit                   |
| WordPress accede a datos privados            | no public endpoints, CORS restrictivo                   |

---

## 24. Criterios de aceptación funcional

```text id="nvr5g7"
[ ] TenantAdmin puede crear AccessGate.
[ ] TenantAdmin puede crear VisitorProfile.
[ ] Resident puede crear autorización para unidad propia.
[ ] Resident no puede crear autorización para unidad ajena.
[ ] Guard puede consultar autorizaciones activas.
[ ] Guard puede registrar check-in.
[ ] Guard puede registrar check-out.
[ ] Check-in crea AccessEvent.
[ ] Check-out cierra check-in abierto.
[ ] Autorización expirada no permite ingreso.
[ ] Autorización cancelada no permite ingreso.
[ ] AccessPass oneTime no se reutiliza.
[ ] Vehículo visitante puede registrarse con placa enmascarada.
[ ] Incidente puede registrarse y resolverse.
[ ] Reportes funcionan tenant-scoped.
[ ] Exportaciones generan secureDocumentId.
[ ] No se expone storageKey.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] No hay reconocimiento facial.
[ ] No hay biometría.
[ ] No hay apertura automática de portones.
```

---

## 25. Criterios de aceptación de seguridad

```text id="zissdf"
[ ] Todas las entidades tienen tenantId.
[ ] Todas las consultas usan tenantId.
[ ] Cross-tenant responde 404.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan status directo fuera de transición.
[ ] DTOs rechazan identificationNumberRaw en responses generales.
[ ] DTOs rechazan storageKey.
[ ] DTOs rechazan base64.
[ ] Datos de identificación se enmascaran.
[ ] Placas se enmascaran.
[ ] Resident solo ve datos propios.
[ ] Guard solo opera endpoints permitidos.
[ ] PlatformAdmin no accede automáticamente.
[ ] Audit no contiene datos sensibles completos.
[ ] Logs no contienen datos sensibles completos.
[ ] OpenAPI no documenta campos prohibidos.
```

---

## 26. No aceptación

No se acepta el módulo si:

```text id="b5j8wc"
- permite visitantes cross-tenant;
- permite vehículos cross-tenant;
- permite autorizaciones cross-tenant;
- permite eventos cross-tenant;
- permite check-ins cross-tenant;
- permite check-outs cross-tenant;
- permite incidentes cross-tenant;
- permite reportes cross-tenant;
- permite tenantId desde cliente;
- permite actor fields desde cliente;
- permite status directo sin endpoint de transición;
- expone identificación completa por defecto;
- expone placa completa por defecto;
- almacena o expone storageKey;
- acepta base64;
- registra biometría;
- registra faceEmbedding;
- implementa reconocimiento facial;
- envía datos reales a IA externa;
- abre portones automáticamente;
- crea endpoints públicos de visitantes o accesos;
- permite acceso desde WordPress público;
- permite que residente vea visitantes de otra unidad;
- permite reutilizar AccessPass oneTime;
- permite check-out doble activo;
- permite borrar físicamente eventos críticos;
- omite auditoría de check-in/check-out;
- omite auditoría de cancelación/revocación;
- exporta reportes sin SDS.
```

---

## 27. Decisiones MVP

```text id="fg4l8z"
1. Access Control and Visitors será módulo operativo tenant-scoped.
2. El módulo tendrá API tenant administrativa.
3. El módulo tendrá API /me limitada para residentes.
4. El módulo tendrá Guard API autenticada bajo /tenant/guard.
5. No habrá API pública.
6. No habrá acceso desde WordPress público.
7. No habrá apertura automática de puertas.
8. No habrá biometría.
9. No habrá reconocimiento facial.
10. No habrá OCR automático de placas.
11. Los eventos críticos serán auditados.
12. Los datos personales se enmascararán por defecto.
13. Los reportes exportados usarán Secure Document Storage.
```

---

## 28. Resultado esperado

Al finalizar el módulo `024-access-control-visitors`, RESIDENT Core contará con una base segura y auditable para controlar visitantes, autorizaciones, ingresos, salidas, entregas, proveedores visitantes, incidentes y reportes de acceso por conjunto residencial.

Resultado esperado:

```text id="d0mcai"
VisitorProfile definido
VisitorVehicle definido
AccessGate definido
AccessAuthorization definido
AccessPass definido
AccessEvent definido
AccessCheckIn definido
AccessCheckOut definido
VisitorDelivery definido
VisitorSupplierVisit definido
VisitorRecurringAuthorization definido
AccessIncident definido
AccessComment definido
AccessDocument definido
AccessReportExport definido
tenant isolation definido
resident own access definido
guard operations definidas
visitor preauthorization definida
check-in definido
check-out definido
delivery tracking definido
supplier visit tracking definido
incident tracking definido
reports definidos
exports definidos
audit definido
observability definida
privacy masking definido
no public endpoints
no WordPress access
no biometric processing
no face recognition
no gate opening
no external AI with real data
```

---

## 29. Expediente actualizado

```text id="ybsy7k"
resident-core/
├── docs/
│   ├── specs/
│   │   ├── 001-tenants/
│   │   ├── 002-users-roles/
│   │   ├── 003-residents-properties/
│   │   ├── 004-dues-fees/
│   │   ├── 005-payments/
│   │   ├── 006-account-statements/
│   │   ├── 007-audit/
│   │   ├── 008-basic-reports/
│   │   ├── 009-wordpress-integration-basic/
│   │   ├── 010-reservations-common-areas/
│   │   ├── 011-fines-sanctions/
│   │   ├── 012-communications-notifications/
│   │   ├── 013-meetings-attendance/
│   │   ├── 014-voting-basic/
│   │   ├── 015-certified-minutes/
│   │   ├── 016-secure-document-storage/
│   │   ├── 017-bank-reconciliation/
│   │   ├── 018-payment-provider-integration/
│   │   ├── 019-open-banking-integration/
│   │   ├── 020-accounting-ledger/
│   │   ├── 021-supplier-payments/
│   │   ├── 022-maintenance-work-orders/
│   │   ├── 023-inventory-basic/
│   │   └── 024-access-control-visitors/
│   │       └── spec.md
```
