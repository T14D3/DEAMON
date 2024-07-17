import React, { useState, useRef, useEffect } from 'react';
import { fetchAllWeapons, fetchAllModules, fetchAllDescendants } from '../util/api';

const Search = ({ searchType, moduleType, action }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemList, setItemList] = useState([]);
  const [cachedItems, setCachedItems] = useState([]);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  const fetchItems = async () => {
    try {
      let data = [];
      switch (searchType) {
        case 'weapon':
          const weapons = await fetchAllWeapons();
          data = weapons.map(weapon => ({
            id: weapon.weapon_id,
            name: weapon.weapon_name,
            type: weapon.weapon_rounds_type,
            searchType: 'weapon'
          }));
          break;
        case 'module':
          const modules = await fetchAllModules();
          data = modules
            .filter(module => module.module_class === moduleType)
            .map(module => ({
              id: module.module_id,
              name: module.module_name,
              type: module.module_class,
              searchType: 'module'
            }));
          break;
        case 'descendant':
          const descendants = await fetchAllDescendants();
          data = descendants.map(descendant => ({
            id: descendant.descendant_id,
            name: descendant.descendant_name,
            type: 'Descendant',
            searchType: 'descendant'
          }));
          break;
        default:
          break;
      }
      setCachedItems(data);
      return data;
    } catch (error) {
      console.error(`Error fetching ${searchType} data:`, error);
      setError(`Error fetching ${searchType} data.`);
      return [];
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const startsWithMatches = cachedItems.filter(item =>
      item.name.toLowerCase().startsWith(value.toLowerCase())
    );
    const containsMatches = cachedItems.filter(item =>
      !item.name.toLowerCase().startsWith(value.toLowerCase()) && item.name.toLowerCase().includes(value.toLowerCase())
    );

    const filteredItems = [...startsWithMatches, ...containsMatches].slice(0, 10);

    setItemList(filteredItems);
  };

  const handleItemClick = (itemName, itemId, itemType) => {
    setSearchTerm(''); // Clear the search input text
    action({ id: itemId, name: itemName, type: itemType, searchType });
    setItemList([]);
    setError(null);
    searchInputRef.current.focus();
  };

  const handleInputFocus = async () => {
    if (searchTerm.trim() === '') {
      // If search term is empty, show all cached items
      setItemList(cachedItems);
    } else {
      // If there is a search term, filter cached items again
      const startsWithMatches = cachedItems.filter(item =>
        item.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
      const containsMatches = cachedItems.filter(item =>
        !item.name.toLowerCase().startsWith(searchTerm.toLowerCase()) && item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filteredItems = [...startsWithMatches, ...containsMatches].slice(0, 10);
      setItemList(filteredItems);
    }
  
    if (cachedItems.length === 0) {
      const data = await fetchItems();
      setCachedItems(data);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && itemList.length > 0) {
      const topResult = itemList[0];
      handleItemClick(topResult.name, topResult.id, topResult.type);
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
        onBlur={() => setTimeout(() => setItemList([]), 200)}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
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
