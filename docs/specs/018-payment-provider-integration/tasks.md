# Tasks — Spec 018 Payment Provider Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                                           |
| Spec ID         | 018                                                                                                                                                                                                                                                     |
| Módulo          | Payment Provider Integration                                                                                                                                                                                                                            |
| Documento       | Tasks                                                                                                                                                                                                                                                   |
| Ruta            | `docs/specs/018-payment-provider-integration/tasks.md`                                                                                                                                                                                                  |
| Versión         | 0.1                                                                                                                                                                                                                                                     |
| Estado          | Borrador inicial                                                                                                                                                                                                                                        |
| Fecha           | 2026-07-23                                                                                                                                                                                                                                              |
| Documento base  | `docs/specs/018-payment-provider-integration/spec.md`                                                                                                                                                                                                   |
| Plan técnico    | `docs/specs/018-payment-provider-integration/plan.md`                                                                                                                                                                                                   |
| Modelo de datos | `docs/specs/018-payment-provider-integration/data-model.md`                                                                                                                                                                                             |
| Contrato API    | `docs/specs/018-payment-provider-integration/api-contract.md`                                                                                                                                                                                           |
| Plan de pruebas | `docs/specs/018-payment-provider-integration/test-plan.md`                                                                                                                                                                                              |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `012-communications-notifications`, `016-secure-document-storage`, `017-bank-reconciliation` |
| Naturaleza      | Tenant-scoped / Provider-agnostic / Webhook-driven / Idempotent / Payment-aware / Audit-heavy / PCI-minimized / Non-public administrative surface                                                                                                       |

---

## 2. Propósito

Este documento descompone la implementación de `018-payment-provider-integration` en tareas técnicas verificables.

La finalidad es que el equipo pueda usarlo como checklist de implementación, revisión, pruebas, hardening, CI/CD y control de avance bajo Spec Driven Development.

Regla central:

```text id="m0ymcl"
Cada tarea de Payment Provider Integration debe preservar tenant isolation, cálculo server-side de montos, manejo seguro de SecretRef, ausencia de datos de tarjeta, checkout externo, webhooks firmados, idempotencia, creación controlada de Payment interno, auditoría financiera, logs seguros y cero endpoints públicos administrativos.
```

---

## 3. Convenciones

### 3.1. Estados de tarea

```text id="x1z3gh"
[ ] Pendiente
[x] Completada
[~] En progreso
[!] Bloqueada
```

---

### 3.2. Criterio de completitud por tarea

Una tarea solo puede marcarse como completada si:

```text id="vtyln0"
- el código fue implementado;
- los tests mínimos pasan;
- no rompe módulos previos;
- respeta tenant isolation;
- no acepta tenantId desde body;
- no usa amount del cliente como fuente de verdad;
- no expone secretos;
- no almacena PAN, CVV ni raw card data;
- no crea Payment sin webhook verificado;
- no duplica Payment ante webhook repetido;
- no confía en redirects del navegador;
- no crea endpoints públicos administrativos;
- audita operaciones críticas;
- no contradice spec.md, plan.md, data-model.md, api-contract.md ni test-plan.md.
```

---

### 3.3. Regla para uso de IA

La IA puede apoyar con código, pruebas, fixtures y documentación, pero no debe recibir:

```text id="k1cgfj"
- datos reales de tarjeta;
- payloads reales de proveedor;
- API keys reales;
- webhook secrets reales;
- tokens reales;
- comprobantes reales;
- datos financieros reales;
- datos personales reales;
- dumps productivos;
- logs productivos con información sensible.
```

---

## 4. Fase 0 — Preparación documental

### 4.1. Revisión de documentos del paquete

```text id="s6k1mm"
[ ] Revisar docs/specs/018-payment-provider-integration/spec.md.
[ ] Revisar docs/specs/018-payment-provider-integration/plan.md.
[ ] Revisar docs/specs/018-payment-provider-integration/data-model.md.
[ ] Revisar docs/specs/018-payment-provider-integration/api-contract.md.
[ ] Revisar docs/specs/018-payment-provider-integration/test-plan.md.
[ ] Validar consistencia de entidades entre documentos.
[ ] Validar consistencia de enums entre documentos.
[ ] Validar consistencia de endpoints entre documentos.
[ ] Validar consistencia de permisos entre documentos.
[ ] Validar consistencia de eventos de auditoría entre documentos.
[ ] Registrar dudas o cambios en archivo de cambios si aplica.
```

---

### 4.2. Revisión de dependencias

```text id="ef1j05"
[ ] Confirmar que 001-tenants define tenant activo/suspendido/archivado.
[ ] Confirmar que 002-users-roles define permisos y membership activa.
[ ] Confirmar que 003-residents-properties resuelve UserProfile -> Person -> PropertyUnit.
[ ] Confirmar que 004-dues-fees permite consultar cargos pagables.
[ ] Confirmar que 005-payments permite crear Payment desde fuente provider.
[ ] Confirmar si 005-payments ya tiene paymentSource o requiere extensión.
[ ] Confirmar que 006-account-statements deriva saldos desde cargos/pagos.
[ ] Confirmar que 007-audit soporta eventos financieros nuevos.
[ ] Confirmar que 008-basic-reports puede consumir reportes del módulo.
[ ] Confirmar que 012-communications-notifications puede notificar pagos sin datos sensibles.
[ ] Confirmar que 016-secure-document-storage puede almacenar comprobantes/exports.
[ ] Confirmar extensión SourceModule=paymentProviderIntegration.
[ ] Confirmar que 017-bank-reconciliation puede consumir pagos provider-verified.
```

---

## 5. Fase 1 — Estructura base del módulo

### 5.1. Crear estructura de carpetas

```text id="grsd4x"
[ ] Crear apps/api/src/modules/payment-provider-integration/.
[ ] Crear payment-provider-integration.module.ts.
[ ] Crear carpeta controllers/.
[ ] Crear carpeta application/.
[ ] Crear carpeta application/use-cases/.
[ ] Crear carpeta application/services/.
[ ] Crear carpeta application/ports/.
[ ] Crear carpeta domain/.
[ ] Crear carpeta domain/entities/.
[ ] Crear carpeta domain/value-objects/.
[ ] Crear carpeta domain/events/.
[ ] Crear carpeta domain/errors/.
[ ] Crear carpeta infrastructure/.
[ ] Crear carpeta infrastructure/persistence/.
[ ] Crear carpeta infrastructure/providers/.
[ ] Crear carpeta infrastructure/webhooks/.
[ ] Crear carpeta infrastructure/secrets/.
[ ] Crear carpeta infrastructure/integrations/.
[ ] Crear carpeta infrastructure/audit/.
[ ] Crear carpeta infrastructure/reports/.
[ ] Crear carpeta infrastructure/observability/.
[ ] Crear carpeta dto/.
[ ] Crear carpeta guards/.
[ ] Crear carpeta policies/.
[ ] Crear carpeta mappers/.
[ ] Crear carpeta tests/.
```

---

### 5.2. Registrar módulo

```text id="qc4phr"
[ ] Registrar PaymentProviderIntegrationModule en el módulo principal.
[ ] Registrar providers base.
[ ] Registrar controllers vacíos.
[ ] Registrar repositorios como providers.
[ ] Registrar ports internos.
[ ] Registrar adapter mock/sandbox.
[ ] Registrar integración con Payments.
[ ] Registrar integración con Audit.
[ ] Registrar integración con Secure Document Storage.
[ ] Verificar que el módulo compila vacío.
[ ] Verificar que el módulo no registra endpoints públicos administrativos.
```

---

## 6. Fase 2 — Enums y constantes

### 6.1. Enums de proveedores

```text id="jn3hl0"
[ ] Implementar PaymentProviderDefinitionStatus.
[ ] Implementar PaymentProviderEnvironment.
[ ] Implementar TenantPaymentProviderConfigStatus.
[ ] Implementar PaymentMethodType.
[ ] Agregar tests de enums.
```

---

### 6.2. Enums de intents y checkout

```text id="d5i8al"
[ ] Implementar PaymentIntentStatus.
[ ] Implementar PaymentIntentPurpose.
[ ] Implementar PaymentIntentItemType.
[ ] Implementar CheckoutSessionStatus.
[ ] Agregar tests de state transitions.
```

---

### 6.3. Enums de webhooks y transacciones

```text id="k1ukrc"
[ ] Implementar ProviderWebhookSignatureStatus.
[ ] Implementar ProviderWebhookProcessingStatus.
[ ] Implementar ProviderTransactionStatus.
[ ] Implementar InternalProviderPaymentStatus.
[ ] Implementar ProviderPaymentMappingStatus.
[ ] Implementar ProviderSettlementStatus.
[ ] Implementar PaymentProviderSourceModule.
[ ] Implementar PaymentProviderHashAlgorithm.
```

---

### 6.4. Constantes MVP

```text id="dseq6g"
[ ] Definir DEFAULT_PAYMENT_PROVIDER_ENVIRONMENT=sandbox.
[ ] Definir DEFAULT_CURRENCY=USD.
[ ] Definir PAYMENT_INTENT_TTL_MINUTES=30.
[ ] Definir CHECKOUT_SESSION_TTL_MINUTES=30.
[ ] Definir WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS=300.
[ ] Definir MAX_WEBHOOK_PAYLOAD_BYTES=262144.
[ ] Definir REQUIRE_WEBHOOK_SIGNATURE=true.
[ ] Definir REPLAY_PROTECTION_ENABLED=true.
[ ] Definir CARD_DATA_STORAGE_ALLOWED=false.
[ ] Definir ANONYMOUS_PAYMENT_LINKS_ENABLED=false.
[ ] Definir AI_RISK_SCORING_ENABLED=false.
```

---

## 7. Fase 3 — Value Objects

### 7.1. `ProviderKey`

```text id="lb2z9x"
[ ] Crear ProviderKey value object.
[ ] Validar no vacío.
[ ] Validar formato permitido.
[ ] Normalizar espacios.
[ ] Rechazar caracteres inseguros.
[ ] Rechazar providerKey no soportado.
[ ] Crear tests unitarios.
```

---

### 7.2. `ProviderEnvironment`

```text id="wb5n3i"
[ ] Crear ProviderEnvironment value object.
[ ] Aceptar sandbox.
[ ] Aceptar production.
[ ] Rechazar valores desconocidos.
[ ] Aplicar default sandbox en desarrollo.
[ ] Exigir configuración explícita para production.
[ ] Crear tests unitarios.
```

---

### 7.3. `SecretRef`

```text id="jj6vw2"
[ ] Crear SecretRef value object.
[ ] Validar formato de referencia.
[ ] Rechazar valores vacíos.
[ ] Rechazar secret value como si fuera ref.
[ ] Implementar maskedRef si aplica.
[ ] Implementar configured boolean.
[ ] Impedir serialización del valor secreto.
[ ] Crear tests unitarios.
```

---

### 7.4. `MoneyDecimal`

```text id="b553rz"
[ ] Crear MoneyDecimal value object o reutilizar el existente.
[ ] Aceptar string decimal.
[ ] Rechazar number.
[ ] Rechazar float.
[ ] Rechazar NaN.
[ ] Rechazar negativos.
[ ] Rechazar amount=0 cuando aplique.
[ ] Soportar suma exacta.
[ ] Soportar comparación exacta.
[ ] Validar 0.10 + 0.20 = 0.30.
[ ] Crear tests unitarios.
```

---

### 7.5. `PaymentIntentExpiration`

```text id="tqprjl"
[ ] Crear PaymentIntentExpiration.
[ ] Validar fecha futura.
[ ] Aplicar TTL configurado.
[ ] Normalizar a UTC.
[ ] Detectar intent expirado.
[ ] Crear tests unitarios.
```

---

### 7.6. `CheckoutUrl`

```text id="yu54ok"
[ ] Crear CheckoutUrl value object.
[ ] Aceptar HTTPS.
[ ] Rechazar javascript:.
[ ] Rechazar data:.
[ ] Rechazar URL vacía.
[ ] Permitir URL mock solo en test si policy lo habilita.
[ ] Calcular checkoutUrlHash.
[ ] Impedir serialización en logs.
[ ] Crear tests unitarios.
```

