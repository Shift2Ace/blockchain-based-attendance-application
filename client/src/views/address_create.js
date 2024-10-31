import React, { useState } from 'react';
import MenuBar from './components/menu';
import zxcvbn from 'zxcvbn';
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bs58 from 'bs58';
const { Buffer } = require('buffer');


const Wallet = () => { 
  const [data, setData] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [name, setName] = useState('');

  // Function to generate keys and address
  const generateKeysAndAddress = () => {
    const ec = new EC('secp256k1');
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate('hex');
    const publicKey = keyPair.getPublic('hex');

    const sha256Hash = CryptoJS.SHA256(publicKey).toString();
    const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();
    const ripemd160Hash_bytes = Buffer.from(ripemd160Hash, 'hex');
    const address = bs58.encode(ripemd160Hash_bytes);
    return { privateKey, publicKey, address };
  };

  // Function to handle address creation
  const handleCreateAddress = (e) => {
    e.preventDefault();
    try {
      const newData = generateKeysAndAddress();
      // hash password
      const hashedPassword = CryptoJS.SHA256(password).toString();
      // encrypt (AES256 CBC PKCS7) private key with hashed password
      const encryptedPrivateKey = CryptoJS.AES.encrypt(newData.privateKey, hashedPassword).toString();

      const encryptedData = { ...newData, privateKey: encryptedPrivateKey, hashedPassword };
      setData({ ...newData, hashedPassword });
      const addressCount = Object.keys(localStorage).filter(key => key.startsWith(`address_${name}_`)).length + 1;
      localStorage.setItem(`address_${name}_${addressCount}`, JSON.stringify(encryptedData));
      toast.success('Address created successfully!');
    } catch (err) {
      toast.error('Failed to create address');
    }
  };

  const getPasswordStrengthWord = (score) => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return 'Unknown';
    }
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    const score = zxcvbn(pwd).score;
    setPasswordStrength(getPasswordStrengthWord(score));
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  return (
    <div>
      <MenuBar />
      <h1>Create Address</h1>
      <form onSubmit={handleCreateAddress}>
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={handleNameChange}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        <div>
          Password strength: {passwordStrength !== null && passwordStrength}
        </div>
        <button type="submit">Create Address</button>
      </form>
      {data && (
        <div>
          <p><strong>Private Key:</strong> {data.privateKey}</p>
          <p><strong>Public Key:</strong> {data.publicKey}</p>
          <p><strong>Address:</strong> {data.address}</p>
          <p><strong>Hashed Password:</strong> {data.hashedPassword}</p>
          <p><strong>Data saved in:</strong> {`address_${name}_${Object.keys(localStorage).filter(key => key.startsWith(`address_${name}_`)).length}`}</p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Wallet;
