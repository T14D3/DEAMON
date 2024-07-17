const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const { saveData, loadData } = require('./util/db'); // Import db module
const app = express();
const port = 5000;

const API_KEY = 'INSERT_YOUR_API_KEY_HERE';
const cache = new NodeCache({ stdTTL: 120 }); // Cache for 2 minutes

// Middleware to parse JSON bodies
app.use(express.json());

// Function to fetch data from API or cache
const getCacheOrFetch = async (key, fetchFn) => {
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData;
  }
  const data = await fetchFn();
  cache.set(key, data);
  return data;
};

// POST endpoint to save build data
app.post('/api/save', async (req, res) => {
  const { data } = req.body; // Extract data directly from req.body
  
  try {
    const result = await saveData(data); // Pass data to saveData function
    res.json(result);
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ success: false, message: 'Failed to save data' });
  }
});

// Endpoint to load build data
app.get('/api/load/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const data = await loadData(id);
    res.json(data);
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(404).json({ success: false, message: 'Data not found' });
  }
});

// Endpoint to fetch user OUID
app.get('/api/user/ouid', async (req, res) => {
  const { user_name } = req.query;
  const encodedHeader = encodeURIComponent(user_name);
  const cacheKey = `fetchUserOUID_${encodedHeader}`;

  try {
    const data = await getCacheOrFetch(cacheKey, async () => {
      const response = await axios.get(`https://open.api.nexon.com/tfd/v1/id?user_name=${encodedHeader}`, {
        headers: { 'x-nxopen-api-key': API_KEY }
      });
      return response.data.ouid;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching user OUID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch user basic info
app.get('/api/user/info', async (req, res) => {
  const { ouid } = req.query;
  const cacheKey = `fetchUserInfo_${ouid}`;

  try {
    const data = await getCacheOrFetch(cacheKey, async () => {
      const response = await axios.get(`https://open.api.nexon.com/tfd/v1/user/basic?ouid=${ouid}`, {
        headers: { 'x-nxopen-api-key': API_KEY }
      });
      return response.data;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch user descendant info
app.get('/api/user/descendant', async (req, res) => {
  const { ouid } = req.query;
  const cacheKey = `fetchDescendant_${ouid}`;

  try {
    const data = await getCacheOrFetch(cacheKey, async () => {
      const response = await axios.get(`https://open.api.nexon.com/tfd/v1/user/descendant?ouid=${ouid}`, {
        headers: { 'x-nxopen-api-key': API_KEY }
      });
      return response.data;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching user descendant info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch descendant metadata by ID
app.get('/api/meta/descendant', async (req, res) => {
  const { descendant_id } = req.query;
  const cacheKey = `findDescendantData_${descendant_id}`;

  try {
    const data = await getCacheOrFetch(cacheKey, async () => {
      const response = await axios.get('https://open.api.nexon.com/static/tfd/meta/en/descendant.json');
      const descendantInfo = response.data.find(descendant => descendant.descendant_id === descendant_id);
      if (!descendantInfo) {
        throw new Error(`Descendant with ID ${descendant_id} not found`);
      }
      return descendantInfo;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching descendant metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch title metadata by ID
app.get('/api/meta/title', async (req, res) => {
  const { title_id } = req.query;
  const cacheKey = `fetchTitle_${title_id}`;

  try {
    const data = await getCacheOrFetch(cacheKey, async () => {
      const response = await axios.get('https://open.api.nexon.com/static/tfd/meta/en/title.json');
      const titleInfo = response.data.find(title => title.title_id === title_id);
      if (!titleInfo) {
        throw new Error(`Title with ID ${title_id} not found`);
      }
      return titleInfo.title_name;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching title metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch module metadata by ID
app.get('/api/meta/module', async (req, res) => {
  const { module_id } = req.query;
  const cacheKey = `fetchModuleInfo_${module_id}`;

  try {
    const data = await getCacheOrFetch(cacheKey, async () => {
      const response = await axios.get('https://open.api.nexon.com/static/tfd/meta/en/module.json');
      const moduleInfo = response.data.find(module => module.module_id === module_id);
      if (!moduleInfo) {
        throw new Error(`Module with ID ${module_id} not found`);
      }
      return moduleInfo;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching module metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch all module metadata
app.get('/api/meta/modules', async (req, res) => {
  try {
    const data = await getCacheOrFetch('fetchAllModules', async () => {
      const response = await axios.get('https://open.api.nexon.com/static/tfd/meta/en/module.json');
      return response.data;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching all module metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch weapon metadata by ID
app.get('/api/meta/weapon', async (req, res) => {
  const { weapon_id } = req.query;
  const cacheKey = `fetchWeaponInfo_${weapon_id}`;

  try {
    const data = await getCacheOrFetch(cacheKey, async () => {
      const response = await axios.get('https://open.api.nexon.com/static/tfd/meta/en/weapon.json');
      const weaponInfo = response.data.find(weapon => weapon.weapon_id === weapon_id);
      if (!weaponInfo) {
        throw new Error(`Weapon with ID ${weapon_id} not found`);
      }
      return weaponInfo;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching weapon metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch all weapon metadata
app.get('/api/meta/weapons', async (req, res) => {
  try {
    const data = await getCacheOrFetch('fetchAllWeapons', async () => {
      const response = await axios.get('https://open.api.nexon.com/static/tfd/meta/en/weapon.json');
      return response.data;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching all weapon metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch all descendant metadata
app.get('/api/meta/descendants', async (req, res) => {
  try {
    const data = await getCacheOrFetch('fetchAllDescendants', async () => {
      const response = await axios.get('https://open.api.nexon.com/static/tfd/meta/en/descendant.json');
      return response.data;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching all descendant metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
