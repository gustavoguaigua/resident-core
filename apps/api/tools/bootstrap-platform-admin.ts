import { PrismaAuditWriter } from "../src/modules/audit/prisma-audit-writer.js";
import {
  PlatformAdminBootstrapError,
  parseBootstrapArguments,
} from "../src/modules/platform-admin-bootstrap/bootstrap-contract.js";
import { BootstrapFirstPlatformAdmin } from "../src/modules/platform-admin-bootstrap/bootstrap-first-platform-admin.js";
import { KeycloakPlatformIdentityClient } from "../src/modules/platform-admin-bootstrap/keycloak-platform-identity-client.js";
import { PrismaService } from "../src/platform/database/prisma.service.js";

const prisma = new PrismaService();

try {
  const { email } = parseBootstrapArguments(process.argv.slice(2));
  const identityLookup = KeycloakPlatformIdentityClient.fromEnvironment();
  const auditWriter = new PrismaAuditWriter(prisma);
  const useCase = new BootstrapFirstPlatformAdmin(
    prisma,
    identityLookup,
    auditWriter,
  );
  await prisma.$connect();
  const result = await useCase.execute(email);
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  const code =
    error instanceof PlatformAdminBootstrapError
      ? error.code
      : "BOOTSTRAP_FAILED";
  process.stderr.write(`${code}\n`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
