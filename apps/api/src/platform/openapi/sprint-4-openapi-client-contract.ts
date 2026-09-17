import type { OpenAPIObject } from "@nestjs/swagger";

type Schema = Record<string, unknown>;
type Operation = Record<string, unknown> & {
  parameters?: Array<Record<string, unknown>>;
  requestBody?: Record<string, unknown>;
  responses?: Record<string, unknown>;
};

const ref = (name: string): Schema => ({
  $ref: `#/components/schemas/${name}`,
});
const nullable = (schema: Schema): Schema => ({ ...schema, nullable: true });
const string = (format?: string): Schema => ({
  type: "string",
  ...(format === undefined ? {} : { format }),
});
const uuid = () => string("uuid");
const date = () => string("date");
const dateTime = () => string("date-time");
const money = (): Schema => ({
  type: "string",
  pattern: "^(?:0|[1-9]\\d{0,9})(?:\\.\\d{1,2})?$",
  example: "125.50",
});
const decimal = (): Schema => ({
  type: "string",
  pattern: "^-?(?:0|[1-9]\\d*)(?:\\.\\d{1,2})?$",
  example: "125.50",
});
const object = (
  properties: Record<string, Schema>,
  required: readonly string[] = Object.keys(properties),
): Schema => ({
  type: "object",
  additionalProperties: false,
  properties,
  required,
});
const array = (items: Schema): Schema => ({ type: "array", items });

