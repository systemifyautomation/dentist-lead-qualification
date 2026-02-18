# DENTIRO - Dental Lead Management & Automation Platform

A modern, production-ready React application for dental practices featuring intelligent lead management, n8n workflow automation, and WhatsApp integration. Built with React 19, TypeScript, and Vite, deployed on Vercel.

## 🚀 Quick Links

- **📘 [Deployment Guide](DEPLOYMENT.md)** - Complete Vercel deployment instructions
- **📊 [Strategy v2.0](DENTIRO_STRATEGY_v2.md)** - Full implementation documentation
- **📋 [Blueprint v1.0](DENTIRO_Blueprint_Workflow.md)** - Original strategy & workflows
- **🌐 Live Demo:** `https://your-app.vercel.app` (after deployment)

## ✨ Features

### 🏠 Public Pages
- **Home Page** (`/`) - Landing page with hero section and CTAs
- **Strategy Page** (`/strategy`) - Documentation and workflow explanation
- **Lead Form** (`/lead-form`) - Patient intake form with validation
- **Chatbot** - Scalint AI assistant (bottom-right toggle)

### 📊 Admin CRM Dashboard (`/admin`)
- **CRUD Operations:** Create, Read, Update, Delete leads via n8n webhooks
- **Advanced Filters:** 7 status badges with color coding
- **Search:** Full-text search (name, email, phone)
- **Sorting:** 6 sort options (date, name, created date)
- **Pagination:** 10 leads per page with navigation
- **Icon Actions:** Edit (Pencil), Delete (Trash), Save, Cancel
- **Responsive Design:** Mobile-first, optimized for all devices

