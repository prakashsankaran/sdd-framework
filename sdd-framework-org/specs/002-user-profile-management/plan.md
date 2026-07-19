# plan.md

## 1. Summary of Architecture
The system follows a classic **Client-Server architecture** using a RESTful API pattern.
- **Backend:** Node.js with Express.js.
- **Database:** Relational Database (e.g., PostgreSQL) managed via an ORM (e.g., Prisma or Sequelize).
- **Security:** Password hashing via `bcrypt`, authentication via JSON Web Tokens (JWT).
- **Data Flow:** The client sends credentials/updates to the API, which validates input, interacts with the database, and returns appropriate JWTs or JSON payloads.

---

## 2. Components, Directories, and Files
### Directory Structure
```text
/src
  /config      # DB connection and environment variables
  /controllers # Auth and Profile logic
  /middleware  # JWT verification
  /models      # Database schema definitions
  /routes      # API route definitions
  /utils       # Helper functions (hashing)
/tests         # Integration and Unit tests
```

### Files to Create/Modify
- `models/User.js`: Schema definition (`id`, `email`, `password_hash`, `display_name`, `profile_picture_url`, `created_at`, `updated_at`).
- `controllers/authController.js`: `register` and `login` logic.
- `controllers/profileController.js`: `getProfile` and `updateProfile` logic.
- `middleware/auth.js`: Middleware to verify JWT.
- `routes/api.js`: Endpoints for `POST /register`, `POST /login`, `GET /profile`, `PATCH /profile`.

---

## 3. Phased Implementation Schedule

| Phase | Tasks |
| :--- | :--- |
| **Phase 1: Setup** | Initialize project, setup Express, configure DB connection, define User model. |
| **Phase 2: Auth** | Implement `bcrypt` hashing, register/login controllers, and JWT token issuance. |
| **Phase 3: Profiles** | Implement protected routes, profile retrieval, and update logic. |
| **Phase 4: Testing** | Write unit tests for hashing and integration tests for API endpoints. |

---

## 4. Verification Plan

### Automated Scripts
- **Unit Tests:** Jest tests to verify `bcrypt` hashes match expectations.
- **Integration Tests:** Supertest suite to verify HTTP status codes:
    - `POST /register` -> 201 Created.
    - `POST /login` -> 200 OK with JWT.
    - `PATCH /profile` -> 401 Unauthorized (if no token) / 200 OK (with valid token).

### Manual Test Flows
1. **Registration:** Submit valid email/password via Postman; confirm `password_hash` in DB.
2. **Authentication:** Login with credentials; copy JWT; use in `Authorization: Bearer <token>` header for subsequent requests.
3. **Profile Update:** Send `PATCH` request with a new `display_name`; verify database record update.
4. **Data Integrity:** Verify that `created_at` and `updated_at` timestamps correctly reflect record creation and modification.

### Test Routes
- `POST /api/register`
- `POST /api/login`
- `GET /api/profile`
- `PATCH /api/profile`