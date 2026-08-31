# GAP-S3-005 — Frontera entre Payments y Secure Document Storage

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-005` |
| Severidad | Alta |
| Estado | `CLOSED` |
| Fecha | 2026-08-29 |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Decisión de readiness | `NO_GO` |
| Fase | `0 — readiness` |

Este cierre no autoriza implementación ni cambia la fase. Specs 005 y 016 permanecen
en `needs-review` hasta cerrar sus demás blockers y ejecutar GAP-S3-001.

## 2. Causa raíz

Spec 005 atribuía a `PaymentReceipt` metadata y responsabilidades del archivo físico,
mientras Spec 016 declaraba ownership sobre documento, versión, archivo, hash y
storage key. A la vez, Spec 016 declaraba depender de Payments, aunque la secuencia del
sprint necesita preparar storage antes de implementar pagos. No existía un protocolo
único para upload, compensación o recuperación de objetos huérfanos.

## 3. Ownership canónico

| Capacidad | Owner | Regla |
| --- | --- | --- |
| Pago y validación del comprobante | Spec 005 | `PaymentReceipt` conserva relación con `Payment`, estado de revisión, referencia y actores |
| Documento lógico y binario | Spec 016 | documento, versiones, archivo físico, provider, storage key, MIME, tamaño, hash y scan status |
| Autorización de negocio | Spec 005 | decide quién puede adjuntar, revisar o descargar para un pago |
| Autorización técnica del archivo | Spec 016 | valida tenant, documento, estado y entrega stream controlado |
| Configuración del provider | aplicación/infraestructura | MinIO sólo local; producción mediante adapter S3-compatible privado |

`PaymentReceipt` no persiste `fileId`, `fileName`, `mimeType`, `fileSize`, hash,
provider, bucket ni `storageKey`. Conserva `secureDocumentId` como referencia requerida
y única al documento de Spec 016, además de metadata estrictamente financiera como
`receiptNumber` o `transactionReference`. Un `SecureDocument` no contiene una FK hacia
Payments: su `SecureDocumentLink` genérico usa `sourceModule = PAYMENTS`,
`resourceType = PAYMENT_RECEIPT` y el ID del receipt, siempre dentro del mismo tenant.

## 4. Dependencia y orden de bootstrap

1. La Fase 3 implementa el módulo de Spec 016, sus tablas y el puerto de storage sin
   importar módulos, repositorios ni modelos de Payments.
2. Spec 016 conoce recursos origen sólo mediante identificadores opacos tenant-scoped y
   un puerto de validación implementado por el módulo consumidor.
3. La Fase 6 implementa Payments y consume el puerto de aplicación de Spec 016. Es el
   composition root quien conecta ambos módulos.
4. No existe dependencia de infraestructura de Payments hacia MinIO/S3 ni dependencia
   de dominio de Secure Document Storage hacia Payment.

## 5. Contrato mínimo de puertos

Secure Document Storage ofrece operaciones tenant-scoped equivalentes a:

- iniciar o reutilizar un upload mediante una clave idempotente;
- escribir un stream en ubicación temporal privada;
- validar metadata y contenido, calcular SHA-256 y promover el objeto;
- abrir un stream de lectura después de autorizar el recurso;
- archivar metadata y ejecutar compensación técnica;
- consultar estado por `tenantId` y `secureDocumentId` sin exponer claves internas.

Payments aporta un validador de recurso origen que demuestra que `Payment` y
`PaymentReceipt` pertenecen al tenant activo. Los DTO externos no aceptan `tenantId`,
provider, bucket, path, `storageKey`, hash ni estado de scan. Los nombres concretos de
endpoints, DTOs y permisos se cerrarán en GAP-S3-006/007.

## 6. Lifecycle del comprobante

Sprint 3 mantiene exactamente un `PaymentReceipt` por `Payment`. Una nueva carga tras
rechazo crea una nueva versión del mismo `SecureDocument`; no crea otro receipt ni
sobrescribe archivos históricos.

```text
PaymentReceipt: PENDING -> UPLOADED -> ACCEPTED | REJECTED
                              ^                 |
                              +-----------------+  nueva versión autorizada