---

### 7.7. `WebhookSignature`

```text id="ektkd0"
[ ] Crear WebhookSignature value object.
[ ] Validar presencia.
[ ] Validar formato base según provider.
[ ] Calcular signatureHeaderHash.
[ ] Impedir log de firma completa.
[ ] Crear tests unitarios.
```

---

### 7.8. `WebhookPayloadHash`

```text id="tm5fgp"
[ ] Crear WebhookPayloadHash.
[ ] Calcular SHA-256 sobre raw body.
[ ] Garantizar estabilidad.
[ ] Generar hashPrefix seguro.
[ ] No aceptar hash desde cliente como fuente de verdad.
[ ] Crear tests unitarios.
```

---

### 7.9. `ProviderTransactionId`

```text id="gz4l4w"
[ ] Crear ProviderTransactionId value object.
[ ] Validar no vacío cuando provider lo requiere.
[ ] Normalizar espacios.
[ ] Preparar uso en idempotencia.
[ ] Crear tests unitarios.
```

---

### 7.10. `CardLast4`

```text id="e0t0fn"
[ ] Crear CardLast4 value object.
[ ] Aceptar exactamente 4 dígitos.
[ ] Permitir null.
[ ] Rechazar más de 4 caracteres.
[ ] Rechazar PAN completo.
[ ] Rechazar letras.
[ ] Crear tests unitarios.
```

---

## 8. Fase 4 — Entidades de dominio

### 8.1. `PaymentProviderDefinition`

```text id="gduymd"
[ ] Implementar entidad PaymentProviderDefinition.
[ ] Crear factory createDraft.
[ ] Implementar activate.
[ ] Implementar markInactive.
[ ] Implementar deprecate.
[ ] Implementar archive.
[ ] Validar transiciones.
[ ] Bloquear archived -> active.
[ ] Validar providerKey único por repository.
[ ] Validar supportedEnvironments.
[ ] Validar supportedCurrencies.
[ ] Validar supportedPaymentMethods.
[ ] Bloquear secretos en metadata.
[ ] Crear tests de dominio.
```

---

### 8.2. `TenantPaymentProviderConfig`

```text id="g1538k"
[ ] Implementar entidad TenantPaymentProviderConfig.
[ ] Crear factory createDraft.
[ ] Implementar enable.
[ ] Implementar disable.
[ ] Implementar markInvalid.
[ ] Implementar markTested.
[ ] Implementar archive.
[ ] Validar providerDefinition active.
[ ] Validar SecretRefs mínimos para enabled.
[ ] Validar settlementBankAccount tenant-scoped en servicio.
[ ] Bloquear archived -> enabled.
[ ] Bloquear secretos en metadata.
[ ] Crear tests de dominio.
```

---

### 8.3. `PaymentIntent`

```text id="z3y8gx"
[ ] Implementar entidad PaymentIntent.
[ ] Crear factory create.
[ ] Implementar markCheckoutCreated.
[ ] Implementar markPendingProviderConfirmation.
[ ] Implementar markSucceeded.
[ ] Implementar markFailed.
[ ] Implementar cancel.
[ ] Implementar expire.
[ ] Implementar reverse futuro/controlado.
[ ] Implementar archive.
[ ] Validar amount > 0.
[ ] Validar currency USD.
[ ] Validar items no vacíos.
[ ] Bloquear Payment automático desde intent.
[ ] Crear tests de dominio.
```

---

### 8.4. `PaymentIntentItem`

```text id="qr3n6q"
[ ] Implementar entidad PaymentIntentItem.
[ ] Validar itemType charge requiere chargeId.
[ ] Validar itemType accountBalance requiere propertyUnitId.
[ ] Validar itemType fine requiere fineId si módulo activo.
[ ] Validar itemType reservation requiere reservationId si módulo activo.
[ ] Validar amount > 0.
[ ] Validar currency USD.
[ ] Sanitizar description.
[ ] Bloquear creación de cargos desde item.
[ ] Crear tests de dominio.
```

---

### 8.5. `PaymentCheckoutSession`

```text id="yrnvs2"
[ ] Implementar entidad PaymentCheckoutSession.
[ ] Crear factory create.
[ ] Implementar markOpened.
[ ] Implementar markCompleted.
[ ] Implementar markFailed.
[ ] Implementar cancel.
[ ] Implementar expire.
[ ] Implementar archive.
[ ] Validar expiresAt obligatorio.
[ ] Bloquear exposición de checkoutUrl vencida.
[ ] Crear tests de dominio.
```

---

### 8.6. `ProviderWebhookEvent`

```text id="jhp6gk"
[ ] Implementar entidad ProviderWebhookEvent.
[ ] Crear factory received.
[ ] Implementar markVerified.
[ ] Implementar markInvalidSignature.
[ ] Implementar markMissingSignature.
[ ] Implementar markProcessing.
[ ] Implementar markProcessed.
[ ] Implementar markFailed.
[ ] Implementar markRejected.
[ ] Implementar markDuplicate.
[ ] Implementar reprocess.
[ ] Implementar archive.
[ ] Validar payloadHash obligatorio.
[ ] Sanitizar payloadPreview.
[ ] Bloquear raw payload.
[ ] Bloquear raw signature.
[ ] Crear tests de dominio.
```

---

### 8.7. `ProviderTransaction`

```text id="xcnzwx"
[ ] Implementar entidad ProviderTransaction.
[ ] Crear factory createPending.
[ ] Implementar markAuthorized.
[ ] Implementar markCaptured.
[ ] Implementar markSucceeded.
[ ] Implementar markFailed.
[ ] Implementar markCancelled.
[ ] Implementar markExpired.
[ ] Implementar markRequiresReview.
[ ] Implementar archive.
[ ] Validar amount > 0.
[ ] Validar currency USD.
[ ] Validar cardLast4.
[ ] Bloquear PAN/CVV/rawCardData.
[ ] Crear tests de dominio.
```

---

### 8.8. `ProviderPaymentMapping`

```text id="zpqa25"
[ ] Implementar entidad ProviderPaymentMapping.
[ ] Crear factory active.
[ ] Implementar reverse.
[ ] Implementar markFailed.
[ ] Implementar archive.
[ ] Requerir reverseReason.
[ ] Bloquear doble mapping activo en repositorio.
[ ] Bloquear reverse sin reason.
[ ] No eliminar Payment.
[ ] No eliminar ProviderTransaction.
[ ] Crear tests de dominio.
```

---

### 8.9. `ProviderSettlementRecord`

```text id="zws37z"
[ ] Implementar entidad ProviderSettlementRecord.
[ ] Crear factory pending.
[ ] Implementar markSettled.
[ ] Implementar markFailed.
[ ] Implementar markReversed.
[ ] Implementar markUnknown.
[ ] Implementar linkBankTransaction.
[ ] Implementar archive.
[ ] Validar grossAmount >= 0.
[ ] Validar feeAmount >= 0 si existe.
[ ] Validar netAmount >= 0 si existe.
[ ] No marcar conciliación bancaria final.
[ ] Crear tests de dominio.
```

---

## 9. Fase 5 — Errores de dominio

```text id="j3vgez"
[ ] Crear PAYMENT_PROVIDER_DEFINITION_NOT_FOUND.
[ ] Crear PAYMENT_PROVIDER_DEFINITION_INVALID_STATUS.
[ ] Crear PAYMENT_PROVIDER_DEFINITION_ARCHIVED.
[ ] Crear PAYMENT_PROVIDER_UNSUPPORTED.
[ ] Crear PAYMENT_PROVIDER_DEPRECATED.
[ ] Crear TENANT_PAYMENT_PROVIDER_CONFIG_NOT_FOUND.
[ ] Crear TENANT_PAYMENT_PROVIDER_CONFIG_INVALID_STATUS.
[ ] Crear TENANT_PAYMENT_PROVIDER_CONFIG_DISABLED.
[ ] Crear TENANT_PAYMENT_PROVIDER_CONFIG_INVALID.
[ ] Crear TENANT_PAYMENT_PROVIDER_CONFIG_ARCHIVED.
[ ] Crear TENANT_PAYMENT_PROVIDER_SECRET_INVALID.
[ ] Crear PAYMENT_INTENT_NOT_FOUND.
[ ] Crear PAYMENT_INTENT_INVALID_STATUS.
[ ] Crear PAYMENT_INTENT_EXPIRED.
[ ] Crear PAYMENT_INTENT_CANCELLED.
[ ] Crear PAYMENT_INTENT_ALREADY_SUCCEEDED.
[ ] Crear PAYMENT_INTENT_NO_ITEMS.
[ ] Crear PAYMENT_INTENT_AMOUNT_MISMATCH.
[ ] Crear PAYMENT_INTENT_CURRENCY_UNSUPPORTED.
[ ] Crear PAYMENT_INTENT_SOURCE_INVALID.
[ ] Crear PAYMENT_INTENT_IDEMPOTENCY_CONFLICT.
[ ] Crear CHECKOUT_SESSION_CREATION_FAILED.
[ ] Crear CHECKOUT_SESSION_EXPIRED.
[ ] Crear PROVIDER_WEBHOOK_SIGNATURE_MISSING.
[ ] Crear PROVIDER_WEBHOOK_SIGNATURE_INVALID.
[ ] Crear PROVIDER_WEBHOOK_TIMESTAMP_EXPIRED.
[ ] Crear PROVIDER_WEBHOOK_REPLAY_DETECTED.
[ ] Crear PROVIDER_WEBHOOK_DUPLICATE.
[ ] Crear PROVIDER_WEBHOOK_PAYLOAD_INVALID.
[ ] Crear PROVIDER_TRANSACTION_DUPLICATE.
[ ] Crear PROVIDER_TRANSACTION_AMOUNT_MISMATCH.
[ ] Crear PROVIDER_TRANSACTION_CURRENCY_MISMATCH.
[ ] Crear PROVIDER_TRANSACTION_REQUIRES_REVIEW.
[ ] Crear PROVIDER_PAYMENT_MAPPING_DUPLICATE.
[ ] Crear PROVIDER_PAYMENT_MAPPING_REVERSE_REASON_REQUIRED.
[ ] Crear PROVIDER_SETTLEMENT_BANK_TRANSACTION_INVALID.
[ ] Crear PAYMENT_CREATION_FROM_PROVIDER_FAILED.
[ ] Crear PAYMENT_ALREADY_CREATED_FROM_PROVIDER.
[ ] Crear PAYMENT_ALLOCATION_FROM_PROVIDER_FAILED.
[ ] Crear CARD_DATA_FORBIDDEN.
[ ] Crear SECRET_EXPOSURE_FORBIDDEN.
[ ] Crear RAW_PROVIDER_PAYLOAD_FORBIDDEN.
[ ] Crear PUBLIC_PAYMENT_ENDPOINT_FORBIDDEN.
[ ] Mapear errores a códigos API estándar.
```

---

## 10. Fase 6 — Prisma schema y migración

### 10.1. Enums Prisma

```text id="wakp9a"
[ ] Agregar PaymentProviderDefinitionStatus.
[ ] Agregar PaymentProviderEnvironment.
[ ] Agregar TenantPaymentProviderConfigStatus.
[ ] Agregar PaymentMethodType.
[ ] Agregar PaymentIntentStatus.
[ ] Agregar PaymentIntentPurpose.
[ ] Agregar PaymentIntentItemType.
[ ] Agregar CheckoutSessionStatus.
[ ] Agregar ProviderWebhookSignatureStatus.
[ ] Agregar ProviderWebhookProcessingStatus.
[ ] Agregar ProviderTransactionStatus.
[ ] Agregar InternalProviderPaymentStatus.
[ ] Agregar ProviderPaymentMappingStatus.
[ ] Agregar ProviderSettlementStatus.
[ ] Agregar PaymentProviderSourceModule.
[ ] Agregar PaymentProviderHashAlgorithm.
[ ] Extender Currency con USD si no existe.
```

