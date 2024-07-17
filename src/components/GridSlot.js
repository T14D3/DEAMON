import React from 'react';
import { useDrop } from 'react-dnd';

const GridSlot = ({ slot, children, moveBox, imageUrl }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'BOX',
    drop: (item) => {
      moveBox(item.id, slot);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const isEmpty = React.Children.count(children) === 0;

  return (
    <div
      ref={drop}
      className="grid-slot"
      style={{
        width: '150px', // Set width to 150 pixels
        height: '200px', // Set height to 200 pixels
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: 'none',
        background: isEmpty ? `url(https://tfdvod.dn.nexoncdn.co.kr/img/cbt/recommend/module__none_dummy.png) center / cover no-repeat` : 'none',
        boxShadow: isOver ? '0 0 15px rgba(200, 200, 200, 1), inset 0 0 10px rgba(200, 200, 200, 1)' : 'none', // Shadow-like highlight
        borderRadius: '7px',
      }}
    >
      {children}
    </div>
  );
};

export default GridSlot;
