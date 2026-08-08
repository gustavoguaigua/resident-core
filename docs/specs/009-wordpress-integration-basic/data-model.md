# Data Model — Spec 009 WordPress Integration Basic

## 1. Información del documento

| Campo                  | Valor                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                  |
| Spec ID                | 009                                                                                            |
| Módulo                 | WordPress Integration Basic                                                                    |
| Documento              | Data Model                                                                                     |
| Ruta                   | `docs/specs/009-wordpress-integration-basic/data-model.md`                                     |
| Versión                | 0.1                                                                                            |
| Estado                 | Borrador inicial                                                                               |
| Fecha                  | 2026-07-14                                                                                     |
| Documento base         | `docs/specs/009-wordpress-integration-basic/spec.md`                                           |
| Plan técnico           | `docs/specs/009-wordpress-integration-basic/plan.md`                                           |
| Depende de             | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `008-basic-reports` |
| Base de datos          | PostgreSQL                                                                                     |
| ORM                    | Prisma                                                                                         |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                  |
| Naturaleza del módulo  | Public-safe / WordPress integration                                                            |
| API Style              | REST                                                                                           |
| Integración externa    | WordPress                                                                                      |

---

## 2. Propósito

Este documento define el modelo de datos para la integración básica entre WordPress y RESIDENT Core.

El objetivo del modelo es permitir que el portal WordPress multitenant consuma información pública del Core de forma segura, controlada y tenant-scoped, sin acceder directamente a la base de datos transaccional y sin exponer información financiera, personal o sensible.

Regla central:

```text id="vm1b83"
El modelo de integración WordPress debe separar claramente los datos publicables de los datos transaccionales privados del Core.
```

---

## 3. Decisión principal del modelo

Para MVP se recomienda crear tablas separadas para la información pública e integración WordPress:

```text id="cfm6ag"
tenant_public_profiles
tenant_wordpress_mappings
```

Razones:

* evita sobrecargar la tabla `tenants`;
* separa configuración pública de configuración operativa interna;
* permite clasificar campos publicables;
* permite controlar visibilidad;
* permite auditar cambios;
* facilita futura integración con otros canales públicos;
* reduce el riesgo de exponer accidentalmente datos internos del tenant;
* permite evolución hacia publicación, cache, snapshots o canales adicionales.

---

## 4. Alternativa considerada

### 4.1. Extender tabla `tenants`

Campos posibles en `tenants`:

```text id="qcgbzz"
public_name
public_description
public_email
public_phone
public_whatsapp
public_address
website_url
resident_portal_url
wordpress_slug
wordpress_url
wordpress_allowed_origin
is_public_visible
branding
public_metadata
```

### 4.2. Ventajas

* menos tablas;
* implementación inicial más rápida;
* menos joins;
* menos migraciones.

### 4.3. Desventajas

* mezcla datos internos con datos públicos;
* dificulta versionar visibilidad pública;
* aumenta riesgo de exposición accidental;
* complica evolución hacia múltiples portales/canales;
* complica auditoría específica del mapping;
* acopla demasiado Tenant Management con External Integrations.

### 4.4. Decisión

Para mantener una separación limpia desde el diseño, el MVP usará tablas separadas.

---

## 5. Tablas principales

### 5.1. Tablas nuevas MVP

```text id="y4evm0"
tenant_public_profiles
tenant_wordpress_mappings
```

---

### 5.2. Tablas fuente existentes

El módulo se apoya en:

```text id="s4d0mn"
tenants
audit_logs
user_profiles
user_tenant_memberships
```

En futuras specs podría apoyarse en:

```text id="tx1hku"
announcements
common_areas
files
media_assets
```

Si esos módulos aún no existen, los endpoints correspondientes pueden quedar preparados contractualmente pero implementarse con datos mock/controlados o diferirse.

---

## 6. Entidad `TenantPublicProfile`

### 6.1. Propósito

Representa la vista pública controlada de un tenant.

No debe contener información financiera ni datos personales privados.

### 6.2. Tabla

```text id="r7efuw"
tenant_public_profiles
```

### 6.3. Campos