---

### 10.2. Modelos Prisma

```text id="lvm427"
[ ] Crear modelo PaymentProviderDefinition.
[ ] Crear modelo TenantPaymentProviderConfig.
[ ] Crear modelo PaymentIntent.
[ ] Crear modelo PaymentIntentItem.
[ ] Crear modelo PaymentCheckoutSession.
[ ] Crear modelo ProviderWebhookEvent.
[ ] Crear modelo ProviderTransaction.
[ ] Crear modelo ProviderPaymentMapping.
[ ] Crear modelo ProviderSettlementRecord.
```

---

### 10.3. Relaciones con modelos existentes

```text id="sng4zm"
[ ] Agregar relaciones en Tenant.
[ ] Agregar relaciones en UserProfile.
[ ] Agregar relaciones en Person.
[ ] Agregar relaciones en PropertyUnit.
[ ] Agregar relaciones en Charge.
[ ] Agregar relaciones en Payment.
[ ] Agregar paymentSource en Payment si no existe.
[ ] Agregar providerKey en Payment si se decide.
[ ] Agregar providerPaymentMappingId en Payment si se decide.
[ ] Agregar providerTransactionExternalId en Payment si se decide.
[ ] Agregar providerReference en Payment si se decide.
[ ] Agregar providerVerifiedAt en Payment si se decide.
[ ] Agregar relaciones en BankAccount.
[ ] Agregar relaciones en BankTransaction.
[ ] Extender SourceModule=paymentProviderIntegration en Secure Document Storage.
```

---

### 10.4. Índices básicos

```text id="njkxwy"
[ ] Crear índice provider_key en payment_provider_definitions.
[ ] Crear índices tenant_id en tablas tenant-scoped.
[ ] Crear índices tenant_id + provider_key.
[ ] Crear índices tenant_id + status.
[ ] Crear índices tenant_id + environment.
[ ] Crear índices tenant_id + tenant_provider_config_id.
[ ] Crear índices tenant_id + payment_intent_id.
[ ] Crear índices tenant_id + property_unit_id.
[ ] Crear índices tenant_id + person_id.
[ ] Crear índices tenant_id + source_module.
[ ] Crear índices tenant_id + source_resource_type + source_resource_id.
[ ] Crear índices tenant_id + provider_event_id.
[ ] Crear índices tenant_id + provider_transaction_id.
[ ] Crear índices tenant_id + payment_id.
[ ] Crear índices tenant_id + bank_account_id.
[ ] Crear índices tenant_id + bank_transaction_id.
[ ] Crear índices tenant_id + created_at.
[ ] Crear índices tenant_id + archived_at.
```

---

### 10.5. Índices parciales raw

```text id="t0kmoj"
[ ] Crear unique enabled provider por tenant/provider/environment.
[ ] Crear unique idempotencyKey por tenant.
[ ] Crear unique providerIntentId por tenant/provider.
[ ] Crear unique providerSessionId por tenant/provider.
[ ] Crear unique providerEventId por tenant/provider.
[ ] Crear índice payloadHash para replay detection.
[ ] Crear unique providerTransactionId por tenant/provider.
[ ] Crear unique active mapping por providerTransaction.
[ ] Crear unique active mapping por Payment.
[ ] Crear unique providerSettlementId por tenant/provider.
```

---

### 10.6. Constraints raw

```text id="u47yt4"
[ ] Constraint payment_intents.amount > 0.
[ ] Constraint payment_intent_items.amount > 0.
[ ] Constraint provider_transactions.amount > 0.
[ ] Constraint provider_transactions.fee_amount >= 0 si existe.
[ ] Constraint provider_transactions.net_amount >= 0 si existe.
[ ] Constraint provider_settlement_records.gross_amount >= 0.
[ ] Constraint provider_settlement_records.fee_amount >= 0 si existe.
[ ] Constraint provider_settlement_records.net_amount >= 0 si existe.
[ ] Constraint confirmedAt requerido si PaymentIntent status=succeeded.
[ ] Constraint cancelReason requerido si PaymentIntent status=cancelled.
[ ] Constraint expiredAt requerido si PaymentIntent status=expired.
[ ] Constraint completedAt requerido si CheckoutSession status=completed.
[ ] Constraint failedAt requerido si CheckoutSession status=failed.
[ ] Constraint processedAt requerido si WebhookEvent processingStatus=processed.
[ ] Constraint rejectedAt requerido si WebhookEvent processingStatus=rejected.
[ ] Constraint reverseReason requerido si mappingStatus=reversed.
[ ] Constraint cardLast4 longitud <= 4.
```

---

### 10.7. Migración

```text id="wh92xv"
[ ] Crear migración 018_create_payment_provider_integration.
[ ] Ejecutar migración local.
[ ] Ejecutar migración en entorno test.
[ ] Ejecutar prisma generate.
[ ] Verificar Prisma Client.
[ ] Verificar rollback si el flujo del proyecto lo contempla.
[ ] Ejecutar repository tests.
```

---

## 11. Fase 7 — Puertos de aplicación

### 11.1. Repository ports

```text id="f7ye90"
[ ] Crear PaymentProviderDefinitionRepositoryPort.
[ ] Crear TenantPaymentProviderConfigRepositoryPort.
[ ] Crear PaymentIntentRepositoryPort.
[ ] Crear PaymentIntentItemRepositoryPort.
[ ] Crear PaymentCheckoutSessionRepositoryPort.
[ ] Crear ProviderWebhookEventRepositoryPort.
[ ] Crear ProviderTransactionRepositoryPort.
[ ] Crear ProviderPaymentMappingRepositoryPort.
[ ] Crear ProviderSettlementRepositoryPort.
```

---

### 11.2. Functional ports

```text id="x458c0"
[ ] Crear PaymentProviderPort.
[ ] Crear PaymentProviderAdapterRegistryPort.
[ ] Crear PaymentProviderSecretPort.
[ ] Crear WebhookSignatureVerifierPort.
[ ] Crear WebhookPayloadHasherPort.
[ ] Crear PaymentIntentAmountCalculatorPort.
[ ] Crear PaymentsIntegrationPort.
[ ] Crear AccountStatementsIntegrationPort.
[ ] Crear SecureDocumentStorageIntegrationPort.
[ ] Crear BankReconciliationIntegrationPort.
[ ] Crear NotificationsIntegrationPort.
[ ] Crear AuditPort.
[ ] Crear ClockPort.
[ ] Crear IdempotencyPort.
[ ] Crear ObservabilityPort.
[ ] Crear ReportExportPort.
```

---

## 12. Fase 8 — Repositorios Prisma

### 12.1. PaymentProviderDefinitionRepository

```text id="dwnn5x"
[ ] Implementar PrismaPaymentProviderDefinitionRepository.
[ ] Implementar create.
[ ] Implementar findById.
[ ] Implementar findByProviderKey.
[ ] Implementar list.
[ ] Implementar update.
[ ] Implementar activate.
[ ] Implementar markInactive.
[ ] Implementar deprecate.
[ ] Implementar archive.
[ ] Probar providerKey unique.
[ ] Crear repository tests.
```

---

### 12.2. TenantPaymentProviderConfigRepository

```text id="x37nyu"
[ ] Implementar PrismaTenantPaymentProviderConfigRepository.
[ ] Implementar create.
[ ] Implementar findByIdAndTenant.
[ ] Implementar findEnabledByProviderKeyAndEnvironment.
[ ] Implementar listByTenant.
[ ] Implementar update.
[ ] Implementar enable.
[ ] Implementar disable.
[ ] Implementar markInvalid.
[ ] Implementar markTested.
[ ] Implementar archive.
[ ] Prohibir findUnique por id simple.
[ ] Crear repository tests.
```

---

### 12.3. PaymentIntentRepository

```text id="w46u45"
[ ] Implementar PrismaPaymentIntentRepository.
[ ] Implementar createWithItems en transacción.
[ ] Implementar findByIdAndTenant.
[ ] Implementar listByTenant.
[ ] Implementar listOwn.
[ ] Implementar findByIdempotencyKey.
[ ] Implementar markCheckoutCreated.
[ ] Implementar markPendingProviderConfirmation.
[ ] Implementar markSucceeded.
[ ] Implementar markFailed.
[ ] Implementar cancel.
[ ] Implementar expire.
[ ] Implementar archive.
[ ] Prohibir findUnique por id simple.
[ ] Crear repository tests.
```

---

### 12.4. PaymentIntentItemRepository

```text id="y8psvj"
[ ] Implementar PrismaPaymentIntentItemRepository.
[ ] Implementar create.
[ ] Implementar bulkCreate.
[ ] Implementar listByPaymentIntent.
[ ] Implementar listByCharge.
[ ] Implementar listByPropertyUnit.
[ ] Validar tenant en consultas.
[ ] Crear repository tests.
```

---

### 12.5. PaymentCheckoutSessionRepository

```text id="ut76m1"
[ ] Implementar PrismaPaymentCheckoutSessionRepository.
[ ] Implementar create.
[ ] Implementar findByIdAndTenant.
[ ] Implementar listByPaymentIntent.
[ ] Implementar findByProviderSession.
[ ] Implementar markOpened.
[ ] Implementar markCompleted.
[ ] Implementar markFailed.
[ ] Implementar cancel.
[ ] Implementar expire.
[ ] Implementar archive.
[ ] Crear repository tests.
```

---

### 12.6. ProviderWebhookEventRepository

```text id="r8regh"
[ ] Implementar PrismaProviderWebhookEventRepository.
[ ] Implementar createReceived.
[ ] Implementar findByIdAndTenant.
[ ] Implementar findByProviderEventId.
[ ] Implementar findByPayloadHash.
[ ] Implementar markVerified.
[ ] Implementar markRejected.
[ ] Implementar markDuplicate.
[ ] Implementar markProcessing.
[ ] Implementar markProcessed.
[ ] Implementar markFailed.
[ ] Implementar incrementRetry.
[ ] Implementar archive.
[ ] Crear repository tests.
```

---

### 12.7. ProviderTransactionRepository

```text id="l5eh8d"
[ ] Implementar PrismaProviderTransactionRepository.
[ ] Implementar create.
[ ] Implementar findByIdAndTenant.
[ ] Implementar findByProviderTransactionId.
[ ] Implementar listByTenant.
[ ] Implementar markSucceeded.
[ ] Implementar markFailed.
[ ] Implementar markRequiresReview.
[ ] Implementar archive.
[ ] Probar unique providerTransactionId.
[ ] Crear repository tests.
```

---

### 12.8. ProviderPaymentMappingRepository

```text id="nupp2w"
[ ] Implementar PrismaProviderPaymentMappingRepository.
[ ] Implementar create.
[ ] Implementar findByIdAndTenant.
[ ] Implementar findActiveByProviderTransaction.
[ ] Implementar findActiveByPayment.
[ ] Implementar listByTenant.
[ ] Implementar reverse.
[ ] Implementar markFailed.
[ ] Implementar archive.
[ ] Probar unique active mapping por providerTransaction.
[ ] Probar unique active mapping por Payment.
[ ] Crear repository tests.
```

---

### 12.9. ProviderSettlementRepository

```text id="s5f1fc"
[ ] Implementar PrismaProviderSettlementRepository.
[ ] Implementar create.
[ ] Implementar findByIdAndTenant.
[ ] Implementar findByProviderSettlementId.
[ ] Implementar listByTenant.
[ ] Implementar markSettled.
[ ] Implementar markFailed.
[ ] Implementar linkBankTransaction.
[ ] Implementar archive.
[ ] Crear repository tests.
```

---

## 13. Fase 9 — DTOs y validadores

### 13.1. DTOs de provider definitions

