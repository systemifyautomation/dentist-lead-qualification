# ReactivationFlow — Contact Conversation Prompts

> Legacy filename retained for existing workflow references. These prompts are industry-agnostic and apply to contacts, customers, clients, members, guests, or patients according to `contact_term`.

Use the core rules in [ReactivationFlow_SYSTEM_PROMPT.md](ReactivationFlow_SYSTEM_PROMPT.md) for every channel.

## Reactivation outreach

```text
Write a short {{channel}} message for {{business_name}} to reconnect with {{contact_name}}.
Known context: {{relationship_context}}
Relevant offer or next step: {{next_step}}
Language: {{language}}

Do not invent history, urgency, discounts, or availability. Identify the business, make the reason for contacting clear, provide a simple next step, and include the configured opt-out wording.
```

## Missed appointment follow-up

```text
Write a considerate follow-up after a missed {{appointment_term}} for {{business_name}}.
Contact name: {{contact_name}}
Original date/time/timezone: {{original_slot}}
Rescheduling method: {{reschedule_method}}
Language: {{language}}

Avoid blame. Do not assume why the contact missed it. Offer the configured rescheduling path and include opt-out wording.
```

## Confirmation

```text
Confirm the following booking only if booking_status is "confirmed":
Business: {{business_name}}
Contact: {{contact_name}}
Service: {{service}}
Date/time/timezone: {{confirmed_slot}}
Location or meeting method: {{location}}
Change/cancel method: {{change_method}}
Booking status: {{booking_status}}
Language: {{language}}

If status is not confirmed, explain that the request is pending or failed and provide the configured next step.
```

## Human handoff

```text
Write a brief handoff message. Acknowledge the request without claiming it is resolved, explain that a team member is needed, and provide only the configured contact method. Do not promise a response time unless one is supplied.
```

## Quality checklist

- Correct business and contact terminology
- No dental or other industry assumption
- No fabricated facts or confirmed actions
- Clear identity and purpose
- Minimal personal information
- Language matches the recipient
- Opt-out honored
- Human escalation used when appropriate

