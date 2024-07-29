import React, { Component, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Modal.css';

const Modal = ({ isOpen, onClose, onSave, level, setLevel, minLevel, maxLevel, moduleData, onRemove }) => {
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Get the "value" equivalent to modules level, module_stat is an array of module stats
  const moduleDesc = moduleData.module_stat ? moduleData.module_stat[level].value : '';

  useEffect(() => {
    if (isOpen) {
      inputRef.current.focus();
      document.body.classList.add('no-scroll');
      document.addEventListener('wheel', handleScroll, { passive: false });
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, level]);

  const handleScroll = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setLevel((prevLevel) => Math.min(prevLevel + 1, maxLevel));
    } else {
      setLevel((prevLevel) => Math.max(prevLevel - 1, minLevel));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveModal();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
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
      saveModal();
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
          <button className="modal-close-button" onClick={onClose}><span>✕</span></button>
          <button className="modal-save-button" onClick={onSave}><span>✓</span></button>
          <button className="modal-remove-button" onClick={onRemove}><span>🗑️</span></button>
          <div className="modal-info">
            <h2 style={{ marginTop: '0px', marginBottom: '0px' }}>{moduleData.module_name}</h2>
            <br />
            <p>{moduleDesc}</p>
          </div>
          <input
            id="level-input"
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
  onRemove: PropTypes.func.isRequired,
  level: PropTypes.number.isRequired,
  setLevel: PropTypes.func.isRequired,
  minLevel: PropTypes.number.isRequired,
  maxLevel: PropTypes.number.isRequired,
  moduleData: PropTypes.shape({
    module_name: PropTypes.string.isRequired,
    module_stat: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default Modal;
