# Data Model — Spec 001 Tenants Management

> **Ownership vigente para Sprint 2:** GAP-S2-006 retira `TenantConfiguration`,
> `tenant_configurations` y su relación Prisma. El slice canónico de Spec 001 contiene
> `Tenant`, `TenantProfile`, `TenantBranding` y `TenantWordPressMapping`; `timezone` y
> `currency` existen sólo en `Tenant`. Los bloques posteriores incompatibles quedan
> supersedidos por el contrato de ownership.

## 1. Información del documento

| Campo                  | Valor                                         |
| ---------------------- | --------------------------------------------- |
| Proyecto               | RESIDENT Core                                 |
| Spec ID                | 001                                           |
| Módulo                 | Tenants Management                            |
| Documento              | Data Model                                    |
| Ruta                   | `docs/specs/001-tenants/data-model.md`        |
| Versión                | 0.1                                           |
| Estado                 | needs-review                                  |
| Fecha                  | 2026-07-12                                    |
| Documento base         | `docs/specs/001-tenants/spec.md`              |
| Plan técnico           | `docs/specs/001-tenants/plan.md`              |
| Base de datos          | PostgreSQL                                    |
| ORM                    | Prisma                                        |
| Estrategia multitenant | Shared database + shared schema + `tenant_id` |
| Moneda inicial         | USD                                           |
| Timezone inicial       | America/Guayaquil                             |

---

## 2. Propósito

Este documento define el modelo de datos para la spec `001-tenants`.

El objetivo es establecer:

* tablas;
* columnas;
* tipos de datos;
* relaciones;
* constraints;
* índices;
* enums;
* reglas de integridad;
* migración inicial;
* seeds;
* decisiones de persistencia;
* criterios de validación;
* compatibilidad con futuras specs.

Este modelo debe permitir implementar la primera frontera multitenant de RESIDENT Core.

---

## 3. Principios del modelo

### 3.1. Tenant como raíz de aislamiento

`tenants` es la entidad raíz del modelo multitenant.

Las tablas operativas futuras deberán referenciar `tenant_id`.

Excepción:

```text id="yi4ebc"
La tabla tenants no lleva tenant_id porque representa al propio tenant.
```

---

### 3.2. Datos públicos separados de datos internos

El modelo separa:

* datos internos del tenant;
* perfil público;
* branding;
* configuración;
* mapeo WordPress.

Esto evita exponer accidentalmente información no pública.

---

### 3.3. No eliminación física normal

Los tenants no se eliminan físicamente en operaciones normales.

Se usan estados:

```text id="a9jaxo"
pendingSetup
active
suspended
inactive
archived
```

---

### 3.4. Auditoría externa al módulo

Este módulo debe generar eventos de auditoría, pero la tabla definitiva de auditoría se implementará en una spec o módulo transversal.

Por tanto, este modelo no define todavía `audit_logs`.

---

### 3.5. Roles base diferidos

La creación real de roles, permisos y membresías se implementará en:

```text id="czke26"
docs/specs/002-users-roles/
```

Este modelo no crea todavía tablas de roles.

---

## 4. Entidades del módulo

El módulo `001-tenants` define cinco entidades persistentes principales:

```text id="2kcxwo"
Tenant
TenantProfile
TenantBranding
TenantConfiguration
TenantWordPressMapping
```

Relación general:

```text id="8lh94p"
Tenant
├── TenantProfile              1:1
├── TenantBranding             1:1
├── TenantConfiguration        1:1
└── TenantWordPressMapping     1:1
```

---

## 5. Tabla `tenants`

### 5.1. Propósito

Representa un conjunto residencial, condominio, edificio, urbanización o comunidad habitacional registrada en RESIDENT Core.

Esta tabla contiene la identidad operativa básica del tenant.

---

### 5.2. Nombre físico

```text id="urddhs"
tenants
```

---

### 5.3. Columnas

| Columna             | Tipo lógico | Requerido |           Default | Descripción                            |
| ------------------- | ----------: | --------: | ----------------: | -------------------------------------- |
| `id`                | UUID/string |        Sí |              uuid | Identificador interno                  |
| `name`              |      string |        Sí |                 — | Nombre interno del tenant              |
| `legal_name`        |      string |        No |              null | Nombre legal o razón social, si aplica |
| `slug`              |      string |        Sí |                 — | Identificador público único            |
| `status`            | enum/string |        Sí |      pendingSetup | Estado operativo                       |
| `timezone`          |      string |        Sí | America/Guayaquil | Zona horaria                           |
| `currency`          |      string |        Sí |               USD | Moneda base                            |
| `plan_code`         |      string |        No |              null | Plan comercial futuro                  |
| `created_at`        |   timestamp |        Sí |               now | Fecha de creación                      |
| `updated_at`        |   timestamp |        Sí |              auto | Fecha de actualización                 |
| `suspended_at`      |   timestamp |        No |              null | Fecha de suspensión                    |
| `suspended_by`      | UUID/string |        No |              null | Usuario que suspendió                  |
| `suspension_reason` |        text |        No |              null | Motivo de suspensión                   |
| `archived_at`       |   timestamp |        No |              null | Fecha de archivado                     |
| `archived_by`       | UUID/string |        No |              null | Usuario que archivó                    |

