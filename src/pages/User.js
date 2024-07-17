import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchUserOUID,
  fetchUserInfo,
  fetchDescendant,
  findDescendantData,
  fetchTitle,
  fetchModuleInfo,
} from '../util/api';
import {
  getStatsForLevel,
  getModifiedStatType,
} from '../util/helpers';
import ModuleDisplay from '../components/ModuleDisplay';
import './User.css';

const User = () => {
  const navigate = useNavigate();
  const { name } = useParams();

  const [apiData, setApiData] = useState(null);
  const [descendantData, setDescendantData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [descendantInfo, setDescendantInfo] = useState(null);
  const [titleNames, setTitleNames] = useState({});
  const [moduleSetups, setModuleSetups] = useState([]);

  useEffect(() => {
    document.title = 'DEAMON // User // ' + name;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const ouid = await fetchUserOUID(name);
        const [userInfo, descendantInfoResult] = await Promise.all([
          fetchUserInfo(ouid),
          fetchDescendant(ouid),
        ]);

        const localDescendantData = await findDescendantData(descendantInfoResult.descendant_id);
        const titlePrefixName = await fetchTitle(userInfo.title_prefix_id);
        const titleSuffixName = await fetchTitle(userInfo.title_suffix_id);

        setApiData(userInfo);
        setDescendantData(localDescendantData);
        setDescendantInfo(descendantInfoResult);
        setTitleNames({ prefix: titlePrefixName, suffix: titleSuffixName });

        // Prepare module setups
        const fetchedModuleSetups = descendantInfoResult.module.map(module => ({
          module_id: module.module_id,
          module_slot_id: module.module_slot_id,
          module_enchant_level: module.module_enchant_level,
          module_drain: module.module_drain,
        }));
        setModuleSetups(fetchedModuleSetups);
      } catch (error) {
        setError(error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchData();
    }
  }, [name]);

  // Define onLayoutChange function to handle layout changes
  const onLayoutChange = (layout) => {
    // Handle layout changes here
    console.log('Layout changed:', layout);
  };

  const statsForLevel = descendantInfo ? getStatsForLevel(descendantData, descendantInfo.descendant_level) : null;

  return (
    <div className="App">
      <header className="App-header">
        <h1>TFD Api Query</h1>
        {error && (
          <div className="error">
            <h2>Error</h2>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
        {apiData && descendantInfo && (
          <div className="user-info-container">
            <div className="user-info-box">
              <h2>{`${titleNames.prefix} ${titleNames.suffix}`}</h2>
              <h1>{`${apiData.user_name} \u2605 ${apiData.mastery_rank_level}`}</h1>
              <p className="ouid">OUID: {apiData.ouid}</p>
            </div>
          </div>
        )}
        {descendantInfo && (
          <div className="descendant-container">
            <div className="descendant-box">
              <h2>Descendant Info</h2>
              <div className="descendant-info">
                <div className="descendant-details">
                  <p>Name: {descendantData.descendant_name}</p>
                  <p>Level: {descendantInfo.descendant_level}</p>
                  <img src={descendantData.descendant_image_url} alt={descendantInfo.descendant_name} />
                </div>
                <div className="descendant-stats">
                  {statsForLevel ? (
                    <div className="stats-box">
                      {statsForLevel.stat_detail.map((stat, index) => (
                        <div key={index} className="stat-item">
                          <span className="stat-type">{getModifiedStatType(stat.stat_type)}:</span>
                          <span className="stat-value">{stat.stat_value}</span>
                        </div>
                      ))}
                    </div>  
                  ) : (
                    <p>No stats available for this level</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {moduleSetups.length > 0 && (
          <ModuleDisplay moduleSetups={moduleSetups} onLayoutChange={onLayoutChange} />
        )}
        
        <button onClick={() => navigate('/')}>Go back to Home</button>
      </header>
    </div>
  );
};

export default User;