const RESOURCE_SCHEMAS: Record<string, Schema> = {
  PropertyUnit: object({
    id: uuid(),
    tenantId: uuid(),
    code: string(),
    name: nullable(string()),
    type: string(),
    block: nullable(string()),
    floor: nullable(string()),
    addressReference: nullable(string()),
    areaM2: nullable(money()),
    status: string(),
    archivedAt: nullable(dateTime()),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  Person: object({
    id: uuid(),
    tenantId: uuid(),
    displayName: string(),
    firstName: nullable(string()),
    lastName: nullable(string()),
    identificationType: nullable(string()),
    identificationNumber: nullable(string()),
    email: nullable(string("email")),
    phone: nullable(string()),
    whatsapp: nullable(string()),
    userProfileId: nullable(uuid()),
    status: string(),
    archivedAt: nullable(dateTime()),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  LegalEntity: object({
    id: uuid(),
    tenantId: uuid(),
    name: string(),
    taxIdentificationType: nullable(string()),
    taxIdentificationNumber: nullable(string()),
    email: nullable(string("email")),
    phone: nullable(string()),
    address: nullable(string()),
    status: string(),
    archivedAt: nullable(dateTime()),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  PropertyOwnership: object({
    id: uuid(),
    tenantId: uuid(),
    propertyUnitId: uuid(),
    personId: nullable(uuid()),
    legalEntityId: nullable(uuid()),
    ownershipType: string(),
    ownershipPercentage: nullable(money()),
    isPrimary: { type: "boolean" },
    startDate: date(),
    endDate: nullable(date()),
    status: string(),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  Residency: object({
    id: uuid(),
    tenantId: uuid(),
    propertyUnitId: uuid(),
    personId: uuid(),
    residencyType: string(),
    isPrimaryResident: { type: "boolean" },
    startDate: date(),
    endDate: nullable(date()),
    status: string(),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  Lease: object({
    id: uuid(),
    tenantId: uuid(),
    propertyUnitId: uuid(),
    ownerPersonId: nullable(uuid()),
    ownerLegalEntityId: nullable(uuid()),
    tenantPersonId: uuid(),
    residencyId: nullable(uuid()),
    startDate: date(),
    endDate: nullable(date()),
    status: string(),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  ChargeConcept: object({
    id: uuid(),
    code: string(),
    name: string(),
    description: nullable(string()),
    category: string(),
    defaultAmount: nullable(money()),
    currency: { type: "string", enum: ["USD"] },
    status: string(),
    isSystem: { type: "boolean" },
    createdAt: dateTime(),
    updatedAt: dateTime(),
    archivedAt: nullable(dateTime()),
  }),
  FeeSchedule: object({
    id: uuid(),
    chargeConceptId: uuid(),
    name: string(),
    amount: money(),
    currency: { type: "string", enum: ["USD"] },
    frequency: string(),
    effectiveFrom: date(),
    effectiveTo: nullable(date()),
    status: string(),
    createdAt: dateTime(),
    updatedAt: dateTime(),
    archivedAt: nullable(dateTime()),
  }),
  UnitFeeAssignment: object({
    id: uuid(),
    propertyUnitId: uuid(),
    feeScheduleId: uuid(),
    status: string(),
    startDate: date(),
    endDate: nullable(date()),
    createdAt: dateTime(),
    updatedAt: dateTime(),
    endedAt: nullable(dateTime()),
    endReason: nullable(string()),
  }),
  BillingPeriod: object({
    id: uuid(),
    periodCode: string(),
    startsAt: date(),
    endsAt: date(),
    dueDate: date(),
    status: string(),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  ChargeBatch: object({
    id: uuid(),
    billingPeriodId: uuid(),
    feeScheduleId: nullable(uuid()),
    type: string(),
    status: string(),
    totalItems: { type: "integer" },
    successItems: { type: "integer" },
    skippedItems: { type: "integer" },
    failedItems: { type: "integer" },
    errorSummary: nullable({
      type: "object",
      additionalProperties: false,
      properties: {
        codes: array(
          object({ code: string(), count: { type: "integer", minimum: 1 } }),
        ),
      },
      required: ["codes"],
    }),
    currency: { type: "string", enum: ["USD"] },
    startedAt: nullable(dateTime()),
    completedAt: nullable(dateTime()),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  Charge: object({
    id: uuid(),
    billingPeriodId: uuid(),
    propertyUnitId: uuid(),
    chargeConceptId: uuid(),
    feeScheduleId: nullable(uuid()),
    chargeBatchId: nullable(uuid()),
    type: string(),
    description: nullable(string()),
    originalAmount: money(),
    effectiveAmount: money(),
    currency: { type: "string", enum: ["USD"] },
    issuedDate: date(),
    dueDate: date(),
    status: string(),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  Payment: object({
    id: uuid(),
    propertyUnitId: uuid(),
    method: string(),
    amount: money(),
    allocatedAmount: money(),
    unallocatedAmount: money(),
    currency: { type: "string", enum: ["USD"] },
    paidAt: dateTime(),
    status: string(),
    transactionReference: nullable(string()),
    externalReference: nullable(string()),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  PaymentReceipt: object({
    id: uuid(),
    paymentId: uuid(),
    receiptNumber: nullable(string()),
    transactionReference: nullable(string()),
    status: string(),
    uploadedAt: nullable(dateTime()),
    reviewedAt: nullable(dateTime()),
    createdAt: dateTime(),
    updatedAt: dateTime(),
  }),
  PaymentAllocation: object({
    id: uuid(),
    paymentId: uuid(),
    chargeId: uuid(),
    propertyUnitId: uuid(),
    amount: money(),
    currency: { type: "string", enum: ["USD"] },
    status: string(),
    allocatedAt: dateTime(),
  }),
  UnitBalance: object(
    {
      id: nullable(uuid()),
      propertyUnitId: uuid(),
      currency: { type: "string", enum: ["USD"] },
      outstandingBalance: decimal(),
      overdueBalance: decimal(),
      notDueBalance: decimal(),
      creditBalance: decimal(),
      unallocatedPaymentBalance: decimal(),
      calculatedAt: nullable(dateTime()),
      isStale: { type: "boolean" },
    },
    [
      "propertyUnitId",
      "currency",
      "outstandingBalance",
      "overdueBalance",
      "notDueBalance",
      "creditBalance",
      "unallocatedPaymentBalance",
      "calculatedAt",
      "isStale",
    ],
  ),
  FinancialMovement: object({
    sourceId: uuid(),
    sourceType: string(),
    type: string(),
    descriptionCode: string(),
    date: date(),
    dueDate: nullable(date()),
    debit: money(),
    credit: money(),
    balance: decimal(),
  }),
  AccountStatementLine: object({
    id: uuid(),
    type: string(),
    descriptionCode: string(),
    date: date(),
    dueDate: nullable(date()),
    debit: money(),
    credit: money(),
    balance: decimal(),
    sourceType: nullable(string()),
  }),
  AccountStatement: object(
    {
      id: uuid(),
      propertyUnitId: uuid(),
      billingPeriodId: uuid(),
      statementNumber: string(),
      status: string(),
      currency: { type: "string", enum: ["USD"] },
      asOfDate: date(),
      openingBalance: decimal(),
      chargesTotal: money(),
      adjustmentsTotal: decimal(),
      paymentsTotal: money(),
      reversalsTotal: money(),
      creditBalance: money(),
      closingBalance: decimal(),
      overdueBalance: decimal(),
      notDueBalance: decimal(),
      lineCount: { type: "integer" },
      generatedAt: dateTime(),
      previousStatementId: nullable(uuid()),
      supersededById: nullable(uuid()),
      lines: array(ref("AccountStatementLine")),
    },
    [
      "id",
      "propertyUnitId",
      "billingPeriodId",
      "statementNumber",
      "status",
      "currency",
      "asOfDate",
      "openingBalance",
      "chargesTotal",
      "adjustmentsTotal",
      "paymentsTotal",
      "reversalsTotal",
      "creditBalance",
      "closingBalance",
      "overdueBalance",
      "notDueBalance",
      "lineCount",
      "generatedAt",
      "previousStatementId",
      "supersededById",
    ],
  ),
  PersonIdentityLinkAcknowledgement: object({
    linkedAt: dateTime(),
    personId: uuid(),
    userProfileId: uuid(),
  }),
};

const REQUEST_SCHEMAS: Record<string, Schema> = {
  ArchiveRequest: object({ reason: string() }),
  EndRelationshipRequest: object({ endDate: date(), reason: string() }),
  LinkUserRequest: object({ userProfileId: uuid() }),
  PropertyUnitCreateRequest: object(
    {
      code: string(),
      name: string(),
      type: string(),
      block: string(),
      floor: string(),
      addressReference: string(),
      areaM2: money(),
    },
    ["code"],
  ),
  PropertyUnitUpdateRequest: object(
    {
      code: string(),
      name: string(),
      type: string(),
      block: string(),
      floor: string(),
      addressReference: string(),
      areaM2: money(),
      status: string(),
    },
    [],
  ),
  PersonCreateRequest: object(
    {
      firstName: string(),
      lastName: string(),
      displayName: string(),
      identificationType: string(),
      identificationNumber: string(),
      email: string("email"),
      phone: string(),
      whatsapp: string(),
    },
    ["displayName"],
  ),
  PersonUpdateRequest: object(
    {
      firstName: string(),
      lastName: string(),
      displayName: string(),
      identificationType: string(),
      identificationNumber: string(),
      email: string("email"),
      phone: string(),
      whatsapp: string(),
      status: string(),
    },
    [],
  ),
  LegalEntityCreateRequest: object(
    {
      name: string(),
      taxIdentificationType: string(),
      taxIdentificationNumber: string(),
      email: string("email"),
      phone: string(),
      address: string(),
    },
    ["name"],
  ),
  LegalEntityUpdateRequest: object(
    {
      name: string(),
      taxIdentificationType: string(),
      taxIdentificationNumber: string(),
      email: string("email"),
      phone: string(),
      address: string(),
      status: string(),
    },
    [],
  ),
  OwnershipCreateRequest: object(
    {
      propertyUnitId: uuid(),
      personId: uuid(),
      legalEntityId: uuid(),
      ownershipType: string(),
      ownershipPercentage: money(),
      isPrimary: { type: "boolean" },
      startDate: date(),
    },
    ["propertyUnitId", "startDate"],
  ),
  OwnershipUpdateRequest: object(
    {
      ownershipType: string(),
      ownershipPercentage: money(),
      isPrimary: { type: "boolean" },
      status: string(),
    },
    [],
  ),
  ResidencyCreateRequest: object(
    {
      propertyUnitId: uuid(),
      personId: uuid(),
      residencyType: string(),
      isPrimaryResident: { type: "boolean" },
      startDate: date(),
    },
    ["propertyUnitId", "personId", "startDate"],
  ),
  ResidencyUpdateRequest: object(
    {
      residencyType: string(),
      isPrimaryResident: { type: "boolean" },
      status: string(),
    },
    [],
  ),
  LeaseCreateRequest: object(
    {
      propertyUnitId: uuid(),
      ownerPersonId: uuid(),
      ownerLegalEntityId: uuid(),
      tenantPersonId: uuid(),
      startDate: date(),
      endDate: date(),
    },
    ["propertyUnitId", "tenantPersonId", "startDate"],
  ),
  LeaseUpdateRequest: object({ endDate: date(), status: string() }, []),
  ChargeConceptCreateRequest: object(
    {
      code: string(),
      name: string(),
      description: string(),
      category: string(),
      defaultAmount: money(),
    },
    ["code", "name"],
  ),
  ChargeConceptUpdateRequest: object(
    {
      name: string(),
      description: string(),
      category: string(),
      defaultAmount: money(),
      status: string(),
    },
    [],
  ),
  FeeScheduleCreateRequest: object(
    {
      chargeConceptId: uuid(),
      name: string(),
      amount: money(),
      frequency: string(),
      effectiveFrom: date(),
      effectiveTo: date(),
    },
    ["chargeConceptId", "name", "amount", "effectiveFrom"],
  ),
  FeeScheduleUpdateRequest: object(
    {
      name: string(),
      amount: money(),
      frequency: string(),
      effectiveFrom: date(),
      effectiveTo: date(),
      status: string(),
    },
    [],
  ),
  UnitFeeCreateRequest: object(
    {
      propertyUnitId: uuid(),
      feeScheduleId: uuid(),
      startDate: date(),
      endDate: date(),
    },
    ["propertyUnitId", "feeScheduleId", "startDate"],
  ),
  BillingPeriodCreateRequest: object({
    periodCode: string(),
    startsAt: date(),
    endsAt: date(),
    dueDate: date(),
  }),
  ChargeCreateRequest: object(
    {
      billingPeriodId: uuid(),
      propertyUnitId: uuid(),
      chargeConceptId: uuid(),
      feeScheduleId: uuid(),
      type: string(),
      amount: money(),
      issuedDate: date(),
      dueDate: date(),
      description: string(),
    },
    [
      "billingPeriodId",
      "propertyUnitId",
      "chargeConceptId",
      "type",
      "amount",
      "issuedDate",
      "dueDate",
    ],
  ),
  PaymentReviewRequest: object({ reason: string() }),
  EmptyRequest: object({}, []),
};

const COLLECTIONS: Record<string, string> = {
  "/api/v1/tenant/property-units": "PropertyUnit",
  "/api/v1/tenant/persons": "Person",
  "/api/v1/tenant/legal-entities": "LegalEntity",
  "/api/v1/tenant/property-ownerships": "PropertyOwnership",
  "/api/v1/tenant/residencies": "Residency",
  "/api/v1/tenant/leases": "Lease",
  "/api/v1/tenant/charge-concepts": "ChargeConcept",
  "/api/v1/tenant/fee-schedules": "FeeSchedule",
  "/api/v1/tenant/unit-fees": "UnitFeeAssignment",
  "/api/v1/tenant/billing-periods": "BillingPeriod",
  "/api/v1/tenant/charge-batches": "ChargeBatch",
  "/api/v1/tenant/charges": "Charge",
  "/api/v1/tenant/payments": "Payment",
  "/api/v1/tenant/balances": "UnitBalance",
  "/api/v1/tenant/account-statements": "AccountStatement",
  "/api/v1/me/property-units": "PropertyUnit",
  "/api/v1/me/residencies": "Residency",
};

const NON_PAGED_COLLECTIONS = new Set([
  "/api/v1/me/property-units",
  "/api/v1/me/residencies",
]);

const RESIDENT_PAGED_COLLECTIONS = new Set([
  "/api/v1/tenant/property-units",
  "/api/v1/tenant/persons",
  "/api/v1/tenant/legal-entities",
  "/api/v1/tenant/property-ownerships",
  "/api/v1/tenant/residencies",
  "/api/v1/tenant/leases",
]);

const REQUEST_ID_PATHS = [
  /^\/api\/v1\/tenant\/payments(?:\/|$)/u,
  /^\/api\/v1\/tenant\/payment-(?:receipts|allocations)(?:\/|$)/u,
  /^\/api\/v1\/tenant\/balances$/u,
  /^\/api\/v1\/tenant\/property-units\/\{propertyUnitId\}\/(?:balance|financial-movements)$/u,
  /^\/api\/v1\/tenant\/account-statements(?:\/|$)/u,
];

const DETAILS: Array<[RegExp, string]> = [
  [/\/property-units\/\{propertyUnitId\}$/u, "PropertyUnit"],
  [/\/persons\/\{personId\}$/u, "Person"],
  [/\/legal-entities\/\{legalEntityId\}$/u, "LegalEntity"],
  [/\/property-ownerships\/\{ownershipId\}$/u, "PropertyOwnership"],
  [/\/residencies\/\{residencyId\}$/u, "Residency"],
  [/\/leases\/\{leaseId\}$/u, "Lease"],
  [/\/charge-concepts\/\{chargeConceptId\}$/u, "ChargeConcept"],
  [/\/fee-schedules\/\{feeScheduleId\}$/u, "FeeSchedule"],
  [/\/unit-fees\/\{unitFeeAssignmentId\}$/u, "UnitFeeAssignment"],
  [/\/billing-periods\/\{billingPeriodId\}$/u, "BillingPeriod"],
  [/\/charge-batches\/\{chargeBatchId\}$/u, "ChargeBatch"],
  [/\/charges\/\{chargeId\}$/u, "Charge"],
  [/\/payments\/\{paymentId\}$/u, "Payment"],
  [/\/payment-receipts\/\{receiptId\}$/u, "PaymentReceipt"],
  [/\/payment-allocations\/\{allocationId\}$/u, "PaymentAllocation"],
  [/\/account-statements\/\{statementId\}$/u, "AccountStatement"],
];

const REQUESTS: Record<string, string> = {
  "post /api/v1/tenant/property-units": "PropertyUnitCreateRequest",
  "patch /api/v1/tenant/property-units/{propertyUnitId}":
    "PropertyUnitUpdateRequest",
  "post /api/v1/tenant/property-units/{propertyUnitId}/archive":
    "ArchiveRequest",
  "post /api/v1/tenant/persons": "PersonCreateRequest",
  "patch /api/v1/tenant/persons/{personId}": "PersonUpdateRequest",
  "post /api/v1/tenant/persons/{personId}/archive": "ArchiveRequest",
  "post /api/v1/tenant/persons/{personId}/link-user": "LinkUserRequest",
  "post /api/v1/tenant/legal-entities": "LegalEntityCreateRequest",
  "patch /api/v1/tenant/legal-entities/{legalEntityId}":
    "LegalEntityUpdateRequest",
  "post /api/v1/tenant/legal-entities/{legalEntityId}/archive":
    "ArchiveRequest",
  "post /api/v1/tenant/property-ownerships": "OwnershipCreateRequest",
  "patch /api/v1/tenant/property-ownerships/{ownershipId}":
    "OwnershipUpdateRequest",
  "post /api/v1/tenant/property-ownerships/{ownershipId}/end":
    "EndRelationshipRequest",
  "post /api/v1/tenant/residencies": "ResidencyCreateRequest",
  "patch /api/v1/tenant/residencies/{residencyId}": "ResidencyUpdateRequest",
  "post /api/v1/tenant/residencies/{residencyId}/end": "EndRelationshipRequest",
  "post /api/v1/tenant/leases": "LeaseCreateRequest",
  "patch /api/v1/tenant/leases/{leaseId}": "LeaseUpdateRequest",
  "post /api/v1/tenant/leases/{leaseId}/end": "EndRelationshipRequest",
  "post /api/v1/tenant/charge-concepts": "ChargeConceptCreateRequest",
  "patch /api/v1/tenant/charge-concepts/{chargeConceptId}":
    "ChargeConceptUpdateRequest",
  "post /api/v1/tenant/charge-concepts/{chargeConceptId}/archive":
    "EmptyRequest",
  "post /api/v1/tenant/fee-schedules": "FeeScheduleCreateRequest",
  "patch /api/v1/tenant/fee-schedules/{feeScheduleId}":
    "FeeScheduleUpdateRequest",
  "post /api/v1/tenant/fee-schedules/{feeScheduleId}/archive": "EmptyRequest",
  "post /api/v1/tenant/unit-fees": "UnitFeeCreateRequest",
  "post /api/v1/tenant/unit-fees/{unitFeeAssignmentId}/end":
    "EndRelationshipRequest",
  "post /api/v1/tenant/billing-periods": "BillingPeriodCreateRequest",
  "post /api/v1/tenant/charges": "ChargeCreateRequest",
  "post /api/v1/tenant/charges/{chargeId}/cancel": "PaymentReviewRequest",
  "post /api/v1/tenant/payments/{paymentId}/reject": "PaymentReviewRequest",
  "post /api/v1/tenant/payment-receipts/{receiptId}/reject":
    "PaymentReviewRequest",
};

const BODYLESS_MUTATIONS = [
  "post /api/v1/tenant/payments/{paymentId}/confirm",
  "post /api/v1/tenant/payment-receipts/{receiptId}/accept",
];

export function applySprint4OpenApiClientContract(
  document: OpenAPIObject,
): void {
  const schemas = ((document.components ??= {}).schemas ??= {});
  Object.assign(schemas, RESOURCE_SCHEMAS, REQUEST_SCHEMAS, {
    TypedTraceMeta: object({ traceId: string() }),
    TypedRequestMeta: object({ requestId: string() }),
    TypedResidentPageMeta: object({
      page: { type: "integer" },
      pageSize: { type: "integer" },
      total: { type: "integer" },
      totalPages: { type: "integer" },
      traceId: string(),
    }),
    TypedTracePageMeta: object({
      page: { type: "integer" },
      pageSize: { type: "integer" },
      total: { type: "integer" },
      traceId: string(),
    }),
    TypedRequestPageMeta: object({
      page: { type: "integer" },
      pageSize: { type: "integer" },
      total: { type: "integer" },
      requestId: string(),
    }),
  });

  for (const [path, resource] of Object.entries(COLLECTIONS)) {
    const operation = getOperation(document, path, "get");
    if (operation) {
      const paged = !NON_PAGED_COLLECTIONS.has(path);
      setJsonSuccess(operation, path, array(ref(resource)), paged);
      if (paged) addPaginationParameters(operation);
    }
  }
  for (const [path, item] of Object.entries(document.paths)) {
    if (!path.startsWith("/api/v1/tenant/")) continue;
    const detail = DETAILS.find(([pattern]) => pattern.test(path));
    if (detail && item?.get)
      setJsonSuccess(
        item.get as unknown as Operation,
        path,
        ref(detail[1]),
        false,
      );
  }

  setJsonSuccessAt(document, "/api/v1/me/person", "get", ref("Person"));
  setJsonSuccessAt(
    document,
    "/api/v1/tenant/payments/{paymentId}/receipts",
    "get",
    array(ref("PaymentReceipt")),
  );
  setJsonSuccessAt(
    document,
    "/api/v1/tenant/payments/{paymentId}/allocations",
    "get",
    array(ref("PaymentAllocation")),
  );
  setJsonSuccessAt(
    document,
    "/api/v1/tenant/property-units/{propertyUnitId}/balance",
    "get",
    ref("UnitBalance"),
  );
  setJsonSuccessAt(
    document,
    "/api/v1/tenant/property-units/{propertyUnitId}/financial-movements",
    "get",
    array(ref("FinancialMovement")),
  );

  for (const [key, requestSchema] of Object.entries(REQUESTS)) {
    const separator = key.indexOf(" ");
    const method = key.slice(0, separator);
    const path = key.slice(separator + 1);
    const operation = getOperation(document, path, method);
    if (!operation) continue;
    operation.requestBody = {
      required: true,
      content: { "application/json": { schema: ref(requestSchema) } },
    };
    const resource = resourceForMutation(path);
    if (resource) setJsonSuccess(operation, path, ref(resource), false);
  }

  for (const key of BODYLESS_MUTATIONS) {
    const separator = key.indexOf(" ");
    const path = key.slice(separator + 1);
    const operation = getOperation(document, path, key.slice(0, separator));
    if (operation) {
      delete operation.requestBody;
      const resource = resourceForMutation(path);
      if (resource) setJsonSuccess(operation, path, ref(resource), false);
    }
  }

  for (const path of ["/api/v1/tenant/payment-receipts/{receiptId}/download"]) {
    const operation = getOperation(document, path, "get");
    if (operation) setBinarySuccess(operation);
  }
}

function resourceForMutation(path: string): string | undefined {
  if (path === "/api/v1/tenant/persons/{personId}/link-user")
    return "PersonIdentityLinkAcknowledgement";
  return (
    DETAILS.find(([pattern]) =>
      pattern.test(
        path.replace(
          /\/(archive|end|link-user|cancel|confirm|reject|accept)$/u,
          "",
        ),
      ),
    )?.[1] ?? COLLECTIONS[path]
  );
}

function getOperation(
  document: OpenAPIObject,
  path: string,
  method: string,
): Operation | undefined {
  return document.paths[path]?.[
    method as keyof (typeof document.paths)[string]
  ] as Operation | undefined;
}

function setJsonSuccessAt(
  document: OpenAPIObject,
  path: string,
  method: string,
  data: Schema,
  paged = false,
) {
  const operation = getOperation(document, path, method);
  if (operation) setJsonSuccess(operation, path, data, paged);
}

function setJsonSuccess(
  operation: Operation,
  path: string,
  data: Schema,
  paged: boolean,
) {
  const success = Object.keys(operation.responses ?? {}).find((status) =>
    /^2\d\d$/u.test(status),
  );
  if (!success) return;
  const meta = ref(metaSchemaFor(path, paged));
  operation.responses![success] = {
    description: "Successful response.",
    content: { "application/json": { schema: object({ data, meta }) } },
  };
}

function setBinarySuccess(operation: Operation) {
  const success = Object.keys(operation.responses ?? {}).find((status) =>
    /^2\d\d$/u.test(status),
  );
  if (!success) return;
  operation.responses![success] = {
    description: "Receipt document.",
    content: Object.fromEntries(
      ["application/pdf", "image/jpeg", "image/png"].map((mimeType) => [
        mimeType,
        { schema: string("binary") },
      ]),
    ),
  };
}

function metaSchemaFor(path: string, paged: boolean): string {
  if (!paged)
    return REQUEST_ID_PATHS.some((pattern) => pattern.test(path))
      ? "TypedRequestMeta"
      : "TypedTraceMeta";
  if (RESIDENT_PAGED_COLLECTIONS.has(path)) return "TypedResidentPageMeta";
  return REQUEST_ID_PATHS.some((pattern) => pattern.test(path))
    ? "TypedRequestPageMeta"
    : "TypedTracePageMeta";
}

function addPaginationParameters(operation: Operation) {
  const parameters = (operation.parameters ??= []);
  for (const name of ["page", "pageSize"]) {
    if (
      parameters.some(
        (parameter) => parameter.in === "query" && parameter.name === name,
      )
    )
      continue;
    parameters.push({
      in: "query",
      name,
      required: false,
      schema: {
        type: "integer",
        minimum: 1,
        ...(name === "pageSize" ? { maximum: 100 } : {}),
      },
    });
  }
}
