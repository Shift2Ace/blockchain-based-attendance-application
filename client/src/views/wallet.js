import React, { useState } from 'react';
import MenuBar from './components/menu';

const Wallet = () => {
  const [password, setPassword] = useState('');
  const [walletId, setWalletId] = useState('');
  const [address, setAddress] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleCreateWallet = (e) => {
    e.preventDefault();
    // Logic to create a unique wallet ID from the password
    const newWalletId = `wallet-${Date.now()}`; // Example logic for unique ID
    setWalletId(newWalletId);
    console.log('Created wallet ID:', newWalletId);
  };

  const handleCreateAddress = (e) => {
    e.preventDefault();
    // Logic to create an address using wallet ID, password, and student ID
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
        <h2>Create Blockchain Wallet</h2>
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
