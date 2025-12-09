# ScheduleSync 📅

> **Note**: This project has evolved from a vanilla JavaScript implementation to a modern React-based application. The current version represents a complete rewrite with enhanced features and accessibility.

A modern React-based web application that helps groups coordinate schedules and find common availability. Share your availability, discover mutual free time slots, create events, and organize meetings with friends seamlessly.

## 📈 Project Evolution

**Previous Version (ScheduleSync):**
- Simple HTML/CSS/JavaScript implementation
- Basic calendar functionality with Firebase backend
- Planned features for authentication and group suggestions

**Current Version (Availability Scheduler):**
- Full React 19 application with modern architecture
- Complete accessibility implementation (WCAG 2.1 AA)
- Advanced features: friend collaboration, real-time sync, conflict detection
- Production-ready with comprehensive testing and deployment setup

## 🌟 Key Features

- 📅 **Interactive Weekly Calendar**: Manage your availability with an intuitive visual calendar interface
- 🤝 **Friend Collaboration**: Share calendars with friends and view their availability in real-time
- 📌 **Event Management**: Create group events and track participant responses
- ♿ **Accessibility First**: Full screen reader support, keyboard navigation, and WCAG compliance
- 🎨 **Customizable Themes**: Multiple accessibility-focused color schemes
- 🔔 **Conflict Detection**: Automatic notifications for scheduling conflicts
- 🔐 **Secure Authentication**: Firebase-based authentication with Google OAuth
- ⚡ **Real-time Sync**: Live updates across all connected devices

## 🛠 Tech Stack

- **Frontend Framework**: React 19 with ES modules
- **Routing**: React Router 7
- **State Management**: React Context API (Authentication & Accessibility)
- **Backend**: Firebase (Authentication & Firestore Database)
- **Date Handling**: date-fns library
- **Styling**: CSS3 with responsive design
- **Build Tool**: React Scripts 5
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js v16 or higher
- npm or yarn
- A Firebase project with Firestore and Authentication enabled

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/asemaoskonbaikyzy-lab/wewannagraduate.git
cd wewannagraduate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a `.env.local` file in the project root with your Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Start Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📦 Available Commands

```bash
# Start development server with hot reload
npm start

# Create optimized production build
npm run build

# Run test suite
npm test

# Eject Create React App configuration (irreversible)
npm run eject
```

## 📂 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── AccessibilityButton.js       # Theme/accessibility toggle
│   ├── AccessibilityModal.js        # Accessibility settings dialog
│   ├── AddTimeBlockModal.js         # Modal for adding schedule blocks
│   ├── ConflictNotification.js      # Conflict alerts
│   ├── TimeSlotCalendar.js          # Calendar grid component
│   └── WeekView.js                  # Weekly calendar view
├── pages/                   # Full-page components
│   ├── HomePage.js                  # Landing page with auth
│   ├── CalendarPageFinal.js         # Main calendar management page
│   ├── EventsPage.js                # Event creation and management
│   └── FriendsPage.js               # Friend management and viewing
├── hooks/                   # Custom React hooks
│   ├── useAuth.js                   # Authentication context and logic
│   └── useAccessibility.js          # Accessibility features context
├── utils/                   # Utility functions
│   ├── firebase.js                  # Firebase API calls and config
│   ├── conflictDetection.js         # Schedule conflict detection logic
│   └── categories.js                # Schedule type definitions
├── styles/                  # CSS stylesheets
│   ├── App.css
│   ├── Calendar.css
│   ├── AccessibilityThemes.css
│   ├── AccessibilityButton.css
│   ├── AccessibilityModal.css
│   └── index.css
├── App.js                   # Main app component with routing
└── index.js                 # React DOM entry point
```

## 🏗 Architecture Overview

### Authentication System
- Built on React Context API (`useAuth.js`)
- Google OAuth integration via Firebase
- Automatic user profile creation on first login
- Session persistence across page reloads

### Data Management
Firestore collections:
- **users**: User profiles with display info
- **schedules**: Time blocks (startHour, endHour, type, date)
- **events**: Group events with participant lists
- **shares**: Friend relationships for calendar sharing

### Calendar System
- Time slots: 6 AM to 11 PM (hourly increments)
- Schedule types: `available`, `event`, `activity`
- Multi-slot selection and batch operations
- Real-time updates via Firestore listeners

## ♿ Accessibility Features

This app prioritizes accessibility:

- ✅ **WCAG 2.1 AA Compliant** with semantic HTML5
- ✅ **Screen Reader Optimized**: Comprehensive ARIA labels and live regions
- ✅ **Keyboard Navigation**: Full keyboard accessibility for all features
- ✅ **Skip Links**: Quick navigation to main content
- ✅ **Focus Management**: Proper focus handling and visible focus indicators
- ✅ **Color Contrast**: WCAG AA compliant color combinations
- ✅ **Multiple Themes**: High contrast, dark mode, and dyslexia-friendly options
- ✅ **Announcements**: Screen reader-friendly route change announcements

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and connect your repository
3. Add environment variables in Vercel dashboard
4. Vercel will automatically deploy on every push to main

### Other Platforms

After running `npm run build`, the `build/` folder contains your production-ready app and can be deployed to:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🧪 Development Workflow

### Adding New Features

1. Create a new component in `src/components/` or `src/pages/`
2. Import required hooks and utilities
3. Use Firebase utilities from `src/utils/firebase.js` for data operations
4. Add corresponding CSS to `src/styles/`
5. Test locally with `npm start`
6. Commit and push to GitHub

### Working with Schedules

Schedule item structure:
```javascript
{
  id: string,              // Firebase doc ID
  userId: string,          // Owner's UID
  date: 'YYYY-MM-DD',     // ISO date format
  startHour: number,       // 0-23
  endHour: number,         // 0-23
  title: string,           // Display name
  type: 'available'|'event'|'activity',
  eventId: string,         // Reference to events collection
  updatedAt: string        // ISO timestamp
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add feature description'`
5. Push to your fork: `git push origin feature/your-feature`
6. Open a Pull Request with a description of changes

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support & Issues

Have questions or found a bug?
- Open an issue on [GitHub Issues](https://github.com/asemaoskonbaikyzy-lab/wewannagraduate/issues)
- Include:
  - Clear description of the problem
  - Steps to reproduce
  - Expected vs actual behavior
  - Browser and OS information

## 🔗 Links

- **Live Demo**: Check Vercel deployment
- **Firebase Console**: Configure your Firestore rules
- **React Documentation**: [react.dev](https://react.dev)
- **Firebase Docs**: [firebase.google.com](https://firebase.google.com)

---

**Made with ❤️ for better scheduling and collaboration**
