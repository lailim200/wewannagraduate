import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './styles/App.css';
import './styles/Calendar.css';
import './styles/AccessibilityThemes.css';
import HomePage from './pages/HomePage.js';
import CalendarPage from './pages/CalendarPageFinal.js';
import EventsPage from './pages/EventsPage.js';
import FriendsPage from './pages/FriendsPage.js';
import { AuthProvider } from './hooks/useAuth.js';
import { AccessibilityProvider, useAccessibility } from './hooks/useAccessibility.js';
import AccessibilityButton from './components/AccessibilityButton.js';

// Announces route changes to screen readers
function RouteAnnouncer() {
  const location = useLocation();
  const { announcePolite, screenReaderMode } = useAccessibility();
  useEffect(() => {
    if (!screenReaderMode) return;
    const path = location.pathname;
    const pageName =
      path === '/' ? 'Home' : path.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    announcePolite(`${pageName} page loaded`);
  }, [location, announcePolite, screenReaderMode]);
  return null;
}

function App() {
  // Focus target for skip link is the main element with id="main-content"
  const onSkipToContent = (e) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      // Remove tabindex after focus to keep DOM clean
      const remove = () => main.removeAttribute('tabindex');
      main.addEventListener('blur', remove, { once: true });
    }
  };

  return (
    <AccessibilityProvider>
      <AuthProvider>
        <Router>
          <RouteAnnouncer />
          <div className="App">
            <a href="#main-content" className="skip-link" onClick={onSkipToContent}>
              Skip to main content
            </a>
            <header className="app-header">
              <h1 id="app-title">ScheduleSync</h1>
              <nav aria-label="Primary">
                <a href="/">Home</a>
                <a href="/calendar">My Schedule</a>
                <a href="/events">Events</a>
                <a href="/friends">Friends</a>
              </nav>
            </header>
            <main id="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/friends" element={<FriendsPage />} />
              </Routes>
            </main>
            <AccessibilityButton />
          </div>
        </Router>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;
