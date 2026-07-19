# tasks.md

## Setup
- [ ] Project Initialization: Initialize repository, set up folder structure (client/server), and install base dependencies (Node.js, React).
- [ ] Environment Configuration: Set up `.env` files for database connection strings, JWT secrets, and port configurations.

## Backend Database
- [ ] Schema Design: Create the database migration script for the `users` table with fields (id, email, password_hash, display_name, profile_picture_url, created_at, updated_at).
- [ ] Database Connection: Implement the database connection utility and verify connectivity.

## Backend APIs
- [ ] Authentication Logic: Implement register and login endpoints.
  - [ ] Password Hashing: Integrate `bcrypt` to hash passwords during registration and verify them during login.
  - [ ] JWT Implementation: Implement logic to generate and return a signed JWT upon successful login.
- [ ] Profile Management: Create protected endpoints for retrieving and updating user profile data.
  - [ ] Auth Middleware: Implement a JWT validation middleware to protect profile routes.
  - [ ] Update Logic: Create a PATCH/PUT endpoint to handle updates to `display_name` and `profile_picture_url`.

## Frontend Components
- [ ] UI Library Integration: Set up CSS/UI framework for form elements.
- [ ] Reusable Components: Create reusable input fields, buttons, and loading spinners.
- [ ] Auth Context: Implement a Global Auth Provider to manage JWT state and user session data across the app.

## Frontend Pages
- [ ] Authentication Pages: Build Registration and Login forms with form validation.
- [ ] Profile Dashboard: Create a user profile view to display account details.
- [ ] Profile Editor: Build an editable form to update display name and profile picture URL.

## Integration & QA
- [ ] API Integration: Connect frontend forms to the backend authentication and profile APIs.
- [ ] Session Handling: Ensure the JWT is stored securely and handled in header requests.
- [ ] End-to-End Testing: Perform manual testing of the user lifecycle (Register -> Login -> View Profile -> Update Profile).