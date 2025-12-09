import React from 'react';
import { useAuth } from '../hooks/useAuth.js';

function HomePage() {
  const { user, signIn, signOut } = useAuth();

  return (
    <div className="home-page">
      <h2>Welcome to ScheduleSync</h2>
      <p>
        Share your schedule and coordinate events with friends easily.
        Create detailed time blocks showing when you're available or busy, and let friends see your schedule when planning events.
      </p>
      
      {!user ? (
        <div className="auth-section">
          <h3>Get Started</h3>
          <p>Sign in to start creating your schedule and sharing it with friends.</p>
          <button onClick={signIn} className="sign-in-button">Sign In with Google</button>
        </div>
      ) : (
        <div className="user-section">
          <h3>Welcome back, {user.displayName}!</h3>
          <p>Ready to manage your schedule and coordinate some events?</p>
          <div className="action-buttons">
            <button onClick={() => window.location.href = '/calendar'} className="primary-button">
              Manage My Schedule
            </button>
            <button onClick={() => window.location.href = '/events'} className="secondary-button">
              View Events
            </button>
            <button onClick={signOut} className="text-button">
              Sign Out
            </button>
          </div>
        </div>
      )}
      
      <div className="features">
        <h3>Features</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h4>Time Block Scheduling</h4>
            <p>Create detailed time blocks showing exactly when you're available, busy, or have custom activities</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h4>Share with Friends</h4>
            <p>Let friends see your schedule when they're planning events and meetings</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Google Calendar Style</h4>
            <p>Familiar weekly view with drag-and-drop time blocks, just like Google Calendar</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h4>Real-time Sync</h4>
            <p>Your schedule updates instantly across all devices and stays in sync</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;