---

### 5.4. Reglas

* `slug` debe ser único globalmente.
* `slug` debe estar normalizado.
* `status` solo puede tener valores permitidos.
* `timezone` debe contener una zona horaria válida.
* `currency` inicia con `USD`.
* `suspension_reason` debe existir cuando `status = suspended`.
* `archived_at` debe existir cuando `status = archived`.
* No se permite eliminación física normal.

---

### 5.5. Índices

```text id="da1ulg"
unique index tenants_slug_unique on tenants(slug)
index tenants_status_idx on tenants(status)
index tenants_created_at_idx on tenants(created_at)
```

---

## 6. Tabla `tenant_profiles`

### 6.1. Propósito

Contiene datos institucionales y públicos del tenant.

Estos datos pueden ser usados por el frontend administrativo y por el endpoint público controlado para WordPress.

---

### 6.2. Nombre físico

```text id="v67mpd"
tenant_profiles
```

---

### 6.3. Columnas

| Columna         | Tipo lógico | Requerido | Default | Descripción            |
| --------------- | ----------: | --------: | ------: | ---------------------- |
| `id`            | UUID/string |        Sí |    uuid | Identificador interno  |
| `tenant_id`     | UUID/string |        Sí |       — | Tenant propietario     |
| `display_name`  |      string |        Sí |       — | Nombre visible         |
| `slogan`        |      string |        No |    null | Slogan público         |
| `description`   |        text |        No |    null | Descripción pública    |
| `contact_email` |      string |        No |    null | Email institucional    |
| `contact_phone` |      string |        No |    null | Teléfono institucional |
| `whatsapp`      |      string |        No |    null | WhatsApp institucional |
| `address`       |      string |        No |    null | Dirección general      |
| `city`          |      string |        No |    null | Ciudad                 |
| `province`      |      string |        No |    null | Provincia              |
| `country`       |      string |        No | Ecuador | País                   |
| `created_at`    |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`    |   timestamp |        Sí |    auto | Fecha de actualización |

---

### 6.4. Reglas

* Debe existir máximo un perfil por tenant.
* `tenant_id` debe ser único.
* `display_name` es requerido.
* No debe almacenar datos personales de residentes.
* No debe almacenar información financiera.
* Puede exponerse parcialmente en endpoint público.

---

### 6.5. Índices

```text id="0x9sjs"
unique index tenant_profiles_tenant_id_unique on tenant_profiles(tenant_id)
index tenant_profiles_display_name_idx on tenant_profiles(display_name)
```

---

## 7. Tabla `tenant_branding`

### 7.1. Propósito

Contiene información visual del tenant.

Se usa para personalización de UI y perfil público.

---

### 7.2. Nombre físico

```text id="4rh53x"
tenant_branding
```

---

### 7.3. Columnas

| Columna           | Tipo lógico | Requerido | Default | Descripción            |
| ----------------- | ----------: | --------: | ------: | ---------------------- |
| `id`              | UUID/string |        Sí |    uuid | Identificador interno  |
| `tenant_id`       | UUID/string |        Sí |       — | Tenant propietario     |
| `logo_url`        |      string |        No |    null | URL del logo           |
| `banner_url`      |      string |        No |    null | URL del banner         |
| `primary_color`   |      string |        No |    null | Color primario         |
| `secondary_color` |      string |        No |    null | Color secundario       |
| `accent_color`    |      string |        No |    null | Color de acento        |
| `created_at`      |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`      |   timestamp |        Sí |    auto | Fecha de actualización |

---

### 7.4. Reglas

* Debe existir máximo un branding por tenant.
* Los colores deben usar formato hexadecimal `#RRGGBB`.
* Las URLs deben ser HTTPS en producción.
* No debe almacenar archivos binarios; solo URLs o referencias.
* El almacenamiento real de imágenes se definirá en módulo de archivos/storage.

---

### 7.5. Índices

```text id="6tgp79"
unique index tenant_branding_tenant_id_unique on tenant_branding(tenant_id)
```

---

## 8. Tabla `tenant_configurations`

### 8.1. Propósito

Contiene configuración funcional básica del tenant.

Esta tabla define comportamientos iniciales del tenant sin mezclar configuración con datos públicos.

---

### 8.2. Nombre físico

```text id="6v34q4"
tenant_configurations
```

---

### 8.3. Columnas