```text id="k0wbyw"
TenantPublicProfile
├── id
├── tenantId
├── publicName
├── publicSlug
├── publicDescription
├── slogan
├── history
├── mission
├── vision
├── publicRulesSummary
├── publicEmail
├── publicPhone
├── publicWhatsapp
├── publicAddress
├── websiteUrl
├── residentPortalUrl
├── logoUrl
├── bannerUrl
├── primaryColor
├── secondaryColor
├── galleryUrls
├── socialLinks
├── publicMetadata
├── visibility
├── status
├── publishedAt
├── lastPublicUpdateAt
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 6.4. Reglas de negocio

* `tenantId` obligatorio.
* Un tenant debe tener como máximo un perfil público activo.
* `publicSlug` debe ser único para perfiles activos.
* `visibility = visible` permite exposición pública.
* `status = published` permite exposición pública.
* `tenant.status = active` requerido para exposición pública ordinaria.
* `publicName` requerido para perfil visible.
* `publicSlug` requerido para perfil visible.
* `publicEmail`, `publicPhone`, `publicWhatsapp` deben ser institucionales.
* `residentPortalUrl` no debe contener tokens.
* `galleryUrls` debe contener URLs públicas o publicables.
* `publicMetadata` no debe contener datos privados.

---

## 7. Entidad `TenantWordPressMapping`

### 7.1. Propósito

Representa la relación técnica entre un tenant del Core y su representación en WordPress.

### 7.2. Tabla

```text id="eyewrj"
tenant_wordpress_mappings
```

### 7.3. Campos

```text id="rfel4p"
TenantWordPressMapping
├── id
├── tenantId
├── wordpressSlug
├── wordpressUrl
├── wordpressAllowedOrigin
├── externalPublicId
├── wordpressPostId
├── wordpressPostType
├── wordpressSiteId
├── integrationStatus
├── isPublicVisible
├── lastSyncedAt
├── lastValidatedAt
├── createdBy
├── updatedBy
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 7.4. Reglas de negocio

* `tenantId` obligatorio.
* Un tenant debe tener como máximo un mapping WordPress activo en MVP.
* `wordpressSlug` debe ser único entre mappings activos.
* `wordpressAllowedOrigin` debe ser HTTPS en producción.
* `wordpressUrl` debe ser HTTPS en producción.
* `externalPublicId` puede guardar referencia al post o entidad externa.
* `wordpressPostId` puede guardar ID del CPT `conjunto`.
* `wordpressPostType` recomendado: `conjunto`.
* `integrationStatus` controla si el mapping está activo, pendiente o deshabilitado.
* Cambios deben auditarse.
* No debe guardar credenciales de WordPress en texto plano.
* No debe guardar tokens.
* No debe guardar cookies.
* No debe guardar secretos.

---

## 8. Enums

## 8.1. PublicProfileVisibility

```text id="gfi90f"
visible
hidden
restricted
```

### Uso

* `visible`: puede exponerse en endpoints públicos.
* `hidden`: no se expone.
* `restricted`: reservado para integraciones futuras con credenciales técnicas.

---

## 8.2. PublicProfileStatus

```text id="kdfiej"
draft
published
unpublished
archived
```

### Uso

* `published`: disponible si `visibility = visible` y tenant activo.
* `draft`: no público.
* `unpublished`: no público.
* `archived`: no público.

---

## 8.3. WordPressIntegrationStatus

```text id="tr1vu4"
pending
active
disabled
error
archived
```

### Uso

* `pending`: configurado pero no validado.
* `active`: integración habilitada.
* `disabled`: integración deshabilitada.
* `error`: integración con falla conocida.
* `archived`: mapping histórico.

---

## 8.4. PublicFieldClassification

```text id="bk9gsk"
public
publicDerived
restricted
private
sensitive
```

### Uso

Solo `public` y `publicDerived` pueden exponerse por endpoints públicos.

---

## 9. Modelo Prisma preliminar

## 9.1. Enums Prisma

```prisma id="s6w63c"
enum PublicProfileVisibility {
  VISIBLE    @map("visible")
  HIDDEN     @map("hidden")
  RESTRICTED @map("restricted")

  @@map("public_profile_visibility")
}

enum PublicProfileStatus {
  DRAFT       @map("draft")
  PUBLISHED   @map("published")
  UNPUBLISHED @map("unpublished")
  ARCHIVED    @map("archived")

  @@map("public_profile_status")
}

enum WordPressIntegrationStatus {
  PENDING  @map("pending")
  ACTIVE   @map("active")
  DISABLED @map("disabled")
  ERROR    @map("error")
  ARCHIVED @map("archived")

  @@map("wordpress_integration_status")
}
```

