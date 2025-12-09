import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('accessibility-mode') || 'normal';
  });
  const [screenReaderMode, setScreenReaderMode] = useState(() => {
    return localStorage.getItem('screen-reader-mode') === 'true';
  });

  // Live region messages
  const [livePolite, setLivePolite] = useState('');
  const [liveAssertive, setLiveAssertive] = useState('');
  const clearTimer = useRef(null);

  const announcePolite = (message) => {
    if (!message) return;
    setLivePolite('');
    // Force change so SR announces repeated strings
    window.requestAnimationFrame(() => setLivePolite(message));
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setLivePolite(''), 1500);
  };

  const announceAssertive = (message) => {
    if (!message) return;
    setLiveAssertive('');
    window.requestAnimationFrame(() => setLiveAssertive(message));
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setLiveAssertive(''), 1500);
  };

  useEffect(() => {
    localStorage.setItem('accessibility-mode', mode);
    // Preserve any existing classes when switching modes
    document.body.classList.remove(
      'accessibility-normal',
      'accessibility-protanopia',
      'accessibility-deuteranopia',
      'accessibility-tritanopia',
      'accessibility-high-contrast'
    );
    document.body.classList.add(`accessibility-${mode}`);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('screen-reader-mode', screenReaderMode);
    if (screenReaderMode) {
      document.body.classList.add('screen-reader-mode');
    } else {
      document.body.classList.remove('screen-reader-mode');
    }
  }, [screenReaderMode]);

  const value = {
    mode,
    setMode,
    screenReaderMode,
    setScreenReaderMode,
    announcePolite,
    announceAssertive,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {screenReaderMode && (
        <>
          <div aria-live="polite" role="status" className="sr-only" id="sr-live-polite">
            {livePolite}
          </div>
          <div aria-live="assertive" role="alert" className="sr-only" id="sr-live-assertive">
            {liveAssertive}
          </div>
        </>
      )}
    </AccessibilityContext.Provider>
  );
};
