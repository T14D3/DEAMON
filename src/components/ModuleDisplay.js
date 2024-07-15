import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchModuleInfo } from '../util/api';
import { getLastLevel, getModuleDrain } from '../util/helpers';
import './ModuleDisplay.css';

const placeholderImageUrl = "https://tfdvod.dn.nexoncdn.co.kr/img/cbt/recommend/module__none_dummy.png";

// Define modulesMap here
const modulesMap = {
  'Main 1': { row: 1, col: 2 }, 'Main 2': { row: 2, col: 2 },
  'Main 3': { row: 1, col: 3 }, 'Main 4': { row: 2, col: 3 },
  'Main 5': { row: 1, col: 4 }, 'Main 6': { row: 2, col: 4 },
  'Main 7': { row: 1, col: 5 }, 'Main 8': { row: 2, col: 5 },
  'Main 9': { row: 1, col: 6 }, 'Main 10': { row: 2, col: 6 },
  'Skill 1': { row: 1, col: 1 }, 'Sub 1': { row: 2, col: 1 },
};

const ModuleDisplay = ({ moduleSetups }) => {
  const [modules, setModules] = useState({});

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const modulePromises = moduleSetups.map(async (setup) => {
          const moduleInfo = await fetchModuleInfo(setup.module_id);
          return { ...setup, ...moduleInfo };
        });
        const fetchedModuleData = await Promise.all(modulePromises);

        const updatedModules = {};
        fetchedModuleData.forEach((module) => {
          const { module_slot_id } = module;
          updatedModules[module_slot_id] = module;
        });
        setModules(updatedModules);
      } catch (error) {
        console.error('Error fetching module info:', error);
      }
    };

    if (moduleSetups.length > 0) {
      fetchModuleData();
    }
  }, [moduleSetups]);

  return (
    <div className="module-display">
      <h2>Modules</h2>
      <div className="module-grid-container">
        <div className="module-grid">
          {Object.entries(modulesMap).map(([slotId, { row, col }]) => {
            const module = modules[slotId];
            const lastLevel = module ? getLastLevel(module) : null;
            return (
              <div key={slotId} className="module-item" style={{ gridColumn: col, gridRow: row }}>
                <img
                  src={module ? `${module.image_url}?is_overlay=true&enchant_level=${module.module_enchant_level || "0"}:${lastLevel}` : placeholderImageUrl}
                  alt={module ? module.module_name : 'Placeholder'}
                />
                {module && (
                  <>
                    <p className="module-item-name">{module.module_name}</p>
                    <p className="module-item-drain">{getModuleDrain(module)}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ModuleDisplay.propTypes = {
  moduleSetups: PropTypes.arrayOf(PropTypes.shape({
    module_id: PropTypes.string.isRequired,
    module_slot_id: PropTypes.string.isRequired,
    module_enchant_level: PropTypes.number,
    module_drain: PropTypes.string,
  })).isRequired,
};

export default ModuleDisplay;
