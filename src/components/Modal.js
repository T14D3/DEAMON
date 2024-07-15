import React, { useEffect, useRef } from 'react';
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
      handleSave();
    }
  };

  const handleChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value), minLevel), maxLevel);
    setLevel(value);
  };

  const handleSave = () => {
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

export default Modal;
