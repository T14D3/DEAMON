import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Collapsible from 'react-collapsible';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './Zones.css';

function Zones() {
  const [apiData, setApiData] = useState([]);
  const [filters, setFilters] = useState({
    element: 'Any',
    roundsType: 'Any',
    archeType: 'Any'
  });
  const [showFilters, setShowFilters] = useState(false); // State to toggle visibility of filters

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://open.api.nexon.com/static/tfd/meta/en/reward.json');
        setApiData(response.data.filter(entry => entry.battle_zone && entry.battle_zone.length > 0));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const filteredRewards = (bz) => {
    return bz.reward.filter(reward => {
      const matchElement = filters.element === 'Any' || reward.reactor_element_type === filters.element;
      const matchRoundsType = filters.roundsType === 'Any' || reward.weapon_rounds_type === filters.roundsType;
      const matchArcheType = filters.archeType === 'Any' || reward.arche_type === filters.archeType;
      return matchElement && matchRoundsType && matchArcheType;
    });
  };

  const handleFilterChange = (type, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: value
    }));
  };

  const getUniqueElementTypes = () => {
    let elementTypes = ['Any'];
    apiData.forEach(entry => {
      entry.battle_zone.forEach(bz => {
        bz.reward.forEach(reward => {
          if (reward.reward_type === "Reactor" && reward.reactor_element_type && !elementTypes.includes(reward.reactor_element_type)) {
            elementTypes.push(reward.reactor_element_type);
          }
        });
      });
    });
    return elementTypes;
  };

  const getUniqueRoundsTypes = () => {
    let roundsTypes = ['Any'];
    apiData.forEach(entry => {
      entry.battle_zone.forEach(bz => {
        bz.reward.forEach(reward => {
          if (reward.weapon_rounds_type && !roundsTypes.includes(reward.weapon_rounds_type)) {
            roundsTypes.push(reward.weapon_rounds_type);
          }
        });
      });
    });
    return roundsTypes;
  };

  const getUniqueArcheTypes = () => {
    let archeTypes = ['Any'];
    apiData.forEach(entry => {
      entry.battle_zone.forEach(bz => {
        bz.reward.forEach(reward => {
          if (reward.arche_type && !archeTypes.includes(reward.arche_type)) {
            archeTypes.push(reward.arche_type);
          }
        });
      });
    });
    return archeTypes;
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>TFD-API</p>
        <button className="search-icon" onClick={toggleFilters}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
        <div className={`overlay-menu ${showFilters ? 'active' : ''}`}>
          <div className="filter-box">
            <div className="filter-section">
              <label>Element Type:</label>
              {getUniqueElementTypes().map((element, index) => (
                <div key={index} className="filter-option">
                  <button
                    className={filters.element === element ? 'selected' : ''}
                    onClick={() => handleFilterChange('element', element)}
                  >
                    {element}
                  </button>
                </div>
              ))}
            </div>
            <div className="filter-section">
              <label>Rounds Type:</label>
              {getUniqueRoundsTypes().map((roundsType, index) => (
                <div key={index} className="filter-option">
                  <button
                    className={filters.roundsType === roundsType ? 'selected' : ''}
                    onClick={() => handleFilterChange('roundsType', roundsType)}
                  >
                    {roundsType}
                  </button>
                </div>
              ))}
            </div>
            <div className="filter-section">
              <label>Arche Type:</label>
              {getUniqueArcheTypes().map((archeType, index) => (
                <div key={index} className="filter-option">
                  <button
                    className={filters.archeType === archeType ? 'selected' : ''}
                    onClick={() => handleFilterChange('archeType', archeType)}
                  >
                    {archeType}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="main-content">
          {apiData.map((entry, index) => (
            <div key={index} className="entry-box">
              <Collapsible
                trigger={<div className="entry-header"><h4>{entry.map_name}</h4></div>}
                transitionTime={100}
              >
                {entry.battle_zone && entry.battle_zone.length > 0 && (
                  <div className="battle-zones">
                    {entry.battle_zone.map((bz, bzIndex) => (
                      <Collapsible
                        key={bzIndex}
                        trigger={<div className="battle-zone-header"><h4>{bz.battle_zone_name}</h4></div>}
                        transitionTime={100}
                      >
                        <div className="rewards">
                          <Collapsible
                            trigger={<div className="reactors"><h4>Reactors</h4></div>}
                            transitionTime={100}
                          >
                            {filteredRewards(bz).filter(reward => reward.reward_type === "Reactor").map((reward, rewardIndex) => (
                              <div key={rewardIndex} className="reward-box reactor">
                                <img 
                                  src={`/reactors/${reward.reactor_element_type}.png`} 
                                  alt={`${reward.reactor_element_type} icon`} 
                                />
                                <div className="reward-text">
                                  <p><strong>Element Type:</strong> {reward.reactor_element_type}</p>
                                  <p><strong>Rounds Type:</strong> {reward.weapon_rounds_type}</p>
                                  <p><strong>Arche Type:</strong> {reward.arche_type}</p>
                                </div>
                              </div>
                            ))}
                          </Collapsible>
                          {bz.reward.filter(reward => reward.reward_type !== "Reactor" && reward.reward_type !== null).map((reward, rewardIndex) => (
                            <div key={rewardIndex} className="reward-others">
                              <p><strong>Other(s):</strong> {reward.reward_type}</p>
                            </div>
                          ))}
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </Collapsible>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default Zones;
