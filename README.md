# Content Broadcasting System

A production-ready REST API backend where teachers upload subject-based image content, a principal approves or rejects it, and approved content is broadcast publicly using a dynamic scheduling and rotation system.

**Stack:** Node.js · Express · PostgreSQL · Prisma · JWT · bcrypt · Multer

---

## Project Structure

```
src/
  app.js                    Entry point — Express setup, middleware, routes
  config/
    prisma.js               Prisma client (singleton)
    multer.js               File upload config (jpg/png/gif, 10MB max)
  controllers/              Request/response handlers
  services/                 Business logic layer
  routes/                   API routes
  middlewares/
    auth.middleware.js      JWT auth + RBAC
    error.middleware.js     Global error handling
    validate.middleware.js  Request validation
  utils/
    jwt.js                  Token helpers
    response.js             Standard API responses

prisma/
  schema.prisma             Database schema

uploads/
  Local storage for uploaded files
```

---

## Setup

### Prerequisites

* Node.js >= 18
* PostgreSQL (local or hosted)

---

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env

# Configure environment variables
# (DATABASE_URL, JWT_SECRET, etc.)

# Sync database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start the server
npm start
```

---

## Environment Variables

| Variable       | Description                  | Example                                  |
| -------------- | ---------------------------- | ---------------------------------------- |
| DATABASE_URL   | PostgreSQL connection string | postgresql://user:pass@localhost:5432/db |
| JWT_SECRET     | Secret for JWT signing       | long_random_string                       |
| JWT_EXPIRES_IN | Token expiry                 | 7d                                       |
| PORT           | Server port                  | 3000                                     |

---

## API Overview

### Authentication

| Method | Endpoint       | Description   |
| ------ | -------------- | ------------- |
| POST   | /auth/register | Register user |
| POST   | /auth/login    | Login user    |

---

### Teacher (role: teacher)

* Upload content
* View own content

Endpoints:

* `POST /content/upload`
* `GET /content/my`
* `GET /content/my/:id`

---

### Principal (role: principal)

* Review submitted content
* Approve or reject

Endpoints:

* `GET /content/pending`
* `PATCH /content/:id/approve`
* `PATCH /content/:id/reject`

---

### Public

* `GET /content/live/:teacherId`
  Returns currently active content grouped by subject

---

## Scheduling & Rotation

Content becomes visible only when:

* Status = `approved`
* Current time is within `[start_time, end_time]`

Each subject rotates content independently using a **stateless algorithm**:

```
totalCycle = sum(rotation_durations)
elapsed = (current_time - anchor) % totalCycle
```

The active content is determined dynamically on each request—no cron jobs required.

---

## Key Features

* JWT-based authentication with role-based access control (RBAC)
* Secure file uploads (type + size restrictions)
* Stateless content rotation (no background workers)
* Clean layered architecture (controller → service → DB)
* Prisma ORM with PostgreSQL
* Input validation and global error handling

---

## Assumptions

1. Content must have both `start_time` and `end_time` to be visible
2. Default rotation duration = 5 minutes
3. Only one active item per subject at a time
4. System is deterministic (same output for all users at a given time)
5. Files are stored locally in `/uploads`