---

## 9.2. Modelo `TenantPublicProfile`

```prisma id="td7x7q"
model TenantPublicProfile {
  id                 String                  @id @default(uuid())
  tenantId           String                  @map("tenant_id")

  publicName         String                  @map("public_name")
  publicSlug         String                  @map("public_slug")
  publicDescription  String?                 @map("public_description")
  slogan             String?

  history            String?
  mission            String?
  vision             String?
  publicRulesSummary String?                 @map("public_rules_summary")

  publicEmail        String?                 @map("public_email")
  publicPhone        String?                 @map("public_phone")
  publicWhatsapp     String?                 @map("public_whatsapp")
  publicAddress      String?                 @map("public_address")

  websiteUrl         String?                 @map("website_url")
  residentPortalUrl  String?                 @map("resident_portal_url")

  logoUrl            String?                 @map("logo_url")
  bannerUrl          String?                 @map("banner_url")
  primaryColor       String?                 @map("primary_color")
  secondaryColor     String?                 @map("secondary_color")
  galleryUrls        Json?                   @map("gallery_urls")
  socialLinks        Json?                   @map("social_links")
  publicMetadata     Json?                   @map("public_metadata")

  visibility         PublicProfileVisibility @default(HIDDEN)
  status             PublicProfileStatus     @default(DRAFT)

  publishedAt        DateTime?               @map("published_at")
  lastPublicUpdateAt DateTime?               @map("last_public_update_at")

  createdAt          DateTime                @default(now()) @map("created_at")
  updatedAt          DateTime                @updatedAt @map("updated_at")
  archivedAt         DateTime?               @map("archived_at")

  tenant             Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  @@unique([tenantId])
  @@unique([publicSlug])
  @@index([tenantId])
  @@index([publicSlug])
  @@index([visibility])
  @@index([status])
  @@index([visibility, status])
  @@index([publishedAt])
  @@map("tenant_public_profiles")
}
```

---

## 9.3. Modelo `TenantWordPressMapping`

```prisma id="kc99pu"
model TenantWordPressMapping {
  id                     String                     @id @default(uuid())
  tenantId               String                     @map("tenant_id")

  wordpressSlug          String                     @map("wordpress_slug")
  wordpressUrl           String?                    @map("wordpress_url")
  wordpressAllowedOrigin String?                    @map("wordpress_allowed_origin")

  externalPublicId       String?                    @map("external_public_id")
  wordpressPostId        String?                    @map("wordpress_post_id")
  wordpressPostType      String?                    @map("wordpress_post_type")
  wordpressSiteId        String?                    @map("wordpress_site_id")

  integrationStatus      WordPressIntegrationStatus @default(PENDING) @map("integration_status")
  isPublicVisible        Boolean                    @default(false) @map("is_public_visible")

  lastSyncedAt           DateTime?                  @map("last_synced_at")
  lastValidatedAt        DateTime?                  @map("last_validated_at")

  createdBy              String?                    @map("created_by")
  updatedBy              String?                    @map("updated_by")

  createdAt              DateTime                   @default(now()) @map("created_at")
  updatedAt              DateTime                   @updatedAt @map("updated_at")
  archivedAt             DateTime?                  @map("archived_at")

  tenant                 Tenant                     @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  createdByUser          UserProfile?               @relation("TenantWordPressMappingCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser          UserProfile?               @relation("TenantWordPressMappingUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)

  @@unique([tenantId])
  @@unique([wordpressSlug])
  @@index([tenantId])
  @@index([wordpressSlug])
  @@index([wordpressAllowedOrigin])
  @@index([integrationStatus])
  @@index([isPublicVisible])
  @@index([externalPublicId])
  @@index([wordpressPostId])
  @@map("tenant_wordpress_mappings")
}
```

---

## 9.4. Cambios en `Tenant`

Agregar relaciones:

```prisma id="mrhn8x"
model Tenant {
  // campos existentes...

  publicProfile   TenantPublicProfile?
  wordpressMapping TenantWordPressMapping?
}
```

