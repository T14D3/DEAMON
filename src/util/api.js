import axios from 'axios';

const fetchUserOUID = async (customHeader) => {
  const response = await axios.get(`/api/user/ouid`, {
    params: { user_name: customHeader },
  });
  return response.data;
};

const fetchUserInfo = async (ouid) => {
  const response = await axios.get(`/api/user/info`, {
    params: { ouid },
  });
  return response.data;
};

const fetchDescendant = async (ouid) => {
  const response = await axios.get(`/api/user/descendant`, {
    params: { ouid },
  });
  return response.data;
};

const findDescendantData = async (descendantId) => {
  const response = await axios.get(`/api/meta/descendant`, {
    params: { descendant_id: descendantId },
  });
  return response.data;
};

const fetchTitle = async (titleID) => {
  const response = await axios.get(`/api/meta/title`, {
    params: { title_id: titleID },
  });
  return response.data;
};

const fetchModuleInfo = async (moduleId) => {
  const response = await axios.get(`/api/meta/module`, {
    params: { module_id: moduleId },
  });
  return response.data;
};

const fetchAllModules = async () => {
  const response = await axios.get(`/api/meta/modules`);
  return response.data;
};

const fetchWeaponInfo = async (weaponId) => {
  const response = await axios.get(`/api/meta/weapon`, {
    params: { weapon_id: weaponId },
  });
  return response.data;
};
const fetchAllWeapons = async () => {
  const response = await axios.get(`/api/meta/weapons`);
  return response.data;
};

const fetchAllDescendants = async () => {
  const response = await axios.get(`/api/meta/descendants`);
  return response.data;
};
const fetchAllStats = async () => {
  const response = await axios.get(`/api/meta/stats`);
  return response.data;
};
const fetchStatName = async (statId) => {
  const response = await axios.get(`/api/meta/stat`, {
    params: { stat_id: statId },
  });
  return response.data.stat_name;
};
const fetchAllPatterns = async () => {
  const response = await axios.get(`/api/meta/patterns`);
  return response.data;
};
const fetchPattern = async (patternId) => {
  const response = await axios.get(`/api/meta/pattern`, {
    params: { pattern_id: patternId },
  });
  return response.data;
};
const fetchMission = async (missionId) => {
  const response = await axios.get(`/api/meta/mission`, {
    params: { mission_id: missionId },
  });
  return response.data;
};
const fetchAllMissions = async () => {
  const response = await axios.get(`/api/meta/missions`);
  return response.data;
};

export {
  fetchUserOUID,
  fetchUserInfo,
  fetchDescendant,
  findDescendantData,
  fetchTitle,
  fetchModuleInfo,
  fetchWeaponInfo,
  fetchAllModules,
  fetchAllWeapons,
  fetchAllDescendants,
  fetchStatName,
  fetchAllStats,
  fetchAllPatterns,
  fetchPattern,
  fetchMission,
  fetchAllMissions,
};
