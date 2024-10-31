import React, { useState } from 'react';
import MenuBar from './components/menu';
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';

const SaveKeys = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savedAddress, setSavedAddress] = useState('');

  const isValidPrivateKey = (key) => {
    // Check if the key is a 32-byte hexadecimal string
    return /^[0-9a-fA-F]{64}$/.test(key);
  };

  const handleSaveKeys = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidPrivateKey(privateKey)) {
      setError('Invalid private key. It must be a 32-byte hexadecimal string.');
      return;
    }

    try {
      // Derive public key and address from private key
      const ec = new EC('secp256k1');
      const keyPair = ec.keyFromPrivate(privateKey, 'hex');
      const publicKey = keyPair.getPublic('hex');

      // Hash the public key with SHA-256
      const sha256Hash = CryptoJS.SHA256(publicKey).toString();
      // Hash the result with RIPEMD-160
      const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();

      const address = ripemd160Hash;

      // Hash the password
      const hashedPassword = CryptoJS.SHA256(password).toString();
      // Encrypt the private key with the hashed password
      const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, hashedPassword).toString();

      const encryptedData = { privateKey: encryptedPrivateKey, publicKey, address, hashedPassword };
      const addressCount = Object.keys(localStorage).filter(key => key.startsWith(`address_${name}_`)).length + 1;
      const addressKey = `address_${name}_${addressCount}`;
      localStorage.setItem(addressKey, JSON.stringify(encryptedData));
      setSavedAddress(addressKey);
      setSuccess('Keys saved successfully!');
    } catch (err) {
      setError('Failed to save keys');
    }
  };

  return (
    <div>
      <MenuBar />
      <h1>Add Address</h1>
      <form onSubmit={handleSaveKeys}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Private Key:</label>
          <input
            type="text"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Save Keys</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && (
        <div>
          <p style={{ color: 'green' }}>{success}</p>
          <p><strong>Data saved in:</strong> {savedAddress}</p>
        </div>
      )}
    </div>
  );
};

export default SaveKeys;
