import React, { useState } from 'react';
import MenuBar from './components/menu';
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';
import bs58 from 'bs58';

import Container from 'react-bootstrap/Container';
import './css/basic_style.css';
import Form from 'react-bootstrap/Form';
import { Card, Row, Col } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';

const { Buffer } = require('buffer');

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

      const sha256Hash = CryptoJS.SHA256(publicKey).toString();
      const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();
      const ripemd160Hash_bytes = Buffer.from(ripemd160Hash, 'hex');
      const address = bs58.encode(ripemd160Hash_bytes);

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
      <Container className="marginTitle">
        <h2><span class="badge text-bg-secondary">Add Address</span></h2>
      </Container>
      <Container className="marginTitle">
        <Card style={{ width: '400px' }}>
          <Card.Body>
            <Form onSubmit={handleSaveKeys}>
              <Form.Group className="mb-3">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Private Key:</Form.Label>
                <Form.Control
                  type="text"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  requiredd />
              </Form.Group>
              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" class="btn btn-primary">Save Keys</button>
              </div>
            </Form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && (
              <div>
                <p style={{ color: 'green' }}>{success}</p>
                <p><strong>Data saved in:</strong> {savedAddress}</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* <h1>Add Address</h1>
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
      </form> */}
    </div>
  );
};

export default SaveKeys;
