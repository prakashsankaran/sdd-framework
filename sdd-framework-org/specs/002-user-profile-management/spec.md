# spec.md

## 1. Executive Summary & Goals
The objective is to implement a secure, scalable User Identity and Profile Management module. This system serves as the foundational layer for user authentication and personalization, ensuring data integrity through server-side hashing and providing an authenticated interface for profile maintenance.

## 2. User Persona, Actors, and User Flows
*   **Actor:** Registered User (Authenticated), Guest (Unregistered).
*   **User Persona:** A web-app user who requires a secure account to maintain a persistent identity and customized profile.
*   **User Flow:**
    1.  **Registration:** Guest provides email/password $\rightarrow$ Server hashes password $\rightarrow$ Record created $\rightarrow$ Success.
    2.  **Authentication:** User provides email/password $\rightarrow$ Server validates hash $\rightarrow$ JWT issued.
    3.  **Profile Management:** Authenticated user requests profile $\rightarrow$ Token validated $\rightarrow$ Data returned.
    4.  **Profile Update:** Authenticated user sends update payload $\rightarrow$ System updates specific fields $\rightarrow$ Success.

## 3. Functional Requirements
*   **Registration:**
    *   Inputs: `email` (string, email format), `password` (string, min 8 chars).
    *   Logic: Check if email exists. Hash password with `bcrypt` (work factor 12).
    *   Output: 201 Created or 409 Conflict.
*   **Login:**
    *   Inputs: `email`, `password`.
    *   Logic: Retrieve user by email; compare provided password with `password_hash` using `bcrypt.compare`.
    *   Output: JWT (Access Token) with expiration.
*   **Profile Read:**
    *   Logic: Extract user ID from JWT; fetch record.
    *   Output: User profile JSON (excluding `password_hash`).
*   **Profile Update:**
    *   Inputs: `display_name` (optional), `profile_picture_url` (optional).
    *   Logic: Validate inputs. Update `updated_at` timestamp.
    *   Output: 200 OK with updated profile.

## 4. API Schema Contract
### POST /api/v1/auth/register
*   **Request:** `{"email": "user@example.com", "password": "securePassword123"}`
*   **Response:** `{"status": "success", "user_id": "uuid"}`

### POST /api/v1/auth/login
*   **Request:** `{"email": "user@example.com", "password": "securePassword123"}`
*   **Response:** `{"token": "eyJhbGci..."}`

### GET /api/v1/profile
*   **Headers:** `Authorization: Bearer <token>`
*   **Response:** `{"id": "uuid", "email": "...", "display_name": "...", "profile_picture_url": "..."}`

### PATCH /api/v1/profile
*   **Headers:** `Authorization: Bearer <token>`
*   **Request:** `{"display_name": "New Name", "profile_picture_url": "https://..."}`
*   **Response:** `{"status": "updated", "data": {...}}`

## 5. Data Model Constraints (DDL)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 6. Compliance & Security Mandates
*   **Encryption:** All transit must be encrypted via TLS 1.2+.
*   **Storage:** Passwords must *never* be stored in plaintext. Use `bcrypt` with a minimum salt rounds factor of 12.
*   **Access Control:** The API must implement stateless authentication (JWT). Middleware must verify token signatures and expiration (exp) on every request to private endpoints.
*   **Data Validation:** Sanitization of `display_name` and `profile_picture_url` to prevent XSS. 
*   **Rate Limiting:** Protect login/register endpoints against brute-force attacks via rate limiting.