```text id="gqnheh"
[ ] Crear CreatePaymentProviderDefinitionDto.
[ ] Crear UpdatePaymentProviderDefinitionDto.
[ ] Crear ActivatePaymentProviderDefinitionDto.
[ ] Crear DeprecatePaymentProviderDefinitionDto.
[ ] Crear ArchivePaymentProviderDefinitionDto.
[ ] Crear PaymentProviderDefinitionDto.
[ ] Crear PaymentProviderDefinitionListItemDto.
[ ] Crear PaymentProviderDefinitionFilterDto.
[ ] Rechazar secretos.
[ ] Rechazar credentialSecretRef.
[ ] Rechazar webhookSecretRef.
[ ] Rechazar status directo.
[ ] Crear DTO tests.
```

---

### 13.2. DTOs de tenant provider configs

```text id="o2b3xl"
[ ] Crear CreateTenantPaymentProviderConfigDto.
[ ] Crear UpdateTenantPaymentProviderConfigDto.
[ ] Crear EnableTenantPaymentProviderConfigDto.
[ ] Crear DisableTenantPaymentProviderConfigDto.
[ ] Crear TestTenantPaymentProviderConnectionDto.
[ ] Crear ArchiveTenantPaymentProviderConfigDto.
[ ] Crear TenantPaymentProviderConfigDto.
[ ] Crear TenantPaymentProviderConfigListItemDto.
[ ] Crear TenantPaymentProviderConfigFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar secret values en metadata.
[ ] No exponer secret values.
[ ] Exponer credentialSecretConfigured boolean.
[ ] Exponer webhookSecretConfigured boolean.
[ ] Crear DTO tests.
```

---

### 13.3. DTOs de payment intents

```text id="t6fy8v"
[ ] Crear CreatePaymentIntentDto.
[ ] Crear CreateOwnPaymentIntentDto.
[ ] Crear CancelPaymentIntentDto.
[ ] Crear ExpirePaymentIntentDto.
[ ] Crear PaymentIntentDto.
[ ] Crear OwnPaymentIntentDto.
[ ] Crear PaymentIntentListItemDto.
[ ] Crear PaymentIntentItemDto.
[ ] Crear PaymentIntentFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar amount arbitrario para cargos/saldos.
[ ] Rechazar status directo.
[ ] Rechazar confirmedPaymentId.
[ ] Rechazar providerTransactionId.
[ ] Rechazar card data.
[ ] Crear DTO tests.
```

---

### 13.4. DTOs de checkout sessions

```text id="gqez0j"
[ ] Crear CreatePaymentCheckoutSessionDto.
[ ] Crear PaymentCheckoutSessionDto.
[ ] Crear OwnPaymentCheckoutSessionDto.
[ ] Permitir providerCheckoutUrl solo en respuesta inmediata autorizada.
[ ] Excluir providerCheckoutUrl de listados.
[ ] Crear DTO tests.
```

---

### 13.5. DTOs de webhook events

```text id="elchns"
[ ] Crear ProviderWebhookEventDto.
[ ] Crear ProviderWebhookEventListItemDto.
[ ] Crear ProviderWebhookEventFilterDto.
[ ] Crear ReprocessProviderWebhookEventDto.
[ ] Crear ArchiveProviderWebhookEventDto.
[ ] Exponer payloadHashPrefix.
[ ] No exponer raw payload.
[ ] No exponer raw signature.
[ ] No exponer webhook secret.
[ ] Crear DTO tests.
```

---

### 13.6. DTOs de provider transactions

```text id="zrshti"
[ ] Crear ProviderTransactionDto.
[ ] Crear ProviderTransactionListItemDto.
[ ] Crear ProviderTransactionFilterDto.
[ ] Crear MarkProviderTransactionReviewRequiredDto.
[ ] Crear ArchiveProviderTransactionDto.
[ ] Permitir cardBrand.
[ ] Permitir cardLast4.
[ ] Permitir authorizationCodePreview.
[ ] Rechazar PAN.
[ ] Rechazar CVV.
[ ] Rechazar raw card data.
[ ] Crear DTO tests.
```

---

### 13.7. DTOs de mappings, settlements y reportes

```text id="yf0rv2"
[ ] Crear ProviderPaymentMappingDto.
[ ] Crear ProviderPaymentMappingListItemDto.
[ ] Crear ProviderPaymentMappingFilterDto.
[ ] Crear ReverseProviderPaymentMappingDto.
[ ] Crear ProviderSettlementRecordDto.
[ ] Crear ProviderSettlementRecordListItemDto.
[ ] Crear ProviderSettlementRecordFilterDto.
[ ] Crear LinkProviderSettlementToBankTransactionDto.
[ ] Crear ArchiveProviderSettlementDto.
[ ] Crear PaymentProviderSummaryReportDto.
[ ] Crear PaymentProviderTransactionsReportDto.
[ ] Crear PaymentProviderFailuresReportDto.
[ ] Crear PaymentProviderSettlementsReportDto.
[ ] Crear PaymentProviderReportExportDto.
[ ] Crear DTO tests.
```

---

## 14. Fase 10 — Mappers

```text id="rc20xe"
[ ] Crear PaymentProviderDefinitionMapper.
[ ] Crear TenantPaymentProviderConfigMapper.
[ ] Crear PaymentIntentMapper.
[ ] Crear PaymentIntentItemMapper.
[ ] Crear PaymentCheckoutSessionMapper.
[ ] Crear ProviderWebhookEventMapper.
[ ] Crear ProviderTransactionMapper.
[ ] Crear ProviderPaymentMappingMapper.
[ ] Crear ProviderSettlementRecordMapper.
[ ] Asegurar que ningún mapper expone secret values.
[ ] Asegurar que ningún mapper expone raw webhook payload.
[ ] Asegurar que ningún mapper expone raw signature.
[ ] Asegurar que ningún mapper expone PAN/CVV.
[ ] Asegurar que checkoutUrl solo aparece en respuesta inmediata autorizada.
[ ] Crear mapper tests.
```

---

## 15. Fase 11 — Provider adapters y registry

### 15.1. Adapter registry

```text id="tshv3l"
[ ] Crear PaymentProviderAdapterRegistry.
[ ] Implementar registerAdapter.
[ ] Implementar getAdapter(providerKey).
[ ] Implementar listSupportedProviders.
[ ] Rechazar providerKey no soportado.
[ ] No exponer secretos desde registry.
[ ] Crear tests.
```

---

### 15.2. Mock adapter

```text id="f6xk8l"
[ ] Crear MockPaymentProviderAdapter.
[ ] Implementar createCheckoutSession.
[ ] Implementar verifyWebhook.
[ ] Implementar parseWebhookEvent.
[ ] Implementar retrieveTransaction.
[ ] Implementar testConnection.
[ ] Generar providerSessionId sintético.
[ ] Generar checkoutUrl mock temporal.
[ ] Generar payloads sintéticos.
[ ] No generar datos reales de tarjeta.
[ ] Crear adapter tests.
```

---

### 15.3. Sandbox adapter

```text id="zqeb07"
[ ] Crear SandboxPaymentProviderAdapter.
[ ] Respetar environment=sandbox.
[ ] Bloquear cargos reales.
[ ] Manejar timeouts.
[ ] Manejar provider unavailable.
[ ] Transformar errores externos a errores internos.
[ ] No loggear payload completo.
[ ] Crear adapter tests.
```

---

### 15.4. Generic hosted checkout adapter

```text id="thgzsk"
[ ] Crear GenericHostedCheckoutProviderAdapter.
[ ] Requerir supportsHostedCheckout.
[ ] Crear sesión externa.
[ ] Validar returnUrl/cancelUrl permitidas.
[ ] Retornar providerSessionId si existe.
[ ] Retornar checkoutUrl temporal.
[ ] Manejar respuesta sin checkoutUrl.
[ ] Manejar error de proveedor.
[ ] No capturar tarjeta en RESIDENT.
[ ] Crear tests.
```

---

## 16. Fase 12 — Secret management

```text id="cq4al6"
[ ] Implementar PaymentProviderSecretService.
[ ] Implementar storeCredential.
[ ] Implementar updateCredential.
[ ] Implementar getCredential interno.
[ ] Implementar rotateCredential.
[ ] Implementar deleteCredential.
[ ] Convertir secretValue a SecretRef.
[ ] Persistir solo SecretRef.
[ ] No retornar secret value por API.
[ ] No loggear secret value.
[ ] No auditar secret value.
[ ] Crear SecretRef tests.
[ ] Crear service tests.
```

---

## 17. Fase 13 — Servicios platform y tenant config

### 17.1. Provider definitions

```text id="afvo8a"
[ ] Crear PaymentProviderDefinitionService.
[ ] Implementar createDefinition.
[ ] Implementar listDefinitions.
[ ] Implementar getDefinition.
[ ] Implementar updateDefinition.
[ ] Implementar activateDefinition.
[ ] Implementar deprecateDefinition.
[ ] Implementar archiveDefinition.
[ ] Validar providerKey único.
[ ] Rechazar metadata con secretos.
[ ] Auditar eventos.
[ ] Crear service tests.
```

---

### 17.2. Tenant provider config

```text id="mezvop"
[ ] Crear TenantPaymentProviderConfigService.
[ ] Implementar createConfig.
[ ] Implementar listConfigs.
[ ] Implementar getConfig.
[ ] Implementar updateConfig.
[ ] Implementar enableConfig.
[ ] Implementar disableConfig.
[ ] Implementar testConnection.
[ ] Implementar archiveConfig.
[ ] Validar providerDefinition active.
[ ] Validar settlementBankAccount tenant-scoped.
[ ] Validar SecretRefs mínimos.
[ ] Auditar eventos.
[ ] Crear service tests.
```

---

## 18. Fase 14 — PaymentIntent y cálculo de montos

### 18.1. Amount calculator

```text id="xo2092"
[ ] Crear PaymentIntentAmountService.
[ ] Calcular monto desde chargeIds.
[ ] Calcular monto desde account balance.
[ ] Calcular monto desde fine si integración activa.
[ ] Calcular monto desde reservation si integración activa.
[ ] Calcular manualItem solo para admin autorizado.
[ ] Rechazar amount arbitrario del cliente.
[ ] Usar Decimal.
[ ] Crear tests financieros.
```

---

### 18.2. PaymentIntent service

```text id="it4ryi"
[ ] Crear PaymentIntentService.
[ ] Implementar createPaymentIntent.
[ ] Implementar createOwnPaymentIntent.
[ ] Implementar listPaymentIntents.
[ ] Implementar listOwnPaymentIntents.
[ ] Implementar getPaymentIntent.
[ ] Implementar getOwnPaymentIntent.
[ ] Implementar cancelPaymentIntent.
[ ] Implementar cancelOwnPaymentIntent.
[ ] Implementar expirePaymentIntent.
[ ] Aplicar idempotencyKey.
[ ] Crear PaymentIntentItems en transacción.
[ ] Auditar paymentIntent.created/cancelled/expired.
[ ] Crear service tests.
```

---

### 18.3. Own resource resolution

```text id="b9l35l"
[ ] Resolver UserProfile -> Person.
[ ] Resolver unidades propias.
[ ] Validar propiedad/residencia autorizada.
[ ] Rechazar usuario sin persona vinculada.
[ ] Rechazar usuario sin unidad.
[ ] Rechazar unidad ajena.
[ ] Rechazar charge de unidad ajena.
[ ] Minimizar DTO own.
[ ] Crear own-resource tests.
```

---

## 19. Fase 15 — Checkout sessions

```text id="m3xszl"
[ ] Crear PaymentCheckoutSessionService.
[ ] Implementar createCheckoutSession.
[ ] Implementar createOwnCheckoutSession.
[ ] Validar PaymentIntent tenant-scoped.
[ ] Validar PaymentIntent own si aplica.
[ ] Validar estado created/checkoutCreated.
[ ] Rechazar succeeded/failed/cancelled/expired/archived.
[ ] Validar tenantProviderConfig enabled.
[ ] Invocar adapter correcto.
[ ] Persistir checkout session.
[ ] Actualizar PaymentIntent.checkoutCreated.
[ ] Devolver checkoutUrl temporal solo en respuesta inmediata.
[ ] Evitar checkoutUrl en logs/audit.
[ ] Auditar checkoutSession.created.
[ ] Crear checkout tests.
```

---

## 20. Fase 16 — Webhooks

