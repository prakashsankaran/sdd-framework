# Manual Test Suite Blueprint

| Test ID | Description | Pre-conditions | Test Steps | Expected Output |
| --- | --- | --- | --- | --- |
| TC-001 | Verify successful extraction of action items from meeting transcript via POST /api/v1/meetings/summary | A valid meeting record exists; transcript is uploaded; user is authenticated with proper RBAC. | 1. Send POST request to /api/v1/meetings/summary with valid meeting_id.<br>2. Observe response status code 200.<br>3. Verify response body contains 'action_items' array with 'owner', 'due_date', and 'priority' fields. | System returns a valid JSON object containing accurately parsed action items matching the transcript context. |
| TC-002 | Validate RBAC enforcement for unauthorized action item update | User is authenticated as 'Employee'; Target Action Item is assigned to a different user. | 1. Send PATCH/PUT request to /api/v1/actions/{id} to update status.<br>2. Observe response status code. | System returns 403 Forbidden; state of the action item remains unchanged. |
| TC-003 | Verify Semantic Search retrieval accuracy | Vector database (Qdrant) is populated with embeddings from multiple meetings. | 1. Perform a GET request to the search endpoint with a natural language query.<br>2. Verify the returned snippets match the query context. | System returns the most relevant meeting excerpts based on vector similarity score. |
| TC-004 | Validate Data Residency and Security via TLS 1.3 requirement | Environment configured with VPC-peering. | 1. Attempt to connect to API using TLS 1.2 or lower.<br>2. Attempt to connect to API using TLS 1.3. | TLS 1.2 connections are rejected; TLS 1.3 connections are successful. |


## Gherkin Automated Specifications

```gherkin
Feature: Meeting and Action Item Management

  Scenario Outline: Extracting action items from meeting transcript
    Given a valid meeting with transcript content exists
    When a user requests a summary for meeting "<meeting_id>"
    Then the system should return status 200
    And the response should contain an action item with priority "<priority>"

    Examples:
      | meeting_id | priority |
      | UUID-001   | High     |
      | UUID-002   | Critical |

  Scenario Outline: Validate action item status constraints
    Given an existing action item
    When the user updates status to "<status>"
    Then the system should return "<expected_result>"

    Examples:
      | status      | expected_result |
      | Completed   | 200 OK          |
      | InvalidStat | 400 Bad Request |

  Scenario: Unauthorized access to system configuration
    Given a user with role "Employee"
    When they attempt to access an Admin endpoint
    Then the system returns a 403 Forbidden error
```
