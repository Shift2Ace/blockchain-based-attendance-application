import React, { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import MenuBar from './components/menu';
import config from './components/config.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NodePage = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mining, setMining] = useState(false);
  const miningRef = useRef(false);

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
      toast.error('Failed to connect');
    }
  };

  const handleMineBlock = async () => {
    setMining(true);
    miningRef.current = true;
    let response;
    do {
      response = await fetch(`${config.API_URL}/blockchain/mine`, {
        method: 'POST',
      });

      const result = await response.json();
      if (result.message === 'Block mined successfully') {
        toast.success(result.message);
      } else if (result.message === 'No block mined') {
        toast.info('Retrying to mine block...');
      } else {
        toast.error('Failed to mine block');
        break;
      }
    } while (response.ok && miningRef.current);
    setMining(false);
    miningRef.current = false;
  };

  const toggleMining = () => {
    if (!mining) {
      handleMineBlock();
    } else {
      setMining(false);
      miningRef.current = false;
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
      <button onClick={toggleMining}>
        {mining ? 'Stop Mining' : 'Start Mining'}
      </button>
      <ToastContainer />
    </div>
  );
};

export default NodePage;
