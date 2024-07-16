import React, { useState, useRef, useEffect } from 'react';
import { fetchAllWeapons, fetchAllModules, fetchAllDescendants } from '../util/api';

const Search = ({ searchType, moduleType, action }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemList, setItemList] = useState([]);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  const fetchItems = async () => {
    switch (searchType) {
      case 'weapon':
        const weapons = await fetchAllWeapons();
        return weapons.map(weapon => ({
          id: weapon.weapon_id,
          name: weapon.weapon_name,
          type: weapon.weapon_rounds_type,
          searchType: 'weapon'
        }));
      case 'module':
        const modules = await fetchAllModules();
        const filteredModules = modules
          .filter(module => module.module_class === moduleType)
          .map(module => ({
            id: module.module_id,
            name: module.module_name,
            type: module.module_class,
            searchType: 'module'
          }));
        return filteredModules;
      case 'descendant':
        const descendants = await fetchAllDescendants();
        return descendants.map(descendant => ({
          id: descendant.descendant_id,
          name: descendant.descendant_name,
          type: 'Descendant',
          searchType: 'descendant'
        }));
      default:
        return [];
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    try {
      const data = await fetchItems();
      const filteredItems = data
        .filter(item => item.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);

      setItemList(filteredItems);
    } catch (error) {
      console.error(`Error fetching ${searchType} data:`, error);
      setError(`Error fetching ${searchType} data.`);
    }
  };

  const handleItemClick = (itemName, itemId, itemType) => {
    setSearchTerm(''); // Clear the search input text
    action({ id: itemId, name: itemName, type: itemType, searchType });
    setItemList([]);
    setError(null);
    searchInputRef.current.focus();
  };

  const handleInputBlur = () => {
    setTimeout(() => setItemList([]), 200);
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() !== '') {
      setItemList(itemList);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setItemList([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`${searchType}-search`}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        ref={searchInputRef}
        placeholder={`Search ${searchType}s...`}
        className={`${searchType}search-input`}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
      />
      {itemList.length > 0 && (
        <div className="search-results" ref={searchResultsRef}>
          <ul className={`${searchType}-list`}>
            {itemList.map(item => (
              <li
                key={item.id}
                onClick={() => handleItemClick(item.name, item.id, item.type)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Search;