| Columna                            | Tipo lógico | Requerido |           Default | Descripción                  |
| ---------------------------------- | ----------: | --------: | ----------------: | ---------------------------- |
| `id`                               | UUID/string |        Sí |              uuid | Identificador interno        |
| `tenant_id`                        | UUID/string |        Sí |                 — | Tenant propietario           |
| `timezone`                         |      string |        Sí | America/Guayaquil | Timezone funcional           |
| `currency`                         |      string |        Sí |               USD | Moneda funcional             |
| `default_language`                 |      string |        Sí |                es | Idioma por defecto           |
| `allow_resident_self_registration` |     boolean |        Sí |             false | Permitir autoregistro futuro |
| `allow_online_payments`            |     boolean |        Sí |             false | Pagos en línea futuros       |
| `enable_reservations`              |     boolean |        Sí |             false | Reservas habilitadas         |
| `enable_fines`                     |     boolean |        Sí |             false | Multas habilitadas           |
| `enable_meetings`                  |     boolean |        Sí |             false | Reuniones habilitadas        |
| `enable_notifications`             |     boolean |        Sí |             false | Notificaciones habilitadas   |
| `created_at`                       |   timestamp |        Sí |               now | Fecha de creación            |
| `updated_at`                       |   timestamp |        Sí |              auto | Fecha de actualización       |

---

### 8.4. Reglas

* Debe existir máximo una configuración por tenant.
* `timezone` debe ser válida.
* `currency` debe ser válida.
* La moneda inicial permitida es `USD`.
* Los flags no deben activar módulos no implementados en producción.
* El cambio de flags críticos debe auditarse.

---

### 8.5. Índices

```text id="2q1tfz"
unique index tenant_configurations_tenant_id_unique on tenant_configurations(tenant_id)
```

---

## 9. Tabla `tenant_wordpress_mappings`

### 9.1. Propósito

Representa la relación entre el tenant del Core y el portal WordPress existente en la FASE 1.

Permite vincular:

```text id="rfrzji"
WordPress CPT conjunto
↔
RESIDENT Core tenant
```

---

### 9.2. Nombre físico

```text id="e6p8dc"
tenant_wordpress_mappings
```

---

### 9.3. Columnas

| Columna                   | Tipo lógico | Requerido | Default | Descripción                            |
| ------------------------- | ----------: | --------: | ------: | -------------------------------------- |
| `id`                      | UUID/string |        Sí |    uuid | Identificador interno                  |
| `tenant_id`               | UUID/string |        Sí |       — | Tenant propietario                     |
| `wordpress_site_url`      |      string |        No |    null | URL del portal WordPress               |
| `wordpress_conjunto_slug` |      string |        No |    null | Slug del CPT `conjunto`                |
| `wordpress_conjunto_id`   |      string |        No |    null | ID del post/CPT en WordPress si aplica |
| `access_url`              |      string |        No |    null | URL de acceso residentes               |
| `is_active`               |     boolean |        Sí |   false | Mapeo activo                           |
| `created_at`              |   timestamp |        Sí |     now | Fecha de creación                      |
| `updated_at`              |   timestamp |        Sí |    auto | Fecha de actualización                 |

---

### 9.4. Reglas

* Debe existir máximo un mapping por tenant.
* `wordpress_conjunto_slug` debe coincidir preferentemente con `tenant.slug`.
* `access_url` debe apuntar al login del Core o dashboard correspondiente.
* WordPress no es fuente transaccional.
* WordPress no autoriza usuarios del Core.
* Las URLs deben ser HTTPS en producción.
* Cambios deben auditarse.

---

### 9.5. Índices

```text id="6f5ntr"
unique index tenant_wordpress_mappings_tenant_id_unique on tenant_wordpress_mappings(tenant_id)
index tenant_wordpress_mappings_wordpress_conjunto_slug_idx on tenant_wordpress_mappings(wordpress_conjunto_slug)
```

---

## 10. Enum `TenantStatus`

### 10.1. Valores funcionales

```text id="jra7ub"
pendingSetup
active
suspended
inactive
archived
```

---

### 10.2. Recomendación Prisma

Usar enum Prisma para mejorar type safety.

```prisma id="y1s2qs"
enum TenantStatus {
  PENDING_SETUP @map("pendingSetup")
  ACTIVE        @map("active")
  SUSPENDED     @map("suspended")
  INACTIVE      @map("inactive")
  ARCHIVED      @map("archived")

  @@map("tenant_status")
}
```

---

### 10.3. Reglas de transición

| Desde          | Hacia       |   Permitido | Observación                   |
| -------------- | ----------- | ----------: | ----------------------------- |
| `pendingSetup` | `active`    |          Sí | Requiere configuración mínima |
| `pendingSetup` | `inactive`  |          Sí | Puede quedar no operativo     |
| `active`       | `suspended` |          Sí | Requiere motivo               |
| `active`       | `inactive`  |          Sí | Proceso administrativo        |
| `suspended`    | `active`    |          Sí | Reactivación                  |
| `suspended`    | `archived`  |          Sí | Cierre                        |
| `inactive`     | `active`    |          Sí | Reactivación administrativa   |
| `inactive`     | `archived`  |          Sí | Archivo                       |
| `archived`     | `active`    | Excepcional | Requiere proceso especial     |

---

## 11. Modelo Prisma completo propuesto

