# Security Notes — Spec 015 Certified Minutes

## 1. Información del documento

| Campo           | Valor                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                                                |
| Spec ID         | 015                                                                                                                                                          |
| Módulo          | Certified Minutes                                                                                                                                            |
| Documento       | Security Notes                                                                                                                                               |
| Ruta            | `docs/specs/015-certified-minutes/security-notes.md`                                                                                                         |
| Versión         | 0.1                                                                                                                                                          |
| Estado          | Borrador inicial                                                                                                                                             |
| Fecha           | 2026-07-21                                                                                                                                                   |
| Documento base  | `docs/specs/015-certified-minutes/spec.md`                                                                                                                   |
| Plan técnico    | `docs/specs/015-certified-minutes/plan.md`                                                                                                                   |
| Modelo de datos | `docs/specs/015-certified-minutes/data-model.md`                                                                                                             |
| Contrato API    | `docs/specs/015-certified-minutes/api-contract.md`                                                                                                           |
| Plan de pruebas | `docs/specs/015-certified-minutes/test-plan.md`                                                                                                              |
| Tareas          | `docs/specs/015-certified-minutes/tasks.md`                                                                                                                  |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance`, `014-voting-basic` |
| Relacionado con | storage seguro, PDF, hash, canonicalización, publicaciones, audiencia, descargas, auditoría, firmas electrónicas futuras, sellado externo futuro             |

---

## 2. Propósito

Este documento define las notas de seguridad para el módulo `015-certified-minutes`.

El módulo gestiona actas formales internas vinculadas a reuniones o asambleas. Por su naturaleza, puede contener información sensible sobre asistentes, propietarios, residentes, unidades habitacionales, quórum, resoluciones, votaciones, decisiones administrativas, temas financieros, temas sancionatorios, temas de seguridad y adjuntos documentales.

Regla central:

```text id="q36n5t"
Toda acta certificada, versión, sección, aprobación, adjunto, artefacto, publicación y descarga debe proteger tenant isolation, autorización por permiso, autorización por audiencia, inmutabilidad documental, integridad por hash, storage seguro, auditoría completa, minimización de datos y ausencia total de exposición pública en MVP.
```

---

## 3. Resumen ejecutivo de seguridad

`Certified Minutes` es un módulo documental sensible.

Riesgos principales:

```text id="o7cfom"
- acceso cross-tenant a actas;
- uso de reuniones de otro tenant;
- edición de versiones selladas;
- alteración posterior al sellado;
- publicación a audiencia incorrecta;
- descarga no autorizada de PDFs;
- exposición de storageKey;
- exposición pública accidental;
- logs con contenido completo del acta;
- auditoría con contenido sensible;
- adjuntos maliciosos;
- PDF generado desde contenido no aprobado;
- presentar hash interno como firma electrónica legal;
- ejecución automática indebida de resoluciones, cargos o multas.
```

Controles obligatorios:

```text id="nodcwm"
- tenant_id en todas las entidades;
- consultas siempre filtradas por tenant_id;
- no tenantId desde body;
- autorización por permisos;
- autorización por audiencia;
- autorización por recurso propio;
- state machine estricta;
- versiones selladas inmutables;
- hash SHA-256 reproducible;
- storageKey interno no expuesto;
- descargas por endpoint autorizado;
- no endpoints públicos;
- auditoría sanitizada;
- logs seguros;
- payload mínimo en notificaciones;
- pruebas negativas obligatorias;
- OpenAPI sin rutas públicas.
```

---

## 4. Alcance de seguridad

### 4.1. Incluido

Estas notas cubren:

```text id="p8gl2d"
1. Autenticación.
2. Autorización.
3. Tenant isolation.
4. Validación de referencias cross-tenant.
5. Seguridad de reuniones vinculadas.
6. Seguridad de actas preliminares fuente.
7. Seguridad de versiones.
8. Inmutabilidad de versiones selladas.
9. Seguridad de secciones.
10. Sanitización de contenido.
11. Seguridad de aprobaciones.
12. Sellado interno mediante hash.
13. Canonicalización.
14. Seguridad de PDFs.
15. Seguridad de adjuntos.
16. Seguridad de storage.
17. Seguridad de descargas.
18. Seguridad de publicaciones.
19. Autorización por audiencia.
20. Seguridad de endpoints `/me`.
21. Auditoría.
22. Logs.
23. Métricas.
24. Notificaciones.
25. Errores seguros.
26. Rate limiting.
27. OpenAPI.
28. Pruebas de seguridad.
29. CI/CD gates.
30. No ejecución automática.
31. Prohibición de IA externa con actas reales.
```

---

### 4.2. Fuera de alcance del MVP

No se cubre como funcionalidad implementada en este módulo:

```text id="jrvswl"
- firma electrónica legalmente válida;
- firma electrónica avanzada;
- firma electrónica cualificada;
- proveedor externo de firma;
- sellado de tiempo certificado por tercero;
- certificación notarial;
- blockchain;
- verificación pública externa;
- QR de verificación pública;
- validación jurídica automática;
- workflow legal de impugnaciones;
- OCR de actas físicas;
- validación automática de firmas manuscritas;
- firma biométrica;
- transcripción automática;
- reconocimiento de voz;
- videograbación;
- IA con actas reales.
```

---

## 5. Aclaración crítica sobre “certificación”

En MVP, “acta certificada” significa:

```text id="u9jssw"
acta formalizada internamente por RESIDENT Core,
con control de versión,
aprobación administrativa,
hash de integridad,
registro de publicación,
auditoría,
y evidencia técnica interna de no alteración posterior.
```

No significa:

```text id="jb4nfg"
firma electrónica legal
certificación notarial
sellado de tiempo externo
documento legalmente certificado por tercero
validez probatoria garantizada
verificación pública universal
documento autoejecutable
resolución legal automáticamente ejecutada
```

Regla obligatoria:

```text id="mdcict"
La API, los DTOs, la UI, el PDF, la documentación y los mensajes del sistema no deben presentar el hash interno como firma electrónica legal ni como certificación externa.
```

---

## 6. Activos protegidos

### 6.1. Actas

```text id="vyx2ug"
certified_minutes
certified_minutes_versions
certified_minutes_sections
```

Protegen:

* contenido formal del acta;
* historia de versiones;
* secciones del acta;
* snapshots de asistencia;
* snapshots de quórum;
* resoluciones;
* referencias a votaciones;
* decisiones internas.

---

### 6.2. Aprobaciones

```text id="zc371o"
certified_minutes_approvals
```

Protegen:

* identidad del aprobador;
* rol del aprobador;
* decisión;
* comentarios;
* fecha de aprobación;
* trazabilidad del flujo.

---

### 6.3. Adjuntos

```text id="a41cmc"
certified_minutes_attachments
```

Protegen:

* hojas de asistencia;
* reportes de votación;
* documentos de soporte;
* imágenes;
* PDFs;
* documentos Word;
* hojas de cálculo;
* evidencia documental interna.

---

### 6.4. Artefactos

```text id="ijq76k"
certified_minutes_artifacts
```

Protegen:

* PDF oficial interno;
* PDF borrador;
* snapshots HTML;
* snapshots JSON;
* manifiestos de hash;
* metadatos de generación.

---

### 6.5. Publicaciones

```text id="la1f6c"
certified_minutes_publications
```

Protegen:

* audiencia;
* reglas de acceso;
* estado de publicación;
* expiración;
* revocación;
* vínculo con artefacto publicado.

---

### 6.6. Access logs

```text id="h3wpl8"
certified_minutes_access_logs
```

Protegen:

* acceso a actas;
* descargas;
* intentos denegados;
* trazabilidad documental;
* hash de IP si aplica;
* hash de user agent si aplica.

---

### 6.7. Storage interno

Protege:

```text id="g2cuwg"
storageKey
bucket
path interno
archivos binarios
PDFs
adjuntos
hashes completos
metadata técnica
credenciales
URLs temporales
```

---

## 7. Clasificación de datos

### 7.1. Datos altamente sensibles

```text id="s9kxzl"
contenido completo del acta
contenido completo de secciones
adjuntos
PDF oficial
PDF borrador
resultados detallados de votación si exponen datos sensibles
comentarios de aprobación
razones de rechazo
razones de cambios solicitados
storageKey
URLs firmadas
hash completo si la política lo restringe
```

---

### 7.2. Datos personales

```text id="wjgpo4"
nombres de propietarios
nombres de residentes
nombres de asistentes
nombres de representantes
usuarios aprobadores
usuarios publicadores
personas vinculadas a unidades
unidades habitacionales
roles de usuarios
posible información de contacto si aparece dentro del contenido del acta
```

---

### 7.3. Datos internos no públicos

```text id="ze0b14"
meetingId
sourceMeetingMinutesId
versionId
sectionId
approvalId
attachmentId
artifactId
publicationId
audit event ids
traceId
correlationId
audienceRules
metadata interna
```

---

### 7.4. Datos permitidos en respuestas públicas

En MVP no hay respuestas públicas para este módulo.

Regla:

```text id="s4tutg"
Certified Minutes no debe exponer datos bajo /api/v1/public.
```

---

### 7.5. Datos permitidos en respuestas `/me`

Solo datos publicados y autorizados:

```text id="igbxsl"
id
meetingId
title
code
status = published
visibility
publishedAt
sealAlgorithm
sealHashPrefix
sections publicadas autorizadas
artifactAvailable
artifact metadata segura
download endpoint controlado
```

No permitido en `/me`:

```text id="gfk3iu"
actas no publicadas
auditoría
aprobaciones internas
storageKey
URLs firmadas persistentes
audienceRules completas si revelan terceros
contenido restringido
metadata interna sensible
```

---

## 8. Fronteras de confianza

### 8.1. Frontera cliente/API

Riesgo:

```text id="x26mhy"
El cliente puede enviar IDs de otro tenant, campos del sistema, tenantId falso, contenido malicioso, archivos peligrosos o requests para publicar/descargar recursos ajenos.
```

Controles:

```text id="ps377p"
- no aceptar tenantId desde body;
- validar todos los IDs contra tenant activo;
- validar permisos;
- validar audiencia;
- sanitizar contenido;
- validar archivos;
- aplicar DTO whitelist;
- rechazar mass assignment;
- auditar acciones críticas.
```

---

### 8.2. Frontera API/Base de datos

Riesgo:

```text id="ku26qz"
Consultas sin tenant_id pueden exponer actas o artefactos de otro conjunto residencial.
```

Controles:

```text id="j2qut0"
- tenant_id en todas las tablas;
- repositorios tenant-scoped;
- prohibido findUnique por id simple;
- índices compuestos tenant_id + id;
- tests multitenant obligatorios;
- code review con checklist de tenant isolation.
```

---

### 8.3. Frontera API/Storage

Riesgo:

```text id="kl3kr4"
Storage puede exponer archivos si se filtran storageKey, bucket, URL persistente o credenciales.
```

Controles:

```text id="la96je"
- storageKey nunca se expone al cliente;
- descargas pasan por API autorizada;
- URLs temporales con TTL corto si se usan;
- no persistir URLs temporales;
- validar tenant antes de descargar;
- auditar descarga;
- sanitizar filename.
```

---

### 8.4. Frontera API/PDF generator

Riesgo:

```text id="jw4em3"
El generador PDF puede incorporar contenido malicioso, datos no autorizados, HTML inseguro o metadatos sensibles.
```

Controles:

```text id="cpketf"
- sanitización previa de HTML;
- templates controlados;
- no ejecutar JavaScript;
- no cargar recursos remotos no confiables;
- no incluir storageKey;
- no incluir tokens;
- no incluir datos restringidos;
- marcar borradores como BORRADOR;
- calcular artifactHash.
```

---

### 8.5. Frontera API/Notificaciones

Riesgo:

```text id="g8zayv"
Las notificaciones pueden filtrar contenido completo del acta o enlaces sensibles.
```

Controles:

```text id="ox97qd"
- payload mínimo;
- no contenido completo;
- no secciones completas;
- no adjuntos;
- no storageKey;
- no URL firmada;
- actionUrl interno;
- audiencia mínima.
```

---

### 8.6. Frontera API/Auditoría

Riesgo:

```text id="mx9ips"
La auditoría puede convertirse en canal de fuga si guarda contenido completo o metadatos sensibles.
```

Controles:

```text id="bb7rsn"
- metadata sanitizada;
- solo IDs internos necesarios;
- hash prefix, no hash completo si política lo restringe;
- no acta completa;
- no adjuntos;
- no storageKey;
- no URL firmada;
- no tokens;
- no headers sensibles.
```

---

## 9. Threat model resumido

### 9.1. Spoofing

Amenazas:

```text id="v4dymn"
- usuario intenta actuar como aprobador;
- usuario intenta publicar como administrador;
- usuario intenta descargar como propietario/residente sin serlo;
- token robado;
- actor intenta manipular approverUserId o publishedBy desde body.
```

Controles:

```text id="v4l0qh"
- Keycloak/OIDC;
- validación de membership activa;
- permisos en Core;
- actor derivado del token;
- no aceptar approverUserId desde body;
- no aceptar publishedBy desde body;
- no aceptar sealedBy desde body;
- auditoría con actor real.
```

---

### 9.2. Tampering

Amenazas:

```text id="kg6bi4"
- modificar versión sellada;
- alterar PDF posterior a generación;
- editar secciones después de aprobación;
- cambiar audiencia después de publicación;
- modificar storageKey;
- manipular contentSnapshot.
```

Controles:

```text id="xcngrp"
- state machine;
- versión sealed inmutable;
- contentHash;
- sealHash;
- artifactHash;
- repository policies;
- checks de estado;
- auditoría;
- constraints;
- tests de integridad.
```

---

### 9.3. Repudiation

Amenazas:

```text id="bd81ts"
- aprobador niega aprobación;
- publicador niega publicación;
- usuario niega descarga;
- administrador niega revocación;
- editor niega modificación.
```

Controles:

```text id="v3qcbt"
- auditoría obligatoria;
- access logs;
- timestamps UTC;
- actorUserId desde token;
- traceId/correlationId;
- IP/userAgent hash si política lo permite;
- no delete físico ordinario.
```

Nota:

```text id="ztfabn"
El MVP no provee no repudio legal equivalente a firma electrónica avanzada o cualificada.
```

---

### 9.4. Information Disclosure

Amenazas:

```text id="uxqevt"
- acta de tenant B visible para tenant A;
- acta no publicada visible en /me;
- PDF descargado por audiencia ajena;
- storageKey expuesto;
- URL firmada filtrada;
- logs con contenido completo;
- OpenAPI documenta endpoint público accidental.
```

Controles:

```text id="o78hvj"
- tenant_id obligatorio;
- audience guard;
- own-resource guard;
- DTO minimizado;
- no public endpoints;
- no storageKey;
- Cache-Control: no-store;
- safe logs;
- safe audit;
- OpenAPI negative tests.
```

---

### 9.5. Denial of Service

Amenazas:

```text id="kzc05m"
- subida de archivos demasiado grandes;
- generación masiva de PDFs;
- descarga masiva de artefactos;
- consultas sin paginación;
- actas con contenido excesivo;
- adjuntos maliciosos pesados.
```

Controles:

```text id="iqhd9v"
- límite de tamaño de archivo;
- pageSize máximo 100;
- rate limiting;
- límites de longitud de contenido;
- PDF generation limits;
- timeouts;
- streaming de descargas;
- no carga de binarios en JSON;
- cuotas futuras por tenant.
```

---

### 9.6. Elevation of Privilege

Amenazas:

```text id="xsdpdy"
- usuario sin permiso aprueba;
- usuario sin rol descarga;
- residente ve actas solo para propietarios;
- PlatformAdmin accede automáticamente a actas internas;
- usuario cambia audienceRules para incluirse.
```

Controles:

```text id="j94lra"
- permisos por acción;
- autorización por audiencia;
- validación de roles del tenant;
- no acceso automático PlatformAdmin;
- state policies;
- audienceRules validadas contra tenant;
- audit de cambios de publicación.
```

---

## 10. Reglas de autenticación

Todos los endpoints requieren:

```text id="y05nn1"
Authorization: Bearer <access_token>
```

Reglas:

```text id="ucdwgr"
- no hay endpoints anónimos;
- no hay endpoints públicos;
- token debe ser válido;
- usuario debe estar activo;
- membership del tenant debe estar activa;
- tenant activo debe resolverse desde contexto autenticado;
- Keycloak autentica;
- RESIDENT Core autoriza.
```

Errores esperados:

```text id="fk90vg"
401 si no hay token;
401 si token es inválido;
403 si usuario está deshabilitado;
403 si no tiene membership activa;
403 si no tiene permiso requerido;
403/404 si intenta acceder a recurso de otro tenant.
```

---

## 11. Reglas de autorización

### 11.1. Permisos administrativos

```text id="znvi34"
certifiedMinutes.create
certifiedMinutes.read
certifiedMinutes.update
certifiedMinutes.submitReview
certifiedMinutes.approve
certifiedMinutes.reject
certifiedMinutes.requestChanges
certifiedMinutes.seal
certifiedMinutes.publish
certifiedMinutes.revokePublication
certifiedMinutes.archive
```

---

### 11.2. Permisos de versiones

```text id="z66r4v"
certifiedMinutesVersions.create
certifiedMinutesVersions.read
certifiedMinutesVersions.compare
certifiedMinutesVersions.archive
```

---

### 11.3. Permisos de secciones

```text id="gj06k5"
certifiedMinutesSections.create
certifiedMinutesSections.read
certifiedMinutesSections.update
certifiedMinutesSections.reorder
certifiedMinutesSections.archive
```

---

### 11.4. Permisos de aprobaciones

```text id="kvd5gy"
certifiedMinutesApprovals.create
certifiedMinutesApprovals.read
```

---

### 11.5. Permisos de adjuntos

```text id="gazxn4"
certifiedMinutesAttachments.create
certifiedMinutesAttachments.read
certifiedMinutesAttachments.download
certifiedMinutesAttachments.archive
```

---

### 11.6. Permisos de artefactos

```text id="eb0qey"
certifiedMinutesArtifacts.generate
certifiedMinutesArtifacts.read
certifiedMinutesArtifacts.download
certifiedMinutesArtifacts.archive
```

---

### 11.7. Permisos de publicaciones

```text id="gpdjts"
certifiedMinutesPublications.read
certifiedMinutesPublications.revoke
certifiedMinutesPublications.archive
```

---

### 11.8. Permisos propios

```text id="u0x0hd"
certifiedMinutes.read.own
certifiedMinutesArtifacts.download.own
```

---

### 11.9. Auditoría

```text id="dqhwd1"
certifiedMinutes.audit.read
```

---

### 11.10. Regla PlatformAdmin

PlatformAdmin no accede automáticamente a actas internas de tenants.

Regla:

```text id="muxbga"
PlatformAdmin requiere permiso explícito, contexto de soporte, justificación y auditoría reforzada para acceder a actas internas.
```

---

## 12. Tenant isolation

### 12.1. Regla obligatoria

Todas las entidades nuevas deben tener:

```text id="y2ws04"
tenant_id
```

Entidades:

```text id="ps3m3j"
certified_minutes
certified_minutes_versions
certified_minutes_sections
certified_minutes_approvals
certified_minutes_attachments
certified_minutes_artifacts
certified_minutes_publications
certified_minutes_access_logs
```

---

### 12.2. Patrón requerido

```typescript id="gyj7om"
await prisma.certifiedMinutes.findFirst({
  where: {
    id: certifiedMinutesId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 12.3. Patrón prohibido

```typescript id="gox7ej"
await prisma.certifiedMinutes.findUnique({
  where: { id: certifiedMinutesId }
});
```

También está prohibido:

```typescript id="fm8wi2"
await prisma.certifiedMinutesVersion.findUnique({ where: { id: versionId } });
await prisma.certifiedMinutesSection.findUnique({ where: { id: sectionId } });
await prisma.certifiedMinutesAttachment.findUnique({ where: { id: attachmentId } });
await prisma.certifiedMinutesArtifact.findUnique({ where: { id: artifactId } });
await prisma.certifiedMinutesPublication.findUnique({ where: { id: publicationId } });
```

---

### 12.4. Referencias que deben validarse contra tenant

```text id="o4k9mg"
meetingId
sourceMeetingMinutesId
certifiedMinutesId
versionId
sectionId
approvalId
attachmentId
artifactId
publicationId
votingSessionId
votingResultId
votingTallyId
meetingResolutionId
userIds en audienceRules
propertyUnitIds en audienceRules
roleIds en audienceRules
personIds en audienceRules si se agregan
```

---

### 12.5. Respuesta ante recurso cross-tenant

Usar una de estas estrategias de forma consistente:

```text id="btiyn6"
404 para no revelar existencia del recurso;
403 cuando la política interna requiera evidenciar forbidden.
```

Recomendación:

```text id="aeyltj"
Para recursos tenant-scoped de otro tenant, preferir 404 en APIs externas para reducir enumeración.
```

---

## 13. Seguridad de reuniones vinculadas

Toda acta certificada debe tener `meetingId`.

Reglas:

```text id="bvnv5f"
- meetingId es obligatorio;
- meetingId debe pertenecer al tenant activo;
- meetingId no debe venir de otro tenant;
- meeting cancelada puede tener restricciones según política;
- meeting archived no debería permitir nueva acta salvo excepción administrativa;
- certified minutes no modifica meeting;
- certified minutes no modifica attendance;
- certified minutes no modifica quorum;
- certified minutes no modifica resolutions.
```

Validación mínima:

```typescript id="uxozdz"
const meeting = await meetingPort.findByIdForTenant({
  tenantId: currentTenant.id,
  meetingId
});

if (!meeting) {
  throw new NotFoundOrForbiddenError();
}
```

---

## 14. Seguridad de `sourceMeetingMinutesId`

Si se importa desde acta preliminar:

```text id="m6lm4n"
sourceMeetingMinutesId debe pertenecer al tenant activo.
sourceMeetingMinutesId debe pertenecer a la misma meetingId.
sourceMeetingMinutesId no debe modificar la fuente.
sourceMeetingMinutesId no debe permitir importar contenido de otro tenant.
```

Regla:

```text id="rajk15"
sourceMeetingMinutes.tenantId == currentTenant.id
AND sourceMeetingMinutes.meetingId == certifiedMinutes.meetingId
```

---

## 15. Seguridad del versionado

### 15.1. Reglas

```text id="lfoim8"
- toda versión pertenece a tenant_id;
- toda versión pertenece a certifiedMinutesId del mismo tenant;
- versionNumber es incremental;
- no se sobrescribe versión previa;
- versión sealed es inmutable;
- versión published no se edita directamente;
- corrección posterior requiere nueva versión;
- copia desde versión previa debe validar tenant y acta.
```

---

### 15.2. Estados editables

```text id="rrzcrn"
CertifiedMinutes.status IN draft, changesRequested
AND CertifiedMinutesVersion.status = draft
```

---

### 15.3. Estados no editables

```text id="du5e1u"
approved
sealed
published
superseded
cancelled
archived
```

---

### 15.4. Prohibiciones

```text id="w2dv9f"
- editar versión sealed;
- editar sección de versión sealed;
- reordenar sección de versión sealed;
- crear sección sobre versión sealed;
- reemplazar contentSnapshot sealed;
- recalcular sealHash de una versión ya sellada sin flujo explícito;
- eliminar físicamente versiones.
```

---

## 16. Seguridad del sellado interno

### 16.1. Algoritmo MVP

```text id="mzj568"
SHA-256
```

---

### 16.2. Canonicalización obligatoria

Antes de calcular hash:

```text id="w4ot1n"
- ordenar claves JSON;
- ordenar secciones por order;
- normalizar saltos de línea;
- normalizar espacios no materiales;
- normalizar fechas a ISO 8601 UTC;
- normalizar nulls;
- codificar en UTF-8;
- excluir metadata sensible;
- usar representación determinística.
```

---

### 16.3. Hashes

```text id="nye74f"
contentHash = SHA-256(canonicalized contentSnapshot)
sealHash = SHA-256(canonicalized version content + approval metadata + meeting reference + versionNumber)
artifactHash = SHA-256(binary artifact)
```

---

### 16.4. Exposición de hashes

Permitido por DTO estándar:

```text id="xwz114"
contentHashPrefix
sealHashPrefix
artifactHashPrefix
hashAlgorithm
legalSignature = false
```

No recomendado por DTO estándar:

```text id="tiwlrx"
contentHash completo
sealHash completo
artifactHash completo
```

Los hashes completos pueden exponerse solo si existe permiso explícito y decisión de producto documentada.

---

### 16.5. Advertencia legal

Toda respuesta de sellado debe dejar claro:

```json id="s4gwlj"
{
  "legalSignature": false
}
```

Regla:

```text id="aax59d"
El sellado interno no reemplaza firma electrónica legal, sellado de tiempo certificado ni certificación notarial.
```

---

## 17. Seguridad de secciones y contenido

### 17.1. Campos a sanitizar

```text id="t1gvku"
title
summary
section.title
section.body
comments
changeReason
cancellationReason
revocationReason
publication notes
attachment metadata
metadata
```

---

### 17.2. Contenido bloqueado

```text id="b3dh03"
<script>
<iframe>
<object>
<embed>
event handlers inline
javascript:
data URLs peligrosas
HTML no permitido
CSS peligroso
payloads JSON arbitrarios no validados
```

---

### 17.3. Reglas

```text id="z2o2tt"
- no almacenar HTML inseguro;
- no renderizar contenido sin sanitización;
- no ejecutar scripts en PDF generator;
- no permitir contenido remoto no confiable;
- no permitir iframes;
- no permitir objetos embebidos;
- limitar longitud de secciones;
- limitar tamaño de contentSnapshot;
- no guardar datos personales innecesarios.
```

---

## 18. Seguridad de aprobaciones

### 18.1. Actor real

El aprobador se deriva del token y del contexto del usuario.

Prohibido aceptar desde body:

```text id="xg62au"
approverUserId
approverRole
decidedAt
approvedBy
approvedAt
```

---

### 18.2. Comentarios obligatorios

Requieren comentario:

```text id="efaw4r"
decision = rejected
decision = changesRequested
```

---

### 18.3. No firma legal

La aprobación administrativa no es firma electrónica legal.

Regla:

```text id="up5pv5"
CertifiedMinutesApproval no debe usarse ni presentarse como firma electrónica legalmente válida.
```

---

## 19. Seguridad de PDF

### 19.1. PDF oficial

Reglas:

```text id="sc78le"
- PDF oficial solo desde versión approved o sealed;
- recomendado: PDF oficial solo desde versión sealed;
- PDF oficial desde draft está prohibido;
- PDF borrador debe tener watermark BORRADOR;
- PDF debe incluir código, versión, fecha de generación y referencia de hash si aplica;
- PDF no debe incluir storageKey;
- PDF no debe incluir datos no autorizados;
- PDF debe tener artifactHash.
```

---

### 19.2. Seguridad del renderer

El generador PDF debe:

```text id="nxwjld"
- usar templates controlados;
- deshabilitar ejecución de JavaScript;
- bloquear carga de recursos remotos no confiables;
- sanitizar HTML antes de render;
- no leer archivos locales arbitrarios;
- no permitir path traversal;
- no incrustar secretos;
- no incrustar URLs firmadas persistentes;
- ejecutar con timeouts y límites de memoria.
```

---

### 19.3. Error handling

Errores de PDF deben mapearse a:

```text id="va3k7f"
CERTIFIED_MINUTES_PDF_GENERATION_FAILED
```

El error no debe incluir:

```text id="zg5jpn"
HTML completo
contenido completo del acta
storageKey
path interno
stack trace en producción
payload completo
```

---

## 20. Seguridad de adjuntos

### 20.1. MIME types permitidos MVP

```text id="mgzmyv"
application/pdf
image/png
image/jpeg
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

---

### 20.2. Validaciones obligatorias

```text id="ef5vtv"
- tenant activo;
- certifiedMinutesId del tenant;
- versionId del tenant si existe;
- fileName sanitizado;
- MIME type permitido;
- extensión consistente con MIME;
- fileSize > 0;
- fileSize <= máximo configurado;
- hash de archivo;
- storageKey generado por servidor;
- permisos de upload;
- no path traversal;
- no archivos ejecutables;
- no contenido HTML activo no esperado;
- antivirus futuro si la infraestructura lo permite.
```

---

### 20.3. Prohibiciones

```text id="i9b1w5"
- aceptar storageKey desde cliente;
- exponer storageKey;
- exponer URL persistente;
- descargar sin autorización;
- almacenar adjunto sin hash cuando esté disponible;
- eliminar físicamente en operación ordinaria;
- publicar adjuntos automáticamente;
- registrar contenido completo del adjunto en logs;
- registrar contenido completo del adjunto en auditoría.
```

---

### 20.4. Estados seguros

```text id="oguc7w"
uploaded
available
quarantined
rejected
archived
```

Una descarga solo debe permitirse si:

```text id="mkk49n"
status = available
AND archivedAt IS NULL
AND actor autorizado
AND tenant válido
```

---

## 21. Seguridad de storage

### 21.1. `storageKey`

`storageKey` es dato interno sensible.

Prohibido exponer:

```text id="i8u6ck"
storageKey
bucket
path interno
provider metadata sensible
credenciales
URL firmada persistente
```

---

### 21.2. Generación de storageKey

El servidor debe generar `storageKey`.

Ejemplo interno permitido:

```text id="oa8kts"
certified-minutes/{tenantId}/{certifiedMinutesId}/artifacts/{artifactId}.pdf
```

Reglas:

```text id="ii4n6k"
- no usar filename original como path completo;
- sanitizar filename;
- no path traversal;
- no aceptar ruta desde cliente;
- separar tenant en path interno;
- no reutilizar storageKey entre tenants;
- no exponer storageKey en DTO, error, audit o log.
```

---

### 21.3. Descargas

Descarga permitida solo por:

```text id="bne0ke"
endpoint autorizado
streaming seguro
o URL temporal corta generada después de autorización
```

Reglas de URL temporal:

```text id="csqsvp"
- TTL corto;
- no persistir URL;
- no enviar URL por notificaciones persistentes;
- no registrar URL completa en logs;
- no registrar URL completa en auditoría.
```

---

## 22. Seguridad de publicaciones

### 22.1. Publicación permitida solo desde acta sellada

Regla:

```text id="i6kjtj"
CertifiedMinutes.status = sealed
AND CertifiedMinutesVersion.status = sealed
```

No permitir:

```text id="l0np5k"
draft -> published
underReview -> published
changesRequested -> published
approved no sealed -> published
cancelled -> published
archived -> published
```

---

### 22.2. Audiencia obligatoria

Todo publish requiere:

```text id="ukh9zn"
audienceType
```

`audienceRules` requerido para:

```text id="du2qeq"
mixed
restricted
propertyUnits
specificUsers
roles
```

---

### 22.3. Validación de audienceRules

Todos los IDs deben pertenecer al tenant activo:

```text id="kvt3d2"
userIds
propertyUnitIds
roleIds
personIds si se agregan
```

Prohibido:

```text id="w0wf6x"
- audienceRules con usuarios de otro tenant;
- audienceRules con unidades de otro tenant;
- audienceRules con roles de otro tenant;
- audienceRules sin validación;
- audienceRules excesivamente amplias por error;
- audienceRules completas en respuesta /me si revelan terceros.
```

---

### 22.4. Revocación

Reglas:

```text id="uqhtiw"
- revocar requiere razón;
- revocar no elimina acta;
- revocar no elimina versión;
- revocar no elimina artifact;
- revocar no elimina auditoría;
- publicación revoked no visible en /me;
- publicación revoked no descargable;
- debe auditar certifiedMinutes.publicationRevoked.
```

---

### 22.5. Expiración

Si `expiresAt` existe:

```text id="w2hahp"
expiresAt > publishedAt
```

Reglas:

```text id="jcpuex"
- publicación expirada no visible en /me;
- publicación expirada no descargable;
- descarga de publicación expirada devuelve 404/409;
- access log puede registrar outcome = expired.
```

---

## 23. Seguridad de endpoints `/me`

### 23.1. Principio

Los endpoints `/me` no son endpoints administrativos. Deben resolver acceso propio por audiencia publicada.

Regla:

```text id="zvv6mw"
Un usuario solo puede ver actas publicadas para una audiencia a la que pertenece dentro del tenant activo.
```

---

### 23.2. Resolución de actor

La autorización propia debe resolver:

```text id="iecbpq"
actorUserId
actorPersonIds
actorPropertyUnitIds
actorRoleIds
meetingParticipant relation
publication audienceType
publication audienceRules
publication status
publication expiresAt
```

---

### 23.3. Datos no permitidos en `/me`

```text id="oa5jeh"
storageKey
URL persistente
auditoría
aprobaciones internas
comentarios internos
metadata interna sensible
audienceRules completas si revelan terceros
actas no publicadas
versiones no publicadas
secciones restringidas
adjuntos no publicados
```

---

### 23.4. Casos obligatorios

```text id="dcp9n7"
owner ve owners;
resident ve residents;
board ve board;
participant ve meetingParticipants;
specific user ve specificUsers si está incluido;
role user ve roles si tiene rol;
property unit user ve propertyUnits si pertenece;
usuario no incluido no ve acta;
tenant B no ve tenant A;
revoked no visible;
expired no visible;
sealed no published no visible.
```

---

## 24. API security

### 24.1. Headers

Todos los endpoints privados deben responder:

```text id="hfuvov"
Cache-Control: no-store
```

Recomendado:

```text id="zzu76y"
X-Request-Id
X-Correlation-Id
Content-Security-Policy en UI si aplica
```

---

### 24.2. Idempotencia

Recomendado en operaciones sensibles:

```text id="dxarny"
POST /artifacts/generate-pdf
POST /publish
POST /revoke-publication
POST /attachments
```

Header:

```text id="ovcutq"
Idempotency-Key
```

---

### 24.3. Rate limiting

Aplicar rate limit más estricto a:

```text id="azchnq"
subida de adjuntos
generación PDF
descarga de artefactos
descarga de adjuntos
compare versions si consume mucho
```

---

### 24.4. Validación de payload

Aplicar:

```text id="z4sttn"
DTO whitelist
forbidNonWhitelisted
class-validator
limitar tamaños de strings
limitar tamaño JSON de audienceRules
limitar tamaño contentSnapshot
limitar número de secciones
limitar número de adjuntos por acta
```

---

## 25. Error handling seguro

### 25.1. Estructura

```json id="fds5nw"
{
  "error": {
    "code": "CERTIFIED_MINUTES_NOT_FOUND",
    "message": "Certified minutes not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 25.2. Prohibido en errores

```text id="x0zu0a"
stack trace
SQL raw
storageKey
bucket
path interno
URL firmada
contenido completo del acta
contenido completo de secciones
contenido completo de adjuntos
tokens
cookies
Authorization header
provider payload completo
```

---

### 25.3. Recomendación para cross-tenant

Para recursos de otro tenant:

```text id="qr3zye"
404 NOT_FOUND
```

o:

```text id="qhnpsa"
403 FORBIDDEN
```

La recomendación externa es `404` para evitar enumeración.

---

## 26. Auditoría

### 26.1. Eventos obligatorios

```text id="k7l73f"
certifiedMinutes.created
certifiedMinutes.updated
certifiedMinutes.importedFromMeetingMinutes
certifiedMinutes.submittedForReview
certifiedMinutes.approved
certifiedMinutes.rejected
certifiedMinutes.changesRequested
certifiedMinutes.sealed
certifiedMinutes.published
certifiedMinutes.publicationRevoked
certifiedMinutes.archived
certifiedMinutesVersion.created
certifiedMinutesVersion.archived
certifiedMinutesSection.created
certifiedMinutesSection.updated
certifiedMinutesSection.reordered
certifiedMinutesSection.archived
certifiedMinutesApproval.created
certifiedMinutesAttachment.uploaded
certifiedMinutesAttachment.downloaded
certifiedMinutesAttachment.archived
certifiedMinutesArtifact.generated
certifiedMinutesArtifact.downloaded
certifiedMinutesArtifact.archived
certifiedMinutesAccess.viewed
certifiedMinutesAccess.downloaded
```

---

### 26.2. Metadata permitida

```text id="cn2ul7"
certifiedMinutesId
meetingId
sourceMeetingMinutesId
versionId
sectionId
approvalId
attachmentId
artifactId
publicationId
status
versionNumber
visibility
certificationMode
sealAlgorithm
sealHashPrefix
artifactHashPrefix
audienceType
accessType
outcome
traceId
```

---

### 26.3. Metadata prohibida

```text id="x16d64"
contenido completo del acta
contenido completo de secciones
contenido completo de adjuntos
storageKey completo
URLs firmadas
tokens
cookies
Authorization header
emails completos
teléfonos completos
cédulas
firmas
documentos completos
stack trace
SQL raw
payload completo
```

---

### 26.4. Auditoría reforzada

Aplicar auditoría reforzada para:

```text id="vh7tdn"
- acceso PlatformAdmin excepcional;
- descarga administrativa de PDF;
- descarga de adjunto;
- revocación de publicación;
- sellado;
- publicación;
- intento cross-tenant detectado;
- múltiples descargas fallidas;
- cambio de audiencia.
```

---

## 27. Access logs

`CertifiedMinutesAccessLog` complementa `AuditLog`.

Debe registrar:

```text id="htnqez"
tenantId
certifiedMinutesId
versionId si aplica
artifactId si aplica
actorUserId
accessType
outcome
ipAddressHash si aplica
userAgentHash si aplica
accessedAt
traceId
metadata segura
```

No debe registrar:

```text id="iismxg"
IP en texto plano si política de minimización lo impide
user agent completo si se considera excesivo
storageKey
URL firmada
contenido del acta
contenido del PDF
contenido de adjuntos
tokens
cookies
```

---

## 28. Logs seguros

### 28.1. Permitido

```text id="wk55a5"
traceId
requestId
correlationId
action
outcome
status
durationMs
errorCode
certifiedMinutesStatus
visibility
certificationMode
artifactType
publicationStatus
accessType
```

---

### 28.2. Prohibido

```text id="p6wum8"
Authorization header
tokens
cookies
secretos
contenido completo del acta
contenido completo de secciones
contenido completo de adjuntos
storageKey
URL firmada
emails completos
teléfonos completos
cédulas
firmas
SQL raw
stack trace en producción
hash completo si política lo restringe
tenantId como label de métrica
userId como label de métrica
```

---

### 28.3. Ejemplo de log seguro

```json id="lw5r0j"
{
  "action": "certifiedMinutes.sealed",
  "outcome": "success",
  "status": "sealed",
  "certificationMode": "internalHash",
  "hashAlgorithm": "SHA-256",
  "durationMs": 142,
  "traceId": "req_123456"
}
```

---

## 29. Métricas seguras

### 29.1. Métricas permitidas

```text id="tonoxx"
certified_minutes_created_total
certified_minutes_submitted_total
certified_minutes_approved_total
certified_minutes_sealed_total
certified_minutes_published_total
certified_minutes_publication_revoked_total
certified_minutes_pdf_generated_total
certified_minutes_downloaded_total
certified_minutes_attachment_uploaded_total
```

---

### 29.2. Labels permitidos

```text id="f7by18"
status
visibility
certificationMode
artifactType
publicationStatus
accessType
outcome
```

---

### 29.3. Labels prohibidos

```text id="gtad8k"
tenantId
certifiedMinutesId
meetingId
versionId
userId
personId
propertyUnitId
email
phone
ipAddress
storageKey
sealHash
artifactHash
traceId
```

---

## 30. Seguridad de notificaciones

### 30.1. Eventos permitidos

```text id="jyyhn4"
certifiedMinutes.submittedForReview
certifiedMinutes.changesRequested
certifiedMinutes.approved
certifiedMinutes.sealed
certifiedMinutes.published
certifiedMinutes.publicationRevoked
```

---

### 30.2. Payload permitido

```json id="xed7dj"
{
  "tenantId": "tenant_uuid",
  "sourceType": "certifiedMinutes",
  "sourceId": "certified_minutes_uuid",
  "eventType": "certifiedMinutes.published",
  "title": "Acta de Asamblea Ordinaria 2026",
  "actionUrl": "/certified-minutes/certified_minutes_uuid",
  "audience": {
    "type": "owners"
  },
  "traceId": "req_123456"
}
```

---

### 30.3. Payload prohibido

```text id="oqefmm"
contenido completo del acta
secciones completas
adjuntos
PDF
storageKey
URL firmada
hash completo
datos personales innecesarios
tokens
secretos
cookies
```

---

### 30.4. Canalización

Este módulo no debe enviar directamente:

```text id="lwye18"
email
WhatsApp
SMS
push móvil
webhook externo
```

Debe emitir eventos hacia `012-communications-notifications`.

---

## 31. Seguridad de OpenAPI

OpenAPI debe documentar:

```text id="cfxfy5"
x-tenant-scope: true
x-auth-required: true
x-required-permission
x-own-resource en /me
x-secure-download en descargas
x-storage-key-exposed: false
x-integrity-seal: true en sellado
x-hash-algorithm: SHA-256
x-legal-signature: false
x-publication-controlled: true
x-public-exposure: false
x-audience-required: true
x-artifact-generation: true
x-storage-backed: true
x-official-pdf-from-draft: false
x-audit-event
```

OpenAPI no debe documentar:

```text id="d7m12b"
GET /api/v1/public/tenants/{slug}/certified-minutes
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download
GET /api/v1/public/tenants/{slug}/certified-minutes-artifacts/{artifactId}/download
POST /api/v1/public/tenants/{slug}/certified-minutes
POST /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/publish
```

---

## 32. Seguridad de base de datos

### 32.1. Constraints críticos

```text id="b6so9s"
tenant_id NOT NULL en todas las tablas;
meeting_id NOT NULL en certified_minutes;
UNIQUE tenant_id + certified_minutes_id + version_number;
UNIQUE tenant_id + version_id + order;
file_size > 0 en attachments;
file_size IS NULL OR file_size > 0 en artifacts;
expires_at > published_at si ambos existen;
índice parcial para una acta activa por reunión;
índice parcial para PDF oficial activo por versión;
índice parcial para publicación activa por audiencia.
```

---

### 32.2. Soft delete

No eliminar físicamente:

```text id="upqr60"
certified_minutes
certified_minutes_versions
certified_minutes_sections
certified_minutes_approvals
certified_minutes_attachments
certified_minutes_artifacts
certified_minutes_publications
certified_minutes_access_logs
```

Usar:

```text id="eybb5k"
archived_at
status = archived cuando aplique
```

---

### 32.3. Operaciones transaccionales

Deben ser transaccionales:

```text id="bh9qnp"
crear acta + versión inicial;
importar MeetingMinutes + crear secciones;
aprobar + crear approval + cambiar estado;
sellar + calcular hash + bloquear versión;
generar PDF + subir storage + crear artifact;
publicar + crear publication + cambiar estado;
revocar publicación + actualizar estado + auditar.
```

---

## 33. Seguridad de concurrencia

### 33.1. Duplicidad de acta por reunión

Riesgo:

```text id="ju7l81"
Dos requests simultáneos crean dos actas activas para la misma reunión.
```

Control:

```text id="lxy8o4"
índice parcial único tenant_id + meeting_id para actas activas
```

Resultado esperado:

```text id="jnmd3r"
1 request exitoso
1 request con 409 CERTIFIED_MINUTES_ALREADY_EXISTS_FOR_MEETING
```

---

### 33.2. Duplicidad de PDF oficial

Riesgo:

```text id="dfv54z"
Dos requests simultáneos generan dos PDFs oficiales activos para la misma versión.
```

Control:

```text id="enalkn"
índice parcial único para PDF oficial activo por versión
```

---

### 33.3. Duplicidad de publicación

Riesgo:

```text id="ae5vzs"
Dos requests simultáneos publican la misma versión para la misma audiencia.
```

Control:

```text id="f6vjwm"
índice parcial o política de idempotencia por tenant + acta + versión + audiencia
```

---

## 34. No ejecución automática

Una acta no debe ejecutar acciones de dominio.

Prohibido:

```text id="egorg1"
generar cargos
generar multas
modificar alícuotas
modificar saldos
aprobar resoluciones automáticamente
ejecutar resoluciones
modificar roles
modificar presupuestos
activar contratos
notificar terceros externos sin flujo explícito
```

Regla:

```text id="v3vudc"
Certified Minutes registra, formaliza y publica información; no ejecuta decisiones administrativas o financieras.
```

---

## 35. Uso de IA

### 35.1. Prohibición MVP

No enviar actas reales a servicios externos de IA.

Prohibido:

```text id="nefx14"
contenido completo del acta
secciones
adjuntos
PDFs
datos de propietarios
datos de residentes
asistencia
votaciones
resoluciones
comentarios internos
documentos reales
```

---

### 35.2. Permitido

```text id="d8rpxq"
datos ficticios
plantillas genéricas
documentación técnica
código fuente sin secretos
tests con fixtures sintéticos
reportes anonimizados si data governance lo permite
```

---

### 35.3. Futuro

Cualquier asistencia IA sobre actas reales requiere spec futura, gobierno de datos, anonimización, consentimiento/política, proveedor aprobado y controles de privacidad.

---

## 36. Rate limiting y abuso

Aplicar límites a:

```text id="o3073l"
POST /attachments
POST /artifacts/generate-pdf
GET /attachments/{id}/download
GET /artifacts/{id}/download
GET /me/certified-minutes-artifacts/{artifactId}/download
GET /versions/compare
```

Recomendación inicial:

```text id="f8zr65"
- límites por usuario;
- límites por tenant;
- límites por endpoint;
- límites por tamaño de archivo;
- límites por número de PDFs generados por ventana temporal;
- alertas por múltiples descargas denegadas.
```

---

## 37. Retención y archivo

### 37.1. Regla MVP

No eliminar físicamente actas ni registros asociados en operación ordinaria.

Motivo:

```text id="kviiqi"
Las actas son evidencia administrativa interna y requieren trazabilidad histórica.
```

---

### 37.2. Política futura

Debe definirse una spec futura para:

```text id="j6d0zg"
document retention policy
legal hold
purga controlada
exportación regulada
anonimización
retención por tenant
retención por tipo de reunión
cumplimiento legal local
```

---

## 38. Backup y recuperación

Riesgos:

```text id="x8pfgs"
pérdida de actas
pérdida de adjuntos
pérdida de PDFs
pérdida de auditoría
restauración parcial inconsistente
```

Recomendaciones:

```text id="agxscd"
- backup de PostgreSQL;
- backup de storage;
- consistencia entre DB y storage;
- artifactHash para verificar integridad;
- restore tests periódicos;
- no almacenar solo en filesystem efímero en producción;
- versionado de objetos en storage si aplica;
- retención de backups por política del tenant/plataforma.
```

---

## 39. Configuración segura

Variables sensibles:

```text id="nrly5d"
storage credentials
bucket name
storage endpoint
PDF service config
hash config
temporary URL signing key
notification adapter secrets
audit adapter config
```

Reglas:

```text id="da4msm"
- no secretos en repositorio;
- usar secret manager o variables seguras;
- rotación de credenciales;
- mínimos privilegios para storage;
- separar credenciales por ambiente;
- no logs de configuración sensible;
- no exponer variables en health checks.
```

---

## 40. Hardening de archivos

### 40.1. Filename

Sanitizar:

```text id="qhmqs1"
espacios excesivos
caracteres de control
../
..\
/
\
null bytes
comillas peligrosas
caracteres invisibles
nombres excesivamente largos
```

---

### 40.2. MIME sniffing

No confiar únicamente en MIME declarado por cliente.

Validar:

```text id="m0o1q8"
Content-Type
extensión
firma/magic bytes cuando sea posible
tamaño
hash
```

---

### 40.3. Antivirus futuro

Si la infraestructura lo permite:

```text id="esj6mh"
uploaded -> quarantined -> available
uploaded -> quarantined -> rejected
```

MVP debe dejar estados preparados.

---

## 41. Seguridad de endpoints prohibidos

Estas rutas no deben existir:

```text id="oaarg3"
GET /api/v1/public/tenants/{slug}/certified-minutes
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}
GET /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/download
GET /api/v1/public/tenants/{slug}/certified-minutes-artifacts/{artifactId}/download
POST /api/v1/public/tenants/{slug}/certified-minutes
POST /api/v1/public/tenants/{slug}/certified-minutes/{certifiedMinutesId}/publish
```

Resultado esperado:

```text id="gpwxqk"
404 route not found
```

Sin revelar:

```text id="f1e8au"
si el tenant existe
si el acta existe
si el artifact existe
si el usuario tendría acceso
```

---

## 42. Casos de abuso prioritarios

| Caso                                    | Riesgo  | Control                                |
| --------------------------------------- | ------- | -------------------------------------- |
| Tenant A consulta acta de Tenant B      | Crítico | tenant_id + repository policy + tests  |
| Usuario envía `tenantId` en body        | Alto    | DTO reject                             |
| Usuario usa `meetingId` de otro tenant  | Crítico | meeting port tenant-scoped             |
| Usuario edita versión sellada           | Crítico | state machine                          |
| Usuario publica acta approved no sealed | Alto    | publication policy                     |
| Usuario descarga artifact ajeno         | Crítico | artifact guard + audience guard        |
| Usuario filtra `storageKey`             | Alto    | DTO minimizado                         |
| PDF oficial desde draft                 | Alto    | PDF policy                             |
| Acta no publicada visible en `/me`      | Alto    | publication guard                      |
| Publicación revocada descargable        | Alto    | publication state check                |
| Logs con contenido completo             | Alto    | log sanitizer                          |
| Audit con contenido completo            | Alto    | audit sanitizer                        |
| Endpoint público accidental             | Crítico | route negative tests + OpenAPI gate    |
| Hash presentado como firma legal        | Alto    | DTO/legalSignature=false + copy review |
| Acta ejecuta multas/cargos              | Crítico | no automatic execution policy          |

---

## 43. Pruebas de seguridad obligatorias

### 43.1. Multitenancy

```text id="t7k84d"
tenant A no ve actas tenant B
tenant A no ve versiones tenant B
tenant A no ve secciones tenant B
tenant A no ve adjuntos tenant B
tenant A no ve artifacts tenant B
tenant A no ve publicaciones tenant B
tenant A no descarga PDFs tenant B
tenant A no usa meetingId tenant B
tenant A no usa sourceMeetingMinutesId tenant B
tenant A no usa audienceRules de tenant B
```

---

### 43.2. Autorización

```text id="m57ock"
401 sin token
403 sin membership
403 usuario disabled
403 sin permiso por acción
403/404 sin audiencia
403/404 recurso propio no autorizado
PlatformAdmin sin acceso automático
```

---

### 43.3. Inmutabilidad

```text id="iegd90"
no editar versión sealed
no editar sección de versión sealed
no reordenar versión sealed
no sobrescribir contentSnapshot sealed
nueva versión para correcciones posteriores
```

---

### 43.4. Integridad

```text id="eoyul0"
mismo canonical content -> mismo hash
cambio material -> hash distinto
artifactHash coincide con binario descargado
sealHashPrefix seguro
hash completo no expuesto por DTO estándar
```

---

### 43.5. Storage

```text id="w67roq"
no storageKey en listados
no storageKey en detalles
no storageKey en errores
no storageKey en audit metadata
no URL persistente
descarga autorizada
descarga denegada auditada
path traversal bloqueado
```

---

### 43.6. Publicación

```text id="es01x5"
no publicar sin sellado
no publicar sin audiencia
no audienceRules cross-tenant
revoked no visible
expired no visible
revoked no descargable
expired no descargable
```

---

### 43.7. Endpoints públicos

```text id="q1tgnr"
rutas públicas prohibidas devuelven 404
OpenAPI no documenta rutas públicas
```

---

## 44. CI/CD security gates

El pipeline debe fallar si:

```text id="o66j4v"
- falla lint;
- falla typecheck;
- falla unit test;
- falla DTO validation;
- falla authorization test;
- falla multitenancy test;
- falla audience test;
- falla integrity test;
- falla storage test;
- falla PDF security test;
- falla audit sanitizer test;
- falla observability sanitizer test;
- falla OpenAPI validation;
- OpenAPI documenta endpoints públicos prohibidos;
- aparece storageKey en snapshots de respuesta;
- aparece contenido completo en logs de test;
- se puede editar versión sealed;
- se puede publicar sin sellado;
- se puede descargar sin autorización;
- se puede crear acta cross-tenant;
- se puede crear segunda acta activa por reunión.
```

---

## 45. Checklist de seguridad para revisión de PR

Cada PR debe responder:

```text id="h2ifzy"
[ ] ¿Toda consulta filtra por tenant_id?
[ ] ¿Se evita findUnique por id simple?
[ ] ¿El body rechaza tenantId?
[ ] ¿Los IDs externos se validan contra tenant?
[ ] ¿Se aplican permisos?
[ ] ¿Se aplica autorización por audiencia cuando corresponde?
[ ] ¿Se aplica autorización /me por recurso propio?
[ ] ¿Se respeta la state machine?
[ ] ¿Se impide modificar versiones sealed?
[ ] ¿El hash se calcula sobre contenido canonicalizado?
[ ] ¿El DTO expone solo hashPrefix?
[ ] ¿legalSignature=false está presente donde corresponde?
[ ] ¿storageKey queda interno?
[ ] ¿Descargas se auditan?
[ ] ¿No se crearon endpoints públicos?
[ ] ¿OpenAPI no documenta rutas públicas?
[ ] ¿Logs están sanitizados?
[ ] ¿Auditoría está sanitizada?
[ ] ¿Notificaciones usan payload mínimo?
[ ] ¿PDF oficial no se genera desde draft?
[ ] ¿No se ejecutan resoluciones/cargos/multas?
[ ] ¿Tests de seguridad pasan?
```

---

## 46. Definition of Done de seguridad

El módulo cumple seguridad cuando:

```text id="opdjzh"
- todas las entidades tienen tenant_id;
- toda consulta aplica tenant_id;
- no se acepta tenantId desde body;
- se validan referencias cross-tenant;
- se aplican permisos por endpoint;
- se aplican guards de audiencia;
- /me solo muestra actas publicadas autorizadas;
- versiones sealed son inmutables;
- hash SHA-256 es reproducible;
- cambios materiales cambian hash;
- PDF oficial no sale de draft;
- storageKey nunca se expone;
- descargas requieren autorización;
- descargas se auditan;
- publicaciones requieren sellado;
- publicaciones requieren audiencia;
- publicaciones revoked/expired no son visibles;
- logs no contienen contenido completo;
- audit no contiene contenido completo;
- notificaciones no contienen contenido completo;
- no existen endpoints públicos;
- OpenAPI no documenta endpoints públicos;
- no hay ejecución automática de resoluciones, cargos o multas;
- tests críticos pasan;
- CI pasa.
```

---

## 47. No aceptación

La implementación no debe aceptarse si:

```text id="o0e2ss"
- permite actas cross-tenant;
- permite versiones cross-tenant;
- permite secciones cross-tenant;
- permite aprobaciones cross-tenant;
- permite adjuntos cross-tenant;
- permite artefactos cross-tenant;
- permite publicaciones cross-tenant;
- permite access logs cross-tenant;
- permite usar meetingId de otro tenant;
- permite usar sourceMeetingMinutesId de otro tenant;
- permite usar votingResultId de otro tenant;
- permite usar meetingResolutionId de otro tenant;
- permite crear más de un acta activa principal por reunión;
- permite editar versión sellada;
- permite editar sección de versión sellada;
- permite publicar sin sellar;
- permite publicar sin audiencia;
- permite descargar PDF sin autorización;
- permite descargar publicación revocada;
- permite descargar publicación expirada;
- expone storageKey;
- expone URL firmada persistente;
- genera PDF oficial desde draft sin marca de borrador;
- no calcula hash;
- calcula hash no reproducible;
- no cambia hash ante modificación de contenido;
- registra contenido completo en logs;
- registra contenido completo en auditoría;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- presenta hash como firma electrónica legal;
- presenta MVP como certificación legal externa;
- ejecuta resoluciones automáticamente;
- genera cargos desde actas;
- genera multas desde actas;
- usa IA externa con actas reales;
- omite auditoría de operaciones críticas.
```

---

## 48. Resultado esperado

Al aplicar estas notas, `015-certified-minutes` quedará protegido como un módulo documental sensible, con controles sólidos sobre:

```text id="efju0d"
tenant isolation
autenticación
autorización por permisos
autorización por audiencia
autorización por recurso propio
versionado
inmutabilidad
hash interno
integridad documental
storage seguro
PDF seguro
adjuntos seguros
publicaciones controladas
descargas auditadas
logs seguros
métricas seguras
notificaciones mínimas
OpenAPI seguro
no exposición pública
no ejecución automática
```

El módulo queda listo para evolucionar posteriormente hacia firma electrónica, sellado de tiempo externo, verificación pública, QR, reglas legales avanzadas y flujos de impugnación, siempre mediante specs futuras y controles adicionales de seguridad, privacidad y cumplimiento.
