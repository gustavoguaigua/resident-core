FROM node:24.18.0-bookworm-slim AS build

RUN apt-get update \
    && apt-get install --yes --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable \
    && corepack prepare pnpm@11.21.0 --activate

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma

RUN --mount=type=cache,id=resident-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm --filter @resident/api... build
RUN test -f /workspace/apps/api/dist/main.js \
    && mkdir --parents /tmp/resident-api-dist \
    && cp --archive /workspace/apps/api/dist/. /tmp/resident-api-dist/
RUN pnpm --filter @resident/api deploy --prod --legacy /opt/resident-api \
    && rm -rf /opt/resident-api/dist \
    && mkdir --parents /opt/resident-api/dist \
    && cp --archive /tmp/resident-api-dist/. /opt/resident-api/dist/ \
    && test -f /opt/resident-api/dist/main.js \
    && generated_client_dir="$(dirname "$(find /workspace/node_modules/.pnpm -path '*/node_modules/.prisma/client/schema.prisma' -print -quit)")" \
    && deployed_client_dir="$(dirname "$(find /opt/resident-api/node_modules/.pnpm -path '*/node_modules/.prisma/client/default.js' -print -quit)")" \
    && test -n "$generated_client_dir" \
    && test -n "$deployed_client_dir" \
    && rm -rf "$deployed_client_dir" \
    && mkdir --parents "$deployed_client_dir" \
    && cp --archive "$generated_client_dir/." "$deployed_client_dir/"

FROM node:24.18.0-bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install --yes --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build --chown=node:node /opt/resident-api ./
COPY --from=build --chown=node:node /workspace/packages/auth/package.json /workspace/packages/auth/package.json
COPY --from=build --chown=node:node /workspace/packages/auth/dist /workspace/packages/auth/dist
COPY --from=build --chown=node:node /workspace/packages/config/package.json /workspace/packages/config/package.json
COPY --from=build --chown=node:node /workspace/packages/config/dist /workspace/packages/config/dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
