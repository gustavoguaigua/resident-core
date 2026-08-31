# GAP-S3-008 — Política operativa y de seguridad de archivos de Sprint 3

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-008` |
| Severidad | Alta |
| Estado | `closed` |
| Fecha | 2026-08-30 |
| Sprint | Sprint 3 — Residentes, propiedades y finanzas base |
| Specs afectadas | 005, 007, 016 y 025 |
| Readiness resultante | `NO_GO`, fase 0; GAP-S3-001 cerrado posteriormente |

Este documento fija la única política operativa de archivos autorizada para Sprint 3.
No implementa storage ni amplía la superficie API.

## 2. Causa raíz

Spec 016 proponía un módulo documental general con categorías, límites, providers,
estados de scan, retención y capacidades de dominios posteriores. El contrato de Sprint
3 sólo necesita comprobantes de pago y no tenía decisiones reproducibles para aceptar,
rechazar, conservar o descargar su binario.

## 3. Frontera exacta

Sprint 3 admite exclusivamente:

```text
DocumentCategory = PAYMENT_RECEIPT
SourceModule = PAYMENTS
resourceType = PAYMENT_RECEIPT
DocumentVisibility = PRIVATE
DocumentSensitivity = RESTRICTED
```

El grafo obligatorio es tenant-scoped:

```text
Payment -> PaymentReceipt -> SecureDocument -> SecureDocumentVersion -> SecureDocumentFile
```

Cada relación comparte el mismo `tenantId`. Un archivo pertenece a un único documento,
versión y receipt y no puede reutilizarse entre tenants, pagos o receipts.

Actas, multas, comunicaciones, reportes, exports, documentos administrativos, archivos
de residentes/propiedades, documentos públicos y categorías `OTHER` quedan fuera de
Sprint 3. No existen endpoints generales ni permisos `documents.*`.

## 4. Allowlist de contenido

| MIME verificado | Extensiones admitidas | Firma mínima |
| --- | --- | --- |
| `application/pdf` | `.pdf` | `%PDF-` |
| `image/jpeg` | `.jpg`, `.jpeg` | `FF D8 FF` |
| `image/png` | `.png` | `89 50 4E 47 0D 0A 1A 0A` |

El máximo exacto por archivo es `10 MiB` (`10_485_760` bytes) y el mínimo es un byte.
No existe override por tenant, categoría o endpoint en Sprint 3.

Core valida durante streaming y antes de confirmar estado disponible:

1. tamaño contado por el servidor, sin confiar en `Content-Length`;
2. MIME declarado dentro de allowlist;
3. extensión normalizada compatible;
4. magic bytes compatibles con MIME y extensión;
5. SHA-256 calculado por Core sobre el contenido completo;
6. filename no vacío, máximo 255 caracteres y sanitizado sólo para presentación;
7. ausencia de path traversal, null bytes y caracteres de control.

Una discrepancia, archivo vacío, truncado o sobre el límite se rechaza. Quedan
prohibidos SVG, HTML, texto, JSON, Office, scripts, ejecutables, archivos comprimidos y
cualquier MIME no enumerado. El nombre del cliente nunca genera `storageKey`.

## 5. Malware scan y cuarentena

Spec 016 excluye antivirus real del MVP. ADR-009 fija la topología local de siete
servicios y GAP-S3-008 no añade ClamAV, otro daemon ni una dependencia de scanning.

Durante Sprint 3:

```text
FileScanStatus = NOT_REQUIRED
```

Sólo se alcanza `AVAILABLE` con `NOT_REQUIRED` después de superar todas las validaciones
de la sección 4. `PENDING`, `CLEAN`, `SUSPICIOUS`, `INFECTED` y `FAILED` permanecen
reservados para una futura decisión de malware scanning, no se aceptan desde clientes y
no forman parte de un flujo de transición de Sprint 3.

Si un archivo existente presenta cualquiera de esos estados distintos de
`NOT_REQUIRED`, contenido indeterminado o una anomalía de integridad, el acceso falla
cerrado y el documento/archivo queda `QUARANTINED`. `QUARANTINED`, `REJECTED`,
`MISSING`, `FAILED` o `ARCHIVED` nunca se descargan.

El riesgo residual de no disponer de antivirus se mitiga con allowlist mínima, firmas,
hash, storage privado, ausencia de renderizado/preview, descarga autenticada como
attachment, `X-Content-Type-Options: nosniff` y `Cache-Control: private, no-store`.

## 6. Lifecycle operativo

El upload usa el contrato de GAP-S3-005:

1. Core genera IDs, `uploadId` y clave temporal tenant-scoped.
2. El stream se valida y hashea en storage temporal privado.
3. Un archivo inválido se elimina o queda como temporal no referenciado; nunca crea un
   receipt utilizable.
4. La promoción al objeto final es idempotente por `(tenantId, uploadId, hash)`.
5. Documento, versión, archivo, link, `PaymentReceipt` y Audit se escriben en una sola
   transacción PostgreSQL.
6. Sólo después del commit el grafo es observable como `AVAILABLE`.
7. Un fallo posterior a promoción ejecuta compensación; si ésta falla, el objeto queda
   sin referencia y expirable para reconciliación.

Los estados persistidos autorizados conservan los enums existentes:

```text
DocumentStatus: DRAFT -> UPLOADED -> AVAILABLE | QUARANTINED | REJECTED -> ARCHIVED
DocumentVersionStatus: DRAFT -> ACTIVE -> SUPERSEDED | ARCHIVED
DocumentFileStatus: PENDING -> STORED -> AVAILABLE | QUARANTINED | REJECTED | MISSING | FAILED -> ARCHIVED
```

Estados de error no vuelven directamente a `AVAILABLE`. Una recarga posterior a un
receipt rechazado crea una nueva versión y archivo, conforme a GAP-S3-005.

## 7. Provider y configuración

| Ambiente | Provider autorizado | Regla |
| --- | --- | --- |
| local/test | `MINIO` | sólo datos sintéticos, red privada de Compose |
| staging/production | `S3` o `S3_COMPATIBLE` | provider administrado que cumpla este contrato |

`LOCAL`, `MINIO`, `OTHER` y filesystem efímero no están autorizados en
staging/production.
El vendor concreto no pertenece al dominio y puede seleccionarse operativamente sólo si
cumple:

- HTTPS/TLS verificado;
- bucket y objetos privados, sin ACL o policy pública;
- server-side encryption habilitado y comprobable;
- credencial de mínimo privilegio limitada al bucket/prefix de la aplicación;
- endpoint, región, bucket y secretos fuera de Git, OpenAPI, logs y Audit;
- bloqueo de arranque en ambiente no local si falta cifrado o configuración segura.

La configuración pertenece a aplicación/infraestructura mediante variables validadas,
no a Tenant Settings ni a una tabla de configuración. No existe endpoint para cambiar
provider, probar conexión o leer secretos.

ADR-009 no necesita cambio: mantiene MinIO local y storage S3-compatible no local. La
topología Compose conserva exactamente sus siete servicios; no se agrega scanner.

## 8. Claves, acceso y respuesta HTTP

- `storageKey` es UUID-based, generado por Core y namespaced por tenant; no incluye
  filename ni datos de negocio legibles.
- Todo lookup combina `tenantId` y los IDs canónicos; el namespace no sustituye
  autorización.
- El bucket, provider, key, hash completo y URL temporal no salen en DTOs o errores.
- La descarga de Sprint 3 es server-mediated por el endpoint de PaymentReceipt fijado
  en GAP-S3-006; no devuelve redirects ni signed URLs.
- La respuesta usa MIME verificado, `Content-Disposition: attachment`,
  `X-Content-Type-Options: nosniff` y `Cache-Control: private, no-store`.
- PlatformAdmin no accede implícitamente; rigen los permisos y `.own` de GAP-S3-007.
- El filename presentado se sanitiza y nunca se usa como path o header sin encoding.

## 9. Retención y reconciliación

- objetos temporales o finales sin fila canónica expiran a las 24 horas;
- la reconciliación sólo puede eliminar, después de esas 24 horas, objetos sin referencia
  verificados contra PostgreSQL y dentro del mismo tenant namespace;
- documentos, versiones y archivos persistidos `AVAILABLE`, `REJECTED`, `QUARANTINED`
  o `ARCHIVED` no se eliminan físicamente en Sprint 3;
- archivar un receipt no elimina su evidencia;
- no existe purge, restore público, legal hold ni retención legal configurable;
- una política temporal/legal definitiva requiere una decisión posterior y no puede
  aplicarse retroactivamente de forma destructiva sin migración revisada.

La regla de 24 horas sólo cubre objetos técnicos sin fila, no documentos canónicos.

## 10. Auditoría y datos sensibles

Se aplica el catálogo de GAP-S3-007. Audit y logs sólo aceptan IDs, categoría,
`fileSize`, `verifiedMimeType`, estados y códigos estables permitidos. Nunca contienen
binario, filename original, referencia bancaria, hash completo, key, bucket, URL,
credenciales, token, secreto o payload completo.

La descarga permitida registra `paymentReceipt.downloaded`; una denegación usa los
eventos genéricos de acceso de Sprint 2. Compensación, huérfanos, cuarentena y rechazo
usan los eventos documentales exactos de GAP-S3-007.

## 11. Gates obligatorios de Fase 3

`test:documents` debe demostrar:

- aceptación de PDF/JPEG/PNG válidos y rechazo de todo lo demás;
- rechazo por tamaño, vacío, extensión/MIME/magic bytes incompatibles y path traversal;
- hash SHA-256 calculado por Core y ausencia de metadata física en input/output;
- `NOT_REQUIRED` como único scan status normal y fail-closed para cualquier otro;
- descarga sólo de `AVAILABLE`, con headers seguros y autorización Core;
- denegación cross-tenant, `.own` inválido y PlatformAdmin sin membership/permiso;
- idempotencia, concurrencia, compensación y reconciliación tenant-aware;
- expiración de objetos sin fila con reloj controlado y no purga de documentos;
- Audit durable y sanitizado;
- MinIO local privado y adapter no local que exige TLS, bucket privado y SSE;
- ausencia de rutas/permisos generales `documents.*` y ausencia de un octavo servicio
  Compose.

Fase 9 debe repetir la integración de upload/download mediante Payments y el stack
acumulativo. En fase 0 sólo se valida documentación y frontera.

## 12. Criterio de cierre

GAP-S3-008 queda cerrado porque existen categoría, límites, MIME, validaciones, estados,
scan status, cuarentena, provider, cifrado, acceso, retención, reconciliación y gates
exactos. Antivirus real, categorías futuras, purga legal y provider específico quedan
explícitamente fuera. Sprint 3 continúa `NO_GO`, fase 0, hasta reevaluar formalmente
la compuerta.
