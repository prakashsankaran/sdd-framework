# constitution.md

## 1. Core Principles
*   **User-First:** Every interaction must prioritize user experience, ensuring seamless authentication flows and responsive profile management.
*   **Secure-by-Default:** Security is not an add-on. We employ industry-standard hashing (bcrypt), secure token handling (JWT), and input sanitization at every layer.
*   **Scalable Architecture:** Code must be modular and decoupled to allow for future feature expansions without technical debt.
*   **Data Integrity:** Strict adherence to relational schema constraints to ensure consistent user states.

## 2. Tech Stack Guidelines
*   **Backend:** Node.js with Express.js to handle API endpoints and business logic.
*   **Database:** PostgreSQL as the primary relational database. 
    *   All schemas must utilize appropriate data types and constraints.
    *   `password_hash` must exclusively store the output of `bcrypt` routines.
*   **Frontend:** React.js bootstrapped with Vite.
    *   Styling must be implemented using Tailwind CSS for consistency and performance.
*   **Communication:** RESTful JSON-based API communication between client and server, utilizing JWTs for authorization.

## 3. Architectural Boundaries & Rules

### Data Schema Integrity
The `users` table is the source of truth and must strictly contain the following fields:
*   `id`: Primary Key (UUID recommended).
*   `email`: Unique constraint, indexed.
*   `password_hash`: String (bcrypt result).
*   `display_name`: String.
*   `profile_picture_url`: String (URI).
*   `created_at`: Timestamp.
*   `updated_at`: Timestamp (auto-updated on mutation).

### Authentication Rules
*   **Hashing:** Plaintext passwords must never touch the database. All password hashing must be performed on the server side using `bcrypt` before storage.
*   **Tokenization:** JWTs must be used for session management. Tokens should be issued upon successful login and verified on all protected routes (e.g., profile updates/viewing).
*   **Validation:** All user inputs (registration and profile updates) must be validated server-side for format (email regex) and length constraints before hitting the database.

### Separation of Concerns
*   **Logic Layer:** API routes should not perform direct database queries; utilize a dedicated service or model layer.
*   **Security Middleware:** Authentication verification must be handled by reusable Express middleware before reaching protected controller logic.
*   **Frontend State:** Sensitive data (JWTs) should be stored securely (e.g., `httpOnly` cookies or secure memory storage) to mitigate XSS risks.