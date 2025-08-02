# Gemini Backend Clone – Assignment Submission

This is my submission for the **Gemini Backend Clone Assignment** for the **Backend Developer role at Kuvaka Tech**.

---

## 🔗 Links

- **GitHub:** https://github.com/siddhant-deshmukh/llm-chat-api/
- **Deployed App:** https://llm-chat-api-53jr.onrender.com
- **Postman Collection:** https://www.postman.com/security-candidate-24130897/public-workspace/collection/m2qsydi/gemini-clone?action=share&creator=34715249

---

## ⚙️ Tech Stack

- Express.js (TypeScript)
- PostgreSQL with Drizzle ORM (with migrations)
- Redis & BullMQ
- JWT-based Auth with OTP verification
- Stripe (sandbox)
- Google Gemini API
- Deployed on Render

---

## ✅ Core Features Implemented

- OTP-based login with mocked OTP
- JWT token authentication
- Middleware for authentication and chatroom authorization
- Chatroom creation and listing
- Async Gemini API messaging via BullMQ
- Rate limiting for Basic users with Redis-based cache
- Gemini response polling via `GET /chatroom/:id/latest`
- Stripe integration (checkout, webhook, status)
- Caching for `GET /chatroom` endpoint (per-user TTL)
- Password reset and change via OTP
- Consistent JSON responses with proper status codes

---

## 🧪 How to Set Up and Run the Project

1. Clone the repository

2. Install dependencies:

```
npm install
npm run build
```


3. Create your environment file(s) inside `/config`:
   - `.env.test`
   - `.env.development`
   - `.env.production`

4. Add the following environment variables:

```
NODE_ENV=development

PORT=3079
HOST=localhost

JET_LOGGER_MODE=CONSOLE
JET_LOGGER_FILEPATH=jet-logger.log
JET_LOGGER_TIMESTAMP=TRUE
JET_LOGGER_FORMAT=LINE

PG_CONNECTION_STRING=postgresql://siddhant:password@localhost:5432/gemini_clone
JWT_SECRET=AVerySecretJWT
GEMINI_API_KEY=

REDIS_URL=redis://localhost:6379

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
```


---

## 🏗️ Architecture Overview

- Built with Express.js and modular route handlers
- JWT used for authentication (issued after OTP verification)
- Custom middleware:
  - `authenticateToken`: validates JWT
  - `authorizeChatroomAccess`: ensures only owners access chatrooms
- Folder structure:

```
.
├── common
│ └── constants
│ ├── ENV.ts
│ ├── HttpStatusCodes.ts
│ └── index.ts
├── config
│ ├── redis.ts
│ └── stripe.ts
├── db
│ ├── index.ts
│ └── schema
│ ├── chat.ts
│ ├── enums.ts
│ ├── index.ts
│ ├── payment.ts
│ ├── relations
│ │ └── index.ts
│ └── user.ts
├── index.ts
├── middleware
│ ├── auth.middleware.ts
│ └── chatroom.access.middleware.ts
├── routes
│ ├── auth.routes.ts
│ ├── chatroom.routes.ts
│ ├── subscription.routes.ts
│ └── user.routes.ts
├── server.ts
├── services
│ ├── auth.service.ts
│ ├── chatroom.service.ts
│ └── subscription.service.ts
├── types
│ └── express.d.ts
└── util
├── gemini.ts
├── jwt.ts
├── otp.ts
├── redis.ts
├── route-errors.ts
└── validators.ts
```


---

## 📬 Queue System Explanation

- When user sends a message to `/chatroom/:id/message`, response is **immediate**
- If Gemini API hasn’t responded yet, system returns status `102 PROCESSING`
- Users can poll for updates via `GET /chatroom/:id/latest`
- Powered by **BullMQ** and **Redis** for managing job queues and message status

---

## 🤖 Gemini API Integration

- Integration logic resides in: `src/util/gemini.ts`
- Handled via async job queue (BullMQ)
- Gemini message responses stored in DB, retrievable on polling
- Queue retries & error handling also implemented

---

## 📌 Assumptions / Design Decisions

- OTPs are not sent via SMS; they are mocked and returned via API (per instructions)
- Chatroom access is strictly user-scoped (authorization middleware)
- Rate-limiting based on prompt count, enforced via Redis with per-user key
- Caching applied only where it benefits (GET /chatroom), not globally

---

## 🔍 How to Test via Postman

1. Import the shared collection:
   https://www.postman.com/security-candidate-24130897/public-workspace/collection/m2qsydi/gemini-clone?action=share&creator=34715249

2. Steps:
   - Start with `/auth/send-otp` and then `/auth/verify-otp` to receive JWT
   - Use the JWT in the Authorization header for all secured routes
   - Create and list chatrooms
   - Test Gemini interaction via `/chatroom/:id/message` and `/chatroom/:id/latest`
   - Initiate Pro plan with `/subscribe/pro`
   - Use `/subscription/status` to check current plan

---

## 🚀 Access / Deployment Instructions

- App is deployed on Render:
  https://llm-chat-api-53jr.onrender.com

- Public API is live with all routes accessible via Postman

- Redis, Stripe (sandbox), and Gemini APIs are fully wired in the hosted version

---

## 📝 Final Notes

I read your message a bit late, so some areas like documentation and Postman grouping are still rough. I’ll be refining them soon with:
- Improved README
- Clear Postman folders
- Detailed setup walkthrough

All core features have been implemented and tested.

Thanks!
