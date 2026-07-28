# ReactivationFlow Sample Lead CSV

## File

`data/leads_sample.csv`

## Current English Schema

| Header | Type | Required | Description |
|---|---|---:|---|
| `id` | String | Yes | Unique lead identifier |
| `name` | String | Yes | Lead's full name |
| `email` | String | Yes | Lead's email address |
| `phone` | String | Yes | International phone number |
| `leadType` | String | Yes | `appointment`, `emergency`, or `question` |
| `status` | String | Yes | Current pipeline status |
| `description` | String | No | Additional request details |
| `reminderSent` | Boolean | No | Whether a reminder was sent |
| `reminderDate` | ISO 8601 | No | Reminder date and time |
| `visitDate` | ISO 8601 | No | Scheduled visit date and time |
| `visitValue` | Number | No | Value of the current visit |
| `lifetimeValue` | Number | No | Total lifetime value of the lead |
| `calendarUrl` | String | No | Calendar event URL |
| `calendarId` | String | No | Calendar event identifier |
| `rescheduleUrl` | String | No | Rescheduling URL |
| `cancelUrl` | String | No | Cancellation URL |
| `updatedAt` | ISO 8601 | No | Last update timestamp |
| `createdAt` | ISO 8601 | Yes | Creation timestamp |

## Header Order

```text
id,name,email,phone,leadType,status,description,reminderSent,reminderDate,visitDate,visitValue,lifetimeValue,calendarUrl,calendarId,rescheduleUrl,cancelUrl,updatedAt,createdAt
```

## Pipeline Status Values

1. `phone-unconfirmed`
2. `phone-confirmed`
3. `canceled`
4. `no-show`
5. `completed`

## Data Rules

- Use unique values in `id`.
- Use ISO 8601 timestamps, such as `2026-02-21T14:00:00Z`.
- Use international phone numbers with a country code.
- Use `true` or `false` for `reminderSent`.
- Use numeric values for `visitValue` and `lifetimeValue`.
- Leave optional fields empty when no value is available.
- Keep the header names and order unchanged for reliable imports.

## Example

```csv
id,name,email,phone,leadType,status,description,reminderSent,reminderDate,visitDate,visitValue,lifetimeValue,calendarUrl,calendarId,rescheduleUrl,cancelUrl,updatedAt,createdAt
001,Jean Dupont,jean.dupont@email.com,+1-514-234-5678,appointment,phone-unconfirmed,,false,,,0,0,,,,,,2026-02-18T08:15:00Z
```

## App Mapping

The CSV uses English external headers. The CRM accepts these fields directly. During normalization, `visitDate` maps to the app's current internal `dateVisite` property for backward compatibility with existing n8n data.

**Format version:** 2.0  
**Compatible with:** ReactivationFlow
