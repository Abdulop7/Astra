# Astra AI

Astra AI is a full-stack, ChatGPT-style conversational assistant built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS 4**. It supports both anonymous (guest) chatting and authenticated accounts backed by **AWS Cognito**, with per-user chat history persisted through **AWS API Gateway + Lambda** endpoints.

LLM responses are served through the [AI Pipe](https://aipipe.org) OpenRouter proxy using `openai/gpt-4o-mini`, then revealed in the UI with a character-by-character typewriter animation.

---

## Table of Contents

- [Feature Overview](#feature-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Functionality Reference](#functionality-reference)
  - [Pages / Routes](#pages--routes)
  - [Internal API Routes](#internal-api-routes)
  - [External Backend Endpoints](#external-backend-endpoints)
  - [Library Functions](#library-functions)
  - [React Context API](#react-context-api)
  - [Components](#components)
- [Data Models](#data-models)
- [Authentication Flow](#authentication-flow)
- [Chat Flow](#chat-flow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Styling & Design System](#styling--design-system)
- [Deployment](#deployment)
- [Known Limitations & Roadmap](#known-limitations--roadmap)

---

## Feature Overview

### Core Features

| Feature | Description |
| --- | --- |
| **Dual-mode experience** | The root page detects an active Cognito session and renders either the authenticated workspace (sidebar + chat) or the guest landing/chat experience. |
| **Guest chat (no signup)** | Anyone can ask Astra AI a question immediately. The conversation lives in component state only — nothing is persisted. |
| **Authenticated chat with history** | Signed-in users get durable chats, each with its own `chatId` URL (`/c/<chatId>`), stored server-side and listed in the sidebar. |
| **Email/password auth via AWS Cognito** | Complete sign-up → email verification → sign-in flow driven by the AWS SDK v3 and `amazon-cognito-identity-js`. |
| **Smart email routing** | A single email entry point checks whether the account exists and routes the user to *log in* or *create account* accordingly. |
| **Live password policy feedback** | The sign-up form validates length, uppercase, lowercase, digit, and special-character rules in real time and disables submit until all pass. |
| **Auto-titled conversations** | The first user prompt in a new chat becomes the chat title (first 30 characters) and is written alongside the message. |
| **Deep-linkable first message** | Sending a message with no active chat generates a UUID, navigates to `/c/<uuid>?first=<prompt>`, sends it, then cleans the query string out of the URL via `history.replaceState`. |
| **Typewriter response animation** | Bot replies render one character at a time (5 ms/char) with a "Thinking…" placeholder while the request is in flight. |
| **Collapsible responsive sidebar** | Desktop minimize/expand toggle, mobile hamburger + overlay drawer, scroll-shadow on the chat list, and active-chat highlighting. |
| **Profile menu & logout** | Avatar (initial-based fallback), name/email display, and a Cognito `signOut()` action that redirects to the login page. |
| **Auto-scroll to latest** | The message list scrolls smoothly to the newest message on every update. |
| **Branded loading state** | An animated Framer Motion loader (`app/loading.tsx`) doubles as the in-chat suspense state. |
| **Server-side API key protection** | The LLM token never reaches the browser — all model calls proxy through the Next.js route handler `/api/chat`. |

### Supporting Features

- Session validation on mount (`isSignedIn()`) with token expiry handling via `getSession()`.
- ID-token payload decoding to extract `sub`, `name`, and `email` for user identity.
- Message de-duplication when merging server-fetched history with local optimistic state.
- Chat-collection merging that preserves existing titles and falls back to `"Untitled Chat"`.
- Idempotent chat creation guarded by refs (`hasChatBeenCreatedRef`, `firstSentRef`) so a chat is registered exactly once.
- Enter-to-send keyboard handling on all chat inputs.
- Custom dark scrollbars, gradient branding, and a mobile-first responsive layout throughout.

---

## Tech Stack

### Framework & Language

| Technology | Version | Role |
| --- | --- | --- |
| [Next.js](https://nextjs.org) | 15.5.2 | App Router, React Server Components, route handlers, Turbopack |
| [React](https://react.dev) | 19.1.0 | UI runtime |
| [React DOM](https://react.dev) | 19.1.0 | DOM renderer |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Strict-mode static typing, `@/*` path alias to `src/*` |

### Styling & UI

| Technology | Version | Role |
| --- | --- | --- |
| [Tailwind CSS](https://tailwindcss.com) | ^4.1.13 | Utility-first styling (CSS-first `@import "tailwindcss"` config) |
| [@tailwindcss/postcss](https://tailwindcss.com/docs/installation/using-postcss) | ^4 | PostCSS pipeline |
| [tailwind-scrollbar](https://github.com/adoxography/tailwind-scrollbar) | ^4.0.2 | Scrollbar utilities |
| [Framer Motion](https://www.framer.com/motion/) | ^12.23.13 | Loader animation |
| [@heroicons/react](https://heroicons.com) | ^2.2.0 | Outline icon set (send, plus, chevrons, search, bars, close) |
| [lucide-react](https://lucide.dev) | ^0.542.0 | Search & trash icons |
| [react-icons](https://react-icons.github.io/react-icons/) | ^5.5.0 | Google/Facebook/eye icons |
| `next/font` (Geist, Geist Mono) | — | Self-hosted, optimized Google fonts |

### Auth & AWS

| Technology | Version | Role |
| --- | --- | --- |
| [@aws-sdk/client-cognito-identity-provider](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/) | ^3.883.0 | Server-side `SignUp`, `ConfirmSignUp`, `InitiateAuth`, `AdminGetUser` |
| [@aws-sdk/client-cognito-identity](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity/) | ^3.883.0 | Cognito identity client |
| [amazon-cognito-identity-js](https://www.npmjs.com/package/amazon-cognito-identity-js) | ^6.3.15 | Browser-side user pool, session storage, sign-in, sign-out |
| [aws-amplify](https://docs.amplify.aws) | ^6.15.6 | Installed for Amplify-based auth utilities |
| [openid-client](https://www.npmjs.com/package/openid-client) | ^6.7.1 | OIDC support (reserved for federated providers) |
| AWS API Gateway + Lambda | — | Chat persistence backend (`ap-south-2`) |
| AWS DynamoDB (via Lambda) | — | User and chat storage |

### Data & Utilities

| Technology | Version | Role |
| --- | --- | --- |
| [axios](https://axios-http.com) | ^1.11.0 | HTTP client for auth and registration calls |
| [uuid](https://www.npmjs.com/package/uuid) | ^13.0.0 | v4 chat ID generation |
| [openai](https://www.npmjs.com/package/openai) | ^5.20.0 | OpenAI SDK (available for direct provider calls) |
| [dotenv](https://www.npmjs.com/package/dotenv) | ^17.2.2 | Env loading |

### Tooling

| Technology | Version | Role |
| --- | --- | --- |
| [ESLint](https://eslint.org) | ^9 | Flat config extending `next/core-web-vitals` + `next/typescript` |
| [@eslint/eslintrc](https://www.npmjs.com/package/@eslint/eslintrc) | ^3 | FlatCompat bridge |
| Turbopack | — | Dev and build bundler (`next dev --turbopack`, `next build --turbopack`) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser (React 19)                        │
│                                                                  │
│   Guest UI            Authenticated UI                           │
│   ├─ GuestHeader      ├─ Sidebar (chat list, profile, logout)    │
│   └─ Guest chat       └─ ChatWindow (messages, input, header)    │
│                                                                  │
│   ChatProvider (React Context) ── amazon-cognito-identity-js     │
│        │                              (session in localStorage)  │
└────────┼─────────────────────────────────────────────────────────┘
         │
         ├─ /api/chat ─────────────► aipipe.org (OpenRouter) ──► gpt-4o-mini
         │  (server route, hides AI_PIPE_LINE_TOKEN)
         │
         ├─ /api/auth/check-user ──► Cognito AdminGetUser
         ├─ /api/auth/signup ──────► Cognito SignUp
         ├─ /api/auth/confirm ─────► Cognito ConfirmSignUp
         ├─ /api/auth/signin ──────► Cognito InitiateAuth
         │
         └─ API Gateway (ap-south-2, called directly from client)
            ├─ /register       → store user profile
            ├─ /getCollection  → list a user's chats
            ├─ /getChats       → load one chat's messages
            └─ /saveChat       → append a prompt/response turn
```

**Design notes**

- Cognito **admin** operations (`AdminGetUser`) run only in server route handlers, so AWS IAM credentials stay off the client.
- Cognito **user** operations (authenticate, session, sign-out) run in the browser via `amazon-cognito-identity-js`, which persists the session in `localStorage`.
- The chat persistence layer is fully external (API Gateway + Lambda), so this repository contains no database code.

---

## Project Structure

```
Astra/
├── public/                             # Static SVG assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── check-user/route.ts # POST — does this email exist?
│   │   │   │   ├── signup/route.ts     # POST — register a Cognito user
│   │   │   │   ├── confirm/route.ts    # POST — confirm the email code
│   │   │   │   └── signin/route.ts     # POST — USER_PASSWORD_AUTH login
│   │   │   └── chat/route.ts           # POST — proxy to the LLM provider
│   │   ├── c/[chatId]/page.tsx         # Dynamic per-conversation page
│   │   ├── context/chatContext.tsx     # Global chat + user context
│   │   ├── log-in-or-create-account/
│   │   │   ├── page.tsx                # Email entry + provider buttons
│   │   │   ├── create/page.tsx         # Sign-up with live password rules
│   │   │   ├── verify/page.tsx         # Email confirmation code
│   │   │   └── password/page.tsx       # Password login + user registration
│   │   ├── globals.css                 # Tailwind import, theme vars, scrollbar
│   │   ├── layout.tsx                  # Root layout, fonts, ChatProvider
│   │   ├── loading.tsx                 # Animated branded loader
│   │   └── page.tsx                    # Session-aware entry point
│   ├── components/
│   │   ├── chatWindow.tsx              # Main chat surface (387 lines)
│   │   ├── guest/
│   │   │   ├── Guest.tsx               # Guest landing + ephemeral chat
│   │   │   └── header.tsx              # Logo, Login, Sign Up Free
│   │   └── user/
│   │       ├── User.tsx                # Sidebar + ChatWindow shell
│   │       ├── header.tsx              # Chat header with delete button
│   │       ├── sidebar.tsx             # Chat list, search, profile, logout
│   │       └── chats.tsx               # Legacy chat UI (fully commented out)
│   └── lib/
│       ├── cognito.ts                  # Browser pool, signIn, logout, isSignedIn
│       └── cognitoClient.ts            # Server-side AWS SDK Cognito client
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Functionality Reference

### Pages / Routes

| Route | File | Type | Purpose |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | Client | Calls `isSignedIn()` on mount; renders `<User />` when authenticated, otherwise `<GuestHeader />` + `<Guest />`. |
| `/c/[chatId]` | `src/app/c/[chatId]/page.tsx` | Client | Wraps `ChatProvider` around `Sidebar` + `ChatWindow`; falls back to a fresh UUID if `chatId` is missing. |
| `/log-in-or-create-account` | `.../page.tsx` | Client | Email capture → `POST /api/auth/check-user` → routes to `/password` (existing) or `/create` (new), passing the email as a query param. Google/Facebook buttons are present as placeholders. |
| `/log-in-or-create-account/create` | `.../create/page.tsx` | Client | Name + email + password sign-up with a live five-rule password checklist and a show/hide toggle. On success redirects to `/verify`. |
| `/log-in-or-create-account/verify` | `.../verify/page.tsx` | Client | Confirmation-code form; on success redirects to `/password`. |
| `/log-in-or-create-account/password` | `.../password/page.tsx` | Client | Authenticates directly against the Cognito user pool, decodes the ID token, POSTs the profile to the `/register` API Gateway endpoint, then redirects to `/`. |

### Internal API Routes

| Endpoint | Method | Request Body | Behavior | Response |
| --- | --- | --- | --- | --- |
| `/api/chat` | `POST` | `{ message }` | Forwards a single-turn prompt to `https://aipipe.org/openrouter/v1/chat/completions` with `model: "openai/gpt-4o-mini"` and the server-only bearer token. | Raw provider JSON (`choices[0].message.content` is read client-side). `401` if the token is unset, `500` on failure. |
| `/api/auth/check-user` | `POST` | `{ email }` | Runs `AdminGetUserCommand` against the user pool. | `{ exists: true }`, `{ exists: false }` on `UserNotFoundException`, else `{ error }`. |
| `/api/auth/signup` | `POST` | `{ name, email, password }` | Runs `SignUpCommand` with `email` and `name` user attributes. | `{ success, data }` or `400 { success: false, error }`. |
| `/api/auth/confirm` | `POST` | `{ email, code }` | Runs `ConfirmSignUpCommand`. | `{ success, data }` or `400 { success: false, error }`. |
| `/api/auth/signin` | `POST` | `{ email, password }` | Runs `InitiateAuthCommand` with the `USER_PASSWORD_AUTH` flow. | `{ success, data }` (tokens) or `400 { success: false, error }`. |

### External Backend Endpoints

All are AWS API Gateway endpoints in `ap-south-2`, called directly from the client.

| Purpose | Endpoint | Payload |
| --- | --- | --- |
| Register user profile | `https://3gdd3pytn2.execute-api.ap-south-2.amazonaws.com/register` | `{ userId, email, name }` |
| List a user's chats | `https://8dyke468il.execute-api.ap-south-2.amazonaws.com/getCollection` | `{ userId }` → `{ chats: [{ chatId, title }] }` |
| Load one chat | `https://f3sdxgem9h.execute-api.ap-south-2.amazonaws.com/getChats` | `{ chatId }` → `{ title, messages: [{ userPrompt, botResponse }] }` |
| Save a turn | `https://q5qbvbzaf2.execute-api.ap-south-2.amazonaws.com/saveChat` | `{ chatId, userId, title?, timestamp, userPrompt, botResponse }` |

### Library Functions

**`src/lib/cognito.ts`** (browser)

| Function | Signature | Description |
| --- | --- | --- |
| `getUserPool()` | `() => CognitoUserPool` | Builds a pool from the public user-pool and client IDs. |
| `signIn()` | `(email, password) => Promise<CognitoUserSession>` | Promise wrapper around `authenticateUser`. |
| `handleLogout()` | `() => void` | Signs the current user out and redirects to `/log-in-or-create-account/`. |
| `isSignedIn()` | `() => Promise<boolean>` | SSR-safe session check — returns `false` outside the browser, when no user exists, or when `getSession()` yields an invalid/expired session. |

**`src/lib/cognitoClient.ts`** (server)

| Export | Description |
| --- | --- |
| `cognitoClient` | A `CognitoIdentityProviderClient` configured with `AWS_REGION` and static IAM credentials, used by the admin-capable route handlers. |

### React Context API

`ChatProvider` / `useChat()` — `src/app/context/chatContext.tsx`

| Member | Type | Description |
| --- | --- | --- |
| `collection` | `{ chatId, title }[]` | All chats for the signed-in user. |
| `fetchChatCollection()` | `() => Promise<void>` | Fetches `/getCollection` and merges results into `collection`, preserving existing titles and defaulting to `"Untitled Chat"`. |
| `getCurrentUserId()` | `() => Promise<CognitoUserInfo \| null>` | Validates the session and decodes the ID token into `{ userId, name, email }`. |
| `addChat(chat, options?)` | `(chat, { checkExists? }) => boolean` | Adds a chat, optionally skipping duplicates. Returns whether it was added. |
| `markChatAsCreated(chatId)` | `(string) => void` | Records a chat ID in the created-set. |
| `isChatCreated(chatId)` | `(string) => boolean` | Membership check against that set. |
| `userInfo` | `CognitoUserInfo \| null` | Cached profile (`userId`, `name`, `email`, optional `profilePicUrl`), resolved once on mount. |

### Components

| Component | File | Responsibilities |
| --- | --- | --- |
| `ChatWindow` | `components/chatWindow.tsx` | Loads chat history, de-duplicates merged messages, sends prompts, animates the typewriter effect, persists turns, auto-titles new chats, handles the `?first=` deep link, auto-scrolls, and renders both the empty state and the active conversation. |
| `Sidebar` | `components/user/sidebar.tsx` | Responsive drawer with desktop minimize/expand, mobile overlay, New Chat, a search field (UI only), the scrollable chat list with active highlighting, and the profile popover with logout. |
| `User` | `components/user/User.tsx` | Full-height flex shell pairing `Sidebar` with a `ChatWindow` that has no preset chat ID. |
| `ChatHeader` | `components/user/header.tsx` | Brand wordmark plus a delete-chat button (UI only). |
| `Guest` | `components/guest/Guest.tsx` | Self-contained guest experience: hero search, transition into chat, `/api/chat` calls, typewriter animation, auto-scroll, and an attribution footer. |
| `GuestHeader` | `components/guest/header.tsx` | Transparent overlay header with the logo and Login / Sign Up Free links. |
| `Loading` | `app/loading.tsx` | Gradient full-screen loader with three bouncing Framer Motion dots. |
| `chats.tsx` | `components/user/chats.tsx` | Legacy chat implementation, entirely commented out and superseded by `ChatWindow`. |

---

## Data Models

```ts
// UI message
interface Message {
  role: "user" | "bot";
  content: string;
  isLoading?: boolean;
}

// Message shape returned by the backend
interface ApiMessage {
  userPrompt?: string;
  botResponse?: string;
}

// Sidebar chat entry
type ChatCollection = { chatId: string; title: string };

// Decoded Cognito ID-token profile
interface CognitoUserInfo {
  userId: string;   // Cognito `sub`
  name?: string;
  email?: string;
  profilePicUrl?: string;
}
```

Persisted chat turn (`/saveChat`):

```json
{
  "chatId": "uuid-v4",
  "userId": "cognito-sub",
  "title": "First 30 chars of the first prompt",
  "timestamp": "ISO-8601",
  "userPrompt": "…",
  "botResponse": "…"
}
```

---

## Authentication Flow

```
/log-in-or-create-account
        │  email
        ▼
POST /api/auth/check-user  ──►  Cognito AdminGetUser
        │
        ├─ exists: false ─► /create ─► POST /api/auth/signup ─► Cognito SignUp
        │                                     │
        │                                     ▼  (email code)
        │                              /verify ─► POST /api/auth/confirm
        │                                     │
        │                                     ▼
        └─ exists: true  ─────────────► /password
                                              │  authenticateUser (browser pool)
                                              ▼
                                   decode ID token → { sub, email, name }
                                              │
                                              ├─► POST /register (API Gateway)
                                              └─► redirect to /
```

The session is stored by `amazon-cognito-identity-js` in `localStorage`; every protected surface re-validates it through `getSession()` before use.

---

## Chat Flow

**New chat (authenticated)**

1. The user types into the empty-state input on `/`.
2. `handleSend` generates a UUID v4 and routes to `/c/<uuid>?first=<encoded prompt>`.
3. `ChatWindow` mounts, fetches history (empty), reads `?first=`, and calls `sendMessage`.
4. The URL is cleaned with `history.replaceState`, dropping the query string.
5. The user message plus a `isLoading` bot placeholder render immediately (optimistic UI).
6. `POST /api/chat` proxies the prompt to the model; the reply replaces the placeholder and animates in character by character.
7. `POST /saveChat` persists the turn with `title = prompt.slice(0, 30)` because this is the chat's first message.
8. The chat is added to the context collection so it appears in the sidebar without a refetch.

**Existing chat**

1. `/c/<chatId>` fetches `/getChats`, flattens `{ userPrompt, botResponse }` pairs into `Message[]`, and merges them into state while dropping exact duplicates.
2. If the chat is not yet in `collection`, it is added with its stored title.
3. Subsequent sends omit `title` so the original is preserved.

**Guest chat**

Identical send/animate loop against `/api/chat`, with no `chatId`, no persistence, and no auth. Refreshing clears the conversation.

---

## Getting Started

### Prerequisites

- **Node.js 18.18+** (Node 20 LTS recommended for Next.js 15)
- **npm**, **yarn**, **pnpm**, or **bun**
- An **AWS Cognito User Pool** with an app client that has the `USER_PASSWORD_AUTH` flow enabled and **no client secret**
- An IAM user/role permitted to call `cognito-idp:AdminGetUser`
- An **AI Pipe** token (or another OpenRouter-compatible key)

### Installation

```bash
git clone <your-repo-url>
cd Astra
npm install
```

Create a `.env.local` file in the project root (see [Environment Variables](#environment-variables)), then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create `.env.local` — it is git-ignored via the `.env*` rule.

```bash
# ── Cognito (public — exposed to the browser) ────────────────────
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# ── AWS credentials for server-side admin calls (never public) ───
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Region used by the /api/auth/signin route handler ────────────
COGNITO_REGION=ap-south-1

# ── LLM provider token (server-only) ─────────────────────────────
AI_PIPE_LINE_TOKEN=your_aipipe_or_openrouter_token
```

| Variable | Scope | Used by |
| --- | --- | --- |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Public | `lib/cognito.ts`, `check-user` route, `/password` page |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Public | `lib/cognito.ts`, `signup`/`confirm`/`signin` routes, `/password` page |
| `AWS_REGION` | Server | `lib/cognitoClient.ts` |
| `AWS_ACCESS_KEY_ID` | Server | `lib/cognitoClient.ts` |
| `AWS_SECRET_ACCESS_KEY` | Server | `lib/cognitoClient.ts` |
| `COGNITO_REGION` | Server | `api/auth/signin/route.ts` |
| `AI_PIPE_LINE_TOKEN` | Server | `api/chat/route.ts` |

> `AWS_REGION` and `COGNITO_REGION` are read by different files and should normally hold the same value.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server with Turbopack at `http://localhost:3000`. |
| `npm run build` | Production build with Turbopack. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint across the project. |

---

## Styling & Design System

- **Palette** — dark-first: `gray-900` / `black` / `gray-800` gradients, with an indigo → purple → pink accent ramp.
- **Brand mark** — the "Astra AI" wordmark uses `bg-clip-text` over a tri-color gradient; the compact logo is a gradient rounded square with the letter `A`.
- **Bubbles** — user messages use an indigo→purple gradient; bot messages use `gray-800` with a `gray-700` border. Both cap at `max-w-[80%]` with rounded corners and shadows.
- **Scrollbars** — `.custom-scrollbar` in `globals.css` defines an 8px WebKit scrollbar with a `gray-900` track and a pill-shaped `gray-700` thumb; `tailwind-scrollbar` is also registered as a plugin.
- **Typography** — Geist Sans and Geist Mono loaded through `next/font/google` and exposed as `--font-geist-sans` / `--font-geist-mono`.
- **Theme tokens** — `--background` / `--foreground` are declared in `:root` with a `prefers-color-scheme: dark` override and surfaced to Tailwind via `@theme inline`.
- **Responsiveness** — mobile-first breakpoints; the sidebar collapses to a hamburger drawer under `md`, and the chat header hides its wordmark on small screens.
- **Interaction** — consistent `hover:` and `active:scale-95` feedback on buttons, plus `transition` on colors and layout shifts.

---

## Deployment

The app deploys cleanly to any Next.js-compatible host (Vercel is the path of least resistance):

1. Push the repository to your Git provider.
2. Import it into Vercel and accept the detected Next.js settings.
3. Add every variable from [Environment Variables](#environment-variables) to the project's environment settings.
4. Deploy.

Ensure the Cognito app client's callback/sign-out URLs and any API Gateway CORS rules include your production origin.

---

## Known Limitations & Roadmap

Current gaps, stated plainly:

- **Google and Facebook buttons are non-functional** — rendered on the login and password pages but not wired to Cognito Hosted UI or an OIDC flow. `openid-client` and `aws-amplify` are installed in anticipation of this.
- **Sidebar search is UI-only** — the input does not filter `collection` yet.
- **The chat delete button is inert** — `ChatHeader` renders a trash icon with no handler and no delete endpoint.
- **No conversation memory** — `/api/chat` sends only the latest message, so the model has no prior turns for context.
- **`/api/auth/signin` is unused** — the `/password` page authenticates client-side instead; the route remains available for a server-side flow.
- **No password reset** — the "Forgot password?" link is commented out in `/password`.
- **Guest chats are ephemeral** — nothing is stored, so a refresh clears the conversation.
- **No streaming** — responses arrive in full and are animated client-side rather than streamed token by token.
- **No test suite** — no unit, integration, or E2E tests are configured.
- **`components/user/chats.tsx` is dead code** — a fully commented-out earlier implementation kept for reference.
- **Default metadata** — `layout.tsx` still carries the `create-next-app` title and description.
- **API Gateway URLs are hard-coded** — the four endpoints are inline in the source and would be better as environment variables.

---

## Author

**Abdul Saboor** — credited in the guest-page footer.
