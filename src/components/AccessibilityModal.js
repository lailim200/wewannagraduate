import React, { useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from '../hooks/useAccessibility.js';
import '../styles/AccessibilityModal.css';

const AccessibilityModal = ({ isOpen, onClose, triggerRef }) => {
  const { mode, setMode, screenReaderMode, setScreenReaderMode, announceAssertive } = useAccessibility();
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Close and restore focus
  const handleClose = useCallback(() => {
    onClose();
    announceAssertive('Accessibility options closed');
    if (triggerRef && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [onClose, triggerRef, announceAssertive]);

  useEffect(() => {
    if (!isOpen) return;
    announceAssertive('Accessibility options opened');

    // Lock background scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus management: focus close button
    const previousActive = document.activeElement;
    const node = closeBtnRef.current;
    if (node) node.focus();

    // Trap focus in modal
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const list = Array.from(focusable);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const modalNode = modalRef.current;
    modalNode?.addEventListener('keydown', handleKeyDown);

    return () => {
      modalNode?.removeEventListener('keydown', handleKeyDown);
      // Restore background scroll
      document.body.style.overflow = originalOverflow;
      if (previousActive && previousActive.focus) previousActive.focus();
    };
  }, [isOpen, handleClose, announceAssertive]);

  if (!isOpen) return null;

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleScreenReaderToggle = () => {
    setScreenReaderMode(!screenReaderMode);
  };

  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="accessibility-modal-overlay" onClick={onOverlayClick}>
      <div
        id="accessibility-modal"
        className="accessibility-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-modal-title"
        ref={modalRef}
      >
        <div className="accessibility-modal-header">
          <h2 id="accessibility-modal-title">Accessibility Options</h2>
          <button
            ref={closeBtnRef}
            className="close-button"
            onClick={handleClose}
            aria-label="Close accessibility options"
          >
            ×
          </button>
        </div>

        <div className="accessibility-modal-content">
          <section className="accessibility-section">
            <h3>Color Blindness Modes</h3>
            <p className="section-description">
              Choose a color scheme optimized for different types of color vision deficiency
            </p>
            <div className="accessibility-options">
              <label className={`accessibility-option ${mode === 'normal' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="accessibility-mode"
                  value="normal"
                  checked={mode === 'normal'}
                  onChange={() => handleModeChange('normal')}
                />
                <span className="option-label">Normal Vision</span>
                <span className="option-description">Standard color scheme</span>
              </label>

              <label className={`accessibility-option ${mode === 'protanopia' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="accessibility-mode"
                  value="protanopia"
                  checked={mode === 'protanopia'}
                  onChange={() => handleModeChange('protanopia')}
                />
                <span className="option-label">Protanopia</span>
                <span className="option-description">Red-blind (difficulty perceiving red)</span>
              </label>

              <label className={`accessibility-option ${mode === 'deuteranopia' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="accessibility-mode"
                  value="deuteranopia"
                  checked={mode === 'deuteranopia'}
                  onChange={() => handleModeChange('deuteranopia')}
                />
                <span className="option-label">Deuteranopia</span>
                <span className="option-description">Green-blind (difficulty perceiving green)</span>
              </label>

              <label className={`accessibility-option ${mode === 'tritanopia' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="accessibility-mode"
                  value="tritanopia"
                  checked={mode === 'tritanopia'}
                  onChange={() => handleModeChange('tritanopia')}
                />
                <span className="option-label">Tritanopia</span>
                <span className="option-description">Blue-blind (difficulty perceiving blue)</span>
              </label>

              <label className={`accessibility-option ${mode === 'high-contrast' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="accessibility-mode"
                  value="high-contrast"
                  checked={mode === 'high-contrast'}
                  onChange={() => handleModeChange('high-contrast')}
                />
                <span className="option-label">High Contrast</span>
                <span className="option-description">Enhanced contrast for better visibility</span>
              </label>
            </div>
          </section>

          <section className="accessibility-section">
            <h3>Screen Reader Support</h3>
            <p className="section-description">
              Enable enhanced features for screen reader users
            </p>
            <label className="accessibility-toggle">
              <input
                type="checkbox"
                checked={screenReaderMode}
                onChange={handleScreenReaderToggle}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">
                {screenReaderMode ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityModal;
