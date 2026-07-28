# ReactivationFlow

ReactivationFlow is an industry-agnostic lead reactivation and appointment automation platform. It helps service businesses capture inquiries, reconnect with dormant contacts, confirm appointments, recover no-shows, and manage follow-up from one CRM.

Production application: [app.reactivation.com](https://app.reactivation.com)

## What it includes

- Multilingual inquiry and appointment form
- Lead pipeline and contact management
- Appointment confirmation, cancellation, and rescheduling
- No-show and dormant-contact reactivation
- WhatsApp, email, and voice campaign workflows
- Website chatbot integration
- Role-based administration

Terminology is deliberately generic. A deployment may configure “customer,” “client,” “patient,” “member,” or another audience term for its business; the core product must not assume a dental or healthcare context.

## Local setup

Requirements: a maintained Node.js LTS release and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed.

Set the webhook endpoints in `.env`. Do not commit secrets or production credentials.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Production

The SPA is built with Vite into `dist`. `vercel.json` rewrites application routes to `index.html`. The canonical production origin is `https://app.reactivation.com`.

Before deployment:

1. Configure production webhook environment variables.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Smoke-test the inquiry, authentication, CRM, booking, cancellation, rescheduling, and chatbot flows.

See [DEPLOYMENT.md](DEPLOYMENT.md) for operational details.

## Brand and AI behavior

- [BRAND.md](BRAND.md) defines positioning, terminology, voice, and configurable business fields.
- [ReactivationFlow_SYSTEM_PROMPT.md](ReactivationFlow_SYSTEM_PROMPT.md) is the shared AI policy.
- [ReactivationFlow_CHATBOT_SYSTEM_PROMPT.md](ReactivationFlow_CHATBOT_SYSTEM_PROMPT.md) configures the website assistant.
- [ReactivationFlow_CHATBOT_PROMPT.md](ReactivationFlow_CHATBOT_PROMPT.md) documents chatbot workflow input and output.
- [PATIENT_CONVERSATION_AI_PROMPTS.md](PATIENT_CONVERSATION_AI_PROMPTS.md) retains its legacy filename for compatibility but now contains generic contact-conversation prompts.
- [RETELL_RECEPTIONIST_PROMPT.md](RETELL_RECEPTIONIST_PROMPT.md) and [RETELL_CONFIRMATION_AGENT_PROMPT.md](RETELL_CONFIRMATION_AGENT_PROMPT.md) configure industry-neutral voice agents.

Business facts such as services, hours, prices, location, booking links, terminology, and escalation contacts must be supplied at runtime rather than hard-coded in prompts.

## Technology

- React 19 and TypeScript
- Vite
- React Router
- n8n webhooks and external messaging/voice providers

## Security

- Keep webhook URLs and credentials out of source control.
- Validate and authorize all webhook operations server-side.
- Treat model output as untrusted and validate structured responses.
- Minimize personal data and honor channel consent and opt-out requirements.
- Never display or log confidential records unnecessarily.

