// Modal.js
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

const Modal = ({ isOpen, onClose, onSave, level, setLevel, minLevel, maxLevel }) => {
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveModal();
    }
  };

  const handleChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value), minLevel), maxLevel);
    setLevel(value);
  };

  const saveModal = () => {
    onSave();
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
          <input
            type="number"
            value={level}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            min={minLevel}
            max={maxLevel}
            ref={inputRef}
            className="modal-input"
          />
        </div>
      </div>
    )
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  level: PropTypes.number.isRequired,
  setLevel: PropTypes.func.isRequired,
  minLevel: PropTypes.number.isRequired,
  maxLevel: PropTypes.number.isRequired,
};

export default Modal;