### 🎨 Shopify-Style Design
- **Header:** Black (#1A1A1A), 56px height, 3-column grid layout
- **Status Badges:** 7 distinct colors (Blue, Amber, Green, Indigo, Red, Dark Green)
- **Icon Buttons:** Uniform 32px × 32px from lucide-react
- **Premium Aesthetic:** Gold accents (#D2AC67), clean typography

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Frontend** | React | 19.2.0 |
| **Language** | TypeScript | 5.9.3 |
| **Build Tool** | Vite | 7.3.1 |
| **Routing** | React Router DOM | 7.13.0 |
| **Icons** | lucide-react | 0.574.0 |
| **Date Handling** | date-fns | 4.1.0 |
| **Calendar** | react-day-picker | 9.13.2 |
| **Hosting** | Vercel | - |
| **Automation** | n8n (webhooks) | - |

## 🎨 Design

Built with a premium SaaS aesthetic:

### Color System
- **Primary:** #1A1A1A (Dark Gray) - Header background
- **Accent:** #D2AC67 (Gold) - CTAs, hover states
- **Status Colors:**
  - New: #3B82F6 (Blue)
  - Contacted: #F59E0B (Amber)
  - Qualified: #10B981 (Green)
  - Scheduled: #6366F1 (Indigo)
  - No-show: #EF4444 (Red)
  - Completed: #059669 (Dark Green)

### Typography
- **Font:** System fonts (San Francisco, Segoe UI, Roboto)
- **Scale:** 0.85rem - 2.5rem
- **Weights:** 400 (regular), 600 (semi-bold), 700 (bold)

## ✨ Features

### Public Application Form (`/apply`)
- Elegant, responsive lead qualification form
- Required fields for contact and practice information
- Budget range and timeline selection
- Success confirmation with animation
- Intelligent chatbot assistant

### Interactive Chatbot
- Floating chat button for easy access
- Answers common questions about:
  - Pricing and plans
  - Features and capabilities
  - Support options
  - Implementation timeline
  - System integration
- Smooth animations and typing indicators

### Admin Dashboard (`/admin`)
- Real-time lead overview with statistics
- Visual lead cards with status badges
- Filter leads by status (New, Contacted, Qualified, Unqualified)
- Detailed lead information panel
- Status management system
- Lead deletion capability
- Responsive design for all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- n8n instance with configured webhooks (see [DEPLOYMENT.md](DEPLOYMENT.md))

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/dentist-lead-qualification.git
cd dentist-lead-qualification
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your n8n webhook URLs:
```env
VITE_WEBHOOK_LEADS=https://your-n8n-instance.com/webhook/dentist-leads
VITE_WEBHOOK_CHATBOT=https://your-n8n-instance.com/webhook/scalint-chatbot
```

4. **Start development server:**
```bash
npm run dev
```

App runs at `http://localhost:5173`

### Production Build

**Build the application:**
```bash
npm run build
# Output: dist/ folder (ready for deployment)
```

**Preview production build locally:**
```bash
npm run preview
```

### Deploy to Vercel

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete Vercel deployment instructions.

**Quick deploy:**
```bash
npm install -g vercel
vercel
# Follow prompts, add environment variables
vercel --prod
```

## 📁 Project Structure

```
dentist-lead-qualification/
├── src/
│   ├── pages/
│   │   ├── Home.tsx              # Landing page
│   │   ├── Strategy.tsx          # Strategy documentation
│   │   ├── LeadForm.tsx          # Patient intake form
│   │   ├── LeadForm.css
│   │   ├── AdminDashboard.tsx    # CRM dashboard (1109 lines)
│   │   └── AdminDashboard.css    # Dashboard styles (1207 lines)
│   ├── components/
│   │   ├── Chatbot.tsx           # Scalint AI chatbot
│   │   ├── Chatbot.css
│   │   ├── DateTimePicker.tsx    # Custom date/time selector
│   │   └── DateTimePicker.css
│   ├── types.ts                  # TypeScript interfaces
│   ├── App.tsx                   # Main router
│   ├── App.css
│   ├── index.css                 # Global styles
│   └── main.tsx                  # Entry point
├── data/
│   ├── leads_sample.csv          # Sample data
│   └── CSV_GUIDE.md
├── public/                       # Static assets
├── DEPLOYMENT.md                 # Vercel deployment guide
├── DENTIRO_STRATEGY_v2.md        # Complete implementation docs
├── DENTIRO_Blueprint_Workflow.md # Original strategy v1.0
├── vercel.json                   # Vercel configuration
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🛣️ Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page with hero and CTAs |
| `/strategy` | Strategy | Documentation and workflow info |
| `/lead-form` | LeadForm | Patient intake form |
| `/admin` | AdminDashboard | CRM dashboard (lead management) |

## 📦 Data Model

### Lead Interface (TypeScript)

```typescript
interface Lead {
  id: string;                    // Unique identifier
  name: string;                  // Patient name
  email: string;                 // Email address
  phone: string;                 // Phone (international format)
  leadType: 'appointment' | 'emergency' | 'question';
  status: 'new' | 'contacted' | 'qualified' | 'scheduled' | 'no-show' | 'completed';
  description: string;           // Request description
  visitDate: string;             // ISO 8601 date
  reminderSent: boolean;         // 24h reminder sent?
  reminderDate: string | null;   // When reminder was sent
  createdAt: string;             // Creation timestamp
}
```

## 💾 Data Flow & Storage

```
┌─────────────────┐
│  React App      │
│  (Vercel)       │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────────┐
│  n8n Webhooks       │
│  ├── GET /leads     │ → Fetch all leads
│  ├── POST /leads    │ → Create lead
│  ├── PUT /leads     │ → Update lead
│  └── DELETE /leads  │ → Delete lead (?id=)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Database           │
│  (Airtable/Sheets/  │
│   PostgreSQL/etc)   │
└─────────────────────┘
```

**Current Development Mode:**
- Uses localStorage for quick testing
- Production: Full n8n webhook integration

## 🎯 Key Components

### AdminDashboard (CRM)
- **4 action buttons:** Edit, Delete, Save, Cancel (icon-only, 32px)
- **7 status badges:** Color-coded for quick visual scanning
- **Filters & Search:** Real-time filtering and full-text search
- **Pagination:** 10 leads per page with navigation
- **CRUD via n8n:** All operations go through webhooks
- **Responsive:** Mobile-optimized with touch-friendly targets

### LeadForm
- **3 lead types:** Appointment, Emergency, Question
- **Custom DateTimePicker:** Mobile-friendly date/time selection
- **Validation:** Email, phone, required fields
- **Success feedback:** Visual confirmation on submission
- **n8n Integration:** POST request to webhook

### Chatbot (Scalint)
- **Toggle button:** Bottom-right corner, always accessible
- **AI-powered:** n8n webhook integration
- **Context-aware:** Knows current page context
- **Session management:** Maintains conversation history
- **Smooth animations:** Typing indicator, slide-in effect

### DateTimePicker
- **Custom component:** Built with react-day-picker
- **French locale:** Full French language support
- **Mobile-optimized:** Touch-friendly, 44px+ targets
- **Time selection:** Custom time picker with validation
- **Accessibility:** ARIA labels, keyboard navigation

## 🔧 Technologies & Libraries

### Core
- **React 19.2.0** - UI framework with latest features
- **TypeScript 5.9.3** - Type safety and IntelliSense
- **Vite 7.3.1** - Lightning-fast build tool (4s builds)

### Routing & Navigation
- **React Router DOM 7.13.0** - Client-side routing

### UI & Icons
- **lucide-react 0.574.0** - Beautiful icon library (20px, strokeWidth 2.5)
- **react-day-picker 9.13.2** - Accessible date picker

### Date Handling
- **date-fns 4.1.0** - Date formatting and manipulation

### Styling
- **CSS3 with Variables** - No CSS-in-JS, pure CSS with theming

## 📱 Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1200px) { ... }

/* Tablet */
@media (max-width: 768px) { ... }

/* Mobile */
@media (max-width: 480px) { ... }
```

**Mobile-First Approach:**
- Touch targets: 44px minimum
- Font sizes: clamp() for fluid typography
- Flexible grids: CSS Grid + Flexbox
- No horizontal scroll

## 🔌 n8n Webhook Integration

### Required Webhooks

**1. Leads Webhook (`VITE_WEBHOOK_LEADS`)**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/webhook/dentist-leads` | Fetch all leads |
| POST | `/webhook/dentist-leads` | Create new lead |
| PUT | `/webhook/dentist-leads` | Update existing lead |
| DELETE | `/webhook/dentist-leads?id={id}` | Delete lead |

**2. Chatbot Webhook (`VITE_WEBHOOK_CHATBOT`)**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/webhook/scalint-chatbot` | Send message, get AI response |

### CORS Configuration

Your n8n webhook responses must include:
```json
{
  "Access-Control-Allow-Origin": "https://your-app.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete n8n workflow setup instructions.

## 🚀 Performance

### Build Stats
- **Bundle Size:** 349.65 kB (106.76 kB gzipped)
- **CSS Size:** 51.04 kB (9.64 kB gzipped)
- **Build Time:** ~4 seconds
- **Modules:** 2688 transformed

### Target Metrics (Vercel Analytics)
- **FCP:** < 1.5s
- **LCP:** < 2.5s
- **TTI:** < 3.5s
- **CLS:** < 0.1

## 🎨 Customization

### Theme Colors

Edit `src/index.css` to customize:

```css
:root {
  /* Primary Colors */
  --color-black: #000000;
  --color-white: #ffffff;
  --color-gold: #d2ac67;
  
  /* Grays */
  --color-dark-gray: #1a1a1a;
  --color-light-gray: #f5f5f5;
  --color-medium-gray: #666666;
  
  /* Status Colors */
  --status-new: #3b82f6;
  --status-contacted: #f59e0b;
  --status-qualified: #10b981;
  --status-scheduled: #6366f1;
  --status-no-show: #ef4444;
  --status-completed: #059669;
}
```

### Icon Sizes

Edit `src/pages/AdminDashboard.css`:
```css
.icon-button svg {
  width: 20px;   /* Change icon size */
  height: 20px;
}
```

### Button Dimensions

```css
.icon-button {
  width: 32px;   /* Change button size */
  height: 32px;
  border-radius: 6px;  /* Corner radius */
}
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file - Quick start & overview |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Complete Vercel deployment guide |
| [DENTIRO_STRATEGY_v2.md](DENTIRO_STRATEGY_v2.md) | Full implementation strategy (v2.0) |
| [DENTIRO_Blueprint_Workflow.md](DENTIRO_Blueprint_Workflow.md) | Original workflow design (v1.0) |
| [data/CSV_GUIDE.md](data/CSV_GUIDE.md) | CSV import/export format |

## 🐛 Troubleshooting

### Build Errors

**Issue:** TypeScript compilation errors
```bash
# Check for errors
npm run build

# Fix linting issues
npm run lint
```

### Environment Variables Not Loading

**Issue:** Webhooks return undefined

**Solution:**
1. Ensure variables start with `VITE_`
2. Restart dev server after changing `.env`
3. Clear browser cache

### CORS Errors

**Issue:** Webhook requests blocked by CORS

**Solution:**
Configure n8n webhook response headers (see [DEPLOYMENT.md](DEPLOYMENT.md))

### 404 on Routes (Vercel)

**Issue:** Refresh on `/admin` returns 404

**Solution:**
Ensure `vercel.json` exists with SPA rewrite rules:
```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

## 🔒 Security & Privacy

### Current Implementation
- ✅ HTTPS only (Vercel automatic SSL)
- ✅ Environment variables (not in client bundle)
- ✅ No sensitive data in localStorage
- ✅ CORS configured on webhooks

### Recommended for Production
- [ ] Authentication for `/admin` route
- [ ] Rate limiting on webhooks
- [ ] Input sanitization (XSS prevention)
- [ ] RGPD compliance (cookie consent)
- [ ] Data retention policy (90 days)

See [DENTIRO_STRATEGY_v2.md](DENTIRO_STRATEGY_v2.md) for RGPD compliance checklist.

## 📊 Monitoring

### Vercel Dashboard
- Real-time logs
- Function executions
- Analytics (page views, performance)
- Error tracking

### n8n Monitoring
- Workflow execution history
- Success/failure rates
- Execution time tracking

## 🗺️ Roadmap

### v2.1 (Next Release)
- [ ] Admin authentication (JWT)
- [ ] Multi-clinic support
- [ ] CSV export functionality
- [ ] Google Calendar integration

### v2.2 (Future)
- [ ] WhatsApp chatbot (conversational)
- [ ] Payment integration (deposits)
- [ ] Push notifications (PWA)
- [ ] Advanced analytics dashboard

### v3.0 (Vision)
- [ ] ML-based no-show prediction
- [ ] AI treatment recommendations
- [ ] Public API for integrations
- [ ] Mobile app (React Native)

See full roadmap in [DENTIRO_STRATEGY_v2.md](DENTIRO_STRATEGY_v2.md)

## 📝 License

This project is proprietary and confidential.

## 🤝 Support

- **Documentation:** See files in repository root
- **Issues:** GitHub Issues tab
- **Email:** team@dentiro.clinic (if applicable)

## 🙏 Acknowledgments

Built with:
- React team for React 19
- Vite team for blazing-fast builds
- lucide-react for beautiful icons
- Vercel for seamless hosting

---

**Version:** 2.0 Production Ready  
**Last Updated:** February 18, 2026  
**Status:** ✅ Ready for deployment

For deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**
