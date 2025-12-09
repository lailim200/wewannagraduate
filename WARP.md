# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a React-based availability scheduler application that allows users to:
- Create and manage their time schedules with visual calendar blocks
- Share schedules with friends for event coordination
- Create events and invite participants
- View friends' calendars and respond to invitations

**Tech Stack**: React 19+ with ES modules, Firebase (Auth, Firestore), date-fns, React Router

## Development Commands

### Core Development
```bash
# Start development server
npm start

# Build production bundle
npm run build

# Run tests
npm test

# Eject Create React App configuration (destructive)
npm run eject
```

### Firebase Security Note
The Firebase configuration contains production API keys that should be replaced with your own project credentials before deployment.

## Architecture Overview

### Authentication System
- **Provider**: `src/hooks/useAuth.js` - React Context for auth state management
- **Backend**: `src/utils/firebase.js` - Google OAuth integration with automatic user profile creation
- Authentication wraps entire app via `AuthProvider` in `App.js`

### Data Layer (Firebase Firestore)
The app uses these main collections:
- **`users`**: User profiles (auto-created on first sign-in)
- **`schedules`**: Individual time blocks with userId, date, startHour, endHour, title, type
- **`events`**: Created events with participant lists and response tracking
- **`shares`**: Friend relationships (ownerId -> friendId mappings)
- **`availability`**: Legacy collection for backward compatibility

### Route Structure
- **`/`**: HomePage - Landing page with feature overview and auth
- **`/calendar`**: CalendarPageFinal - Interactive weekly calendar for schedule management
- **`/events`**: EventsPage - Create events, view invitations, respond to RSVPs
- **`/friends`**: FriendsPage - Add friends by email, view their calendars

### Calendar System Architecture
The calendar uses a slot-based system:
- **Time slots**: 6 AM to 11 PM, hourly increments
- **Schedule items**: Have startHour/endHour ranges, not just single slots
- **Types**: `'available'`, `'event'`, `'activity'` with different visual styling
- **Visual components**: Uses CSS gradients and borders for time block appearance

### State Management Patterns
- **Authentication**: Global React Context (`useAuth`)
- **Calendar data**: Component-level state with Firebase real-time sync
- **Schedule items**: Stored as arrays with manual ID generation for new items
- **Friend schedules**: Read-only viewing via separate API calls

## Key Implementation Details

### Schedule Item Structure
```javascript
{
  id: string,           // Firebase doc ID or temp ID for new items
  userId: string,       // Owner's Firebase UID
  date: 'YYYY-MM-DD',  // ISO date string
  startHour: number,    // 0-23 hour integer
  endHour: number,      // 0-23 hour integer
  title: string,        // Display title
  type: 'available' | 'event' | 'activity',
  eventId?: string,     // Reference to events collection if type='event'
  updatedAt: string     // ISO timestamp
}
```

### Calendar Interaction Patterns
- **Click to select**: Multiple time slots can be selected before saving
- **Batch operations**: Selected slots saved as individual schedule items
- **Real-time updates**: Changes immediately reflected via Firebase listeners
- **Visual feedback**: Hover effects, selected state, and type-based colors

### Event Management Flow
1. **Creation**: Events create schedule items for creator automatically
2. **Invitations**: Participants identified by email (converted to UIDs when possible)
3. **Responses**: Acceptance creates schedule items for responders
4. **Coordination**: Friends can view each other's schedules to find availability

### Friend System
- Friends added by email address (must match Firebase Auth email)
- Bidirectional sharing (add friend = they can see your calendar)
- Real-time schedule viewing (read-only for friend calendars)
- Email-to-UID resolution handled automatically by Firebase functions

## Development Patterns

### Component Structure
- **Pages**: Full-screen route components with data fetching
- **Components**: Reusable UI elements (modals, calendar views)
- **Hooks**: Custom hooks only for authentication (`useAuth`)
- **Utils**: Firebase operations and data transformation functions

### Styling Approach
- CSS-in-JS inline styles for dynamic components
- Traditional CSS files for static styling
- Gradient backgrounds and shadow effects for modern UI
- Responsive grid layouts for calendar and forms

### Error Handling
- Try-catch blocks around all Firebase operations
- User-facing alerts for operation feedback
- Console logging for debugging
- Graceful fallbacks for missing data

### Firebase Integration
- All Firebase operations centralized in `src/utils/firebase.js`
- Async/await pattern throughout
- Firestore queries use compound indexes for user+date filtering
- Real-time listeners avoided in favor of explicit refresh patterns

## Common Development Tasks

### Adding New Schedule Types
1. Update the `type` enum in schedule items
2. Add visual styling in calendar components
3. Update type selection in `AddTimeBlockModal.js`
4. Add color coding in `getSlotType()` functions

### Modifying Calendar Time Range
Change the time slot generation in both:
- `CalendarPageFinal.js` (lines 24-27)
- `WeekView.js` (lines 12-15)

### Adding New Firebase Collections
1. Add Firestore operations to `firebase.js`
2. Update security rules in Firebase Console
3. Add corresponding UI components
4. Update data models and TypeScript interfaces if added later

### Extending Friend Features
The friend system is designed for extension:
- Calendar sharing permissions can be made more granular
- Event collaboration features can be added
- Availability matching algorithms can be implemented