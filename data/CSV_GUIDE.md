# CSV Lead Data Guide - DENTIRO

## File Location
`data/leads_sample.csv`

## CSV Columns & Specifications

| Column | Type | Valid Values | Description | Example |
|--------|------|--------------|-------------|---------|
| **id** | String | Any unique identifier | Unique lead ID | `001`, `002`, `ABC-123` |
| **name** | String | Full name | Patient's complete name | `Jean Dupont` |
| **email** | String | Valid email format | Patient's email address | `jean.dupont@email.com` |
| **phone** | String | Phone format: +1-XXX-XXX-XXXX | Patient's phone number (Montreal area codes: 514, 438, 450, 579) | `+1-514-234-5678` |
| **leadType** | String | `appointment`, `emergency`, `question` | Type of patient inquiry | `appointment` |
| **status** | String | `phone-unconfirmed`, `phone-confirmed`, `canceled`, `no-show`, `completed` | Current status in lead pipeline | `phone-confirmed` |
| **description** | String | Free text | Optional visit details | `Nettoyage dentaire` |
| **reminderSent** | Boolean | `true`, `false` | Whether appointment reminder was sent | `true` |
| **reminderDate** | DateTime (ISO 8601) | YYYY-MM-DDTHH:MM:SSZ | Date/time when reminder will be sent or was sent | `2026-02-19T14:00:00Z` |
| **dateVisite** | DateTime (ISO 8601) | YYYY-MM-DDTHH:MM:SSZ | Appointment date/time | `2026-02-21T14:00:00Z` |
| **calendar_url** | String | URL | Google Calendar event URL | `https://calendar.google.com/calendar/event?eid=evt-001` |
| **calendar_id** | String | Any string | Calendar event ID | `cal_001` |
| **reschedule_url** | String | URL | Patient reschedule link | `https://calendar.google.com/calendar/event?eid=evt-001-resched` |
| **cancel_url** | String | URL | Patient cancellation link | `https://calendar.google.com/calendar/event?eid=evt-001-cancel` |
| **updatedAt** | DateTime (ISO 8601) | YYYY-MM-DDTHH:MM:SSZ | Timestamp when lead was last updated | `2026-02-19T10:05:00Z` |
| **createdAt** | DateTime (ISO 8601) | YYYY-MM-DDTHH:MM:SSZ | Timestamp when lead was created | `2026-02-18T08:15:00Z` |

## Data Guidelines

### Lead Type Values
- **appointment**: Patient requesting a regular dental appointment
- **emergency**: Patient with urgent dental problem (pain, swelling, etc.)
- **question**: Patient with general questions about services or pricing

### Status Values (Pipeline Order)
1. **phone-unconfirmed** - Lead submitted, awaiting WhatsApp "Oui" confirmation
2. **phone-confirmed** - Phone number confirmed via WhatsApp
3. **canceled** - Patient canceled before the visit
4. **no-show** - Patient missed their appointment
5. **completed** - Appointment completed

### Phone Number Format
- Must include country code: `+1` (Canada)
- Montreal area codes: 514, 438, 450, 579
- Format: `+1-XXX-XXX-XXXX`

### Date/Time Format
- Must use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
- Always use UTC timezone (Z suffix)
- Examples:
  - `2026-02-18T08:15:00Z` = Feb 18, 2026 at 8:15 AM UTC
  - `2026-02-19T14:00:00Z` = Feb 19, 2026 at 2:00 PM UTC

### Empty Fields
- Use empty string `""` for optional fields
- `reminderDate` is empty when `reminderSent = false`
- `dateVisite` and `updatedAt` can be empty for unconfirmed leads

## Sample Data Included

The `leads_sample.csv` includes 25 diverse leads representing:
- ✅ 12 appointment requests at various stages
- 🚨 4 emergency inquiries
- ❓ 3 general questions
- 📊 Various statuses showing complete lead lifecycle

### Status Distribution in Sample Data
- **phone-unconfirmed**: 7 leads - Awaiting WhatsApp confirmation
- **phone-confirmed**: 7 leads - Confirmed by WhatsApp
- **canceled**: 3 leads - Canceled before visit
- **completed**: 4 leads - Finished visits
- **no-show**: 4 leads - Missed appointments

## Using This Data

### Import to DENTIRO Admin Dashboard
1. Store this CSV in your database
2. Transform CSV rows to Lead objects
3. Load into admin dashboard for bulk import

### Transform to JSON
```json
{
  "id": "001",
  "name": "Jean Dupont",
  "email": "jean.dupont@email.com",
  "phone": "+1-514-234-5678",
  "leadType": "appointment",
  "status": "phone-unconfirmed",
  "description": "Nettoyage dentaire",
  "reminderSent": false,
  "reminderDate": "",
  "dateVisite": "",
  "calendar_url": "https://calendar.google.com/calendar/event?eid=evt-001",
  "calendar_id": "cal_001",
  "reschedule_url": "https://calendar.google.com/calendar/event?eid=evt-001-resched",
  "cancel_url": "https://calendar.google.com/calendar/event?eid=evt-001-cancel",
  "updatedAt": "",
  "createdAt": "2026-02-18T08:15:00Z"
}
```

### Keys for Success
- ✅ Consistent date/time format (ISO 8601)
- ✅ Valid email addresses (format: user@domain.com)
- ✅ Proper phone format with country code
- ✅ Valid status values only
- ✅ ID uniqueness for each lead
- ✅ Logical progression (e.g., scheduled leads created before reminder dates)

## Tips for Creating Your Own Data

1. **Realistic Names**: Use common French-Canadian names for Montreal market
2. **Email Variety**: Mix Gmail, Hotmail, Outlook, custom domains
3. **Phone Numbers**: Use Montreal area codes (514, 438)
4. **Date Distribution**: Spread out lead creation over several days
5. **Status Logic**: 
   - "new" → created recently, no reminder date
   - "contacted" → contacted, maybe has reminder date
   - "scheduled" → has reminder date in future
   - "completed" → old creation date, no reminder needed

## Integration with DENTIRO App

The CSV format matches the TypeScript Lead interface:

```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  leadType: 'appointment' | 'emergency' | 'question';
  status: 'phone-unconfirmed' | 'phone-confirmed' | 'canceled' | 'no-show' | 'completed';
  reminderSent?: boolean;
  reminderDate?: string;
  dateVisite?: string;
  calendarUrl?: string;
  calendarId?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
  updatedAt?: string;
  createdAt: string;
}
```

## Bulk Operations

### CSV to localStorage
```javascript
const leads = parseCSV('leads_sample.csv');
localStorage.setItem('leads', JSON.stringify(leads));
```

### Export Current Data as CSV
From admin dashboard, export all leads to CSV for backup or analytics.

---

**Last Updated**: February 18, 2026  
**Format Version**: 1.0  
**Compatible with**: DENTIRO v1.0
