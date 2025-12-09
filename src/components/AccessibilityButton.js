import React, { useState, useRef, useEffect } from 'react';
import AccessibilityModal from './AccessibilityModal.js';
import '../styles/AccessibilityButton.css';

const AccessibilityButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const buttonRef = useRef(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Allow opening the modal from elsewhere (header link) via custom event
  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener('open-accessibility-modal', handler);
    return () => window.removeEventListener('open-accessibility-modal', handler);
  }, []);

  // Keyboard shortcut: Alt+Shift+A opens the modal and focuses trigger
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key?.toLowerCase?.() || '';
      if (e.altKey && e.shiftKey && key === 'a') {
        e.preventDefault();
        setIsModalOpen(true);
        // focus after open to help keyboard users
        setTimeout(() => buttonRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        className="accessibility-floating-button"
        onClick={toggleModal}
        aria-label="Open accessibility options"
        title="Accessibility Options"
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
        aria-controls="accessibility-modal"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="2" fill="currentColor" />
          <path
            d="M12 8C10.9 8 10 8.9 10 10V14C10 15.1 10.9 16 12 16C13.1 16 14 15.1 14 14V10C14 8.9 13.1 8 12 8Z"
            fill="currentColor"
          />
          <path
            d="M7 11L9 12V18C9 19.1 9.9 20 11 20H13C14.1 20 15 19.1 15 18V12L17 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <AccessibilityModal isOpen={isModalOpen} onClose={toggleModal} triggerRef={buttonRef} />
    </>
  );
};

export default AccessibilityButton;
