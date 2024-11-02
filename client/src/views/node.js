import React, { useState, useEffect, useRef } from 'react';
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
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const miningRef = useRef(false);

  const isLocalhost = window.location.hostname === 'localhost';

  useEffect(() => {
    // Load addresses from localStorage and sort them
    const storedAddresses = Object.keys(localStorage)
      .filter(key => key.startsWith('address_'))
      .sort();
    setAddresses(storedAddresses);
  }, []);

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

    if (!selectedAddress) {
      toast.error('Please select an address');
      return;
    }

    setMining(true);
    miningRef.current = true;
    let response;
    do {
      response = await fetch(`${config.API_URL}/blockchain/mine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: selectedAddress }),
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
      <label htmlFor="address">Select Address:</label>
        <select
          id="address"
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          required
        >
          <option value="">Select an address</option>
          {addresses.map(address => (
            <option key={address} value={address}>{address}</option>
          ))}
        </select>
      <button onClick={toggleMining}>
        {mining ? 'Stop Mining' : 'Start Mining'}
      </button>
      <ToastContainer />
    </div>
  );
};

export default NodePage;
