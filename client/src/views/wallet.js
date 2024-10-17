import React, { useState } from 'react';
import MenuBar from './components/menu';
import config from './components/config.json';

const Wallet = () => {
  const [password, setPassword] = useState('');
  const [walletId, setWalletId] = useState('');
  const [error, setError] = useState('');

  const [address, setAddress] = useState('');
  const [studentId, setStudentId] = useState('');

  // create wallet
  const handleCreateWallet = async (e) => {
    setError('');
    e.preventDefault();
    try {
      const response = await fetch(`${config.API_URL}/wallet/create_new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      setWalletId(data.walletId);
      console.log('Created wallet ID:', data.walletId);
    } catch (error) {
      setError(error.message);
      console.error('Error:', error);
    }
  };

  // create address
  const handleCreateAddress = (e) => {
    e.preventDefault();
    if (walletId && password && studentId) {
      const newAddress = `address-${walletId}-${studentId}`;
      setAddress(newAddress);
      console.log('Created address:', newAddress);
    } else {
      console.log('Please provide wallet ID, password, and student ID.');
    }
  };
  

  return (
    <div>
      <MenuBar />
      <h1>Wallet</h1>
      
      <form onSubmit={handleCreateWallet}>
        <h2>Create Wallet</h2>
        <label>
          Password:
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </label>
        <br></br>
        <button type="submit">Create Wallet</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {walletId && <p>Wallet ID: {walletId}</p>}

      <form onSubmit={handleCreateAddress}>
        <h2>Create Address</h2>
        <label>
          Wallet ID:
          <input 
            type="text" 
            value={walletId} 
            readOnly 
          />
        </label><br></br>
        <label>
          Password:
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </label><br></br>
        <label>
          Student ID:
          <input 
            type="text" 
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)} 
          />
        </label>
        <br></br>
        <button type="submit">Create Address</button>
      </form>
      {address && <p>Address: {address}</p>}
    </div>
  );
};

export default Wallet;
