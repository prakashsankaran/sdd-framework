# Requirement: Visitor Management System (VMS)

## Project Overview

Build a lightweight Visitor Management System for office reception staff.

The system should allow receptionists to register visitors, notify employees about arrivals, track visitor check-in/check-out, and maintain visitor history.

The application will be used by a single office with multiple employees.

---

# Objectives

- Replace manual visitor register.
- Improve visitor tracking.
- Notify employees instantly.
- Maintain visitor audit history.

---

# User Roles

## Receptionist

- Register visitors
- Check-in visitors
- Check-out visitors
- Search visitor records
- View today's visitors

## Employee

- Receive visitor notifications
- View visitors waiting
- View visitor history

## Administrator

- Manage employees
- View reports
- Configure visitor types

---

# Functional Requirements

## Visitor Registration

Receptionist shall be able to:

- Enter Visitor Name
- Mobile Number
- Email (optional)
- Company Name
- Purpose of Visit
- Person to Meet
- Visitor Type
- Expected Duration

System shall generate a Visitor ID.

---

## Check-In

Receptionist shall:

- Select registered visitor
- Mark visitor as Checked-In
- Record check-in time
- Capture visitor photo (optional)

System shall notify the employee.

---

## Check-Out

Receptionist shall:

- Mark visitor as Checked-Out

System shall record:

- Check-out Time
- Total Visit Duration

---

## Employee Management

Administrator shall:

- Add employee
- Edit employee
- Disable employee
- Search employee

Employee fields:

- Employee ID
- Name
- Department
- Email
- Mobile

---

## Visitor Search

Receptionist can search using:

- Visitor Name
- Mobile Number
- Visitor ID
- Company
- Date

---

## Dashboard

Dashboard should display:

- Visitors Today
- Checked-In Visitors
- Checked-Out Visitors
- Pending Visitors

---

## Reports

Generate reports by:

- Date
- Employee
- Visitor Type
- Company

Reports should support CSV export.

---

# Business Rules

## BR-01
Visitor mobile number should be unique for active visits.

## BR-02
Visitor cannot check-out before check-in.

## BR-03
Only active employees can receive visitors.

## BR-04
Expected duration cannot exceed 8 hours.

## BR-05
Employee notification should be sent immediately after check-in.

---

# Non-Functional Requirements

- Responsive UI
- Mobile friendly
- Page response < 2 seconds
- Secure authentication
- Audit logging
- REST API architecture
- Support 100 concurrent users

---

# Suggested Technology

## Frontend
- React
- Tailwind CSS

## Backend
- Node.js
- Express

## Database
- PostgreSQL

## Authentication
- JWT

## Notifications
- Email (mock implementation)

---

# API Modules

- Authentication
- Visitor
- Employee
- Reports
- Dashboard

---

# Database Entities

- Users
- Employees
- Visitors
- VisitorTypes
- VisitHistory

---

# Success Criteria

The system shall allow:

- Register visitor
- Check-in
- Notify employee
- Check-out
- Search visitor
- View reports

without manual intervention.

---

# Out of Scope

- Face Recognition
- QR Code Entry
- SMS Gateway
- Multi-office support
- Badge Printing

---

# Future Enhancements

- QR based visitor entry
- Face recognition
- Outlook Calendar integration
- Microsoft Teams notification
- Visitor NDA signing
- ID proof scanning