```prisma id="ep8mj2"
enum TenantStatus {
  PENDING_SETUP @map("pendingSetup")
  ACTIVE        @map("active")
  SUSPENDED     @map("suspended")
  INACTIVE      @map("inactive")
  ARCHIVED      @map("archived")

  @@map("tenant_status")
}

model Tenant {
  id               String       @id @default(uuid())
  name             String
  legalName        String?      @map("legal_name")
  slug             String       @unique
  status           TenantStatus @default(PENDING_SETUP)
  timezone         String       @default("America/Guayaquil")
  currency         String       @default("USD")
  planCode         String?      @map("plan_code")

  createdAt        DateTime     @default(now()) @map("created_at")
  updatedAt        DateTime     @updatedAt @map("updated_at")

  suspendedAt      DateTime?    @map("suspended_at")
  suspendedBy      String?      @map("suspended_by")
  suspensionReason String?      @map("suspension_reason")
  archivedAt       DateTime?    @map("archived_at")
  archivedBy       String?      @map("archived_by")

  profile          TenantProfile?
  branding         TenantBranding?
  configuration    TenantConfiguration?
  wordpressMapping TenantWordPressMapping?

  @@index([slug])
  @@index([status])
  @@index([createdAt])
  @@map("tenants")
}

model TenantProfile {
  id           String   @id @default(uuid())
  tenantId     String   @unique @map("tenant_id")
  displayName  String   @map("display_name")
  slogan       String?
  description  String?
  contactEmail String?  @map("contact_email")
  contactPhone String?  @map("contact_phone")
  whatsapp     String?
  address      String?
  city         String?
  province     String?
  country      String?  @default("Ecuador")

  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  @@index([displayName])
  @@map("tenant_profiles")
}

model TenantBranding {
  id             String   @id @default(uuid())
  tenantId       String   @unique @map("tenant_id")
  logoUrl        String?  @map("logo_url")
  bannerUrl      String?  @map("banner_url")
  primaryColor   String?  @map("primary_color")
  secondaryColor String?  @map("secondary_color")
  accentColor    String?  @map("accent_color")

  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  @@map("tenant_branding")
}

model TenantConfiguration {
  id                            String   @id @default(uuid())
  tenantId                      String   @unique @map("tenant_id")
  timezone                      String   @default("America/Guayaquil")
  currency                      String   @default("USD")
  defaultLanguage               String   @default("es") @map("default_language")
  allowResidentSelfRegistration Boolean  @default(false) @map("allow_resident_self_registration")
  allowOnlinePayments           Boolean  @default(false) @map("allow_online_payments")
  enableReservations            Boolean  @default(false) @map("enable_reservations")
  enableFines                   Boolean  @default(false) @map("enable_fines")
  enableMeetings                Boolean  @default(false) @map("enable_meetings")
  enableNotifications           Boolean  @default(false) @map("enable_notifications")

  createdAt                     DateTime @default(now()) @map("created_at")
  updatedAt                     DateTime @updatedAt @map("updated_at")

  tenant                        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  @@map("tenant_configurations")
}

model TenantWordPressMapping {
  id                   String   @id @default(uuid())
  tenantId             String   @unique @map("tenant_id")
  wordpressSiteUrl     String?  @map("wordpress_site_url")
  wordpressConjuntoSlug String? @map("wordpress_conjunto_slug")
  wordpressConjuntoId  String?  @map("wordpress_conjunto_id")
  accessUrl            String?  @map("access_url")
  isActive             Boolean  @default(false) @map("is_active")

  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  tenant               Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  @@index([wordpressConjuntoSlug])
  @@map("tenant_wordpress_mappings")
}
```

---

## 12. Notas sobre `onDelete`

Se usa:

```text id="g1530f"
onDelete: Restrict
```

Razón:

* no debe eliminarse un tenant con datos relacionados;
* no se permite borrado físico ordinario;
* evita cascadas accidentales;
* protege integridad histórica;
* prepara módulos financieros futuros.

---

## 13. Nombres de columnas

En TypeScript se usará camelCase.

En base de datos se usará snake_case.

Ejemplo:

```text id="juzn69"
TypeScript: wordpressConjuntoSlug
Database:   wordpress_conjunto_slug
```

Esta convención sigue `api-guidelines.md`.

---

## 14. Slugs

### 14.1. Reglas de slug

Un slug debe:

* estar en minúsculas;
* no tener tildes;
* no tener espacios;
* usar guiones medios;
* no empezar ni terminar con guion;
* no tener guiones consecutivos;
* no incluir caracteres no permitidos;
* no ser palabra reservada;
* ser único.

---

### 14.2. Regex sugerida

