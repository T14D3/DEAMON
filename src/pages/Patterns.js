import React, { useState, useEffect } from 'react';
import { fetchAllPatterns } from '../util/api';
import './Patterns.css'; // Import your CSS file

function Patterns() {
  const [patterns, setPatterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatterns, setFilteredPatterns] = useState([]);

  useEffect(() => {
    const loadPatterns = async () => {
      const allPatterns = await fetchAllPatterns();
      setPatterns(allPatterns);
      setFilteredPatterns(allPatterns); // Show all patterns initially
    };
    loadPatterns();
  }, []);

  useEffect(() => {
    const updateFilteredPatterns = () => {
      if (searchTerm.length < 3) {
        setFilteredPatterns(patterns);
        return;
      }

      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const matches = patterns.map(pattern => {
        const matchedFields = {};
        const filterFields = Object.entries(pattern).some(([key, value]) => {
          if (typeof value === 'string' && value.toLowerCase().includes(lowerCaseSearchTerm)) {
            matchedFields[key] = highlightMatch(value, lowerCaseSearchTerm);
            return true;
          }
          return false;
        });

        const matchedContents = pattern.pattern_contents.map(content => {
          if (content.content_name.toLowerCase().includes(lowerCaseSearchTerm)) {
            return {
              ...content,
              highlightedName: highlightMatch(content.content_name, lowerCaseSearchTerm),
            };
          }
          return content;
        });

        if (filterFields || matchedContents.some(content => content.highlightedName)) {
          return {
            ...pattern,
            ...matchedFields,
            pattern_contents: matchedContents,
          };
        }
        return null;
      }).filter(Boolean);

      setFilteredPatterns(matches);
    };

    updateFilteredPatterns();
  }, [searchTerm, patterns]);

  const highlightMatch = (text, searchTerm) => {
    const lowerCaseText = text.toLowerCase();
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const parts = [];
    let startIndex = 0;
    let index;

    while ((index = lowerCaseText.indexOf(lowerCaseSearchTerm, startIndex)) > -1) {
      parts.push(text.slice(startIndex, index));
      parts.push(<span key={parts.length} className="highlight">{text.slice(index, index + searchTerm.length)}</span>);
      startIndex = index + searchTerm.length;
    }
    parts.push(text.slice(startIndex));
    return parts;
  };

  return (
    <div className="patterns-container">
      <div className="search-container">
        <h1>Amorphous Material Pattern Search</h1>
        <input
          type="text"
          className="patternsearch-input"
          placeholder="Search for pattern, source or content..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <p>
          {searchTerm.length < 3 
            ? "Type at least 3 characters to search" 
            : `${filteredPatterns.length} results found`}
        </p>
      </div>
      <div className="pattern-grid">
        {filteredPatterns.map(pattern => (
          <div key={pattern.pattern_id} className="pattern-card">
            <h2>Amorphous Material Pattern: {pattern.pattern_id}</h2>
            <p><strong>Map Name:</strong> {pattern.highlightedMap || pattern.source_map}</p>
            <p><strong>Activity Name:</strong> {pattern.highlightedActivity || pattern.source_activity}</p>
            <table className="content-table">
              <thead>
                <tr>
                  <th>Possible Drops</th>
                  <th>Chance</th>
                </tr>
              </thead>
              <tbody>
                {pattern.pattern_contents.map(content => {
                  const chanceValue = parseFloat(content.content_chance) || 0; // Parse the numeric value
                  const normalizedWidth = (chanceValue / 50) * 100; // Normalize to a scale of 0-100%
                  return (
                    <tr key={content.content_name}>
                      <td>{content.highlightedName || content.content_name}</td>
                      <td className="chance-column"> {/* Add class here */}
                        <div className="bar-container">
                          <div 
                            className="bar" 
                            style={{ width: `${Math.min(normalizedWidth, 100)}%` }} // Cap at 100%
                          >
                            {content.content_chance} {/* Display the original string with % */}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p><strong>Shape Stabilizer:</strong> {pattern.shape_stabilizer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Patterns;