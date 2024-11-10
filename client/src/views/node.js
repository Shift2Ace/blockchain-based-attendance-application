import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import MenuBar from './components/menu';
import config from './components/config.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Container from 'react-bootstrap/Container';
import './css/basic_style.css';
import Form from 'react-bootstrap/Form';
import { Card, Row, Col } from 'react-bootstrap';

const NodePage = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mining, setMining] = useState(false);
  const [data, setData] = useState(null);
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

  const handleAddressSelect = (e) => {
    const selected = e.target.value;
    setSelectedAddress(selected);
    const storedData = JSON.parse(localStorage.getItem(selected));
    setData(storedData);
  };

  useEffect(() => {
    return () => {
      // Cleanup function to stop mining when the component unmounts
      setMining(false);
      miningRef.current = false;
    };
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
        body: JSON.stringify({ address: data.address }),
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

  const toggleMining = (e) => {
    e.preventDefault();
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
      <Container className="marginTitle">
        <h2><span className="badge text-bg-secondary">Node Page</span></h2>
      </Container>
      <Container className="marginTitle">
        <Row>
          <Col>
            <Card style={{ width: '400px' }}>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <h4><span className="badge text-bg-light">Node Connect</span></h4>
                  <Form.Group className="mb-3">
                    <Form.Label>Host/IP:</Form.Label>
                    <Form.Control type="text" placeholder="(123.123.123.123) / (example.com)" id="host" value={host} onChange={(e) => setHost(e.target.value)} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Port:</Form.Label>
                    <Form.Control type="text" placeholder="(3000)" id="port" value={port} onChange={(e) => setPort(e.target.value)} required />
                  </Form.Group>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="submit" className="btn btn-primary">Connect</button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="marginRow">
          <Col>
            <Card style={{ width: '400px' }}>
              <Card.Body>
                <Form onSubmit={toggleMining}>
                  <h4><span className="badge text-bg-light">Mining</span></h4>
                  <Form.Group className="mb-3">
                    <select className="form-select" id="address" value={selectedAddress} onChange={handleAddressSelect} required>
                      <option value="">Select Address</option>
                      {addresses.map(address => (
                        <option key={address} value={address}>{address}</option>
                      ))}
                    </select>
                  </Form.Group>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button type='submit' className="btn btn-primary"> {mining ? 'Stop Mining' : 'Start Mining'}</button>
                    </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* <form onSubmit={handleSubmit}>
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
      </form> */}

      {/* <label htmlFor="address">Select Address:</label>
      <select
        id="address"
        value={selectedAddress}
        onChange={handleAddressSelect}
        required
      >
        <option value="">Select Address</option>
        {addresses.map(address => (
          <option key={address} value={address}>{address}</option>
        ))}
      </select>
      <button onClick={toggleMining}>
        {mining ? 'Stop Mining' : 'Start Mining'}
      </button> */}
      <ToastContainer />
    </div>
  );
};

export default NodePage;
