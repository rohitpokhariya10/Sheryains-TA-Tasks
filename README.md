# chotuApp

chotuApp is a full-stack realtime messaging workspace built with React, Node,
Express, Socket.IO, MongoDB, and ImageKit. It supports authenticated direct and
group conversations, optimistic message delivery, read receipts, presence,
typing indicators, user search, and direct browser-to-ImageKit media uploads.

## Table Of Contents

- [Product Capabilities](#product-capabilities)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker](#docker)
- [Architecture](#architecture)
- [API Contract](#api-contract)
- [Realtime Events](#realtime-events)
- [Media Upload Flow](#media-upload-flow)
- [Production Checklist](#production-checklist)
- [Presentation Overhaul](#presentation-overhaul)

## Product Capabilities

- Authenticated register, login, silent refresh, and logout flows.
- Access tokens held in client memory and rotating refresh tokens in httpOnly
  cookies.
- Direct and group conversations with realtime Socket.IO messaging.
- Optimistic message UI with server acknowledgement reconciliation.
- Delivery and read receipts for direct and group chats.
- Online presence, last-seen display, and typing indicators.
- User search by display name or username.
- Image messages, profile photos, and group avatars uploaded directly to
  ImageKit through signed server upload parameters.
- Feature-based frontend and layered backend structure suitable for continued
  product growth.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web | React 18, Vite, React Router, Redux Toolkit, TanStack Query |
| Styling | CSS Modules, shared design tokens, React Icons |
| API | Node 20, Express, Mongoose, Zod, express-validator |
| Realtime | Socket.IO |
| Data | MongoDB |
| Auth | JWT access tokens, refresh-token sessions, httpOnly cookies |
| Media | ImageKit signed uploads |
| Observability | Pino, pino-http, Morgan |
| Runtime | Docker Compose for API and MongoDB |

## Repository Structure

```text
chotuApp/
├── api/
│   ├── src/
│   │   ├── config/          # environment, database, CORS, logging, ImageKit
│   │   ├── modules/         # auth, chats, messages, uploads, users
│   │   ├── shared/          # models, DAO, middleware, utilities, routers
│   │   ├── sockets/         # Socket.IO domain handlers
│   │   ├── app.js
│   │   └── server.js
│   ├── .env                 # local development values
│   ├── .env.example         # safe template
│   └── Dockerfile
├── web/
│   ├── src/
│   │   ├── app/             # router, providers, store, socket bootstrap
│   │   ├── features/        # feature-owned API, hooks, state, UI
│   │   ├── shared/          # reusable UI primitives and product config
│   │   ├── styles/          # global design tokens
│   │   └── lib/             # axios and socket clients
│   ├── .env
│   └── .env.example
└── docker-compose.yml
```

## Environment Setup

Both applications have local `.env` files in this workspace. The values are
development defaults and should not be reused for production.

### API Environment

`api/.env`

| Variable | Purpose | Local value |
| --- | --- | --- |
| `NODE_ENV` | Runtime mode | `development` |
| `PORT` | API port | `8000` |
| `CLIENT_URL` | Allowed frontend origin for CORS/cookies | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/chotuapp` |
| `ACCESS_TOKEN_SECRET` | JWT access-token signing secret | generated local secret |
| `ACCESS_TOKEN_EXPIRY` | Access-token lifetime | `15m` |
| `REFRESH_TOKEN_SECRET` | JWT refresh-token signing secret | generated local secret |
| `REFRESH_TOKEN_EXPIRY` | Refresh-token lifetime | `7d` |
| `COOKIE_DOMAIN` | Cookie domain | `localhost` |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | replace with real key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | replace with real key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | replace with real endpoint |

Image uploads require real ImageKit credentials. Auth, chat, and realtime flows
can still be developed locally before replacing those credentials, but upload
requests will not succeed with placeholder keys.

### Web Environment

`web/.env`

| Variable | Purpose | Local value |
| --- | --- | --- |
| `VITE_API_URL` | Backend base URL used by Axios and Socket.IO | `http://localhost:8000` |

Set `VITE_API_URL` to an empty value if you want Vite to route `/api` and
`/socket.io` through the dev proxy instead of calling the API directly.

## Local Development

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally, or Docker for the MongoDB service
- ImageKit account for media upload testing

### Install Dependencies

```bash
cd api
npm install

cd ../web
npm install
```

### Run API

```bash
cd api
npm run dev
```

The API starts on `http://localhost:8000`.

### Run Web App

```bash
cd web
npm run dev
```

The web app starts on `http://localhost:5173`.

### Production Build Check

```bash
cd web
npm run build
```

## Docker

Docker Compose runs MongoDB and the API service. The web app is usually run
separately with Vite during local development.

```bash
docker compose up --build
```

Compose reads `api/.env`, overrides the container runtime mode to production,
and uses the internal MongoDB hostname:

```text
mongodb://mongo:27017/chotuapp
```

Before using Docker for a production-like run, replace the ImageKit keys and JWT
secrets in `api/.env`.

## Architecture

### Backend

The backend follows a layered module architecture:

- `config/` owns environment validation, database connection, CORS, logging, and
  ImageKit setup.
- `shared/models` contains Mongoose models.
- `shared/dao` isolates database query details.
- `shared/middlewares` contains auth, validation, and error handling.
- `modules/*` keeps each HTTP domain organized as router, validator,
  controller, and service.
- `sockets/*` handles realtime domain events and reuses service logic where
  possible.

### Frontend

The frontend follows an app/features/shared architecture:

- `app/` owns cross-cutting runtime setup: routing, Redux store, React Query,
  authenticated route guards, and socket subscription bootstrap.
- `features/*` owns domain behavior and UI for auth, users, chats, messages,
  and uploads.
- `shared/ui` owns reusable primitives such as avatars, icon buttons, product
  identity, spinners, ticks, and formatting helpers.
- `styles/global.css` defines product design tokens, focus states, layout
  primitives, and compatibility variables.

## API Contract

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a user account |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/refresh` | Rotate access/refresh tokens |
| `POST` | `/api/auth/logout` | Revoke current session |
| `GET` | `/api/auth/me` | Return current user |
| `GET` | `/api/users/search?q=` | Search users |
| `PATCH` | `/api/users/me` | Update profile |
| `GET` | `/api/chats` | List user chats |
| `GET` | `/api/chats/:id` | Get chat details |
| `POST` | `/api/chats/direct` | Open or create direct chat |
| `POST` | `/api/chats/group` | Create group chat |
| `PATCH` | `/api/chats/:id` | Update group metadata |
| `GET` | `/api/messages/:chatId` | Paginated message history |
| `POST` | `/api/messages/:chatId` | REST fallback message send |
| `GET` | `/api/uploads/auth` | Signed ImageKit upload params |

## Realtime Events

| Event | Direction | Purpose |
| --- | --- | --- |
| `message:send` | client to server | Send a message over Socket.IO |
| `message:new` | server to client | Broadcast created message |
| `message:delivered` | client to server | Acknowledge delivery |
| `message:read` | client to server | Acknowledge read state |
| `message:status` | server to client | Patch message receipt status |
| `typing:start` | client to server | Start typing indicator |
| `typing:stop` | client to server | Stop typing indicator |
| `presence:update` | server to client | Broadcast online/last-seen state |
| `chat:activity` | server to client | Refresh chat list ordering/activity |

## Media Upload Flow

1. The authenticated web client requests `GET /api/uploads/auth`.
2. The API signs ImageKit upload parameters using the private key.
3. The browser uploads directly to ImageKit.
4. ImageKit returns file metadata.
5. The client sends metadata to the API for profile, group, or message records.

The ImageKit private key is never exposed to the browser.

## Production Checklist

- Replace all development JWT secrets with environment-managed secrets.
- Replace ImageKit placeholders with real dashboard credentials.
- Use a managed MongoDB connection string with TLS and backups.
- Set `CLIENT_URL` to the deployed web origin.
- Set `COOKIE_DOMAIN` to the production domain.
- Serve the API behind HTTPS.
- Configure log collection for Pino output.
- Add CI checks for install, build, lint, and API smoke tests.
- Keep `.env` files out of source control and manage production values through
  the deployment platform.

## Presentation Overhaul

The frontend presentation layer uses the **Signal & Ink** direction while
preserving existing API calls, socket events, Redux state, and React Query data
contracts.

| Area | What changed | Why |
| --- | --- | --- |
| Theme tokens | Added `--ink`, `--paper`, `--emerald`, `--coral`, `--signal`, `--ink-60`, premium Manrope / Space Grotesk / JetBrains Mono font roles, and subtle grain texture. | Establishes a distinct visual system instead of default WhatsApp green/white. |
| Motion system | Added `shared/ui/motion/motionVariants.js` with reusable Framer Motion variants. | Keeps spring/fade/menu/drawer motion consistent and centralized. |
| Sidebar | Added status rings, pinned/recent sections, archived collapse, staggered list entrance, and presence rails on rows. | Improves scanability and gives online state an ambient signature. |
| Chat window | Added call/video/menu actions, `aria-live="polite"` message stream, and a right-side contact/group info drawer. | Moves toward a classic three-pane messaging workspace without changing data flow. |
| Message bubbles | Added spring-in motion, reply quote rendering, reaction row support, voice-player presentation, Plex Mono metadata, and media polish. | Makes incoming/outgoing messages feel alive while keeping payload shapes untouched. |
| Read receipts | Replaced static icon ticks with animated SVG ink checks and read-state ripple. | Reinvents the most recognizable messaging affordance as the UI signature. |
| Composer | Added emoji tray, attachment fan menu, mic button, and upload progress polish. | Gives the composer richer product affordances while preserving existing send/upload logic. |
