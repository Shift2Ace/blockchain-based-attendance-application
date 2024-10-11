import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import MenuBar from './components/menu';
import config from './components/config.json';

const NodePage = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isLocalhost = window.location.hostname === 'localhost';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${config.API_URL}/node/connect_new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ host, port }),
    });

    if (response.ok) {
      setSubmitted(true);
    } else {
      alert('Failed to connect');
    }
  };

  if (!isLocalhost) {
    return <Navigate to="/home" />;
  }

  if (submitted) {
    return <Navigate to="/home" />;
  }

  return (
    <div>
      <MenuBar />
      <h1>Node Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="host">Host/IP:</label>
          <input
            type="text"
            id="host"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="port">Port:</label>
          <input
            type="text"
            id="port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            required
          />
        </div>
        <button type="submit">Connect</button>
      </form>
    </div>
  );
};

export default NodePage;