---

## 9.5. Cambios en `UserProfile`

Agregar relaciones si se usan `createdBy` y `updatedBy`:

```prisma id="cdxo70"
model UserProfile {
  // campos existentes...

  wordpressMappingsCreated TenantWordPressMapping[] @relation("TenantWordPressMappingCreatedBy")
  wordpressMappingsUpdated TenantWordPressMapping[] @relation("TenantWordPressMappingUpdatedBy")
}
```

---

## 10. Constraints recomendadas

## 10.1. `tenant_public_profiles`

Recomendadas:

```text id="kt3wti"
public_name NOT NULL
public_slug NOT NULL
public_slug unique
tenant_id unique
visibility NOT NULL
status NOT NULL
primary_color formato HEX si existe
secondary_color formato HEX si existe
public_email formato email si existe
website_url URL válida si existe
resident_portal_url URL válida si existe
```

---

## 10.2. `tenant_wordpress_mappings`

Recomendadas:

```text id="p1r8km"
tenant_id unique
wordpress_slug unique
wordpress_slug NOT NULL
wordpress_allowed_origin URL origin válida si existe
wordpress_url URL válida si existe
integration_status NOT NULL
is_public_visible NOT NULL
wordpress_post_type = 'conjunto' si se configura en MVP
```

---

## 10.3. Soft delete y uniqueness

Con `archivedAt`, en PostgreSQL puede requerirse índice único parcial para permitir históricos.

Recomendación para MVP:

```text id="kcicw5"
No permitir duplicados aunque estén archivados, salvo que se implemente unique partial index.
```

Alternativa futura:

```sql id="ppwfll"
CREATE UNIQUE INDEX tenant_public_profiles_public_slug_active_unique
ON tenant_public_profiles(public_slug)
WHERE archived_at IS NULL;
```

```sql id="u2mwo7"
CREATE UNIQUE INDEX tenant_wordpress_mappings_slug_active_unique
ON tenant_wordpress_mappings(wordpress_slug)
WHERE archived_at IS NULL;
```

---

## 11. Reglas de visibilidad pública

Un perfil puede salir por endpoint público si:

```text id="s95qwu"
tenant.status = active
AND tenant_public_profiles.visibility = visible
AND tenant_public_profiles.status = published
AND tenant_public_profiles.archived_at IS NULL
```

Un mapping WordPress puede usarse si:

```text id="did4wj"
tenant.status = active
AND tenant_wordpress_mappings.integration_status = active
AND tenant_wordpress_mappings.is_public_visible = true
AND tenant_wordpress_mappings.archived_at IS NULL
```

Regla combinada para endpoint público:

```text id="ng61tq"
tenant activo
+ perfil público visible/publicado
+ mapping activo/visible si se consulta desde WordPress
```

---

## 12. Clasificación de campos

## 12.1. Campos públicos

```text id="sh68pv"
tenantPublicId
publicSlug
publicName
publicDescription
slogan
history
mission
vision
publicRulesSummary
logoUrl
bannerUrl
primaryColor
secondaryColor
galleryUrls
websiteUrl
residentPortalUrl
publicEmail
publicPhone
publicWhatsapp
publicAddress
socialLinks
```

---

## 12.2. Campos publicDerived

```text id="onsrul"
publicStatus
hasResidentPortal
hasPublicAnnouncements
hasPublicCommonAreas
```

---

## 12.3. Campos restricted

```text id="yg4hdz"
wordpressAllowedOrigin
externalPublicId
wordpressPostId
wordpressSiteId
lastSyncedAt
lastValidatedAt
```

---

## 12.4. Campos private

```text id="i50hny"
tenantId
createdBy
updatedBy
internal integration status details
internal validation errors
```

---

## 12.5. Campos sensitive

```text id="r9ujd8"
tokens
api keys
secrets
cookies
authorization headers
database credentials
payment data
account statements
resident personal data
owner personal data
audit metadata
```

Regla:

```text id="dl1hkl"
Solo public y publicDerived pueden salir por endpoints /api/v1/public.
```

---

## 13. DTOs públicos derivados del modelo

## 13.1. `PublicTenantDto`

Fuente:

```text id="j9khdx"
tenant_public_profiles
tenant_wordpress_mappings
tenants
```