### 20.1. Raw body handling

```text id="u65j94"
[ ] Configurar raw body para webhook endpoint.
[ ] Mantener compatibilidad con JSON parsing general.
[ ] Calcular payloadHash desde raw body.
[ ] Validar MAX_WEBHOOK_PAYLOAD_BYTES.
[ ] Crear tests de payload.
```

---

### 20.2. Signature verification

```text id="mtdni3"
[ ] Crear WebhookSignatureVerificationService.
[ ] Resolver providerKey.
[ ] Resolver tenantProviderConfig si es posible.
[ ] Obtener webhookSecret desde SecretPort.
[ ] Validar firma.
[ ] Validar timestamp.
[ ] Calcular signatureHeaderHash.
[ ] Rechazar firma ausente.
[ ] Rechazar firma inválida.
[ ] Rechazar timestamp expirado.
[ ] No loggear firma completa.
[ ] Crear tests de firma.
```

---

### 20.3. Replay protection e idempotencia

```text id="sowp3y"
[ ] Crear WebhookReplayProtectionService.
[ ] Detectar providerEventId repetido.
[ ] Detectar providerTransactionId repetido.
[ ] Detectar payloadHash repetido en ventana.
[ ] Responder 200 idempotente si ya fue procesado correctamente.
[ ] No crear Payment duplicado.
[ ] Auditar duplicate.
[ ] Crear tests de replay.
```

---

### 20.4. Webhook processing

```text id="fvixoc"
[ ] Crear PaymentProviderWebhookService.
[ ] Implementar receiveWebhook.
[ ] Crear ProviderWebhookEvent received.
[ ] Validar firma antes de efectos financieros.
[ ] Parsear evento con adapter.
[ ] Marcar processing.
[ ] Procesar payment.succeeded.
[ ] Procesar payment.captured.
[ ] Procesar payment.failed.
[ ] Procesar payment.cancelled.
[ ] Procesar payment.expired.
[ ] Procesar payment.refunded como requiresReview.
[ ] Procesar payment.chargeback como requiresReview.
[ ] Marcar processed/failed/rejected/duplicate.
[ ] Auditar eventos.
[ ] Crear webhook service tests.
```

---

## 21. Fase 17 — ProviderTransaction y status mapping

```text id="x9i1d4"
[ ] Crear ProviderStatusMapper.
[ ] Mapear succeeded/captured a estado exitoso.
[ ] Mapear failed/cancelled/expired.
[ ] Mapear refunded/partiallyRefunded/chargeback a requiresReview.
[ ] Crear ProviderTransactionService.
[ ] Crear ProviderTransaction desde webhook verificado.
[ ] Validar providerTransactionId único.
[ ] Validar amount.
[ ] Validar currency.
[ ] Validar cardLast4.
[ ] Bloquear PAN/CVV/raw card data.
[ ] Marcar requiresReview por amount mismatch.
[ ] Marcar requiresReview por currency mismatch.
[ ] Crear service tests.
```

---

## 22. Fase 18 — Creación de Payment interno

### 22.1. PaymentsIntegrationPort

```text id="xz584t"
[ ] Crear PaymentsIntegrationPort.
[ ] Implementar createPaymentFromProvider.
[ ] Implementar allocateProviderPayment.
[ ] Implementar getPaymentForProviderMapping.
[ ] Implementar reverseProviderLinkedPayment futuro/controlado.
[ ] Validar tenantId en Payments.
[ ] Validar Payment no duplicado.
[ ] Crear integration tests.
```

---

### 22.2. PaymentCreationFromProviderService

```text id="im7lmb"
[ ] Crear PaymentCreationFromProviderService.
[ ] Validar webhook verified.
[ ] Validar providerStatus succeeded/captured.
[ ] Validar PaymentIntent tenant-scoped.
[ ] Validar PaymentIntent no succeeded previamente.
[ ] Validar amount coincide.
[ ] Validar currency coincide.
[ ] Validar providerTransactionId no usado.
[ ] Validar items siguen pagables.
[ ] Crear Payment interno mediante PaymentsIntegrationPort.
[ ] Crear PaymentAllocation si corresponde.
[ ] Crear ProviderPaymentMapping.
[ ] Actualizar PaymentIntent=succeeded.
[ ] Auditar payment.createdFromProvider.
[ ] Crear financial integrity tests.
```

---

### 22.3. No creación de Payment

```text id="i27pb9"
[ ] No crear Payment con webhook sin firma.
[ ] No crear Payment con firma inválida.
[ ] No crear Payment desde redirect del navegador.
[ ] No crear Payment con failed.
[ ] No crear Payment con cancelled.
[ ] No crear Payment con expired.
[ ] No crear Payment con unknown.
[ ] No crear Payment con amount mismatch.
[ ] No crear Payment con currency mismatch.
[ ] No crear Payment con PaymentIntent tenant B.
[ ] No crear Payment duplicado por webhook repetido.
[ ] Crear security tests.
```

---

## 23. Fase 19 — ProviderPaymentMapping

```text id="bshbyu"
[ ] Crear ProviderPaymentMappingService.
[ ] Implementar createMapping.
[ ] Validar ProviderTransaction tenant-scoped.
[ ] Validar Payment tenant-scoped.
[ ] Validar PaymentIntent tenant-scoped.
[ ] Evitar dos mappings activos por transaction.
[ ] Evitar dos mappings activos por Payment.
[ ] Implementar reverseMapping.
[ ] Requerir reverseReason.
[ ] No eliminar Payment.
[ ] No eliminar ProviderTransaction.
[ ] Auditar providerPaymentMapping.created.
[ ] Auditar providerPaymentMapping.reversed.
[ ] Crear mapping tests.
```

---

## 24. Fase 20 — ProviderSettlementRecord

```text id="zv974i"
[ ] Crear ProviderSettlementService.
[ ] Implementar createSettlement.
[ ] Implementar listSettlements.
[ ] Implementar getSettlement.
[ ] Implementar markSettled.
[ ] Implementar markFailed.
[ ] Implementar linkBankTransaction.
[ ] Implementar archiveSettlement.
[ ] Validar bankAccount tenant-scoped.
[ ] Validar bankTransaction tenant-scoped.
[ ] Rechazar bankTransaction tenant B.
[ ] No marcar conciliación bancaria final.
[ ] Auditar providerSettlement.created.
[ ] Auditar providerSettlement.linkedToBankTransaction.
[ ] Crear settlement tests.
```

---

## 25. Fase 21 — Integraciones externas internas

### 25.1. Account Statements

```text id="iswscj"
[ ] Crear AccountStatementsIntegrationPort.
[ ] Validar que Payment interno actualiza estado de cuenta.
[ ] Verificar que ProviderTransaction no modifica saldos directamente.
[ ] Crear integration tests.
```

---

### 25.2. Dues/Fees

```text id="r15vt2"
[ ] Crear DuesFeesIntegrationPort si no existe.
[ ] Validar cargos pendientes.
[ ] Validar cargos parcialmente pagados.
[ ] Rechazar cargos pagados.
[ ] Rechazar cargos cancelled/reversed/archived.
[ ] Rechazar cargos tenant B.
[ ] Calcular saldo pendiente.
[ ] Crear integration tests.
```

---

### 25.3. Residents/Properties

```text id="of2q8e"
[ ] Crear ResidentsPropertiesIntegrationPort si no existe.
[ ] Resolver persona por usuario.
[ ] Resolver unidades propias.
[ ] Validar propiedad/residencia vigente.
[ ] Rechazar unidad ajena.
[ ] Crear integration tests.
```

---

### 25.4. Secure Document Storage

```text id="pv8gha"
[ ] Agregar sourceModule=paymentProviderIntegration.
[ ] Crear PaymentProviderSecureDocumentAdapter.
[ ] Guardar comprobante provider si aplica.
[ ] Guardar export de reportes si aplica.
[ ] Configurar visibility owners para comprobantes propios.
[ ] Configurar visibility administrative para reportes.
[ ] Configurar sensitivity confidential/restricted.
[ ] No exponer storageKey.
[ ] Crear integration tests.
```

---

### 25.5. Bank Reconciliation

```text id="srx6g3"
[ ] Crear BankReconciliationIntegrationPort.
[ ] Marcar Payment provider-verified como disponible para conciliación.
[ ] Exponer datos mínimos para conciliación.
[ ] Permitir vínculo settlement -> BankTransaction.
[ ] No marcar conciliación bancaria final desde provider.
[ ] Crear integration tests.
```

---

### 25.6. Notifications

```text id="k2dp37"
[ ] Crear NotificationsIntegrationPort.
[ ] Notificar payment succeeded si policy activa.
[ ] Notificar payment failed si policy activa.
[ ] Notificar requiresReview a financieros si policy activa.
[ ] No enviar secretos.
[ ] No enviar raw payload.
[ ] No enviar PAN/CVV.
[ ] No enviar checkoutUrl por canal inseguro salvo política explícita.
[ ] Crear integration tests.
```

---

## 26. Fase 22 — Reportes

### 26.1. Summary report

```text id="gh51mf"
[ ] Crear PaymentProviderReportService.
[ ] Implementar summary report.
[ ] Calcular paymentIntentsCreated.
[ ] Calcular paymentIntentsSucceeded.
[ ] Calcular paymentIntentsFailed.
[ ] Calcular paymentIntentsCancelled.
[ ] Calcular grossAmount.
[ ] Calcular feeAmount.
[ ] Calcular netAmount.
[ ] Calcular paymentsCreated.
[ ] Calcular webhooksReceived.
[ ] Calcular webhooksRejected.
[ ] Calcular requiresReviewCount.
[ ] Filtrar por providerKey/environment/periodo.
[ ] Crear report tests.
```

---

### 26.2. Transactions report

```text id="zp4xut"
[ ] Implementar transactions report.
[ ] Filtrar por providerStatus.
[ ] Filtrar por internalStatus.
[ ] Filtrar por paymentMethodType.
[ ] Filtrar por periodo.
[ ] No exponer raw payload.
[ ] No exponer PAN/CVV.
[ ] No exponer checkoutUrl.
[ ] Crear tests.
```

---

### 26.3. Failures report

```text id="hzr044"
[ ] Implementar failures report.
[ ] Incluir webhook failed.
[ ] Incluir amount mismatch.
[ ] Incluir currency mismatch.
[ ] Incluir signature rejected sin detalle sensible.
[ ] Mostrar retryCount.
[ ] Filtrar por errorCode.
[ ] Crear tests.
```

---

### 26.4. Settlements report

```text id="uksc98"
[ ] Implementar settlements report.
[ ] Listar pending.
[ ] Listar settled.
[ ] Listar failed.
[ ] Listar linked.
[ ] Filtrar por bankAccountId.
[ ] Filtrar por settlementDate.
[ ] No marcar conciliación final.
[ ] Crear tests.
```

---

### 26.5. Export

```text id="c2qz9d"
[ ] Implementar export CSV.
[ ] Implementar export XLSX.
[ ] Implementar export PDF si está habilitado.
[ ] Persistir export en Secure Document Storage si aplica.
[ ] No exponer storageKey.
[ ] No incluir secretos.
[ ] No incluir raw payloads.
[ ] No incluir checkoutUrl.
[ ] Auditar paymentProviderReport.exported.
[ ] Crear tests.
```

---

## 27. Fase 23 — Controladores REST

### 27.1. PlatformPaymentProviderDefinitionsController

```text id="y8jmdm"
[ ] Implementar GET /api/v1/platform/payment-provider-definitions.
[ ] Implementar POST /api/v1/platform/payment-provider-definitions.
[ ] Implementar GET /api/v1/platform/payment-provider-definitions/{providerDefinitionId}.
[ ] Implementar PATCH /api/v1/platform/payment-provider-definitions/{providerDefinitionId}.
[ ] Implementar POST /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/activate.
[ ] Implementar POST /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/deprecate.
[ ] Implementar POST /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/archive.
[ ] Crear API tests.
```

---

### 27.2. TenantPaymentProvidersController

