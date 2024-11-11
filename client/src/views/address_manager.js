import React, { useState, useEffect } from 'react';
import MenuBar from './components/menu';
import CryptoJS from 'crypto-js';
import config from './components/config.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Container from 'react-bootstrap/Container';
import './css/basic_style.css';
import Form from 'react-bootstrap/Form';
import { Card, Row, Col, Button, ButtonGroup } from 'react-bootstrap';

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [data, setData] = useState(null);
  const [password, setPassword] = useState('');
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState('');
  const [balance, setBalance] = useState(null);
  const [preTransaction, setPreTransaction] = useState(null);
  const [total, setTotal] = useState(null);
  const [sid, setSid] = useState(null);

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
      setSid(null); // Reset SID when no address is selected
    } else {
      const storedData = JSON.parse(localStorage.getItem(selected));
      setData(storedData);
      setDecryptedPrivateKey('');
      fetchBalance(storedData.address);
      fetchSid(storedData.address); // Fetch SID for the selected address
    }
  };


  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleDecryptPrivateKey = (e) => {
    e.preventDefault();
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
    setPassword("")
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

  const fetchSid = async (address) => {
    try {
      const response = await fetch(`${config.API_URL}/wallet/sid/${address}`);
      const result = await response.json();
      if (result.sid) {
        setSid(result.sid);
      } else {
        setSid("Not Registered Yet");
      }

    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch SID');
    }
  };


  return (
    <div>
      <MenuBar />
      <Container className="marginTitle">
        <h2><span className="badge text-bg-secondary">Wallet</span></h2>
      </Container>

      <Container className="marginTitle">
        <Card>
          <Card.Body>
            <h4><span className="badge text-bg-light">Address Manager</span></h4>
            <hr />
            <ButtonGroup className="d-inline-flex gap-1">
              <Button href="wallet/add_address" variant="primary">Add Address</Button>
              <Button href="wallet/create_address" variant="primary">Create New</Button>
            </ButtonGroup>
          </Card.Body>
        </Card>
      </Container>

      <Container className="marginTitle">
        <Card className="w-100">
          <Card.Body>
            <h4><span className="badge text-bg-light">Stored Addresses</span></h4>
            <hr />
            <Form onSubmit={handleDecryptPrivateKey}>
              <Form.Group as={Row} className="mb-3">
                <Col sm="12">
                  <Form.Control as="select" onChange={handleAddressSelect} value={selectedAddress}>
                    <option value="">Select an address</option>
                    {addresses.map(address => (
                      <option key={address} value={address}>{address}</option>
                    ))}
                  </Form.Control>
                  {selectedAddress && (
                    <ButtonGroup className="mt-2 d-flex justify-content-between gap-1">
                      <Button href={`/wallet/register?address=${selectedAddress}`} variant="secondary">SID Register</Button>
                      <Button href={`/wallet/transaction?address=${selectedAddress}`} variant="secondary">Transaction</Button>
                      <Button variant="danger" onClick={handleDeleteAddress}>Delete</Button>
                    </ButtonGroup>
                  )}
                  {data && selectedAddress && (
                    <div className="mt-3">
                      <p><strong>Address:</strong> {data.address}</p>
                      <p><strong>Student ID:</strong> {sid}</p>
                      <p><strong>Public Key:</strong> {data.publicKey}</p>
                      {decryptedPrivateKey ? (
                        <p><strong>Private Key:</strong> {decryptedPrivateKey}</p>
                      ) : (
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="password"
                            placeholder="Enter password to decrypt"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                          />
                          <Button type="submit" className="ms-2" style={{ width: '300px' }}>Decrypt Private Key</Button>
                        </div>
                      )}
                      <hr />
                      {balance !== null && preTransaction !== null && (
                        <>
                          <p><strong>Balance:</strong> {balance}</p>
                          <p><strong>Pre-Transaction:</strong> {preTransaction}</p>
                          <p><strong>Total:</strong> {total}</p>
                        </>
                      )}
                    </div>
                  )}
                </Col>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      <ToastContainer />
    </div>
  );
};

export default ManageAddresses;
