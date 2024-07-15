import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import ModuleDisplay from '../components/ModuleDisplay';
import { fetchModuleInfo } from '../util/api'; // Adjust path as necessary
import './Sandbox.css'; // Style for Sandbox component

const Sandbox = () => {
  const [moduleSetups, setModuleSetups] = useState([]);
  const [newModuleId, setNewModuleId] = useState('');
  const dragItem = useRef();
  const dropItem = useRef();
  const dragNode = useRef();

  // Function to handle input change
  const handleInputChange = (e) => {
    setNewModuleId(e.target.value);
  };

  // Function to add new module
  const addModule = async () => {
    if (newModuleId.trim() === '') return;

    try {
      const moduleInfo = await fetchModuleInfo(newModuleId);
      const nextSlotNumber = moduleSetups.length + 1;

      const newModuleSetup = {
        module_id: newModuleId,
        module_slot_id: `Main ${nextSlotNumber}`,
        module_enchant_level: 0, // Default level
        module_drain: moduleInfo.module_drain, // Assuming you fetch this from API
        module_name: moduleInfo.module_name, // Assuming you fetch this from API
        image_url: moduleInfo.image_url, // Assuming you fetch this from API
      };

      setModuleSetups([...moduleSetups, newModuleSetup]);
      setNewModuleId('');
    } catch (error) {
      console.error('Error fetching module info:', error);
      // Handle error, show message, etc.
    }
  };

  // Function to handle drag start
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    dragNode.current = e.target;
    dragNode.current.addEventListener('dragend', handleDragEnd);
  };

  // Function to handle drag end
  const handleDragEnd = () => {
    dragNode.current.removeEventListener('dragend', handleDragEnd);
    dragItem.current = null;
    dragNode.current = null;
    dropItem.current = null;
  };

  // Function to handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    dropItem.current = index;
  };

  // Function to handle drop
  const handleDrop = () => {
    if (dragItem.current !== dropItem.current) {
      const draggedModule = moduleSetups[dragItem.current];
      const updatedModuleSetups = [...moduleSetups];
      updatedModuleSetups.splice(dragItem.current, 1);
      updatedModuleSetups.splice(dropItem.current, 0, draggedModule);
      setModuleSetups(updatedModuleSetups);
    }
  };

  return (
    <div className="sandbox">
      <h1>Sandbox - Custom Module Setup Creator</h1>
      <div className="sandbox-controls">
        <input
          type="text"
          placeholder="Enter Module ID"
          value={newModuleId}
          onChange={handleInputChange}
        />
        <button onClick={addModule}>Add Module</button>
      </div>
      <ModuleDisplay
        moduleSetups={moduleSetups}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      />
    </div>
  );
};

export default Sandbox;