```text id="mx5sct"
[ ] Implementar GET /api/v1/tenant/payment-providers.
[ ] Implementar POST /api/v1/tenant/payment-providers.
[ ] Implementar GET /api/v1/tenant/payment-providers/{tenantProviderConfigId}.
[ ] Implementar PATCH /api/v1/tenant/payment-providers/{tenantProviderConfigId}.
[ ] Implementar POST /api/v1/tenant/payment-providers/{tenantProviderConfigId}/enable.
[ ] Implementar POST /api/v1/tenant/payment-providers/{tenantProviderConfigId}/disable.
[ ] Implementar POST /api/v1/tenant/payment-providers/{tenantProviderConfigId}/test-connection.
[ ] Implementar POST /api/v1/tenant/payment-providers/{tenantProviderConfigId}/archive.
[ ] Crear API tests.
```

---

### 27.3. TenantPaymentIntentsController

```text id="yuif9z"
[ ] Implementar GET /api/v1/tenant/payment-intents.
[ ] Implementar POST /api/v1/tenant/payment-intents.
[ ] Implementar GET /api/v1/tenant/payment-intents/{paymentIntentId}.
[ ] Implementar POST /api/v1/tenant/payment-intents/{paymentIntentId}/checkout-sessions.
[ ] Implementar POST /api/v1/tenant/payment-intents/{paymentIntentId}/cancel.
[ ] Implementar POST /api/v1/tenant/payment-intents/{paymentIntentId}/expire.
[ ] Crear API tests.
```

---

### 27.4. MyPaymentIntentsController

```text id="ickta5"
[ ] Implementar GET /api/v1/me/payment-intents.
[ ] Implementar POST /api/v1/me/payment-intents.
[ ] Implementar GET /api/v1/me/payment-intents/{paymentIntentId}.
[ ] Implementar POST /api/v1/me/payment-intents/{paymentIntentId}/checkout-sessions.
[ ] Implementar POST /api/v1/me/payment-intents/{paymentIntentId}/cancel.
[ ] Crear API tests.
```

---

### 27.5. PaymentProviderWebhooksController

```text id="rouo8v"
[ ] Implementar POST /api/v1/webhooks/payment-providers/{providerKey}.
[ ] Configurar raw body.
[ ] Validar firma.
[ ] Validar timestamp.
[ ] Procesar idempotentemente.
[ ] Responder duplicate de forma segura.
[ ] Rechazar firma inválida.
[ ] Crear API tests.
```

---

### 27.6. Admin controllers

```text id="yfv9mf"
[ ] Implementar GET /api/v1/tenant/payment-provider-webhook-events.
[ ] Implementar GET /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}.
[ ] Implementar POST /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}/reprocess.
[ ] Implementar POST /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}/archive.
[ ] Implementar GET /api/v1/tenant/provider-transactions.
[ ] Implementar GET /api/v1/tenant/provider-transactions/{providerTransactionId}.
[ ] Implementar POST /api/v1/tenant/provider-transactions/{providerTransactionId}/mark-review-required.
[ ] Implementar POST /api/v1/tenant/provider-transactions/{providerTransactionId}/archive.
[ ] Implementar GET /api/v1/tenant/provider-payment-mappings.
[ ] Implementar GET /api/v1/tenant/provider-payment-mappings/{mappingId}.
[ ] Implementar POST /api/v1/tenant/provider-payment-mappings/{mappingId}/reverse.
[ ] Implementar GET /api/v1/tenant/provider-settlements.
[ ] Implementar GET /api/v1/tenant/provider-settlements/{settlementId}.
[ ] Implementar POST /api/v1/tenant/provider-settlements/{settlementId}/link-bank-transaction.
[ ] Implementar POST /api/v1/tenant/provider-settlements/{settlementId}/archive.
[ ] Crear API tests.
```

---

### 27.7. Reports controller

```text id="z92exi"
[ ] Implementar GET /api/v1/tenant/payment-provider-reports/summary.
[ ] Implementar GET /api/v1/tenant/payment-provider-reports/transactions.
[ ] Implementar GET /api/v1/tenant/payment-provider-reports/failures.
[ ] Implementar GET /api/v1/tenant/payment-provider-reports/settlements.
[ ] Implementar GET /api/v1/tenant/payment-provider-reports/export.
[ ] Crear API tests.
```

---

## 28. Fase 24 — Guards y policies

### 28.1. Guards

```text id="mq7k7z"
[ ] Implementar PaymentProviderPermissionGuard.
[ ] Implementar PlatformPaymentProviderGuard.
[ ] Implementar TenantPaymentProviderGuard.
[ ] Implementar PaymentIntentTenantGuard.
[ ] Implementar PaymentIntentOwnResourceGuard.
[ ] Implementar PaymentCheckoutSessionGuard.
[ ] Implementar ProviderWebhookSignatureGuard.
[ ] Implementar ProviderWebhookReplayGuard.
[ ] Implementar ProviderTransactionTenantGuard.
[ ] Implementar ProviderPaymentMappingTenantGuard.
[ ] Implementar ProviderSettlementTenantGuard.
[ ] Implementar PaymentProviderReportGuard.
```

---

### 28.2. Policies

```text id="o0awls"
[ ] Implementar ProviderDefinitionStatePolicy.
[ ] Implementar TenantProviderConfigStatePolicy.
[ ] Implementar PaymentProviderSecretPolicy.
[ ] Implementar PaymentIntentAmountPolicy.
[ ] Implementar PaymentIntentItemPolicy.
[ ] Implementar PaymentIntentStatePolicy.
[ ] Implementar PaymentIntentExpirationPolicy.
[ ] Implementar PaymentIntentOwnershipPolicy.
[ ] Implementar CheckoutSessionPolicy.
[ ] Implementar CheckoutUrlSafetyPolicy.
[ ] Implementar WebhookSignaturePolicy.
[ ] Implementar WebhookReplayProtectionPolicy.
[ ] Implementar WebhookIdempotencyPolicy.
[ ] Implementar WebhookProcessingPolicy.
[ ] Implementar ProviderTransactionUniquenessPolicy.
[ ] Implementar ProviderTransactionStatusPolicy.
[ ] Implementar PaymentCreationFromProviderPolicy.
[ ] Implementar PaymentAllocationFromProviderPolicy.
[ ] Implementar ProviderPaymentMappingPolicy.
[ ] Implementar ProviderSettlementPolicy.
[ ] Implementar NoCardDataPolicy.
[ ] Implementar NoSecretExposurePolicy.
[ ] Implementar NoPublicPaymentEndpointPolicy.
[ ] Implementar NoExternalAiPaymentDataPolicy.
[ ] Implementar AuditSanitizationPolicy.
```

---

## 29. Fase 25 — Auditoría

### 29.1. Eventos platform y config

```text id="z856ss"
[ ] Emitir paymentProviderDefinition.created.
[ ] Emitir paymentProviderDefinition.updated.
[ ] Emitir paymentProviderDefinition.activated.
[ ] Emitir paymentProviderDefinition.deprecated.
[ ] Emitir paymentProviderDefinition.archived.
[ ] Emitir tenantPaymentProviderConfig.created.
[ ] Emitir tenantPaymentProviderConfig.updated.
[ ] Emitir tenantPaymentProviderConfig.enabled.
[ ] Emitir tenantPaymentProviderConfig.disabled.
[ ] Emitir tenantPaymentProviderConfig.tested.
[ ] Emitir tenantPaymentProviderConfig.invalidated.
[ ] Emitir tenantPaymentProviderConfig.archived.
```

---

### 29.2. Eventos de pago y proveedor

```text id="v6k0tc"
[ ] Emitir paymentIntent.created.
[ ] Emitir paymentIntent.checkoutCreated.
[ ] Emitir paymentIntent.cancelled.
[ ] Emitir paymentIntent.expired.
[ ] Emitir paymentIntent.succeeded.
[ ] Emitir paymentIntent.failed.
[ ] Emitir paymentCheckoutSession.created.
[ ] Emitir paymentCheckoutSession.opened.
[ ] Emitir paymentCheckoutSession.completed.
[ ] Emitir paymentCheckoutSession.cancelled.
[ ] Emitir paymentCheckoutSession.expired.
[ ] Emitir providerWebhook.received.
[ ] Emitir providerWebhook.verified.
[ ] Emitir providerWebhook.rejected.
[ ] Emitir providerWebhook.duplicate.
[ ] Emitir providerWebhook.processed.
[ ] Emitir providerWebhook.failed.
[ ] Emitir providerWebhook.reprocessed.
[ ] Emitir providerWebhook.archived.
[ ] Emitir providerTransaction.created.
[ ] Emitir providerTransaction.updated.
[ ] Emitir providerTransaction.succeeded.
[ ] Emitir providerTransaction.failed.
[ ] Emitir providerTransaction.requiresReview.
[ ] Emitir providerTransaction.archived.
[ ] Emitir payment.createdFromProvider.
[ ] Emitir providerPaymentMapping.created.
[ ] Emitir providerPaymentMapping.reversed.
[ ] Emitir providerSettlement.created.
[ ] Emitir providerSettlement.linkedToBankTransaction.
[ ] Emitir paymentProviderReport.exported.
```

---

### 29.3. Sanitización de auditoría

```text id="j9s3rw"
[ ] No auditar PAN.
[ ] No auditar CVV.
[ ] No auditar raw card data.
[ ] No auditar provider secret.
[ ] No auditar webhook secret.
[ ] No auditar credentialSecret value.
[ ] No auditar webhookSecret value.
[ ] No auditar full webhook payload.
[ ] No auditar full signature.
[ ] No auditar checkoutUrl.
[ ] No auditar storageKey.
[ ] No auditar signedUrl.
[ ] No auditar Authorization header.
[ ] No auditar cookies.
[ ] No auditar tokens.
[ ] No auditar SQL raw.
[ ] No auditar stack trace.
[ ] Crear audit tests.
```

---

## 30. Fase 26 — Observabilidad

### 30.1. Logs seguros

```text id="nevijm"
[ ] Registrar paymentIntent.created.
[ ] Registrar checkoutSession.created.
[ ] Registrar providerWebhook.received.
[ ] Registrar providerWebhook.verified.
[ ] Registrar providerWebhook.rejected.
[ ] Registrar providerWebhook.duplicate.
[ ] Registrar providerWebhook.failed.
[ ] Registrar providerTransaction.succeeded.
[ ] Registrar providerTransaction.failed.
[ ] Registrar payment.createdFromProvider.
[ ] Registrar paymentProviderReport.exported.
[ ] Incluir traceId.
[ ] Incluir action.
[ ] Incluir outcome.
[ ] Incluir durationMs.
[ ] No incluir checkoutUrl.
[ ] No incluir raw payload.
[ ] No incluir raw signature.
[ ] No incluir secretos.
[ ] No incluir PAN/CVV.
```

---

### 30.2. Métricas

```text id="mt80hb"
[ ] Crear payment_provider_configs_total.
[ ] Crear payment_intents_created_total.
[ ] Crear payment_intents_succeeded_total.
[ ] Crear payment_intents_failed_total.
[ ] Crear checkout_sessions_created_total.
[ ] Crear provider_webhooks_received_total.
[ ] Crear provider_webhooks_verified_total.
[ ] Crear provider_webhooks_rejected_total.
[ ] Crear provider_webhooks_duplicate_total.
[ ] Crear provider_transactions_succeeded_total.
[ ] Crear provider_transactions_failed_total.
[ ] Crear payments_created_from_provider_total.
[ ] Crear payment_provider_processing_errors_total.
[ ] Crear payment_provider_reprocess_attempts_total.
```

---

### 30.3. Labels

