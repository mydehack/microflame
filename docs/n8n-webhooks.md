# n8n webhook contract

CampusConnect sends best-effort outbound webhook events. There are no n8n-to-app webhooks in this implementation. The web application remains usable when n8n is absent or unavailable.

## New-student events

Set `N8N_NEW_STUDENT_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` on the server. Registration emits `student.created`; onboarding emits `student.onboarded`. The request body is:

```json
{
  "eventId": "<uuid>",
  "event": "student.created",
  "occurredAt": "<ISO-8601 timestamp>",
  "data": { "studentId": "<Supabase auth user UUID>" }
}
```

The raw JSON body is signed with HMAC-SHA256 over `<timestamp>.<raw body>`. The timestamp is Unix seconds in `x-campusconnect-timestamp`; the hex digest is in `x-campusconnect-signature`. In n8n, verify the signature against the exact raw request body with a constant-time comparison, reject timestamps older than five minutes, and deduplicate `eventId` before processing. Retrieve current student state from Supabase after verification instead of trusting webhook-supplied profile details. Use a least-privilege database credential.

Delivery retries once for network failures, HTTP 429, or 5xx responses, with a short timeout. The same event ID and signature are reused on retry. Delivery failures are logged server-side and do not fail registration or onboarding.

## Future workflows

Goal reminders, weekly learning reviews, profile-change match recalculation, and new-match notifications are not wired to n8n yet. Their environment variable slots are reserved in `.env.example`; do not configure scheduled workflows against those values until the application emits the corresponding signed events and opt-in data contracts are implemented.
