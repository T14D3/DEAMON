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
        const updatedBoxes = [];
        for (const box of boxes) {
          try {
            const moduleInfo = await fetchModuleInfo(box.moduleId);
            if (!moduleInfo.module_stat || moduleInfo.module_stat.length === 0) {
              throw new Error('Module stats not found or empty.');
            }
            const moduleStats = moduleInfo.module_stat;
            updatedBoxes.push({ ...box, moduleInfo, moduleStats });
          } catch (error) {
            console.error(`Error fetching module info for box id ${box.id}:`, error);
            updatedBoxes.push({ ...box, moduleInfo: null, moduleStats: [] });
          }
        }
        return updatedBoxes;
      };
  
      for (const grid of data) {
        switch (grid.gridId) {
          case '1':
            setGridType1(grid.gridType);
            setSelectedDescendantId(grid.selectedDescendantId);
            const boxes1WithStats = await fetchModuleStats(
              grid.boxes.map((box) => ({ ...box, moduleId: box.moduleId }))
            );
            setBoxes1(
              boxes1WithStats.map((box) => ({
                ...box,
                moduleName: box.moduleInfo ? box.moduleInfo.module_name : '',
                moduleType: box.moduleInfo ? box.moduleInfo.module_type : '',
                imageUrl: box.moduleInfo ? `${box.moduleInfo.image_url}` : '',
                moduleDrain: box.moduleStats.length > 0 ? box.moduleStats[0].module_capacity : 0,
              }))
            );
            break;
          case '2':
            setGridType2(grid.gridType);
            setSelectedWeapon1Id(grid.selectedWeaponId);
            const boxes2WithStats = await fetchModuleStats(
              grid.boxes.map((box) => ({ ...box, moduleId: box.moduleId }))
            );
            setBoxes2(
              boxes2WithStats.map((box) => ({
                ...box,
                moduleName: box.moduleInfo ? box.moduleInfo.module_name : '',
                moduleType: box.moduleInfo ? box.moduleInfo.module_type : '',
                imageUrl: box.moduleInfo ? `${box.moduleInfo.image_url}` : '',
                moduleDrain: box.moduleStats.length > 0 ? box.moduleStats[0].module_capacity : 0,
              }))
            );
            break;
          case '3':
            setGridType3(grid.gridType);
            setSelectedWeapon2Id(grid.selectedWeaponId);
            const boxes3WithStats = await fetchModuleStats(
              grid.boxes.map((box) => ({ ...box, moduleId: box.moduleId }))
            );
            setBoxes3(
              boxes3WithStats.map((box) => ({
                ...box,
                moduleName: box.moduleInfo ? box.moduleInfo.module_name : '',
                moduleType: box.moduleInfo ? box.moduleInfo.module_type : '',
                imageUrl: box.moduleInfo ? `${box.moduleInfo.image_url}` : '',
                moduleDrain: box.moduleStats.length > 0 ? box.moduleStats[0].module_capacity : 0,
              }))
            );
            break;
          case '4':
            setGridType4(grid.gridType);
            setSelectedWeapon3Id(grid.selectedWeaponId);
            const boxes4WithStats = await fetchModuleStats(
              grid.boxes.map((box) => ({ ...box, moduleId: box.moduleId }))
            );
            setBoxes4(
              boxes4WithStats.map((box) => ({
                ...box,
                moduleName: box.moduleInfo ? box.moduleInfo.module_name : '',
                moduleType: box.moduleInfo ? box.moduleInfo.module_type : '',
                imageUrl: box.moduleInfo ? `${box.moduleInfo.image_url}` : '',
                moduleDrain: box.moduleStats.length > 0 ? box.moduleStats[0].module_capacity : 0,
              }))
            );
            break;
          default:
            break;
        }
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
