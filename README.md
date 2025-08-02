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
│ ├── chatroom.service.tsObjective:
Develop a Gemini-style backend system that enables user-specific chatrooms, OTP-based
login, Gemini API-powered AI conversations, and subscription handling via Stripe. This
project will assess your skills in backend architecture, authentication, third-party integration,
and clean code practices.

Requirements:
1. User Authentication:
● OTP-based login system (mobile number only).
● OTP should be triggered via API (no third-party SMS integration; just return/send
OTP in response).
● Full authentication system using JWT tokens.

2. Chatroom Management:
● Users should be able to create and manage multiple chatrooms.
● Each chatroom supports conversations where user messages are passed to the
Google Gemini API, and responses are returned.
● Use a message queue (RabbitMQ, Redis Queue, Celery, BullMQ, etc.) to handle
Gemini API calls asynchronously.

3. Google Gemini API Integration:

● Integrate with Google Gemini API.

4. Subscription & Payments:
● Use Stripe (sandbox mode) for handling subscription payments.
● Define two tiers:
○ Basic (Free): Limited daily usage (e.g., 5 prompts/day).
○ Pro (Paid): Higher or unlimited usage.
● Include the following:
○ Subscription start API
○ Stripe webhook to handle events (success, failure, etc.)
○ Subscription status API for user

5. API Requirements:

Endpoint Metho
d
Auth
Required

Description

/auth/signup POST ❌ Registers a new user with mobile number

and optional info.

/auth/send-otp POST ❌ Sends an OTP to the user’s mobile
number (mocked, returned in response).
/auth/verify-otp POST ❌ Verifies the OTP and returns a JWT token

for the session.

/auth/forgot-pas
sword

POST ❌ Sends OTP for password reset.

/auth/change-pas
sword

POST ✅ Allows the user to change password while

logged in.

/user/me GET ✅ Returns details about the currently

authenticated user.

/chatroom POST ✅ Creates a new chatroom for the

authenticated user.

/chatroom GET ✅ Lists all chatrooms for the user (use
caching here – justified below).
/chatroom/:id GET ✅ Retrieves detailed information about a

specific chatroom.

/chatroom/:id/me
ssage

POST ✅ Sends a message and receives a Gemini
response (via queue/async call).
/subscribe/pro POST ✅ Initiates a Pro subscription via Stripe

Checkout.

/webhook/stripe POST ❌ (Stripe
only)

Handles Stripe webhook events (e.g.,
payment success/failure).

/subscription/st
atus

GET ✅ Checks the user's current subscription tier

(Basic or Pro).

Registration Notes:
- JWT Authentication should be included in the Authorization header for all
protected routes (Bearer <token>).
- Use caching/query caching at least at one place where it feels necessary (must be
justified).
- Endpoints must return consistent JSON responses with proper HTTP status codes.
- Implement middleware for token validation and error handling.
- Rate-limiting must be implemented for Basic tier users (e.g., daily message count
check).

Caching Requirement – Justification:

Use query caching on: GET /chatroom

● This endpoint is frequently accessed when loading the dashboard.
● Chatrooms don't change often compared to messages.
● Caching the chatroom list (per user) with a short TTL (e.g., 5–10 minutes)
significantly improves performance and reduces database load.
● Use Redis, Node-cache, or any appropriate caching library.

Technical Constraints:

● Language: Python (FastAPI preferred) or Node.js (Express/NestJS)
● Database: PostgreSQL
● Queue: RabbitMQ / Redis / Celery / BullMQ
● Authentication: JWT with OTP verification
● Payments: Stripe (sandbox environment)
● External API: Google Gemini
● Deployment: Any public cloud platform (Render, Railway, EC2, Fly.io, etc.)

Deliverables:

1. Source Code
● Organized and modular project structure.
● Clear comments and appropriate naming conventions.

2. Postman Collection
● Folder-structured, well-labeled requests covering all APIs.

● Use JWT tokens where needed for authorization.

3. Deployment
● Deploy your app on any cloud service.
● Share a public IP or URL that works with Postman.

4. GitHub Repository
● Public GitHub repo with:
○ Complete source code
○ Readable commit history
○ Branches if used for feature isolation

5. Documentation
● A comprehensive README.md including:
○ How to set up and run the project
○ Architecture overview
○ Queue system explanation
○ Gemini API integration overview
○ Assumptions/design decisions
○ How to test via Postman
○ Access/deployment instructions

Evaluation Criteria:
● Functional completion of all requirements

● Clean, readable, and maintainable code
● Proper use of async patterns or queues
● Error handling and edge case coverage
● Properly working APIs (tested via Postman)
● Deployment availability
● Documentation quality

Submission Guidelines:
● Email your submission and your updated resume to hr@kuvaka.io with the subject:
"Gemini Backend Clone Assignment Submission - Kuvaka Tech [Your Full
Name]"

Include the following in your email:
● GitHub Repository Link
● Postman Collection File
● Deployment Link (Public IP or URL)
● Any setup instructions or environment notes

Deadline:
● Submit the assignment within 48 hrs - 72 hrs (2 - 3 days) of receiving this prompt.
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


