import { registerAs } from "@nestjs/config";

import { parseApplicationEnvironment } from "@resident/config";

export const APPLICATION_CONFIG_NAMESPACE = "platform";

export const applicationConfig = registerAs(APPLICATION_CONFIG_NAMESPACE, () =>
  parseApplicationEnvironment(process.env),
);
