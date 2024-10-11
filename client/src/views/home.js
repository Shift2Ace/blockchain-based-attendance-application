import React, { useEffect, useState } from 'react';
import MenuBar from './components/menu';
import config from './components/config.json';


const HomePage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(config.API_URL);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <MenuBar />
      <h1>Home Page</h1>
      {data ? (
        <div>
          <p>Status: {data.status}</p>
          <p>Node Network ID: {data.node_network_id}</p>
          <p>Host Name: {data.host_name}</p>
          <p>Server Port: {data.server_port}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default HomePage;
