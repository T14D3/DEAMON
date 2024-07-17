import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Sandbox.css';
import ModuleGrid from '../components/ModuleGrid';

const Sandbox = () => {
  const [moduleData, setModuleData] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        console.log('Fetching module data...');
        const cachedModuleData = localStorage.getItem('moduleData');
        if (cachedModuleData) {
          console.log('Module data found in cache.');
          setModuleData(JSON.parse(cachedModuleData));
          return;
        }

        const response = await fetch('https://open.api.nexon.com/static/tfd/meta/en/module.json');
        if (!response.ok) {
          throw new Error('Failed to fetch module data');
        }
        const data = await response.json();

        console.log('Fetched module data:', data);
        localStorage.setItem('moduleData', JSON.stringify(data));
        setModuleData(data);
      } catch (error) {
        console.error('Error fetching module data:', error);
      }
    };

    fetchModules();
  }, []);

  const ModuleGridWrapper = ({ gridType, isWeaponModule }) => {
    const [boxes, setBoxes] = useState([]);

    return (
      <div className="module-grid-wrapper">
        <ModuleGrid
          gridType={gridType}
          boxes={boxes}
          setBoxes={setBoxes}
          moduleData={moduleData}
          isWeaponModule={isWeaponModule}
        />
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="sandbox">
        {/* Example of different ModuleGrid instances */}
        <ModuleGridWrapper gridType="Descendant" isWeaponModule={false} />
        <ModuleGridWrapper gridType="General Rounds" isWeaponModule={true} />
        <ModuleGridWrapper gridType="Impact Rounds" isWeaponModule={true} />
        <ModuleGridWrapper gridType="High-Power Rounds" isWeaponModule={true} />
      </div>
    </DndProvider>
  );
};

export default Sandbox;
