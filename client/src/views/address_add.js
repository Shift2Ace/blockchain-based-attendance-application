import React, { useState } from 'react';
import MenuBar from './components/menu';
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';
import bs58 from 'bs58';
import zxcvbn from 'zxcvbn';


import Container from 'react-bootstrap/Container';
import './css/basic_style.css';
import Form from 'react-bootstrap/Form';
import { Card} from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Buffer } = require('buffer');

const SaveKeys = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);

  const isValidPrivateKey = (key) => {
    // Check if the key is a 32-byte hexadecimal string
    return /^[0-9a-fA-F]{64}$/.test(key);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    const score = zxcvbn(pwd).score;
    setPasswordStrength(getPasswordStrengthWord(score));
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

  const handleSaveKeys = (e) => {
    e.preventDefault();

    if (!isValidPrivateKey(privateKey)) {
      toast.error('Invalid private key');
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
      toast.success('Keys saved successfully!');
      toast.success(`Keys saved as ${addressKey}`);
      setPrivateKey('');
      setPassword('');
      setName('');
    } catch (err) {
      toast.error('Failed to save keys');
    }
  };

  return (
    <div>
      <MenuBar />
      <Container className="marginTitle">
        <h2><span className="badge text-bg-secondary">Add Address</span></h2>
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
                  onChange={handlePasswordChange}
                  required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password strength:</Form.Label> {passwordStrength !== null && passwordStrength}
              </Form.Group>
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" className="btn btn-primary">Save Keys</button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      <ToastContainer />
    </div>
  );
};

export default SaveKeys;