```text id="gwte8m"
[ ] Permitir label providerKey.
[ ] Permitir label environment.
[ ] Permitir label status.
[ ] Permitir label internalStatus.
[ ] Permitir label eventType.
[ ] Permitir label signatureStatus.
[ ] Permitir label processingStatus.
[ ] Permitir label paymentMethodType.
[ ] Permitir label currency.
[ ] Permitir label outcome.
[ ] Prohibir tenantId como label.
[ ] Prohibir userId como label.
[ ] Prohibir personId como label.
[ ] Prohibir propertyUnitId como label.
[ ] Prohibir paymentIntentId como label.
[ ] Prohibir providerTransactionId como label.
[ ] Prohibir providerEventId como label.
[ ] Prohibir paymentId como label.
[ ] Prohibir credentialSecretRef como label.
[ ] Prohibir webhookSecretRef como label.
[ ] Prohibir checkoutUrl como label.
[ ] Prohibir cardLast4 como label.
[ ] Prohibir authorizationCode como label.
[ ] Prohibir traceId como label.
[ ] Crear observability tests.
```

---

## 31. Fase 27 — OpenAPI

```text id="aa3iet"
[ ] Agregar tag Payment Provider Definitions.
[ ] Agregar tag Tenant Payment Providers.
[ ] Agregar tag Payment Intents.
[ ] Agregar tag My Payment Intents.
[ ] Agregar tag Payment Checkout Sessions.
[ ] Agregar tag Payment Provider Webhooks.
[ ] Agregar tag Provider Transactions.
[ ] Agregar tag Provider Payment Mappings.
[ ] Agregar tag Provider Settlements.
[ ] Agregar tag Payment Provider Reports.
[ ] Documentar DTOs.
[ ] Documentar errores.
[ ] Documentar permisos.
[ ] Agregar x-platform-scope en platform endpoints.
[ ] Agregar x-tenant-scope en tenant endpoints.
[ ] Agregar x-own-resource en own endpoints.
[ ] Agregar x-webhook-endpoint en webhook endpoint.
[ ] Agregar x-provider-signature-required.
[ ] Agregar x-idempotent-processing.
[ ] Agregar x-hosted-checkout.
[ ] Agregar x-checkout-url-temporary.
[ ] Agregar x-card-data-stored=false.
[ ] Agregar x-secrets-exposed=false.
[ ] Verificar que no documenta endpoints públicos administrativos.
[ ] Verificar que examples no contienen secretos reales.
[ ] Ejecutar openapi:validate.
```

---

## 32. Fase 28 — Tests automatizados

### 32.1. Unit/domain/value tests

```text id="igoy4v"
[ ] Implementar ProviderKey tests.
[ ] Implementar ProviderEnvironment tests.
[ ] Implementar SecretRef tests.
[ ] Implementar MoneyDecimal tests.
[ ] Implementar PaymentIntentExpiration tests.
[ ] Implementar CheckoutUrl tests.
[ ] Implementar WebhookSignature tests.
[ ] Implementar WebhookPayloadHash tests.
[ ] Implementar ProviderTransactionId tests.
[ ] Implementar CardLast4 tests.
[ ] Implementar entity tests.
[ ] Implementar state machine tests.
```

---

### 32.2. Repository tests

```text id="ttls5f"
[ ] Implementar PaymentProviderDefinition repository tests.
[ ] Implementar TenantPaymentProviderConfig repository tests.
[ ] Implementar PaymentIntent repository tests.
[ ] Implementar PaymentIntentItem repository tests.
[ ] Implementar PaymentCheckoutSession repository tests.
[ ] Implementar ProviderWebhookEvent repository tests.
[ ] Implementar ProviderTransaction repository tests.
[ ] Implementar ProviderPaymentMapping repository tests.
[ ] Implementar ProviderSettlement repository tests.
```

---

### 32.3. Service tests

```text id="jb0njv"
[ ] Implementar PaymentProviderDefinitionService tests.
[ ] Implementar TenantPaymentProviderConfigService tests.
[ ] Implementar PaymentProviderSecretService tests.
[ ] Implementar PaymentIntentAmountService tests.
[ ] Implementar PaymentIntentService tests.
[ ] Implementar OwnPaymentIntentService tests.
[ ] Implementar PaymentCheckoutSessionService tests.
[ ] Implementar WebhookSignatureVerificationService tests.
[ ] Implementar WebhookReplayProtectionService tests.
[ ] Implementar WebhookProcessingService tests.
[ ] Implementar ProviderTransactionService tests.
[ ] Implementar PaymentCreationFromProviderService tests.
[ ] Implementar ProviderPaymentMappingService tests.
[ ] Implementar ProviderSettlementService tests.
[ ] Implementar PaymentProviderReportService tests.
```

---

### 32.4. Integration tests

```text id="m7v9j1"
[ ] Implementar Payments integration tests.
[ ] Implementar Account Statements integration tests.
[ ] Implementar Dues/Fees integration tests.
[ ] Implementar Residents/Properties integration tests.
[ ] Implementar Secure Document Storage integration tests.
[ ] Implementar Bank Reconciliation integration tests.
[ ] Implementar Notifications integration tests.
[ ] Implementar Audit integration tests.
```

---

### 32.5. API/security/performance tests

```text id="f07tw7"
[ ] Implementar Platform API tests.
[ ] Implementar Tenant Provider API tests.
[ ] Implementar Tenant Payment Intent API tests.
[ ] Implementar Own Payment Intent API tests.
[ ] Implementar Webhook API tests.
[ ] Implementar Webhook Events API tests.
[ ] Implementar Provider Transactions API tests.
[ ] Implementar Provider Mappings API tests.
[ ] Implementar Provider Settlements API tests.
[ ] Implementar Reports API tests.
[ ] Implementar authorization tests.
[ ] Implementar own-resource tests.
[ ] Implementar multitenancy tests.
[ ] Implementar financial integrity tests.
[ ] Implementar no-card-data tests.
[ ] Implementar no-secret-exposure tests.
[ ] Implementar no-public-endpoint tests.
[ ] Implementar audit tests.
[ ] Implementar observability tests.
[ ] Implementar OpenAPI tests.
[ ] Implementar performance tests.
[ ] Implementar concurrency tests.
[ ] Implementar smoke tests.
```

---

## 33. Fase 29 — Seeds y fixtures

### 33.1. Seeds

```text id="m7zq46"
[ ] Crear paymentProviderDefinitionMock.
[ ] Crear paymentProviderDefinitionSandbox.
[ ] Crear paymentProviderDefinitionDeprecated.
[ ] Crear paymentProviderDefinitionArchived.
[ ] Crear tenantPaymentProviderConfigEnabledA.
[ ] Crear tenantPaymentProviderConfigDraftA.
[ ] Crear tenantPaymentProviderConfigDisabledA.
[ ] Crear tenantPaymentProviderConfigInvalidA.
[ ] Crear tenantPaymentProviderConfigArchivedA.
[ ] Crear tenantPaymentProviderConfigTenantB.
[ ] Crear paymentIntentCreatedA.
[ ] Crear paymentIntentCheckoutCreatedA.
[ ] Crear paymentIntentSucceededA.
[ ] Crear paymentIntentFailedA.
[ ] Crear paymentIntentExpiredA.
[ ] Crear paymentIntentCancelledA.
[ ] Crear paymentIntentTenantB.
[ ] Crear providerWebhookEventVerifiedA.
[ ] Crear providerWebhookEventInvalidSignatureA.
[ ] Crear providerWebhookEventDuplicateA.
[ ] Crear providerTransactionSucceededA.
[ ] Crear providerTransactionFailedA.
[ ] Crear providerTransactionRequiresReviewA.
[ ] Crear providerPaymentMappingActiveA.
[ ] Crear providerSettlementPendingA.
[ ] Crear providerSettlementSettledA.
```

---

### 33.2. Fixtures de webhook

```text id="qk4o6a"
[ ] Crear payload mock payment.succeeded.
[ ] Crear payload mock payment.captured.
[ ] Crear payload mock payment.failed.
[ ] Crear payload mock payment.cancelled.
[ ] Crear payload mock payment.expired.
[ ] Crear payload mock payment.refunded.
[ ] Crear payload mock payment.chargeback.
[ ] Crear payload con amount mismatch.
[ ] Crear payload con currency mismatch.
[ ] Crear payload sin providerTransactionId.
[ ] Crear payload sin providerEventId.
[ ] Crear payload malformed.
[ ] Crear payload oversized sintético.
[ ] Crear firma válida sintética.
[ ] Crear firma inválida sintética.
[ ] Crear timestamp expirado.
```

---

### 33.3. Datos prohibidos

```text id="bsqcry"
[ ] Verificar que seeds no contienen PAN real.
[ ] Verificar que seeds no contienen CVV.
[ ] Verificar que seeds no contienen API keys reales.
[ ] Verificar que seeds no contienen webhook secrets reales.
[ ] Verificar que fixtures no contienen payloads reales.
[ ] Verificar que fixtures no contienen checkoutUrls reales.
[ ] Verificar que fixtures no contienen datos financieros reales.
[ ] Verificar que fixtures no contienen datos personales reales.
[ ] Verificar que fixtures no contienen tokens.
[ ] Verificar que fixtures no contienen storageKeys reales.
```

---

## 34. Fase 30 — Regresión de módulos dependientes

### 34.1. Payments

```text id="xztj1z"
[ ] Ejecutar regresión de pagos manuales.
[ ] Ejecutar regresión de validación de pagos.
[ ] Ejecutar regresión de allocations.
[ ] Ejecutar regresión de reversos.
[ ] Ejecutar regresión de receipts.
[ ] Verificar que paymentSource opcional no rompe pagos previos.
[ ] Verificar que provider fields opcionales no rompen endpoints existentes.
```

---

### 34.2. Account Statements

```text id="p7ux4q"
[ ] Verificar que saldos se derivan desde cargos/pagos.
[ ] Verificar que ProviderTransaction no altera balances.
[ ] Verificar que Payment provider sí altera balance por Payment interno.
[ ] Verificar que webhook duplicado no duplica balance.
```

---

### 34.3. Dues/Fees

```text id="yrhdnz"
[ ] Verificar generación de cargos.
[ ] Verificar consulta de cargos.
[ ] Verificar cargos pagados no pagables.
[ ] Verificar cargos anulados no pagables.
[ ] Verificar cargos reversados no pagables.
[ ] Verificar cargos archived no pagables.
```

---

### 34.4. Secure Document Storage

```text id="kyltnw"
[ ] Verificar que sourceModule paymentProviderIntegration funciona.
[ ] Verificar que otros sourceModule siguen funcionando.
[ ] Verificar que storageKey sigue oculto.
[ ] Verificar downloads auditados.
```

---

### 34.5. Bank Reconciliation

```text id="ryrhwi"
[ ] Verificar que pagos provider-verified pueden listarse como conciliables.
[ ] Verificar que settlement link no marca conciliación final.
[ ] Verificar que matches bancarios existentes no se rompen.
[ ] Verificar Payment reconciliationStatus consistente.
```

---

## 35. Fase 31 — CI/CD

```text id="m33f2n"
[ ] Agregar npm run test:payment-provider-integration.
[ ] Agregar npm run test:payment-provider-integration:unit.
[ ] Agregar npm run test:payment-provider-integration:domain.
[ ] Agregar npm run test:payment-provider-integration:value-objects.
[ ] Agregar npm run test:payment-provider-integration:state-machines.
[ ] Agregar npm run test:payment-provider-integration:repositories.
[ ] Agregar npm run test:payment-provider-integration:services.
[ ] Agregar npm run test:payment-provider-integration:adapters.
[ ] Agregar npm run test:payment-provider-integration:secrets.
[ ] Agregar npm run test:payment-provider-integration:checkout.
[ ] Agregar npm run test:payment-provider-integration:webhooks.
[ ] Agregar npm run test:payment-provider-integration:idempotency.
[ ] Agregar npm run test:payment-provider-integration:payments.
[ ] Agregar npm run test:payment-provider-integration:reports.
[ ] Agregar npm run test:payment-provider-integration:api.
[ ] Agregar npm run test:payment-provider-integration:authorization.
[ ] Agregar npm run test:payment-provider-integration:own-resource.
[ ] Agregar npm run test:payment-provider-integration:multitenancy.
[ ] Agregar npm run test:payment-provider-integration:financial-integrity.
[ ] Agregar npm run test:payment-provider-integration:audit.
[ ] Agregar npm run test:payment-provider-integration:observability.
[ ] Agregar npm run test:payment-provider-integration:openapi.
[ ] Agregar npm run test:payment-provider-integration:security.
[ ] Agregar npm run test:payment-provider-integration:performance.
[ ] Agregar npm run test:payment-provider-integration:concurrency.
[ ] Agregar npm run test:payment-provider-integration:smoke.
[ ] Integrar comandos en GitHub Actions.
[ ] Hacer fallar CI si OpenAPI documenta endpoints públicos administrativos.
[ ] Hacer fallar CI si snapshots contienen secretos.
[ ] Hacer fallar CI si snapshots contienen PAN/CVV.
[ ] Hacer fallar CI si snapshots contienen raw payload.
[ ] Hacer fallar CI si logs contienen checkoutUrl.
[ ] Hacer fallar CI si se detecta uso de float/double para dinero.
[ ] Hacer fallar CI si webhook inválido crea Payment.
[ ] Hacer fallar CI si webhook duplicado crea Payment duplicado.
[ ] Hacer fallar CI si external AI se activa por defecto.
```