Campos:

```text id="xhmqvw"
tenantPublicId
slug
publicName
slogan
publicDescription
residentPortalUrl
websiteUrl
```

No incluir:

```text id="y23p5w"
tenantId interno
integrationStatus
wordpressAllowedOrigin
createdBy
updatedBy
```

---

## 13.2. `PublicBrandingDto`

Fuente:

```text id="unzczy"
tenant_public_profiles
```

Campos:

```text id="jl3r1l"
logoUrl
bannerUrl
primaryColor
secondaryColor
galleryUrls
```

---

## 13.3. `PublicContactDto`

Fuente:

```text id="pcp997"
tenant_public_profiles
```

Campos:

```text id="mwyxg9"
publicEmail
publicPhone
publicWhatsapp
publicAddress
socialLinks
```

---

## 13.4. `PublicLinksDto`

Fuente:

```text id="wu6ec5"
tenant_public_profiles
tenant_wordpress_mappings
```

Campos:

```text id="mcv73y"
residentPortalUrl
websiteUrl
wordpressUrl
```

Regla:

```text id="nnj407"
Ningún link debe contener tokens, session IDs ni parámetros sensibles.
```

---

## 13.5. `WordPressMappingDto`

Fuente:

```text id="y7856l"
tenant_wordpress_mappings
```

Campos administrativos:

```text id="d9ofby"
tenantId
wordpressSlug
wordpressUrl
wordpressAllowedOrigin
externalPublicId
wordpressPostId
wordpressPostType
wordpressSiteId
integrationStatus
isPublicVisible
lastSyncedAt
lastValidatedAt
updatedAt
```

Disponible solo en endpoints autenticados.

---

## 14. Relación con ACF WordPress

Campos ACF actuales:

```text id="p57qdr"
logo
banner_principal
color_primario
color_secundario
slogan
url_residentes
whatsapp
telefono
email
direccion
facebook
instagram
youtube
historia
mision
vision
foto_1
foto_2
foto_3
foto_4
foto_5
foto_6
```

Mapeo sugerido:

| ACF WordPress       | Core `TenantPublicProfile` |
| ------------------- | -------------------------- |
| `logo`              | `logoUrl`                  |
| `banner_principal`  | `bannerUrl`                |
| `color_primario`    | `primaryColor`             |
| `color_secundario`  | `secondaryColor`           |
| `slogan`            | `slogan`                   |
| `url_residentes`    | `residentPortalUrl`        |
| `whatsapp`          | `publicWhatsapp`           |
| `telefono`          | `publicPhone`              |
| `email`             | `publicEmail`              |
| `direccion`         | `publicAddress`            |
| `facebook`          | `socialLinks.facebook`     |
| `instagram`         | `socialLinks.instagram`    |
| `youtube`           | `socialLinks.youtube`      |
| `historia`          | `history`                  |
| `mision`            | `mission`                  |
| `vision`            | `vision`                   |
| `foto_1` a `foto_6` | `galleryUrls`              |

---

## 15. Fuente oficial por campo en MVP

Durante MVP se permite coexistencia de datos entre WordPress y Core, pero debe definirse precedencia.

Recomendación inicial:

| Campo                  | Fuente primaria MVP              | Fallback           |
| ---------------------- | -------------------------------- | ------------------ |
| slug                   | WordPress y Core deben coincidir | WordPress CPT slug |
| logo/banner            | WordPress ACF                    | Core si existe     |
| colores                | WordPress ACF                    | Core si existe     |
| slogan                 | WordPress ACF                    | Core si existe     |
| contacto               | WordPress ACF                    | Core si existe     |
| historia/misión/visión | WordPress ACF                    | Core si existe     |
| residentPortalUrl      | Core                             | WordPress ACF      |
| visibility/mapping     | Core                             | no fallback        |
| datos financieros      | Core privado                     | no público         |
| datos personales       | Core privado                     | no público         |

Regla:

```text id="wi8riv"
Aunque WordPress pueda conservar ACF como fallback visual, WordPress no es fuente transaccional ni financiera.
```

---

## 16. Datos prohibidos en el modelo WordPress

No guardar en `tenant_public_profiles`, `tenant_wordpress_mappings` ni `publicMetadata`:

