export interface DocumentStorageConfig {
  readonly provider: "MINIO" | "S3" | "S3_COMPATIBLE";
  readonly endpoint?: string;
  readonly region: string;
  readonly bucket: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly forcePathStyle: boolean;
  readonly serverSideEncryption?: "AES256" | "aws:kms";
}

export function parseDocumentStorageConfig(
  source: Readonly<Record<string, unknown>>,
): DocumentStorageConfig {
  const appEnvironment = text(source, "APP_ENV", "local");
  const provider = text(
    source,
    "DOCUMENT_STORAGE_PROVIDER",
    appEnvironment === "local" ? "MINIO" : "S3_COMPATIBLE",
  );
  if (!new Set(["MINIO", "S3", "S3_COMPATIBLE"]).has(provider)) {
    throw new Error("Invalid configuration for DOCUMENT_STORAGE_PROVIDER.");
  }
  const endpoint = optionalText(source, "S3_ENDPOINT");
  const encryption = optionalText(
    source,
    "DOCUMENT_STORAGE_S3_SERVER_SIDE_ENCRYPTION",
  );
  if (appEnvironment !== "local") {
    if (endpoint !== undefined && new URL(endpoint).protocol !== "https:") {
      throw new Error("Document storage requires TLS outside local.");
    }
    if (encryption !== "AES256" && encryption !== "aws:kms") {
      throw new Error(
        "Document storage requires server-side encryption outside local.",
      );
    }
  }
  return {
    provider: provider as DocumentStorageConfig["provider"],
    ...(endpoint === undefined ? {} : { endpoint }),
    region: text(source, "S3_REGION", "us-east-1"),
    bucket: text(
      source,
      "S3_BUCKET",
      appEnvironment === "local" ? "resident-local" : undefined,
    ),
    accessKeyId: text(
      source,
      "S3_ACCESS_KEY",
      appEnvironment === "local" ? "minio_dev_access" : undefined,
    ),
    secretAccessKey: text(
      source,
      "S3_SECRET_KEY",
      appEnvironment === "local" ? "minio_dev_secret" : undefined,
    ),
    forcePathStyle: provider !== "S3",
    ...(encryption === "AES256" || encryption === "aws:kms"
      ? { serverSideEncryption: encryption }
      : {}),
  };
}

function text(
  source: Readonly<Record<string, unknown>>,
  key: string,
  fallback?: string,
): string {
  const value = source[key] ?? fallback;
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid configuration for ${key}.`);
  }
  return value.trim();
}

function optionalText(
  source: Readonly<Record<string, unknown>>,
  key: string,
): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}
