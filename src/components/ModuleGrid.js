import React, { useState, useEffect } from 'react';
import GridSlot from './GridSlot';
import DraggableBox from './DraggableBox';
import Modal from './Modal';
import { fetchModuleInfo, findDescendantData, fetchWeaponInfo } from '../util/api'; // Adjust API functions as per your implementation
import './ModuleGrid.css';
import Search from './Search';

const ModuleGrid = ({ gridType, setGridType, boxes, setBoxes, moduleData, isWeaponModule, selectedDescendantId, setSelectedDescendantId, selectedWeaponId, setSelectedWeaponId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [level, setLevel] = useState(1);
  const [minLevel, setMinLevel] = useState(0);
  const [maxLevel, setMaxLevel] = useState(7);
  const [selectedDescendantName, setSelectedDescendantName] = useState('');
  const [selectedWeaponName, setSelectedWeaponName] = useState('');
  const [modalModuleData, setModalModuleData] = useState(null);

  useEffect(() => {
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

    fetchDescendantName();
    fetchWeaponName();
  }, [selectedDescendantId, selectedWeaponId]);

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

  return (
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
  );
};

export default ModuleGrid;