```text id="kfrmgb"
passwords
passwordHash
accessToken
refreshToken
idToken
authorization header
cookies
apiKey completa
clientSecret
privateKey
databaseUrl
connectionString
payment data
account statements
payment receipts
resident names
owner names
identification numbers
personal emails
personal phones
emergency contacts
audit oldValue
audit newValue
audit metadata completa
```

---

## 17. Índices

## 17.1. `tenant_public_profiles`

Índices recomendados:

```text id="rbiu51"
tenant_id unique
public_slug unique
visibility
status
visibility + status
published_at
archived_at
```

---

## 17.2. `tenant_wordpress_mappings`

Índices recomendados:

```text id="nktjti"
tenant_id unique
wordpress_slug unique
wordpress_allowed_origin
integration_status
is_public_visible
external_public_id
wordpress_post_id
archived_at
```

---

## 17.3. Índices para endpoints públicos

Los endpoints públicos resolverán principalmente por:

```text id="nsx70o"
public_slug
wordpress_slug
visibility + status
integration_status + is_public_visible
```

Por ello, esos campos deben estar indexados.

---

## 18. Queries conceptuales

## 18.1. Resolver tenant público por slug

```sql id="sg47vj"
SELECT
  t.id AS tenant_id,
  p.id AS profile_id,
  p.public_slug,
  p.public_name,
  p.slogan,
  p.public_description,
  p.website_url,
  p.resident_portal_url
FROM tenant_public_profiles p
JOIN tenants t
  ON t.id = p.tenant_id
WHERE p.public_slug = $1
  AND p.visibility = 'visible'
  AND p.status = 'published'
  AND p.archived_at IS NULL
  AND t.status = 'active'
LIMIT 1;
```

---

## 18.2. Resolver branding público

```sql id="jhmv8p"
SELECT
  p.logo_url,
  p.banner_url,
  p.primary_color,
  p.secondary_color,
  p.gallery_urls
FROM tenant_public_profiles p
JOIN tenants t
  ON t.id = p.tenant_id
WHERE p.public_slug = $1
  AND p.visibility = 'visible'
  AND p.status = 'published'
  AND p.archived_at IS NULL
  AND t.status = 'active'
LIMIT 1;
```

---

## 18.3. Resolver mapping WordPress

```sql id="v8utq9"
SELECT
  m.id,
  m.tenant_id,
  m.wordpress_slug,
  m.wordpress_url,
  m.wordpress_allowed_origin,
  m.external_public_id,
  m.wordpress_post_id,
  m.integration_status,
  m.is_public_visible
FROM tenant_wordpress_mappings m
JOIN tenants t
  ON t.id = m.tenant_id
WHERE m.wordpress_slug = $1
  AND m.integration_status = 'active'
  AND m.is_public_visible = true
  AND m.archived_at IS NULL
  AND t.status = 'active'
LIMIT 1;
```

---

## 18.4. Validar origin por slug

```sql id="h4n8xd"
SELECT
  m.wordpress_allowed_origin
FROM tenant_wordpress_mappings m
JOIN tenants t
  ON t.id = m.tenant_id
WHERE m.wordpress_slug = $1
  AND m.integration_status = 'active'
  AND m.is_public_visible = true
  AND m.archived_at IS NULL
  AND t.status = 'active'
LIMIT 1;
```

---

## 19. Reglas de validación

## 19.1. Slug

Formato:

