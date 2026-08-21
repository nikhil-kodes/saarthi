# Saarthi — Environment Variables Reference

> This document tracks all environment variables introduced across development phases.

## Phase 1 & 2 Variables

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://your-project.supabase.co` | Public Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `eyJhbGciOiJIUzI1...` | Supabase public anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (Server only) | `eyJhbGciOiJIUzI1...` | Privileged service-role key for backend operations & audit logs |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Connection URI for Redis instance used by BullMQ queues |
| `REDIS_HOST` | Optional | `localhost` | Redis hostname (used by workers when configured separately) |
| `REDIS_PORT` | Optional | `6379` | Redis port |
| `NODE_ENV` | Yes | `development` | Application runtime environment (`development`, `production`, `test`) |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Public URL for client-side links and redirects |
| `APP_URL` | Yes | `http://localhost:3000` | Base application URL for server-side operations |
| `FASTAPI_URL` | Yes | `http://localhost:8000` | Internal URL for FastAPI AI service calls from Next.js |
| `INTERNAL_SERVICE_TOKEN` | Yes | `dev-internal-token-change-in-prod` | Pre-shared secret header for authenticating internal requests to FastAPI |

## Service-Specific Requirements

### `apps/web`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV`
- `NEXT_PUBLIC_APP_URL`
- `APP_URL`
- `FASTAPI_URL`
- `REDIS_URL`

### `apps/ai-service`
- `DATABASE_URL`
- `REDIS_URL`
- `INTERNAL_SERVICE_TOKEN`
- `FASTAPI_HOST`
- `FASTAPI_PORT`
- `DEBUG`

### `apps/workers`
- `REDIS_HOST` or `REDIS_URL`
- `REDIS_PORT`
- `NODE_ENV`
- `FASTAPI_URL`
- `INTERNAL_SERVICE_TOKEN`
