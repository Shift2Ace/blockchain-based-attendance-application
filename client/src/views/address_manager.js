import React, { useState, useEffect } from 'react';
import MenuBar from './components/menu';
import CryptoJS from 'crypto-js';
import config from './components/config.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [data, setData] = useState(null);
  const [password, setPassword] = useState('');
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState('');
  const [balance, setBalance] = useState(null);
  const [preTransaction, setPreTransaction] = useState(null);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    const storedAddresses = Object.keys(localStorage)
      .filter(key => key.startsWith('address_'))
      .sort();
    setAddresses(storedAddresses);
  }, []);

  const handleAddressSelect = (e) => {
    const selected = e.target.value;
    setSelectedAddress(selected);
  
    if (selected === "") {
      setData(null);
      setDecryptedPrivateKey('');
      setBalance(null);
      setPreTransaction(null);
      setTotal(null);
    } else {
      const storedData = JSON.parse(localStorage.getItem(selected));
      setData(storedData);
      setDecryptedPrivateKey('');
      fetchBalance(storedData.address);
    }
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
        toast.success('Private key decrypted successfully!');
      } else {
        toast.error('Incorrect password');
      }
    } catch (err) {
      toast.error('Failed to decrypt private key');
    }
  };

  const handleDeleteAddress = () => {
    if (selectedAddress) {
      localStorage.removeItem(selectedAddress);
      setAddresses(addresses.filter(address => address !== selectedAddress));
      setSelectedAddress('');
      setData(null);
      setDecryptedPrivateKey('');
      setBalance(null);
      setPreTransaction(null);
      setTotal(null);
      toast.success('Address deleted successfully!');
    }
  };

  const fetchBalance = async (address) => {
    try {
      const response = await fetch(`${config.API_URL}/wallet/balance/${address}`);
      const result = await response.json();
      setBalance(result.balance);
      setPreTransaction(result.preTransaction);
      setTotal(result.balance + result.preTransaction);
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch balance');
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
              <button>SID Register</button>
            </a>
            <a href={`/wallet/transaction?address=${selectedAddress}`}>
              <button>Transaction</button>
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
          {balance !== null && preTransaction !== null && (
            <>
              <p><strong>Balance:</strong> {balance}</p>
              <p><strong>Pre-Transaction:</strong> {preTransaction}</p>
              <p><strong>Total:</strong> {total}</p>
            </>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ManageAddresses;