```text id="2djbc8"
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

---

### 14.3. Longitud sugerida

| Regla  | Valor |
| ------ | ----: |
| Mínimo |     3 |
| Máximo |    80 |

---

### 14.4. Slugs reservados

```text id="jov5v4"
admin
api
auth
login
logout
platform
system
public
resident
www
app
dashboard
core
support
help
billing
settings
```

---

## 15. Timezone

### 15.1. Default

```text id="ij20fo"
America/Guayaquil
```

---

### 15.2. Validación

La aplicación debe validar que el timezone exista.

La base de datos almacena string.

Razón:

* evita acoplar demasiado la DB;
* permite usar librerías de validación en aplicación;
* simplifica cambios futuros.

---

## 16. Currency

### 16.1. Default

```text id="xxf97i"
USD
```

---

### 16.2. Validación MVP

En MVP solo se permitirá:

```text id="vxfsn2"
USD
```

---

### 16.3. Futuro

Soporte multi-moneda requiere ADR o extensión de spec.

---

## 17. URLs

### 17.1. Campos URL

```text id="scaoch"
logo_url
banner_url
wordpress_site_url
access_url
```

---

### 17.2. Reglas

En producción:

```text id="x3tu8v"
Solo HTTPS.
```

En local/dev:

```text id="p5i0k3"
HTTP permitido solo para localhost o ambientes explícitamente autorizados.
```

---

### 17.3. Validación

La validación se realiza en aplicación.

La base de datos almacena string.

---

## 18. Colores

### 18.1. Campos

```text id="u3j5pn"
primary_color
secondary_color
accent_color
```

---

### 18.2. Regex sugerida

```text id="y793zz"
^#[0-9A-Fa-f]{6}$
```

---

### 18.3. Reglas

* almacenar en formato normalizado uppercase o lowercase consistente;
* no aceptar nombres de color;
* no aceptar valores RGB libres en MVP.

---

## 19. Restricciones de integridad

### 19.1. Unicidad

```text id="sz7m7x"
tenants.slug unique
tenant_profiles.tenant_id unique
tenant_branding.tenant_id unique
tenant_configurations.tenant_id unique
tenant_wordpress_mappings.tenant_id unique
```

---

### 19.2. Integridad referencial

Cada tabla secundaria referencia:

```text id="0x13hs"
tenants.id
```

con:

```text id="ll44so"
onDelete: Restrict
```

---

### 19.3. Reglas no expresadas en Prisma

Algunas reglas se validarán en aplicación:

* `suspension_reason` requerido si status suspended;
* `archived_at` requerido si status archived;
* URL HTTPS en producción;
* timezone válida;
* color válido;
* slug reservado;
* transición de estado permitida.

---

## 20. Migración inicial

### 20.1. Nombre sugerido

```text id="qc7ij7"
001_create_tenants
```

---

### 20.2. Tablas creadas

```text id="x8heco"
tenants
tenant_profiles
tenant_branding
tenant_configurations
tenant_wordpress_mappings
tenant_status enum
```

---

### 20.3. Orden de creación

```text id="lj0l39"
1. tenant_status enum
2. tenants
3. tenant_profiles
4. tenant_branding
5. tenant_configurations
6. tenant_wordpress_mappings
7. indexes
8. constraints
```

---

### 20.4. Revisión manual de migración

Antes de aplicar en staging o producción:

* revisar SQL generado;
* verificar `onDelete: Restrict`;
* verificar unique indexes;
* verificar enum;
* verificar nombres físicos;
* verificar que no existan cascades peligrosas;
* verificar que no existan defaults incorrectos.

---

## 21. Seeds iniciales

### 21.1. Propósito

Crear datos ficticios para desarrollo y pruebas.

No usar datos reales de residentes ni información sensible.

---

### 21.2. Tenants demo

```text id="zp75tc"
villa-club-demo
altos-del-norte-demo
jardines-del-valle-demo
portal-del-rio-demo
tenant-suspendido-demo
```

---

### 21.3. Ejemplo de seed

```json id="9s1dtq"
{
  "name": "Villa Club Demo",
  "legalName": "Villa Club Demo",
  "slug": "villa-club-demo",
  "status": "active",
  "timezone": "America/Guayaquil",
  "currency": "USD",
  "profile": {
    "displayName": "Villa Club Demo",
    "slogan": "Comunidad residencial inteligente",
    "contactEmail": "demo-villa-club@example.com",
    "contactPhone": "+593999999999",
    "city": "Santo Domingo",
    "province": "Santo Domingo de los Tsáchilas",
    "country": "Ecuador"
  },
  "branding": {
    "primaryColor": "#1E88E5",
    "secondaryColor": "#90CAF9",
    "accentColor": "#FFC107"
  },
  "wordpressMapping": {
    "wordpressSiteUrl": "https://www.resident.gustavoguaigua.com",
    "wordpressConjuntoSlug": "villa-club",
    "accessUrl": "https://app.resident.example.com/login?tenant=villa-club-demo",
    "isActive": true
  }
}
```

---

## 22. Datos prohibidos en seeds

No incluir:

* cédulas reales;
* nombres completos de residentes reales;
* comprobantes;
* pagos;
* direcciones exactas de personas;
* teléfonos reales sin control;
* correos personales reales;
* credenciales;
* tokens;
* claves API.

---

## 23. Datos públicos permitidos

El endpoint público puede leer desde:

```text id="oyp87c"
tenant_profiles
tenant_branding
tenant_wordpress_mappings
```

Campos permitidos:

```text id="mmwfqb"
slug
displayName
slogan
description
logoUrl
bannerUrl
primaryColor
secondaryColor
accentColor
contactEmail
contactPhone
whatsapp
address
city
province
country
accessUrl
```

---

## 24. Datos no públicos

No exponer públicamente:

```text id="75qhz0"
id interno
planCode
status interno detallado
suspendedAt
suspendedBy
suspensionReason
archivedAt
archivedBy
createdAt interno si no es necesario
updatedAt interno si no es necesario
configuration flags internos
wordpressConjuntoId interno
auditoría
roles
permisos
usuarios
membresías
```

---

## 25. DTO público derivado

La respuesta pública no debe ser la entidad completa.

Debe construirse un DTO específico:

```text id="0p6ph7"
PublicTenantProfileResponseDto
```

Estructura sugerida:

```json id="to6u2n"
{
  "data": {
    "slug": "villa-club",
    "displayName": "Villa Club",
    "slogan": "Comunidad residencial inteligente",
    "description": "Portal digital del conjunto residencial.",
    "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
    "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
    "primaryColor": "#1E88E5",
    "secondaryColor": "#90CAF9",
    "accentColor": "#FFC107",
    "contact": {
      "email": "admin@example.com",
      "phone": "+593999999999",
      "whatsapp": "+593999999999",
      "address": "Santo Domingo, Ecuador",
      "city": "Santo Domingo",
      "province": "Santo Domingo de los Tsáchilas",
      "country": "Ecuador"
    },
    "accessUrl": "https://app.resident.example.com/login?tenant=villa-club"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 26. Relación con WordPress

### 26.1. Mapeo recomendado

```text id="8xlm3j"
tenant.slug = wordpress_conjunto_slug
```

---

### 26.2. Slugs actuales esperados

De la FASE 1 existen conjuntos como:

```text id="frrb5a"
villa-club
altos-del-norte
jardines-del-valle
portal-del-rio
```

Estos pueden mapearse desde WordPress a Core.

---

### 26.3. Regla

No se debe depender de `wordpress_conjunto_id` como identificador principal.

El identificador principal en Core es:

```text id="on8c6g"
tenant.id
```

El identificador público de integración es:

```text id="y8u41q"
tenant.slug
```

---

## 27. Estado y operación

### 27.1. `pendingSetup`

Permite:

* completar perfil;
* completar branding;
* completar configuración;
* crear/invitar admin inicial futuro;
* actualizar WordPress mapping.

No permite:

* alícuotas;
* pagos;
* reservas operativas;
* multas;
* reportes financieros reales.

---

### 27.2. `active`

Permite operación normal según permisos.

---

### 27.3. `suspended`

Permite:

* soporte;
* auditoría;
* consultas autorizadas;
* reactivación;
* exportación controlada.

Bloquea:

* nuevas alícuotas;
* nuevos pagos operativos;
* nuevas reservas;
* nuevas multas;
* nuevas invitaciones ordinarias.

---

### 27.4. `inactive`

Tenant no operativo, pero no necesariamente sancionado o suspendido.

---

### 27.5. `archived`

Tenant conservado por retención histórica.

No operativo.

---

## 28. Compatibilidad con futuras tablas

Las siguientes futuras tablas deberán tener `tenant_id` obligatorio:

```text id="grdr36"
user_tenant_memberships
roles
permissions scoped by tenant when applicable
persons
property_units
property_ownerships
residencies
charge_concepts
charges
payments
payment_allocations
payment_receipts
account_statements
bank_accounts
bank_movements
reconciliations
common_areas
reservations
fines
meetings
attendance_records
announcements
notifications
audit_logs
files
```

---

## 29. Relación con `002-users-roles`

`002-users-roles` deberá crear entidades como:

```text id="00jm91"
UserProfile
Role
Permission
RolePermission
UserTenantMembership
MembershipRole
Invitation
```

Relación esperada:

```text id="ee6n30"
Tenant.id
  ↓
UserTenantMembership.tenant_id
  ↓
UserProfile
```

---

## 30. Relación con Keycloak

Este modelo no almacena usuarios de Keycloak.

La relación con Keycloak se dará indirectamente en `002-users-roles`.

Ejemplo futuro:

```text id="th5zba"
UserProfile.keycloak_subject_id
UserTenantMembership.tenant_id
```

Regla:

```text id="40hzox"
Keycloak autentica.
RESIDENT Core asocia usuario a tenants mediante membresías.
```

---

## 31. Relación con auditoría

Cada cambio crítico en estas tablas debe generar auditoría.

Eventos:

```text id="0x4f2h"
tenant.created
tenant.updated
tenant.activated
tenant.suspended
tenant.reactivated
tenant.archived
tenant.profile.updated
tenant.branding.updated
tenant.configuration.updated
tenant.wordpressMapping.updated
```

La tabla de auditoría se definirá en spec posterior, pero debe soportar como mínimo:

```text id="7ihs33"
tenant_id
actor_user_id
action
resource_type
resource_id
old_value
new_value
trace_id
occurred_at
```

---

## 32. Relación con observabilidad

Las operaciones sobre tenant deben registrar logs técnicos sin exponer datos sensibles.

Campos recomendados:

```text id="n5k78m"
traceId
tenantId
actorUserId
action
result
latencyMs
errorCode
```

No registrar:

```text id="bpzltj"
tokens
secrets
payload completo innecesario
datos personales futuros
```

---

## 33. Reglas de actualización

### 33.1. Campos modificables por PlatformAdmin

```text id="9hkyh7"
name
legalName
slug con restricción
timezone
currency con restricción
planCode
status mediante endpoints específicos
profile
branding
configuration
wordpressMapping
```

---

### 33.2. Campos modificables por TenantAdmin

Solo dentro de su tenant:

```text id="jxmn9g"
profile
branding
wordpressMapping limitado
configuration limitada
```

No puede modificar:

```text id="h9p445"
status
planCode
slug sin autorización especial
suspension fields
archive fields
```

---

### 33.3. Campos no modificables directamente

```text id="wv4lr4"
id
createdAt
updatedAt manual
suspendedAt manual
suspendedBy manual
archivedAt manual
archivedBy manual
```

---

## 34. Cambio de slug

Cambiar el slug es una operación sensible porque afecta:

* WordPress mapping;
* access URL;
* endpoints públicos;
* links compartidos;
* integraciones;
* bookmarks.

Reglas:

* solo PlatformAdmin;
* validar unicidad;
* auditar;
* opcionalmente conservar alias futuro;
* actualizar WordPress mapping si corresponde;
* considerar redirecciones futuras.

En MVP se recomienda:

```text id="m4yi9q"
Evitar cambio de slug después de activación salvo necesidad administrativa.
```

---

## 35. Constraints que deben probarse

Pruebas obligatorias:

```text id="rnzz8u"
No se crean dos tenants con el mismo slug.
No se crean dos profiles para el mismo tenant.
No se crean dos branding para el mismo tenant.
No se crean dos configurations para el mismo tenant.
No se crean dos wordpress mappings para el mismo tenant.
No se elimina tenant con relaciones.
No se acepta status inválido.
```

---

## 36. Consultas esperadas

### 36.1. Buscar tenant por slug

```text id="f5lzm9"
findTenantBySlug(slug)
```

Usado por:

* endpoint público;
* login con tenant hint;
* WordPress integration;
* onboarding;
* admin.

---

### 36.2. Listar tenants

Filtros esperados:

```text id="fit2w7"
status
search
createdFrom
createdTo
page
pageSize
sort
```

---

### 36.3. Obtener perfil público

Consulta debe incluir:

```text id="uch2ie"
Tenant
TenantProfile
TenantBranding
TenantWordPressMapping
```

Pero devolver DTO limitado.

---

## 37. Paginación

Listar tenants debe soportar:

```text id="wp4j9b"
page
pageSize
```

Defaults sugeridos:

```text id="hyjzek"
page = 1
pageSize = 20
max pageSize = 100
```

---

## 38. Ordenamiento

Campos permitidos:

```text id="5gyf9y"
createdAt
name
slug
status
```

No permitir ordenar por campos arbitrarios.

---

## 39. Filtros

Filtros permitidos en MVP:

```text id="sm70rv"
status
search
```

`search` puede buscar en:

```text id="s4o2qc"
name
slug
legalName
```

---

## 40. Performance esperada

El módulo tenants tendrá volumen bajo o medio.

Índices suficientes en MVP:

```text id="n5h04d"
slug
status
created_at
wordpress_conjunto_slug
```

No se requiere particionamiento.

---

## 41. Seguridad de datos

### 41.1. Riesgo de exposición pública

Mitigación:

* DTO público específico;
* endpoint público separado;
* no retornar entidad completa;
* contract tests;
* security tests.

---

### 41.2. Riesgo de modificación cross-tenant

Mitigación:

* TenantGuard;
* permisos tenant-scoped;
* pruebas multitenant;
* repositorios con tenant context.

El tenant seleccionado por la UI no se almacena en estas tablas. El contexto se
resuelve por solicitud desde `X-Tenant-Id` y la validación Core; `tenantId` en el
modelo expresa propiedad de datos, no autoridad del cliente.

---

### 41.3. Riesgo de cambio accidental de estado

Mitigación:

* endpoints explícitos;
* motivo requerido para suspensión;
* permisos globales;
* auditoría;
* no actualizar status mediante PATCH genérico.

---

## 42. Convenciones de errores relacionados con datos

| Caso                | Código                             | HTTP |
| ------------------- | ---------------------------------- | ---: |
| Slug duplicado      | `TENANT_SLUG_ALREADY_EXISTS`       |  409 |
| Tenant inexistente  | `TENANT_NOT_FOUND`                 |  404 |
| Status inválido     | `TENANT_INVALID_STATUS`            |  422 |
| Transición inválida | `TENANT_STATUS_TRANSITION_INVALID` |  409 |
| Slug inválido       | `TENANT_INVALID_SLUG`              |  422 |
| Timezone inválida   | `TENANT_INVALID_TIMEZONE`          |  422 |
| Currency inválida   | `TENANT_INVALID_CURRENCY`          |  422 |
| URL inválida        | `TENANT_INVALID_URL`               |  422 |
| Color inválido      | `TENANT_INVALID_COLOR`             |  422 |

---

## 43. Datos de prueba mínimos

### 43.1. Tenant activo

```text id="wwixwg"
name: Villa Club Demo
slug: villa-club-demo
status: active
```

---

### 43.2. Tenant pendiente

```text id="wma3hy"
name: Altos del Norte Demo
slug: altos-del-norte-demo
status: pendingSetup
```

---

### 43.3. Tenant suspendido

```text id="jvsk2p"
name: Tenant Suspendido Demo
slug: tenant-suspendido-demo
status: suspended
suspensionReason: Demo suspension
```

---

### 43.4. Tenant archivado

```text id="scd91a"
name: Tenant Archivado Demo
slug: tenant-archivado-demo
status: archived
```

---

## 44. Tests de modelo requeridos

### 44.1. Unitarios

* `TenantSlug` normaliza correctamente.
* `TenantSlug` rechaza reservados.
* `TenantStatus` valida transiciones.
* `TenantColor` valida hex.
* `TenantCurrency` acepta solo USD en MVP.
* `TenantTimezone` acepta `America/Guayaquil`.

---

### 44.2. Integración

* Crea tenant con profile/config/branding/mapping.
* Falla por slug duplicado.
* Falla por segundo profile del mismo tenant.
* Falla por segundo configuration del mismo tenant.
* No permite cascade delete.
* Carga perfil público correctamente.

---

### 44.3. Multitenant

* TenantAdmin A no modifica Tenant B.
* Configuración A no afecta B.
* Branding A no afecta B.
* Mapping A no afecta B.

---

## 45. Compatibilidad con migraciones futuras

Este modelo debe permitir agregar:

* dominio personalizado;
* alias de slug;
* configuración financiera;
* módulos habilitados por plan;
* feature flags;
* billing SaaS;
* límites por tenant;
* storage quota;
* configuración de notificaciones;
* configuración de pagos;
* datos legales;
* datos tributarios;
* integración contable.

No agregar esos campos en MVP salvo necesidad directa.

---

## 46. Campos diferidos

No incluir todavía:

```text id="hsstl2"
customDomain
billingCustomerId
subscriptionId
storageQuota
paymentGatewayAccountId
taxId
legalRepresentative
contractStartDate
contractEndDate
featureFlags JSONB
advancedSettings JSONB
```

Razón:

* no son necesarios para el MVP;
* pueden introducir complejidad prematura;
* requieren decisiones comerciales y legales posteriores.

---

## 47. Uso de JSONB

No usar JSONB para el modelo principal de tenants en MVP.

Razón:

* se conocen los campos necesarios;
* se requiere validación fuerte;
* se requiere OpenAPI claro;
* se requiere seguridad de campos públicos;
* se debe evitar configuración opaca.

JSONB podrá evaluarse para:

```text id="swbwzz"
metadata
advancedSettings
integrationPayloads
```

en una fase posterior.

---

## 48. Reglas de retención

* Tenants archivados se conservan.
* Cambios críticos se auditan.
* No eliminar tenant físicamente sin procedimiento formal.
* Datos públicos pueden actualizarse.
* Datos históricos financieros futuros no se eliminan al archivar tenant.

---

## 49. Checklist de migración

Antes de aceptar la migración:

```text id="lpasox"
- [ ] Enum TenantStatus creado.
- [ ] Tabla tenants creada.
- [ ] Tabla tenant_profiles creada.
- [ ] Tabla tenant_branding creada.
- [ ] Tabla tenant_configurations creada.
- [ ] Tabla tenant_wordpress_mappings creada.
- [ ] slug único.
- [ ] tenant_id único en tablas 1:1.
- [ ] onDelete Restrict.
- [ ] Índices creados.
- [ ] Defaults correctos.
- [ ] No cascade delete peligroso.
- [ ] Migración aplicada en local.
- [ ] Migration test ejecutado.
- [ ] Prisma Client generado.
```

---

## 50. Decisión final del modelo

El módulo `001-tenants` usará cinco tablas principales:

```text id="3l8j7f"
tenants
tenant_profiles
tenant_branding
tenant_configurations
tenant_wordpress_mappings
```

`tenants` será la raíz de aislamiento del sistema.

Las demás tablas tendrán relación 1:1 con `tenants` mediante `tenant_id`.

El estado del tenant se modelará con `TenantStatus`.

No se permitirá eliminación física ordinaria.

El endpoint público usará un DTO específico para evitar exposición accidental de datos internos.

La propiedad de roles, permisos y membresías corresponde a `002-users-roles`,
pero el onboarding inicial debe persistir esas relaciones dentro de la misma
transacción que crea el tenant. No se acepta un tenant parcial ni un placeholder
de roles.

Este modelo permite implementar el onboarding inicial de conjuntos residenciales y habilita los módulos posteriores de usuarios, propiedades, alícuotas, pagos, reportes y auditoría.