---

## 36. Fase 32 — Hardening final

```text id="h95884"
[ ] Ejecutar lint.
[ ] Ejecutar typecheck.
[ ] Ejecutar unit tests.
[ ] Ejecutar domain tests.
[ ] Ejecutar repository tests.
[ ] Ejecutar service tests.
[ ] Ejecutar adapter tests.
[ ] Ejecutar webhook tests.
[ ] Ejecutar idempotency tests.
[ ] Ejecutar integration tests.
[ ] Ejecutar API tests.
[ ] Ejecutar authorization tests.
[ ] Ejecutar own-resource tests.
[ ] Ejecutar multitenancy tests.
[ ] Ejecutar financial integrity tests.
[ ] Ejecutar security tests.
[ ] Ejecutar audit tests.
[ ] Ejecutar observability tests.
[ ] Ejecutar OpenAPI tests.
[ ] Ejecutar performance tests.
[ ] Ejecutar concurrency tests.
[ ] Ejecutar regression tests.
[ ] Ejecutar smoke tests.
[ ] Ejecutar openapi:validate.
[ ] Verificar que no hay endpoints públicos administrativos.
[ ] Verificar que no hay PAN/CVV/raw card data.
[ ] Verificar que no hay secret values en responses.
[ ] Verificar que no hay raw webhook payload en logs.
[ ] Verificar que no hay checkoutUrl en logs.
[ ] Verificar que Payment no se crea desde redirect.
[ ] Verificar que Payment no se crea sin webhook verificado.
[ ] Verificar que webhook duplicado no duplica Payment.
[ ] Verificar build.
[ ] Verificar CI.
```

---

## 37. Orden de PRs recomendado

```text id="phdhcw"
PR-018-01 — Module skeleton, enums and constants.
PR-018-02 — Value objects, entities and state machines.
PR-018-03 — Prisma schema, migration, constraints and indexes.
PR-018-04 — Repository ports and Prisma repositories.
PR-018-05 — Provider ports, registry and mock/sandbox adapter.
PR-018-06 — SecretRef handling and provider config security.
PR-018-07 — Platform provider definitions.
PR-018-08 — Tenant provider configuration.
PR-018-09 — PaymentIntent and PaymentIntentItems.
PR-018-10 — Amount calculation from Charges and Account Statements.
PR-018-11 — Own payment intents and ownership policies.
PR-018-12 — Checkout session creation.
PR-018-13 — Webhook raw body, signature verification and replay protection.
PR-018-14 — Webhook idempotency and ProviderWebhookEvent processing.
PR-018-15 — ProviderTransaction and status mapping.
PR-018-16 — Payment creation from verified provider event.
PR-018-17 — ProviderPaymentMapping and Payments integration.
PR-018-18 — Settlements and Bank Reconciliation readiness.
PR-018-19 — Reports and exports.
PR-018-20 — Audit, observability and OpenAPI.
PR-018-21 — Tests, security hardening, performance and CI gates.
```

---

## 38. Checklist por PR

Cada PR debe responder:

```text id="p6w26j"
[ ] ¿Respeta tenant isolation?
[ ] ¿Evita findUnique por id simple en entidades tenant-scoped?
[ ] ¿Rechaza tenantId desde body?
[ ] ¿Rechaza amount arbitrario para cargos/saldos?
[ ] ¿Usa Decimal para dinero?
[ ] ¿Evita float/double?
[ ] ¿Protege SecretRef?
[ ] ¿No expone secret values?
[ ] ¿No almacena PAN?
[ ] ¿No almacena CVV?
[ ] ¿No almacena raw card data?
[ ] ¿No loggea checkoutUrl?
[ ] ¿No loggea raw webhook payload?
[ ] ¿No loggea raw signature?
[ ] ¿Webhook requiere firma?
[ ] ¿Webhook es idempotente?
[ ] ¿Webhook duplicado no duplica Payment?
[ ] ¿Payment se crea solo con evento verificado?
[ ] ¿Redirect del navegador no crea Payment?
[ ] ¿ProviderTransaction no reemplaza Payment?
[ ] ¿Account Statements se actualiza solo vía Payment?
[ ] ¿Bank Reconciliation conserva conciliación final?
[ ] ¿Audita operaciones críticas?
[ ] ¿Sanitiza audit metadata?
[ ] ¿No crea endpoints públicos administrativos?
[ ] ¿OpenAPI no documenta endpoints públicos administrativos?
[ ] ¿No invoca IA externa con datos reales?
[ ] ¿Agrega tests?
[ ] ¿No rompe módulos previos?
```

---

## 39. Comandos sugeridos

```bash id="gy0rwx"
npm run lint
npm run typecheck
npm run test:payment-provider-integration
npm run test:payment-provider-integration:unit
npm run test:payment-provider-integration:domain
npm run test:payment-provider-integration:value-objects
npm run test:payment-provider-integration:state-machines
npm run test:payment-provider-integration:repositories
npm run test:payment-provider-integration:services
npm run test:payment-provider-integration:adapters
npm run test:payment-provider-integration:secrets
npm run test:payment-provider-integration:checkout
npm run test:payment-provider-integration:webhooks
npm run test:payment-provider-integration:idempotency
npm run test:payment-provider-integration:payments
npm run test:payment-provider-integration:reports
npm run test:payment-provider-integration:api
npm run test:payment-provider-integration:authorization
npm run test:payment-provider-integration:own-resource
npm run test:payment-provider-integration:multitenancy
npm run test:payment-provider-integration:financial-integrity
npm run test:payment-provider-integration:audit
npm run test:payment-provider-integration:observability
npm run test:payment-provider-integration:openapi
npm run test:payment-provider-integration:security
npm run test:payment-provider-integration:performance
npm run test:payment-provider-integration:concurrency
npm run test:payment-provider-integration:smoke
npm run openapi:validate
npm run build
```

---

## 40. Definition of Done

El módulo se considera listo cuando:

```text id="xbde91"
[ ] spec.md está aprobado.
[ ] plan.md está aprobado.
[ ] data-model.md está aprobado.
[ ] api-contract.md está aprobado.
[ ] test-plan.md está aprobado.
[ ] tasks.md está aprobado.
[ ] security-notes.md está creado y aprobado.
[ ] Prisma schema está implementado.
[ ] Migración está ejecutada en test.
[ ] Provider registry funciona.
[ ] Mock provider adapter funciona.
[ ] SecretRef abstraction funciona.
[ ] Platform provider definitions funcionan.
[ ] Tenant provider configs funcionan.
[ ] PaymentIntentService funciona.
[ ] OwnPaymentIntentService funciona.
[ ] PaymentIntentAmountService funciona.
[ ] CheckoutSessionService funciona.
[ ] WebhookSignatureVerifier funciona.
[ ] Webhook replay protection funciona.
[ ] Webhook idempotency funciona.
[ ] ProviderWebhookEventService funciona.
[ ] ProviderTransactionService funciona.
[ ] PaymentCreationFromProviderService funciona.
[ ] ProviderPaymentMappingService funciona.
[ ] ProviderSettlementService funciona si está habilitado.
[ ] Payments integration funciona.
[ ] Account Statements integration no rompe saldos.
[ ] Bank Reconciliation readiness validada.
[ ] Secure Document Storage integration funciona si hay comprobantes/exports.
[ ] Notifications integration no expone datos sensibles.
[ ] Reports funcionan.
[ ] Audit funciona.
[ ] Observability funciona.
[ ] Controllers funcionan.
[ ] OpenAPI está actualizado.
[ ] No hay endpoints públicos administrativos.
[ ] No hay datos completos de tarjeta.
[ ] No hay secretos expuestos.
[ ] No se crea Payment sin webhook verificado.
[ ] No se duplica Payment por webhook repetido.
[ ] No se confía en redirect del navegador.
[ ] Unit tests pasan.
[ ] Repository tests pasan.
[ ] Service tests pasan.
[ ] Adapter tests pasan.
[ ] Integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own-resource tests pasan.
[ ] Multitenancy tests pasan.
[ ] Financial integrity tests pasan.
[ ] Security tests pasan.
[ ] Performance tests cumplen objetivo.
[ ] Concurrency tests pasan.
[ ] Smoke test pasa.
[ ] Build pasa.
[ ] CI pasa.
```

---

## 41. No aceptación

La implementación no debe aceptarse si:

```text id="vipj1n"
- permite provider config cross-tenant;
- permite payment intent cross-tenant;
- permite checkout session cross-tenant;
- permite webhook event cross-tenant;
- permite provider transaction cross-tenant;
- permite payment mapping cross-tenant;
- permite settlement cross-tenant;
- permite crear PaymentIntent con charge de otro tenant;
- permite crear PaymentIntent sobre unidad ajena;
- acepta tenantId desde body;
- busca entidades tenant-scoped solo por id;
- expone credentialSecret value;
- expone webhookSecret value;
- expone raw signature;
- expone raw webhook payload;
- expone checkoutUrl en logs;
- guarda PAN;
- guarda CVV;
- guarda raw card data;
- crea Payment desde redirect del navegador;
- crea Payment sin webhook firmado/verificado;
- duplica Payment por webhook repetido;
- usa amount enviado por cliente como fuente de verdad;
- permite amount mismatch sin revisión;
- permite currency mismatch sin revisión;
- omite PaymentAllocation cuando corresponde;
- rompe Account Statements;
- marca conciliado bancariamente sin Bank Reconciliation;
- crea endpoints públicos administrativos;
- documenta endpoints públicos administrativos en OpenAPI;
- permite WordPress confirmar pagos;
- envía datos reales a IA externa;
- omite auditoría financiera crítica.
```

---

## 42. Resultado esperado

Al completar estas tareas, `018-payment-provider-integration` quedará implementado como una capacidad financiera segura para pagos en línea con proveedores externos.

Resultado esperado:

```text id="d9xkvy"
- provider definitions platform;
- provider configs por tenant;
- SecretRef strategy;
- cero secret values expuestos;
- provider registry;
- adapter mock/sandbox;
- PaymentIntent tenant-scoped;
- PaymentIntentItems;
- cálculo server-side de montos;
- own payment intents;
- hosted checkout;
- checkoutUrl temporal;
- webhook endpoint firmado;
- validación de firma;
- protección contra replay;
- procesamiento idempotente;
- ProviderWebhookEvent sanitizado;
- ProviderTransaction;
- Payment interno creado desde evento verificado;
- ProviderPaymentMapping;
- ProviderSettlementRecord básico;
- integración con Payments;
- integración con Account Statements;
- preparación para Bank Reconciliation;
- integración con Secure Document Storage;
- integración con Notifications;
- reportes básicos;
- auditoría financiera;
- observabilidad segura;
- OpenAPI consistente;
- no card data storage;
- no endpoints públicos administrativos;
- no IA externa con datos reales.
```

---

## 43. Próximo documento

Después de este documento, el siguiente archivo del paquete es:

```text id="vz0q9m"
docs/specs/018-payment-provider-integration/security-notes.md
```