```

- `PENDING` no satisface `financial.receiptRequired`.
- `UPLOADED` exige documento y archivo finalizados, íntegros y descargables para el
  revisor autorizado.
- `ACCEPTED` habilita la precondición documental de confirmación del pago.
- `REJECTED` conserva historia y motivo; una nueva versión válida vuelve el receipt a
  `UPLOADED` mediante operación auditada.
- `ACCEPTED` no admite reemplazo en Sprint 3. Archivo en cuarentena, rechazado,
  incompleto o archivado nunca permite confirmar el pago.

## 7. Consistencia DB/object storage

PostgreSQL conserva la autoridad sobre el estado; la existencia de un objeto por sí
sola no crea un documento ni un comprobante válido.

1. El servidor genera IDs y una clave temporal tenant-scoped; nunca usa rutas del
   cliente.
2. El stream se escribe en área temporal privada y se valida antes de cualquier estado
   `UPLOADED`.
3. La promoción al objeto final es idempotente por `(tenantId, uploadId, hash)`.
4. Una transacción PostgreSQL crea o actualiza documento, versión, archivo, link,
   `PaymentReceipt` y Audit. Sólo entonces el receipt queda `UPLOADED`.
5. Si falla la promoción, no se confirma la transacción. Si falla el commit después de
   promover, se intenta borrar el objeto final mediante compensación.
6. Un fallo de compensación se registra sin secretos y deja el objeto sin referencia
   como candidato de reconciliación; nunca se devuelve éxito ni se crea una referencia
   de negocio rota.
7. Objetos temporales o finales sin fila canónica llevan `uploadId` y expiración. Una
   reconciliación tenant-aware puede borrar únicamente objetos vencidos sin referencia,
   después de verificar PostgreSQL. No borra documentos archivados ni objetos con fila.
8. Reintentar la misma clave y hash retorna el resultado existente. La misma clave con
   contenido o metadata distintos produce conflicto; cargas concurrentes se serializan
   por tenant, pago y clave.

No se introduce outbox, worker ni procesamiento asíncrono en Sprint 3.

## 8. Seguridad e invariantes

- claves de objetos incluyen un namespace tenant generado por servidor, pero nunca se
  usan como sustituto de autorización;
- todo lookup combina `tenantId` con el ID del recurso;
- no se exponen claves, bucket, URLs persistentes, credenciales ni hash completo;
- descarga propia requiere que el pago siga vinculado a una unidad `.own` del actor;
- PlatformAdmin no recibe acceso implícito al contenido de tenants;
- logs y Audit sólo incluyen IDs, categoría, resultado, tamaño y metadata allowlisted;
  nunca contenido, secreto, URL firmada o referencia bancaria sensible;
- límites, MIME, scan, cuarentena, retención y cifrado exactos están cerrados por
  `docs/changes/GAP-S3-008-FILE-SECURITY-OPERATING-POLICY-2026-08-30.md`.

## 9. Casos de aceptación

- Spec 016 puede construirse y migrarse sin modelos de Payments;
- Payments no importa adapter MinIO/S3 ni duplica metadata física;
- receipt, documento, link y archivo siempre comparten tenant;
- un objeto sin commit no produce receipt utilizable;
- un receipt nunca referencia un documento o archivo inexistente;
- reintentos y concurrencia no duplican receipt, versión ni objeto;
- fallo de storage, validación, Audit o DB devuelve error y activa compensación;
- reconciliación no cruza tenants ni elimina objetos referenciados;
- archivo no disponible, en cuarentena o rechazado falla cerrado;
- la descarga no expone storage key ni permite acceso cross-tenant.

## 10. Dependencias aún abiertas

La superficie API está cerrada por GAP-S3-006, permisos/Audit por GAP-S3-007 y la
política operativa del archivo por GAP-S3-008. Este contrato no implementa Prisma,
OpenAPI, storage ni runtime mientras Sprint 3 continúe `NO_GO`.

## 11. Criterio de cierre demostrado

- ownership de negocio, metadata y binario queda único;
- dependencia y orden de bootstrap dejan de ser circulares;
- puerto entre módulos y provider queda delimitado;
- lifecycle de upload y referencia queda definido;
- compensación, huérfanos, idempotencia y consistencia quedan gobernados;
- readiness permanece `NO_GO`, fase 0.
