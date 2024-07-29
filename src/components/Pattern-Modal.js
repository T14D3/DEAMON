import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

const PatternModal = ({ isOpen, onClose, pattern }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll');
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal-content" ref={modalRef}>
          {/*<button className="modal-close-button" onClick={onClose}><span>✕</span></button>*/}
          <div className="modal-info">
            <h2 style={{ marginTop: '0px', marginBottom: '0px' }}>{pattern.pattern_id}</h2>
            <br />
            <p><strong>Map Name:</strong> {pattern.source_map}</p>
            <p><strong>Activity Name:</strong> {pattern.source_activity}</p>
            {/* Additional pattern details can be added here */}
          </div>
        </div>
      </div>
    )
  );
};

PatternModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pattern: PropTypes.shape({
    pattern_id: PropTypes.string.isRequired,
    source_map: PropTypes.string.isRequired,
    source_activity: PropTypes.string.isRequired,
  }).isRequired,
};

export default PatternModal;