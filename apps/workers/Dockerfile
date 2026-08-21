FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY apps/workers/package.json ./apps/workers/
COPY packages/ ./packages/

RUN pnpm install --filter=@saarthi/workers...

COPY apps/workers/ ./apps/workers/

RUN pnpm --filter=@saarthi/workers build

ENV NODE_ENV=production

CMD ["node", "apps/workers/dist/index.js"]
