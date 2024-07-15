import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dev.css';
import { useNavigate, useLocation } from 'react-router-dom';

function User() {
  const navigate = useNavigate();
  const location = useLocation();

  const [apiData, setApiData] = useState(null);
  const [customHeader, setCustomHeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query');
    if (query !== null) {
      setCustomHeader(query);
    }
  }, [location.search]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Encode the custom header to handle special characters
      const encodedHeader = encodeURIComponent(customHeader);
      // Make an API request with headers
      const response = await axios.get(`https://open.api.nexon.com/tfd/v1/id?user_name=${encodedHeader}`, {
        headers: {
          'x-nxopen-api-key': 'test_e9822f214fc31b657241200e08a8683d54a8b753dee7c314e841b7644cf2d4c7efe8d04e6d233bd35cf2fabdeb93fb0d', // Set your API key here
        }
      });
      const ouid = response.data.ouid; // Cache the "ouid" value
      await getInfo(ouid); // Call getInfo with the cached "ouid" value
      updateUrlQueryParam(customHeader); // Update URL with the current customHeader value
    } catch (error) {
      setError(error.response ? error.response.data : error.message); // Capture and set error details
    }
    setLoading(false);
  };

  const getInfo = async (ouid) => {
    try {
      // Make an API request with headers using the cached "ouid"
      const response = await axios.get(`https://open.api.nexon.com/tfd/v1/user/basic?ouid=${ouid}`, {
        headers: {
          'x-nxopen-api-key': 'test_e9822f214fc31b657241200e08a8683d54a8b753dee7c314e841b7644cf2d4c7efe8d04e6d233bd35cf2fabdeb93fb0d', // Set your API key here
        }
      });
      setApiData(response.data); // Update state with the fetched data
    } catch (error) {
      setError(error.response ? error.response.data : error.message); // Capture and set error details
    }
  };

  const updateUrlQueryParam = (query) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('query', query);
    navigate({ search: queryParams.toString() });
  };

  const handleInputChange = (e) => {
    setCustomHeader(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TFD-API Raw JSON Response</h1>
        <div className="input-container">
          <input
            type="text"
            value={customHeader}
            onChange={handleInputChange}
            placeholder="Enter custom header value"
          />
          <button onClick={fetchData} disabled={loading}>
            {loading ? 'Loading...' : 'Query'}
          </button>
        </div>
        {error && (
          <div className="error">
            <h2>Error</h2>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
        {apiData ? (
          <pre>{JSON.stringify(apiData, null, 2)}</pre> // Display the raw JSON response
        ) : (
          loading ? <p>Loading...</p> : <p>Enter a value and click 'Query'</p> // Show a loading message or a prompt
        )}
      </header>
    </div>
  );
}

export default User;
