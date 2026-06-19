# Notification System Design — Stage 6

## Goal
Implement a Priority Inbox that returns the top 10 most important unread notifications.

## Requirements
- Use the provided Notification API
- Do not store notifications in a database
- Determine priority by both weight and recency
- Return only the top 10 notifications
- Support protected route access

## Approach
1. Fetch notifications from the test server during startup
2. Store them in memory as `notificationsData`
3. Assign priority weight to each notification type:
   - `Placement` = 3
   - `Result` = 2
   - `Event` = 1
4. Use the existing `Timestamp` field to sort newer notifications before older ones
5. Sort notifications by:
   - weight descending
   - timestamp descending
6. Return the top 10 notifications from the sorted list

## Implementation
- `GET /evaluation-service/notifications/priority`
  - Protected endpoint for priority notifications
  - Returns only the top 10 results
- `getPriorityNotifications(notifications, limit)`
  - Sorts by type weight and recency
  - Uses an in-memory slice of fetched notifications

## Notes
- This implementation assumes new notifications are fetched from the protected API on server startup.
- For an ongoing system, polling or event-driven refresh would keep the in-memory list updated.
- No DB is used, matching the task constraints.
