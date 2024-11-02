import React, { useState, useEffect } from 'react';
import MenuBar from './components/menu';
import CryptoJS from 'crypto-js';
import config from './components/config.json';


const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [data, setData] = useState(null);
  const [password, setPassword] = useState('');
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState('');
  const [balance, setBalance] = useState(null); // New state for balance
  const [error, setError] = useState('');

  useEffect(() => {
    // Load addresses from localStorage and sort them
    const storedAddresses = Object.keys(localStorage)
      .filter(key => key.startsWith('address_'))
      .sort();
    setAddresses(storedAddresses);
  }, []);

  const handleAddressSelect = (e) => {
    const selected = e.target.value;
    setSelectedAddress(selected);
    const storedData = JSON.parse(localStorage.getItem(selected));
    setData(storedData);
    setDecryptedPrivateKey('');
    setError(''); // Clear error message when a new address is selected
    fetchBalance(selected); // Fetch balance when an address is selected
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleDecryptPrivateKey = () => {
    try {
      const hashedPassword = CryptoJS.SHA256(password).toString();
      const decryptedBytes = CryptoJS.AES.decrypt(data.privateKey, hashedPassword);
      const decryptedKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (decryptedKey) {
        setDecryptedPrivateKey(decryptedKey);
        setError(''); // Clear error message on successful decryption
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError('Failed to decrypt private key');
    }
  };

  const handleDeleteAddress = () => {
    if (selectedAddress) {
      localStorage.removeItem(selectedAddress);
      setAddresses(addresses.filter(address => address !== selectedAddress));
      setSelectedAddress('');
      setData(null);
      setDecryptedPrivateKey('');
      setError(''); // Clear error message after deletion
      setBalance(null); // Clear balance after deletion
    }
  };

  const fetchBalance = async (address) => {
    try {
      const response = await fetch(`${config.API_URL}/wallet/balance/${address}`);
      const result = await response.json();
      setBalance(result.balance);
    } catch (error) {
      console.log(error)
      setError('Failed to fetch balance');
    }
  };

  return (
    <div>
      <MenuBar />
      <h1>Address Manager</h1>
      <a href='wallet/add_address'>Add</a><br></br>
      <a href='wallet/create_address'>Create New</a>
      
      <div>
        <h2>Stored Addresses</h2>
        <select onChange={handleAddressSelect} value={selectedAddress}>
          <option value="">Select an address</option>
          {addresses.map(address => (
            <option key={address} value={address}>{address}</option>
          ))}
        </select>
        {selectedAddress && (
          <>
            <button onClick={handleDeleteAddress}>Delete Address</button>
            <a href={`/wallet/register?address=${selectedAddress}`}>
              <button>Go to SID Register</button>
            </a>
          </>
        )}
      </div>
      {data && selectedAddress && (
        <div>
          <p><strong>Address:</strong> {data.address}</p>
          <p><strong>Public Key:</strong> {data.publicKey}</p>
          {decryptedPrivateKey ? (
            <p><strong>Private Key:</strong> {decryptedPrivateKey}</p>
          ) : (
            <div>
              <input
                type="password"
                placeholder="Enter password to decrypt"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button onClick={handleDecryptPrivateKey}>Decrypt Private Key</button>
            </div>
          )}
          {balance !== null && (
            <p><strong>Balance:</strong> {balance}</p>
          )}
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ManageAddresses;
