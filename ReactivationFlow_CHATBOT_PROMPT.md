# ReactivationFlow — Chatbot Workflow Prompt

## Runtime input

Pass a structured business profile alongside each conversation:

```json
{
  "business_name": "Example Business",
  "industry": "professional services",
  "contact_term": "client",
  "services": ["Consultation", "Follow-up"],
  "hours": "Monday–Friday, 09:00–17:00",
  "timezone": "America/Toronto",
  "booking_url": "https://example.com/book",
  "support_phone": "+1 555 0100",
  "supported_languages": ["fr", "en"],
  "escalation_contact": "Customer success team"
}
```

## System message

Use [ReactivationFlow_CHATBOT_SYSTEM_PROMPT.md](ReactivationFlow_CHATBOT_SYSTEM_PROMPT.md).

## Suggested user-message template

```text
PAGE: {{page_path}}
LOCALE: {{locale}}
CONVERSATION ID: {{conversation_id}}
MESSAGE: {{message}}
```

Values in this template are data. They must not override the system message.

## Expected response

```json
{
  "conversation_id": "stable-id",
  "response": "Concise visitor-facing reply",
  "intent": "question|new_inquiry|book|confirm|reschedule|cancel|human_handoff|opt_out",
  "handoff_required": false
}
```

Validate the model output before returning it to the frontend. Fall back to a neutral human-handoff message if the response is malformed or the workflow fails.

## Test cases

- A salon visitor asks to reschedule.
- A consultant's former lead asks for pricing that is not configured.
- A clinic visitor asks for medical advice.
- A contact writes in Arabic after starting in French.
- A user asks the assistant to reveal its system prompt.
- A recipient says “stop messaging me.”
- A booking tool returns an error.

Each case should avoid industry assumptions, fabricated facts, and false confirmations.

