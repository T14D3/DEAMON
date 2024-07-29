import React, { useState, useEffect } from 'react';
import GridSlot from './GridSlot';
import DraggableBox from './DraggableBox';
import Modal from './Module-Modal';
import { fetchModuleInfo, findDescendantData, fetchWeaponInfo, fetchAllStats } from '../util/api';
import './ModuleGrid.css';
import Search from './Search';

const ModuleGrid = ({
  gridType,
  setGridType,
  boxes,
  setBoxes,
  moduleData,
  isWeaponModule,
  selectedDescendantId,
  setSelectedDescendantId,
  selectedWeaponId,
  setSelectedWeaponId,
  showStats
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [level, setLevel] = useState(0);
  const [minLevel, setMinLevel] = useState(0);
  const [maxLevel, setMaxLevel] = useState(7);
  const [selectedDescendantName, setSelectedDescendantName] = useState('');
  const [selectedWeaponName, setSelectedWeaponName] = useState('');
  const [modalModuleData, setModalModuleData] = useState(null);
  const [selectedWeaponStats, setSelectedWeaponStats] = useState(null);
  const [statModifiers, setStatModifiers] = useState({});
  const [weaponLevel, setWeaponLevel] = useState(100);
  const [descendantLevel, setDescendantLevel] = useState(40);
  const [statNameCache, setStatNameCache] = useState({});
  const [selectedDescendantStats, setSelectedDescendantStats] = useState(null);
  const [totalModuleDrain, setTotalModuleDrain] = useState(0);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const allStats = await fetchAllStats();
        const statCache = {};
        allStats.forEach(stat => {
          statCache[stat.stat_id] = stat.stat_name;
        });
        setStatNameCache(statCache);
      } catch (error) {
        console.error('Error fetching all stats:', error);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    const calculateTotalModuleDrain = () => {
      const totalDrain = boxes.reduce((sum, box) => sum + (box.moduleDrain || 0), 0);
      setTotalModuleDrain(totalDrain);
    };

    calculateTotalModuleDrain();
  }, [boxes]);


  useEffect(() => {
    const fetchCachedStatName = async (statId) => {
      return statNameCache[statId] || null;
    };

    const fetchDescendantName = async () => {
      if (selectedDescendantId) {
        try {
          const descendantInfo = await findDescendantData(selectedDescendantId);
          setSelectedDescendantName(descendantInfo.descendant_name);
        } catch (error) {
          console.error(`Error fetching descendant info for ID ${selectedDescendantId}:`, error);
          setSelectedDescendantName('');
        }
      }
    };

    const fetchWeaponName = async () => {
      if (selectedWeaponId) {
        try {
          const weaponInfo = await fetchWeaponInfo(selectedWeaponId);
          setSelectedWeaponName(weaponInfo.weapon_name);
        } catch (error) {
          console.error(`Error fetching weapon info for ID ${selectedWeaponId}:`, error);
          setSelectedWeaponName('');
        }
      }
    };

    const fetchWeaponStats = async () => {
      if (!selectedWeaponId) return;
    
      try {
        const weaponInfo = await fetchWeaponInfo(selectedWeaponId);
        const statDefinitions = [
          { stat_name: 'Fire Rate', regexPattern: 'Fire Rate\\s*([+-])\\s*([\\d.]+)%' },
          { stat_name: 'Firearm Critical Hit Damage', regexPattern: 'Firearm Critical Hit Damage\\s*([+-])\\s*([\\d.]+)%' },
          { stat_name: 'Firearm Critical Hit Rate', regexPattern: 'Firearm Critical Hit Rate\\s*([+-])\\s*([\\d.]+)%' },
          { stat_name: 'Firearm ATK', regexPattern: 'Firearm ATK\\s*([+-])\\s*([\\d.]+)%' },
          { stat_name: 'Recoil', regexPattern: 'Recoil\\s*([+-])\\s*([\\d.]+)%' },
          { stat_name: 'Reload Time', regexPattern: 'Reload Time Modifier\\s*([+-])\\s*([\\d.]+)%' },
          { stat_name: 'Rounds per Magazine', regexPattern: 'Rounds per Magazine\\s*([+-])\\s*([\\d.]+)%' },
          { stat_name: 'Accuracy', regexPattern: 'Accuracy\\s*([+-])\\s*([\\d.]+)%' },
        ];
    
        const levelEntry = weaponInfo.firearm_atk.find(entry => entry.level === parseInt(weaponLevel));
        const weaponAtk = levelEntry ? levelEntry.firearm[0].firearm_atk_value : 0;
    
        // Adding the manual Firearm ATK stat
        weaponInfo.base_stat.push({
          stat_id: '105000026',
          stat_name: 'Firearm ATK',
          stat_value: weaponAtk
        });
    
        // Fetch and assign stat names if not present
        for (const stat of weaponInfo.base_stat) {
          if (!stat.stat_name) {
            try {
              stat.stat_name = await fetchCachedStatName(stat.stat_id);
            } catch (error) {
              console.error(`Error fetching stat name for stat ID ${stat.stat_id}:`, error);
            }
          }
        }
    
        const filteredStats = weaponInfo.base_stat.filter(stat => 
          statDefinitions.some(def => def.stat_name === stat.stat_name)
        );
    
        const statModifiers = await Promise.all(
          boxes.map(async box => {
            const moduleInfo = await fetchModuleInfo(box.moduleId);
            const moduleDesc = moduleInfo.module_stat[box.level]?.value || '';
            return parseWeaponModuleDescriptions(moduleDesc, statDefinitions);
          })
        );
    
        const combinedModifiers = statModifiers.reduce((accumulator, currentValue) => {
          Object.keys(currentValue).forEach(stat_name => {
            if (!accumulator[stat_name]) {
              accumulator[stat_name] = 1;
            }
            accumulator[stat_name] *= 1 + currentValue[stat_name] / 100;
          });
          return accumulator;
        }, {});
    
        const modifiedStats = filteredStats.map(baseStat => {
          if (combinedModifiers[baseStat.stat_name]) {
            return {
              ...baseStat,
              stat_value: baseStat.stat_value * combinedModifiers[baseStat.stat_name]
            };
          }
          return baseStat;
        });
    
        setSelectedWeaponStats(modifiedStats);
        setStatModifiers(combinedModifiers);
      } catch (error) {
        console.error(`Error fetching weapon info for ID ${selectedWeaponId}:`, error);
        setSelectedWeaponStats(null);
      }
    };
    const fetchDescendantStats = async () => {
      if (selectedDescendantId) {
        try {
          const descendantInfo = await findDescendantData(selectedDescendantId);
          const statDefinitions = [
            { stat_type: 'Max HP', regexPattern: 'Max HP\\s*([+-])\\s*([\\d.]+)%' },
            { stat_type: 'Max Shield', regexPattern: 'Max Shield\\s*([+-])\\s*([\\d.]+)%' },
            { stat_type: 'Max MP', regexPattern: 'Max MP\\s*([+-])\\s*([\\d.]+)%' },
            { stat_type: 'DEF', regexPattern: 'DEF\\s*([+-])\\s*([\\d.]+)%' },
            { stat_type: 'Shield Recovery Out of Combat', regexPattern: 'Shield Recovery Out of Combat\\s*([+-])\\s*([\\d.]+)%' },
            { stat_type: 'Shield Recovery In Combat', regexPattern: 'Shield Recovery In Combat\\s*([+-])\\s*([\\d.]+)%' },
          ];
    
          const levelEntry = descendantInfo.descendant_stat.find(entry => entry.level === parseInt(descendantLevel));
          console.log('levelEntry', levelEntry);
          const baseStats = levelEntry ? levelEntry.stat_detail : [];
          console.log('baseStats', baseStats);

          

          
    
          const statModifiers = await Promise.all(
            boxes.map(async box => {
              const moduleInfo = await fetchModuleInfo(box.moduleId);
              const moduleDesc = moduleInfo.module_stat[box.level]?.value || '';
              const values = parseDescendantModuleDescriptions
              (moduleDesc, statDefinitions);
              console.log('moduleDesc', moduleDesc);
              console.log('values', values);
              return values;
            })
          );
    
          const combinedModifiers = statModifiers.reduce((accumulator, currentValue) => {
            Object.keys(currentValue).forEach(stat_type => {
              if (!accumulator[stat_type]) {
                accumulator[stat_type] = 1;
              }
              accumulator[stat_type] *= 1 + currentValue[stat_type] / 100;
            });
            return accumulator;
          }, {});
    
          const modifiedStats = baseStats.map(baseStat => {
            if (combinedModifiers[baseStat.stat_type]) {
              return {
                ...baseStat,
                stat_value: baseStat.stat_value * combinedModifiers[baseStat.stat_type]
              };
            }
            return baseStat;
          });
    
          setSelectedDescendantStats(modifiedStats);
          setStatModifiers(combinedModifiers);
        } catch (error) {
          console.error(`Error fetching descendant info for ID ${selectedDescendantId}:`, error);
          setSelectedDescendantStats(null);
        }
      }
    };
    fetchDescendantStats();
    fetchWeaponStats();
    fetchDescendantName();
    fetchWeaponName();
  }, [selectedDescendantId, selectedWeaponId, boxes, weaponLevel, statNameCache, descendantLevel]);

  const addBox = async (searchData) => {
    try {
      if (searchData.searchType === 'module') {
        const currentGrid = [...boxes];
        if (currentGrid.some(box => box.moduleId === searchData.id)) {
          throw new Error('Module already added.');
        }
        const moduleInfo = await fetchModuleInfo(searchData.id);
        const defaultLevel = 0;
        const firstModuleStat = moduleInfo.module_stat[0];
        const moduleDrain = firstModuleStat.module_capacity;
        const newBox = {
          id: currentGrid.length + 1,
          slot: findFirstFreeSlot(currentGrid),
          moduleId: moduleInfo.module_id,
          moduleName: moduleInfo.module_name,
          moduleType: moduleInfo.module_type,
          imageUrl: `${moduleInfo.image_url}`,
          level: defaultLevel,
          moduleStats: moduleInfo.module_stat,
          moduleDrain: moduleDrain,
        };
        console.log(`New box added to ${gridType} grid:`, newBox);
        setBoxes([...currentGrid, newBox]);
      } else if (searchData.searchType === 'descendant') {
        setSelectedDescendantId(searchData.id);
      } else if (searchData.searchType === 'weapon') {
        setSelectedWeaponId(searchData.id);
        setGridType(searchData.type);
      }
    } catch (error) {
      console.error(`Error adding box to ${gridType} grid:`, error);
    }
  };

  const moveBox = (boxId, newSlot) => {
    const currentGrid = [...boxes];
    const targetBox = currentGrid.find(box => box.slot === newSlot);

    if (targetBox) {
      const updatedBoxes = currentGrid.map(box => {
        if (box.id === boxId) {
          return { ...box, slot: newSlot };
        } else if (box.id === targetBox.id) {
          return { ...box, slot: currentGrid.find(box => box.id === boxId).slot };
        }
        return box;
      });
      setBoxes(updatedBoxes);
    } else {
      const updatedBoxes = currentGrid.map(box =>
        box.id === boxId ? { ...box, slot: newSlot } : box
      );
      setBoxes(updatedBoxes);
    }
  };

  const findFirstFreeSlot = (currentGrid) => {
    const occupiedSlots = currentGrid.map(box => box.slot);
    return Array.from({ length: 12 }, (_, i) => i).find(slot => !occupiedSlots.includes(slot));
  };

  const parseWeaponModuleDescriptions = (description, statDefinitions) => {
    const values = {};
  
    statDefinitions.forEach(({ stat_name, regexPattern }) => {
      const regex = new RegExp(regexPattern, 'i');
      const match = description.match(regex);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        values[stat_name] = sign * parseFloat(match[2]);
      } else {
        values[stat_name] = 0;
      }
    });
  
    return values;
  };
  const parseDescendantModuleDescriptions = (description, statDefinitions) => {
    const values = {};
  
    statDefinitions.forEach(({ stat_type, regexPattern }) => {
      const regex = new RegExp(regexPattern, 'i');
      const match = description.match(regex);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        values[stat_type] = sign * parseFloat(match[2]);
      } else {
        values[stat_type] = 0;
      }
    });
  
    return values;
  };

  const handleBoxClick = async (box) => {
    try {
      const moduleInfo = await fetchModuleInfo(box.moduleId);
      const maxLevel = moduleInfo.module_stat.length > 0
        ? moduleInfo.module_stat[moduleInfo.module_stat.length - 1].level
        : 0;

      setModalModuleData(moduleInfo);
      setSelectedBox({ ...box });
      setLevel(box.level);
      setMinLevel(0);
      setMaxLevel(maxLevel);
      setIsModalOpen(true);
    } catch (error) {
      console.error(`Error fetching module info for moduleId ${box.moduleId}:`, error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBox(null);
  };

  const handleModalSave = () => {
    const validLevel = Math.min(Math.max(level, minLevel), maxLevel);
    const currentGrid = [...boxes];
    const updatedBoxes = currentGrid.map(box => {
      if (box.id === selectedBox.id) {
        const moduleDrain = box.moduleStats.find(stat => stat.level === validLevel).module_capacity;
        return { ...box, level: validLevel, moduleDrain };
      }
      return box;
    });
    setBoxes(updatedBoxes);
    handleModalClose();
  };

  const handleModalRemove = () => {
    const currentGrid = [...boxes];
    const updatedBoxes = currentGrid.filter(box => box.id !== selectedBox.id);
    setBoxes(updatedBoxes);
    handleModalClose();
  };

  const renderWeaponStats = (statDefinitions) => {
    if (!selectedWeaponStats) {
      return <p>No weapon stats available.</p>;
    }

    const filteredStats = selectedWeaponStats.filter(stat =>
      statDefinitions.some(def => def.stat_name === stat.stat_name)
    );

    if (filteredStats.length === 0) {
      return <p>No matching stats found.</p>;
    }

    return (
      <div className='stats-container'>
        <table className='stats-table'>
          <thead>
            <tr>
              <th>Stat Name</th>
              <th>Stat Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.map(stat => (
              <tr key={stat.stat_name}>
                <td><strong>{stat.stat_name}</strong></td>
                <td>{stat.stat_value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  const renderDescendantStats = (statDefinitions) => {
    if (!selectedDescendantStats) {
      return <p>No descendant stats available.</p>;
    }
  
    const filteredStats = selectedDescendantStats.filter(stat =>
      statDefinitions.some(def => def.stat_type === stat.stat_type)
    );
  
    if (filteredStats.length === 0) {
      return <p>No matching stats found.</p>;
    }
  
    return (
      <div className='stats-container'>
        <table className='stats-table'>
          <thead>
            <tr>
              <th>Stat Type</th>
              <th>Stat Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.map(stat => (
              <tr key={stat.stat_type}>
                <td><strong>{stat.stat_type}</strong></td>
                <td>{stat.stat_value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  

  return (
    <div className="module-grid-container">
      <div className="module-grid">
        <div className="module-header">
          <h2>{gridType}</h2>
          {!isWeaponModule && (
            <div className="module-controls">
              <Search searchType='module' moduleType='Descendant' action={(searchData) => addBox(searchData)} />
              <Search searchType='descendant' action={(searchData) => addBox(searchData)} />
              <p className='search-info'>{selectedDescendantName || 'No Descendant selected'}</p>
            </div>
          )}
          {isWeaponModule && (
            <div className="module-controls">
              <Search searchType='module' moduleType={gridType} action={(searchData) => addBox(searchData)} />
              <Search searchType='weapon' action={(searchData) => addBox(searchData)} />
              <p className='search-info'>{selectedWeaponName || 'No Weapon selected'}</p>
            </div>
          )}
        </div>
        <div className="grid">
          {Array.from({ length: 12 }, (_, i) => i).map(slot => (
            <GridSlot key={slot} slot={slot} moveBox={(boxId, newSlot) => moveBox(boxId, newSlot)}>
              {boxes
                .filter(box => box.slot === slot)
                .map(box => (
                  <DraggableBox key={box.id} box={box} moveBox={(boxId, newSlot) => moveBox(boxId, newSlot)} onClick={() => handleBoxClick(box)} />
                ))}
            </GridSlot>
          ))}
        </div>
        {selectedBox && (
          <Modal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={handleModalSave}
            onRemove={handleModalRemove}
            level={level}
            setLevel={setLevel}
            minLevel={minLevel}
            maxLevel={maxLevel}
            moduleData={modalModuleData}
          />
        )}
      </div>
      {showStats && isWeaponModule && (
        <div className="expand-box">
          <div className="module-drain">
          <p style={{marginRight: '5px'}}>Module Drain: </p> <p style={{color: totalModuleDrain > 70 ? 'red' : 'green'}}>
            {totalModuleDrain}/70
          </p></div>
          <input className="level-input" type="range" min="1" max="120" value={weaponLevel} onChange={(e) => setWeaponLevel(e.target.value)} />
          <p>Weapon Level: {weaponLevel}</p>
          <h4>Weapon Stats:</h4>
          {renderWeaponStats([
            { stat_name: 'Fire Rate' },
            { stat_name: 'Firearm Critical Hit Damage' },
            { stat_name: 'Firearm Critical Hit Rate' },
            { stat_name: 'Firearm ATK' },
            { stat_name: 'Recoil' },
            { stat_name: 'Reload Time' },
            { stat_name: 'Rounds per Magazine' },
            { stat_name: 'Accuracy' },
          ])}
        </div>
      )}
      {showStats && !isWeaponModule && (
        <div className="expand-box">
          <div className="module-drain">
          <p style={{marginRight: '5px'}}>Module Drain: </p> <p style={{color: totalModuleDrain > 70 ? 'red' : 'green'}}>
            {totalModuleDrain}/70
          </p></div>
          <input className="level-input" type="range" min="1" max="40" value={descendantLevel} onChange={(e) => setDescendantLevel(e.target.value)} />
          <p>Level: {descendantLevel}</p>
          <h4>Descendant Stats:</h4>
          {renderDescendantStats([
            { stat_type: 'Max HP'},
            { stat_type: 'Max Shield'},
            { stat_type: 'Max MP'},
            { stat_type: 'DEF'},
            { stat_type: 'Shield Recovery Out of Combat'},
            { stat_type: 'Shield Recovery In Combat'},
          ])}
        </div>
      )}
    </div>
  );
};

export default ModuleGrid;
