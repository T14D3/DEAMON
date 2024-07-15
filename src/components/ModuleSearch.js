import React, { useState, useRef, useEffect } from 'react';
import { fetchAllModules } from '../util/api';

const ModuleSearch = ({ addBox, filterType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleList, setModuleList] = useState([]);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    try {
      const data = await fetchAllModules();

      const filteredModules = data
        .filter(module => module.module_name.toLowerCase().includes(value.toLowerCase()))
        .filter(module => filterType === 'all' || module.module_class === filterType)
        .slice(0, 10);

      setModuleList(filteredModules);
    } catch (error) {
      console.error('Error fetching module data:', error);
      setError('Error fetching module data.');
    }
  };

  const handleModuleClick = async (moduleId) => {
    try {
      await addBox(moduleId);
      setSearchTerm('');
      setModuleList([]);
      setError(null);
      searchInputRef.current.focus();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setModuleList([]), 200);
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() !== '') {
      setModuleList(moduleList);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setModuleList([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="module-search">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        ref={searchInputRef}
        placeholder="Search modules..."
        className="modulesearch-input"
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
      />
      {moduleList.length > 0 && (
        <div className="search-results" ref={searchResultsRef}>
          <ul className="module-list">
            {moduleList.map(module => (
              <li key={module.module_id} onClick={() => handleModuleClick(module.module_id)}>
                {module.module_name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ModuleSearch;
