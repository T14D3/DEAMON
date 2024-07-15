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

export {
  fetchUserOUID,
  fetchUserInfo,
  fetchDescendant,
  findDescendantData,
  fetchTitle,
  fetchModuleInfo,
  fetchAllModules,
};
