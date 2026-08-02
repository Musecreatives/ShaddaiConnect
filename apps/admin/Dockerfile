# Build context is the repo root (see docker/docker-compose.portal.yml) — needs the pnpm
# workspace (pnpm-lock.yaml + packages/ui) present to build, per the monorepo's transpilePackages
# setup. `output: 'standalone'` (next.config.ts) traces only the files this app actually needs
# into .next/standalone, so the runtime stage doesn't need pnpm or the rest of the monorepo.
FROM node:22-alpine AS base
RUN corepack enable

FROM base AS build
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @shaddai/admin build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
# standalone's server.js reads PORT itself (not the `next start -p` flag from package.json,
# which isn't used here) — set explicitly to match this app's dev port convention.
ENV PORT=3002
COPY --from=build /repo/apps/admin/.next/standalone ./
COPY --from=build /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build /repo/apps/admin/public ./apps/admin/public
EXPOSE 3002
CMD ["node", "apps/admin/server.js"]
