import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableBox = ({ box, moveBox, onClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'BOX',
    item: { id: box.id, slot: box.slot },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Assuming box.moduleStats is an array of module stats
  const lastModuleStat = box.moduleStats[box.moduleStats.length - 1];

  // Construct imageUrl based on box.level and lastModuleStat
  const imageUrl = `${box.imageUrl}?is_overlay=true&enchant_level=${box.level}:${lastModuleStat.level}`;

  return (
    <div
      ref={drag}
      className="draggable-box"
      style={{
        opacity: isDragging ? 0.5 : 1,
        width: '150px', // Set width to 150 pixels
        height: '200px', // Set height to 200 pixels
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center content horizontally
        cursor: 'move',
        backgroundImage: `url(${imageUrl})`, // Set background image based on box.level and lastModuleStat.module_capacity
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={onClick} // Add onClick handler
    >
      <span
       className="draggable-box-text"
       style={{
        position: 'absolute',
        top: '1px',
        right: '55px',
        fontSize: '20px'

      }}
      >{box.moduleDrain}</span>
      <span className="draggable-box-text"style={{marginTop: '60px', textAlign: 'center', fontSize: '18px', maxWidth: '90%', alignSelf: 'center'}}>{box.moduleName}</span>
      
    </div>
  );
};

export default DraggableBox;
