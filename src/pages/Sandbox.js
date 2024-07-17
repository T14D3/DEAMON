import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Sandbox.css';
import ModuleGrid from '../components/ModuleGrid';
import { copyToClipboard, pasteFromClipboard } from '../util/clipboard';
import { fetchModuleInfo } from '../util/api';

const Sandbox = () => {
  const [moduleData, setModuleData] = useState([]);
  const [boxes1, setBoxes1] = useState([]);
  const [boxes2, setBoxes2] = useState([]);
  const [boxes3, setBoxes3] = useState([]);
  const [boxes4, setBoxes4] = useState([]);
  
  const [selectedDescendantId, setSelectedDescendantId] = useState(null);
  const [selectedWeapon1Id, setSelectedWeapon1Id] = useState(null);
  const [selectedWeapon2Id, setSelectedWeapon2Id] = useState(null);
  const [selectedWeapon3Id, setSelectedWeapon3Id] = useState(null);
  
  const [gridType1, setGridType1] = useState("Descendant");
  const [gridType2, setGridType2] = useState("General Rounds");
  const [gridType3, setGridType3] = useState("Impact Rounds");
  const [gridType4, setGridType4] = useState("High-Power Rounds");

  const exportToClipboard = () => {
    const combinedData = [];

    [boxes1, boxes2, boxes3, boxes4].forEach((boxes, index) => {
      combinedData.push({
        gridId: `${index + 1}`,
        gridType: index === 0 ? gridType1 : (index === 1 ? gridType2 : (index === 2 ? gridType3 : gridType4)),
        selectedDescendantId: index === 0 ? selectedDescendantId : null,
        selectedWeaponId: index === 1 ? selectedWeapon1Id : (index === 2 ? selectedWeapon2Id : (index === 3 ? selectedWeapon3Id : null)),
        boxes: boxes.map(box => ({
          id: box.id,
          slot: box.slot,
          moduleId: box.moduleId,
          level: box.level
        }))
      });
    });

    copyToClipboard(combinedData);
  };

  const importFromClipboard = async () => {
    const data = await pasteFromClipboard();
  
    if (data) {
      const fetchModuleStats = async (boxes) => {
        const updatedBoxes = await Promise.all(boxes.map(async (box) => {
          try {
            const moduleInfo = await fetchModuleInfo(box.moduleId);
            if (!moduleInfo.module_stat || moduleInfo.module_stat.length === 0) {
              throw new Error('Module stats not found or empty.');
            }
            const moduleStats = moduleInfo.module_stat;
            return {
              ...box,
              moduleInfo,
              moduleStats,
              moduleName: moduleInfo.module_name,
              moduleType: moduleInfo.module_type,
              imageUrl: moduleInfo.image_url,
              moduleDrain: moduleStats[0].module_capacity,
            };
          } catch (error) {
            console.error(`Error fetching module info for box id ${box.id}:`, error);
            return { ...box, moduleInfo: null, moduleStats: [], moduleName: '', moduleType: '', imageUrl: '', moduleDrain: 0 };
          }
        }));
        return updatedBoxes;
      };
  
      for (const grid of data) {
        let setBoxes, setGridType, setSelectedId;
        switch (grid.gridId) {
          case '1':
            [setGridType, setSelectedId, setBoxes] = [setGridType1, setSelectedDescendantId, setBoxes1];
            break;
          case '2':
            [setGridType, setSelectedId, setBoxes] = [setGridType2, setSelectedWeapon1Id, setBoxes2];
            break;
          case '3':
            [setGridType, setSelectedId, setBoxes] = [setGridType3, setSelectedWeapon2Id, setBoxes3];
            break;
          case '4':
            [setGridType, setSelectedId, setBoxes] = [setGridType4, setSelectedWeapon3Id, setBoxes4];
            break;
          default:
            continue;
        }
  
        setGridType(grid.gridType);
        setSelectedId(grid.selectedDescendantId || grid.selectedWeaponId);
        const boxesWithStats = await fetchModuleStats(grid.boxes);
        setBoxes(boxesWithStats);
      }
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="sandbox">
        <ModuleGrid
          gridType={gridType1}
          setGridType={setGridType1}
          boxes={boxes1}
          setBoxes={setBoxes1}
          moduleData={moduleData}
          isWeaponModule={false}
          selectedDescendantId={selectedDescendantId}
          setSelectedDescendantId={setSelectedDescendantId}
        />
        <ModuleGrid
          gridType={gridType2}
          setGridType={setGridType2}
          boxes={boxes2}
          setBoxes={setBoxes2}
          moduleData={moduleData}
          isWeaponModule={true}
          selectedWeaponId={selectedWeapon1Id}
          setSelectedWeaponId={setSelectedWeapon1Id}
        />
        <ModuleGrid
          gridType={gridType3}
          setGridType={setGridType3}
          boxes={boxes3}
          setBoxes={setBoxes3}
          moduleData={moduleData}
          isWeaponModule={true}
          selectedWeaponId={selectedWeapon2Id}
          setSelectedWeaponId={setSelectedWeapon2Id}
        />
        <ModuleGrid
          gridType={gridType4}
          setGridType={setGridType4}
          boxes={boxes4}
          setBoxes={setBoxes4}
          moduleData={moduleData}
          isWeaponModule={true}
          selectedWeaponId={selectedWeapon3Id}
          setSelectedWeaponId={setSelectedWeapon3Id}
        />
        <button onClick={exportToClipboard}>Log ModuleGrid States</button>
        <button onClick={importFromClipboard}>Import from Clipboard</button>
      </div>
    </DndProvider>
  );
};

export default Sandbox;
