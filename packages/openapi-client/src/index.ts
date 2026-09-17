import createClient, { type ClientOptions } from "openapi-fetch";

import type { paths } from "./generated/resident-core.js";

export type {
  components,
  operations,
  paths,
} from "./generated/resident-core.js";

export const OPENAPI_CLIENT_STATUS = "generated" as const;

/**
 * Creates a transport-only client. Authentication and tenant headers remain the
 * caller's responsibility and are never stored by this package.
 */
export function createResidentCoreClient(options: ClientOptions) {
  return createClient<paths>(options);
}
