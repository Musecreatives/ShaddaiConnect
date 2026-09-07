# Build context is the repo root (see docker/docker-compose.portal.yml) — a pnpm workspace
# needs pnpm-lock.yaml + every workspace package.json present to resolve dependencies correctly.
FROM node:22-alpine AS base
RUN corepack enable

FROM base AS build
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @shaddai/api exec prisma generate
RUN pnpm --filter @shaddai/api build
# `pnpm deploy` resolves this single workspace package's prod dependency graph into a
# standalone folder with real files (no cross-package symlinks) — the reliable way to get a
# pnpm workspace package running outside the monorepo. It respects .gitignore, so `dist/`
# (gitignored, built above) isn't included — copied in separately below.
# --legacy: pnpm 10 defaults to "injected" workspace-package deploys, which only matters for
# packages that depend on other workspace packages (api has none — no @shaddai/ui dependency).
RUN pnpm --filter @shaddai/api deploy --prod --legacy /out
RUN cp -r /repo/apps/api/dist /out/dist
# `deploy --prod` prunes devDependencies (incl. the `prisma` CLI) after its own postinstall runs,
# and that postinstall's generated .prisma/client engine files don't survive the prune (verified:
# /out/node_modules/@prisma/client's default.js requires '.prisma/client/default', which doesn't
# exist post-deploy — MODULE_NOT_FOUND at container boot). Regenerate here, pinned to the exact
# resolved version (not bare `npx prisma generate`, which fetches latest — Prisma 7 breaks this
# schema's `url = env(...)` datasource block, the same incompatibility already recorded in
# .docs/DECISIONS.md for Node version reasons; pinning sidesteps it here too).
RUN cd /out && npx --yes prisma@6.19.3 generate

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
# openssh-client: PfsenseService drives pfSense's captive portal (real-time session disconnect
# and MAC block/unblock) by running pfSsh.php playback scripts over SSH. This is the only
# mechanism that actually works — pfSense's captive portal never implemented RADIUS CoA
# (Redmine #13625), so CoaService's Disconnect-Requests to UDP 3799 always time out.
RUN apk add --no-cache openssh-client
COPY --from=build /out ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
