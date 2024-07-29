import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAllMissions } from '../util/api'; 
import "./Maps.css";

const mapOptions = [
  { id: '610002000', name: 'None' },
  { id: '610002001', name: 'Vespers' },
  { id: '610002002', name: 'Kingston' },
  { id: '610002003', name: 'Agna Desert' },
  { id: '610002004', name: 'Echo Swamp' },
  { id: '610002005', name: 'Fortress' },
  { id: '610002006', name: 'Sterile Land' },
  { id: '610002007', name: 'Hagios' },
  { id: '610002008', name: 'White-night Gulch' },
];

function Maps() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedMap, setSelectedMap] = useState(id || mapOptions[0].id);
  const [isDragging, setIsDragging] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [prevOffset, setPrevOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [missions, setMissions] = useState([]);
  const [hoveredBox, setHoveredBox] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const loadMissions = async () => {
      const cachedMissions = localStorage.getItem('missions');
      if (cachedMissions) {
        setMissions(JSON.parse(cachedMissions));
      } else {
        const data = await fetchAllMissions();
        setMissions(data);
        localStorage.setItem('missions', JSON.stringify(data));
      }
    };

    loadMissions();
  }, []); // Fetch missions on component mount

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const [offsetX, offsetY, zoom] = hash.split(':');

    if (id && mapOptions.some(map => map.id === id)) {
      setSelectedMap(id);
    } else {
      navigate('/maps');
    }

    const initialOffset = {
      x: offsetX ? parseFloat(offsetX) : 0,
      y: offsetY ? parseFloat(offsetY) : 0,
    };
    const initialScale = zoom ? parseFloat(zoom) : 1;

    setOffset(initialOffset);
    setScale(initialScale);
  }, [id, navigate]);

  useEffect(() => {
    if (imageLoaded) {
      const hash = `${offset.x}:${offset.y}:${scale}`;
      navigate(`/maps/${selectedMap}#${hash}`);
    }
  }, [offset, scale, selectedMap, imageLoaded, navigate]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartCoords({ x: e.clientX, y: e.clientY });
    setPrevOffset(offset);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - startCoords.x;
      const dy = e.clientY - startCoords.y;
      setOffset({
        x: prevOffset.x + dx,
        y: prevOffset.y + dy,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const roundTo = (num, decimalPlaces) => {
      const factor = Math.pow(10, decimalPlaces);
      return Math.round(num * factor) / factor;
    };
    e.preventDefault();
    const zoomIntensity = 0.1;
    setScale((prevScale) => {
      const newScale = e.deltaY > 0 ? prevScale - zoomIntensity : prevScale + zoomIntensity;
      return roundTo(clamp(newScale, 0.1, 50), 2);
    });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const mapContainer = document.querySelector('.map');
    mapContainer.addEventListener('wheel', handleWheel);
    return () => {
      mapContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMapChange = (event) => {
    const newMapId = event.target.value;
    setSelectedMap(newMapId);
    setOffset({ x: 0, y: 0 });
    setPrevOffset({ x: 0, y: 0 });
    setScale(1);
    setImageLoaded(false);
    navigate(`/maps/${newMapId}`);
  };

  const currentMissions = missions.find(m => m.map_id === selectedMap)?.missions || [];

  return (
    <div className="maps-container" style={{ backgroundColor: '#3F3F3F' }}>
      <div className="map-selector">
        <p>Map-Selector</p>
        <select value={selectedMap} onChange={handleMapChange} className='map-selector-select'>
          {mapOptions.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
      </div>

      <div
        className="map"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
        onMouseDown={handleMouseDown}
      >
        <img 
          src={`/maps/${selectedMap}.png`} 
          alt={selectedMap} 
          className="map-image"
          ref={imgRef}
          onLoad={handleImageLoad}
          onDragStart={(e) => e.preventDefault()}
        />
        
        {currentMissions.map((box) => (
          <div 
            key={box.id}
            className="map-box"
            style={{
              width: '35px',
              height: '35px',
              top: box.top,
              left: box.left,
            }}
            onClick={() => alert(`${box.name} clicked!`)}
            onMouseEnter={() => setHoveredBox(box)}
            onMouseLeave={() => setHoveredBox(null)}
          />
        ))}

        {hoveredBox && (
          <div className="tooltip" style={{
            position: 'absolute',
            left: `${parseFloat(hoveredBox.left) + 60}px`,
            top: `${parseFloat(hoveredBox.top)}px`,
          }}>
            <h4>{hoveredBox.name}</h4>
            <p>{hoveredBox.id}</p>
            <p>Type: {hoveredBox.type}</p>
            {/*<p>Objective: {hoveredBox.objective}</p>*/}
            <h5>Rewards:</h5>
            <ul>
              {hoveredBox.rewards.map((reward, index) => (
                <li key={index}>{reward.name} ({reward.chance})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Maps;