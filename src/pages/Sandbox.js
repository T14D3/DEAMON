import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowUp, faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
import './Sandbox.css';
import DraggableBox from '../components/DraggableBox';
import GridSlot from '../components/GridSlot';
import ModuleSearch from '../components/ModuleSearch';
import Modal from '../components/Modal';
import { fetchModuleInfo } from '../util/api';

const Sandbox = () => {
  const [boxes, setBoxes] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [level, setLevel] = useState(1);
  const [minLevel, setMinLevel] = useState(0);
  const [maxLevel, setMaxLevel] = useState(7);
  const [filterType, setFilterType] = useState('Descendant');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const cachedModuleData = localStorage.getItem('moduleData');
        if (cachedModuleData) {
          setModuleData(JSON.parse(cachedModuleData));
          return;
        }

        const response = await fetch('https://open.api.nexon.com/static/tfd/meta/en/module.json');
        if (!response.ok) {
          throw new Error('Failed to fetch module data');
        }
        const data = await response.json();
        
        localStorage.setItem('moduleData', JSON.stringify(data));
        setModuleData(data);
      } catch (error) {
        console.error('Error fetching module data:', error);
      }
    };

    fetchModules();
  }, []);

  const addBox = async (moduleId) => {
    try {
      if (boxes.some(box => box.moduleId === moduleId)) {
        throw new Error('Module already added.');
      }

      const moduleInfo = await fetchModuleInfo(moduleId);
      const defaultLevel = 0;
      const firstModuleStat = moduleInfo.module_stat[0];
      const moduleDrain = firstModuleStat.module_capacity;

      const newBox = {
        id: boxes.length + 1,
        slot: findFirstFreeSlot(),
        moduleId: moduleInfo.module_id,
        moduleName: moduleInfo.module_name,
        imageUrl: `${moduleInfo.image_url}`,
        level: defaultLevel,
        moduleStats: moduleInfo.module_stat,
        moduleDrain: moduleDrain,
      };
      setBoxes([...boxes, newBox]);
    } catch (error) {
      console.error('Error adding box:', error);
    }
  };

  const moveBox = (boxId, newSlot) => {
    const targetBox = boxes.find(box => box.slot === newSlot);

    if (targetBox) {
      const updatedBoxes = boxes.map(box => {
        if (box.id === boxId) {
          return { ...box, slot: newSlot };
        } else if (box.id === targetBox.id) {
          return { ...box, slot: boxes.find(box => box.id === boxId).slot };
        }
        return box;
      });
      setBoxes(updatedBoxes);
    } else {
      const updatedBoxes = boxes.map(box =>
        box.id === boxId ? { ...box, slot: newSlot } : box
      );
      setBoxes(updatedBoxes);
    }
  };

  const findFirstFreeSlot = () => {
    const occupiedSlots = boxes.map(box => box.slot);
    return Array.from({ length: 12 }, (_, i) => i).find(slot => !occupiedSlots.includes(slot));
  };

  const handleBoxClick = (box) => {
    const moduleInfo = moduleData.find(module => module.module_id === box.moduleId);
    const maxLevel = moduleInfo.module_stat[moduleInfo.module_stat.length - 1].level;

    setSelectedBox(box);
    setLevel(box.level);
    setMinLevel(0);
    setMaxLevel(maxLevel);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBox(null);
  };

  const handleModalSave = () => {
    const validLevel = Math.min(Math.max(level, minLevel), maxLevel);
    const updatedBoxes = boxes.map(box => {
      if (box.id === selectedBox.id) {
        const moduleDrain = box.moduleStats.find(stat => stat.level === validLevel).module_capacity;
        return { ...box, level: validLevel, moduleDrain };
      }
      return box;
    });
    setBoxes(updatedBoxes);
    handleModalClose();
  };

  const handleExport = () => {
    try {
      const simplifiedBoxes = boxes.map(({ moduleId, slot, level }) => ({ moduleId, slot, level }));
      const json = JSON.stringify(simplifiedBoxes, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sandbox-config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting configuration:', error);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const fileContent = await file.text();
      const importedBoxes = JSON.parse(fileContent);
  
      const maxId = boxes.reduce((max, box) => (box.id > max ? box.id : max), 0);
  
      const newBoxes = await Promise.all(importedBoxes.map(async (importedBox, index) => {
        const { moduleId, slot, level } = importedBox;
        const moduleInfo = await fetchModuleInfo(moduleId);
        const firstModuleStat = moduleInfo.module_stat[0];
        const moduleDrain = firstModuleStat.module_capacity;
        const id = maxId + index + 1; // Ensure unique id
  
        return {
          id,
          slot,
          moduleId,
          moduleName: moduleInfo.module_name,
          imageUrl: `${moduleInfo.image_url}`,
          level,
          moduleStats: moduleInfo.module_stat,
          moduleDrain,
        };
      }));
  
      // Update state directly with newBoxes
      setBoxes(newBoxes);
    } catch (error) {
      console.error('Error importing configuration:', error);
    }
  };
  

  const handleFilterChange = (newFilterType) => {
    if (newFilterType !== 'all') {
      setBoxes([]);
    }
    setFilterType(newFilterType);
  };

  const slots = Array.from({ length: 12 }, (_, i) => i);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="sandbox">
        <div className="module-search">
          <ModuleSearch addBox={addBox} filterType={filterType} className="modulesearch-input" />
          <label className="export-button" title="Export">
            <button onClick={handleExport} style={{ display: 'none' }}></button>
            <FontAwesomeIcon icon={faFileArrowUp} />
          </label>
          <label className="import-button" title="Import">
            <input className="import-input" type="file" accept=".json" onChange={handleImport} />
            <FontAwesomeIcon icon={faFileArrowDown} />
          </label>
          <select
            className="filter-dropdown"
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="Descendant">Descendant</option>
            <option value="General Rounds">General</option>
            <option value="Special Rounds">Special</option>
            <option value="Impact Rounds">Impact</option>
            <option value="High-Power Rounds">Heavy</option>
            <option value="all">Any</option>
          </select>
        </div>
        <div className="grid">
          {slots.map(slot => (
            <GridSlot key={slot} slot={slot} moveBox={moveBox}>
              {boxes
                .filter(box => box.slot === slot)
                .map(box => (
                  <DraggableBox key={box.id} box={box} moveBox={moveBox} onClick={() => handleBoxClick(box)} />
                ))}
            </GridSlot>
          ))}
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          level={level}
          setLevel={setLevel}
          minLevel={minLevel}
          maxLevel={maxLevel}
        />
      </div>
    </DndProvider>
  );
};

export default Sandbox;