```text id="cdj3wh"
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Longitud sugerida:

```text id="vlkt0d"
3 <= length <= 120
```

---

## 19.2. URL

Permitido en producción:

```text id="kpfyyf"
https://...
```

Permitido en desarrollo:

```text id="aejyy8"
http://localhost:...
```

Prohibido:

```text id="cj4mie"
javascript:
file:
data:
ftp:
```

---

## 19.3. Origin

Debe ser origin válido:

```text id="qgt5fw"
scheme + host + optional port
```

Ejemplo válido:

```text id="uqnzg9"
https://www.resident.gustavoguaigua.com
```

Ejemplo inválido:

```text id="addwti"
https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2
```

---

## 19.4. Colores

Formato HEX:

```text id="evpj68"
#RGB
#RRGGBB
```

Ejemplos:

```text id="hbvw5c"
#0EA5E9
#F59E0B
#fff
```

---

## 19.5. Email

Validar formato email simple.

Debe ser institucional, no personal, por política funcional.

---

## 19.6. Social links

Permitir:

```text id="op27fp"
facebook
instagram
youtube
x
tiktok
linkedin
```

URLs deben ser HTTPS en producción.

---

## 20. Reglas de CORS basadas en modelo

La política CORS debe leer:

```text id="be2f7y"
tenant_wordpress_mappings.wordpress_allowed_origin
```

Validación:

```text id="w2tr11"
request Origin == wordpressAllowedOrigin
```

Para múltiples orígenes futuros, puede evolucionar a JSON array o tabla separada:

```text id="j1emim"
tenant_wordpress_allowed_origins
```

MVP:

```text id="fb873z"
Un origin principal por mapping.
```

---

## 21. Reglas de caché basadas en modelo

Campos relevantes:

```text id="jd615j"
updatedAt
lastPublicUpdateAt
publishedAt
```

Uso:

* `Last-Modified` puede derivarse de `lastPublicUpdateAt` o `updatedAt`.
* `ETag` puede derivarse de hash del DTO público.
* TTL inicial: 300 segundos.

Regla:

```text id="fot71h"
Solo datos public-safe pueden recibir Cache-Control public.
```

---

## 22. Auditoría de cambios

Los cambios en `TenantPublicProfile` y `TenantWordPressMapping` deben generar eventos de auditoría.

Eventos:

```text id="j1971p"
tenant.publicProfile.updated
tenant.publicVisibility.updated
tenant.wordpressMapping.updated
wordpress.integration.updated
```

Metadata permitida:

```text id="cn1o0i"
tenantId
wordpressSlug
wordpressUrl
wordpressAllowedOrigin
externalPublicId
isPublicVisible
integrationStatus
changedFields
traceId
```

No registrar:

```text id="a7jfa0"
payload completo
headers
cookies
tokens
secretos
datos financieros
datos personales privados
```

---

## 23. Seeds

## 23.1. Seeds recomendados

Crear perfiles públicos demo:

```text id="zw7mnk"
tenantPublicProfileSanJoseLaSalle2
tenantPublicProfileAltosDelNorte
tenantPublicProfileJardinesDelValle
tenantPublicProfilePortalDelRio
```

Crear mappings WordPress demo:

```text id="de4ucd"
wordpressMappingSanJoseLaSalle2
wordpressMappingAltosDelNorte
wordpressMappingJardinesDelValle
wordpressMappingPortalDelRio
```

---

## 23.2. Datos demo sugeridos

```text id="s364g8"
publicName
publicSlug
slogan
logoUrl demo
bannerUrl demo
primaryColor
secondaryColor
publicEmail institucional demo
publicPhone institucional demo
publicWhatsapp institucional demo
wordpressUrl
wordpressAllowedOrigin
isPublicVisible
```

---

## 23.3. Datos prohibidos en seeds

```text id="o1rrgx"
datos reales de residentes
nombres reales de residentes
nombres reales de propietarios
emails personales
teléfonos personales
cédulas
pagos
saldos
comprobantes
tokens
secrets
cookies
api keys reales
```

---

## 24. Migración

Nombre sugerido:

```text id="xha5p6"
009_create_tenant_public_profiles_and_wordpress_mappings
```

Pasos:

```text id="z7ti0i"
1. Crear enums.
2. Crear tenant_public_profiles.
3. Crear tenant_wordpress_mappings.
4. Crear índices.
5. Crear constraints.
6. Agregar relaciones Prisma.
7. Generar Prisma Client.
8. Ejecutar migración en DB test.
9. Ejecutar seeds demo.
10. Validar rollback si aplica.
```

---

## 25. Seguridad del modelo

## 25.1. No datos financieros

El modelo público no debe tener campos como:

```text id="sjf1lj"
balance
debt
payment
charge
statement
receipt
delinquency
```

---

## 25.2. No datos personales privados

El modelo público no debe tener campos como:

```text id="gn6k0a"
residentName
ownerName
personId
identificationNumber
personalEmail
personalPhone
emergencyContact
vehiclePlate
petOwner
```

---

## 25.3. No secretos

El modelo no debe guardar:

```text id="v7lcr7"
apiKey
clientSecret
accessToken
refreshToken
cookie
authorizationHeader
databaseUrl
```

---

## 25.4. URLs seguras

Todas las URLs públicas deben validarse.

En producción:

```text id="cvz681"
HTTPS obligatorio.
```

---

## 25.5. Public metadata restringido

`publicMetadata` debe ser JSON controlado.

Permitido:

```text id="zycu26"
shortLabels
displayPreferences
publicBadges
publicFeatureFlags
```

Prohibido:

```text id="id5gxe"
financialData
personalData
tokens
internalConfig
rawPayload
privateNotes
```

---

## 26. Relación con futuros módulos

## 26.1. Comunicados públicos

Futuro módulo:

```text id="x8egoz"
00X-public-announcements
```

Posible tabla:

```text id="j6a59b"
announcements
```

Campos relevantes:

```text id="bsx3iy"
tenant_id
slug
title
summary
content
visibility
status
published_at
cover_image_url
```

---

## 26.2. Áreas comunales públicas

Futuro módulo:

```text id="jm4tsi"
00X-common-areas
```

Posible tabla:

```text id="jqqb18"
common_areas
```

Campos relevantes:

```text id="zm5rv1"
tenant_id
slug
name
description
status
is_public_visible
cover_image_url
gallery_urls
public_rules_summary
```

---

## 26.3. Portal de residentes

Futuro módulo:

```text id="skxk3f"
00X-resident-portal
```

`residentPortalUrl` será el enlace público inicial.

---

## 26.4. Keycloak SSO

Futuro módulo:

```text id="dvs2ve"
00X-keycloak-sso
```

El modelo actual no guarda tokens ni credenciales SSO.

---

## 27. Tests de modelo requeridos

## 27.1. Unit tests

Probar:

```text id="b6o8m6"
WordPressSlug
WordPressUrl
WordPressOrigin
PublicVisibility
PublicFieldClassification
PublicCachePolicy
PublicLink
```

---

## 27.2. Repository tests

Probar:

```text id="d0zg79"
findPublicTenantBySlug
getPublicBrandingBySlug
getPublicContactBySlug
getPublicLinksBySlug
getTenantWordPressMapping
updateTenantWordPressMapping
getPlatformWordPressMapping
updatePlatformWordPressMapping
```

---

## 27.3. Multitenancy tests

Probar:

```text id="ze95yf"
slug A no devuelve tenant B
origin A no autoriza tenant B
wordpressSlug único
publicSlug único
mapping tenant A no modifica tenant B
```

---

## 27.4. Security tests

Probar:

```text id="zuuhxi"
no financial fields in public DTO
no personal private fields in public DTO
no secrets in publicMetadata
HTTPS required in production
CORS wildcard rejected
payload completo no auditado
```

---

## 28. Decisión final del modelo

El módulo `009-wordpress-integration-basic` usará dos tablas separadas en MVP:

```text id="wvy7zl"
tenant_public_profiles
tenant_wordpress_mappings
```

Estas tablas permitirán:

```text id="v0dc37"
- publicar información institucional controlada;
- mapear WordPress CPT conjunto con tenant Core;
- resolver tenants por slug;
- validar allowed origins;
- controlar visibilidad pública;
- preparar CORS seguro;
- preparar cache público;
- auditar cambios de mapping;
- evitar exposición de datos transaccionales.
```

El modelo no debe aceptarse si:

```text id="nmk1vu"
mezcla datos financieros en tablas públicas
guarda datos personales privados en perfiles públicos
almacena tokens o secretos de WordPress
permite wordpressSlug duplicado
permite publicSlug duplicado
permite CORS wildcard en producción
expone tenantId interno innecesariamente
permite publicar tenants suspendidos/inactivos/archivados
usa WordPress como fuente transaccional
```

---

## 29. Pendientes para evolución

Quedan diferidos:

```text id="y3ske3"
tenant_wordpress_allowed_origins múltiples
plugin WordPress personalizado
sync completo WordPress-Core
webhooks de invalidación de cache
LiteSpeed Cache purge
public announcements module
common areas module
resident portal module
Keycloak SSO module
GraphQL public API
API keys servidor-servidor
```

Estos diferidos no bloquean el MVP de integración básica.
