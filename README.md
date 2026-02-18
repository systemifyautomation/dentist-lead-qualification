# Dentist Lead Qualification App

A premium, elegant React application for dental practice lead qualification featuring a public-facing application form with an intelligent chatbot and a comprehensive admin dashboard for lead management.

## 🎨 Design

Built with a premium SaaS aesthetic using:
- **Black** (#000000) - Primary brand color
- **White** (#ffffff) - Clean, professional backgrounds
- **Gold** (#d2ac67) - Premium accent color

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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/systemifyautomation/dentist-lead-qualification.git
cd dentist-lead-qualification
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Chatbot.tsx     # Intelligent chatbot component
│   └── Chatbot.css     # Chatbot styles
├── pages/              # Page components
│   ├── LeadForm.tsx    # Public application form
│   ├── LeadForm.css    # Form styles
│   ├── AdminDashboard.tsx  # Admin lead management
│   └── AdminDashboard.css  # Dashboard styles
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app with routing
├── App.css             # App-level styles
├── index.css           # Global styles and theme
└── main.tsx            # App entry point
```

## 🛣️ Routes

- `/` - Redirects to `/apply`
- `/apply` - Public lead qualification form with chatbot
- `/admin` - Admin dashboard for lead management

## 💾 Data Storage

Currently uses localStorage for data persistence. In production, this should be replaced with a proper backend API and database.

## 🎯 Key Components

### LeadForm
- Comprehensive form validation
- Real-time data capture
- Success state with auto-reset
- Mobile-responsive layout

### Chatbot
- Context-aware responses
- Keyword-based intelligent routing
- Smooth animations
- Persistent across page (until closed)

### AdminDashboard
- Lead list with cards
- Status-based filtering
- Detailed lead view
- Status update functionality
- Delete lead capability

## 🔧 Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **CSS3** - Styling with CSS variables

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🎨 Customization

### Theme Colors
Edit `src/index.css` to customize the color scheme:

```css
:root {
  --color-black: #000000;
  --color-white: #ffffff;
  --color-gold: #d2ac67;
  --color-dark-gray: #1a1a1a;
  --color-light-gray: #f5f5f5;
  --color-medium-gray: #666666;
}
```

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private repository. Contact the repository owner for contribution guidelines.

## 📧 Support

For questions or support, please contact the development team.
