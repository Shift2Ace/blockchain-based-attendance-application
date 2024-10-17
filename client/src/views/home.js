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
    const intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
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
        <p>Status: connection error</p>
      )}
    </div>
  );
};

export default HomePage;
