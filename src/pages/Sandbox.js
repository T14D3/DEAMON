import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Sandbox.css';
import ModuleGrid from '../components/ModuleGrid';
import axios from 'axios'; // Import axios for API requests
import { copyToClipboard } from '../util/clipboard';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';

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

  const [buildId, setBuildId] = useState(null); // State to hold the build ID

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'DEAMON // Sandbox';
    // Function to extract 'id' from URL parameter and load build if available
    const loadBuildFromUrl = async () => {
      const pathname = location.pathname;
      const idFromUrl = pathname.substring(pathname.indexOf('/sandbox/') + '/sandbox/'.length);
      if (idFromUrl) {
        setBuildId(idFromUrl); // Set buildId state from URL parameter
        await loadBuildFromServer(idFromUrl); // Automatically load build when 'id' param is available
      }
    };
    loadBuildFromUrl();
  }, []);


  const exportData = () => {
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

    return combinedData;
  };

  const importData = async (data) => {
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
  };

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

  const fetchModuleInfo = async (moduleId) => {
    try {
      const response = await axios.get(`/api/meta/module?module_id=${moduleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching module info for module ID ${moduleId}:`, error);
      throw error;
    }
  };

  const saveBuildToServer = async () => {
    try {
      const dataToSave = exportData();
      const response = await axios.post('/api/save', { data: dataToSave });
      const { id } = response.data;
      await navigator.clipboard.writeText(window.location.origin + `/b/${id}`);
      toast.success(
      <div>
        Build saved! ({id})<br />
        Link copied to clipboard.
      </div>,
      {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "colored",
        draggable: false,
        closeButton: false,
        pauseOnFocusLoss: false,
      });
    } catch (error) {
      console.error('Error saving build:', error);
      toast.error(`Error saving build: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const loadBuildFromServer = async (buildId) => {
    try {
      const response = await axios.get(`/api/load/${buildId}`);
      const buildData = response.data;
      await importData(buildData);
      console.log('Build loaded successfully:', buildData);

      // Update URL without causing a reload
      navigate('/sandbox');
    } catch (error) {
      console.error('Error loading build:', error);
      // Handle error, show user notification, etc.
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="sandbox">
      <ToastContainer />
      <button title='Save Build to Server
Note: Will be stored for 30 days' onClick={saveBuildToServer} className='save-button'><FontAwesomeIcon icon={faFloppyDisk} style={{marginRight: '7px'}} />Save Build to Server</button>
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
      </div>
    </DndProvider>
  );
};

export default Sandbox;
