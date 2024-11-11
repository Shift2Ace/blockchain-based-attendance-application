import React, { useState, useEffect } from 'react';
import MenuBar from './components/menu';
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';
import config from './components/config.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bs58 from 'bs58';

import Container from 'react-bootstrap/Container';
import './css/basic_style.css';
import Form from 'react-bootstrap/Form';
import { Modal, Card, Row, Col } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';


const AttendanceRegister = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [password, setPassword] = useState('');
  const [classCode, setClassCode] = useState('');
  const [index, setIndex] = useState(() => Math.floor(Math.random() * 0xFFFFFFFF)); // Random 32-bit number
  const [timestamp, setTimestamp] = useState(() => Date.now()); // Current time
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [generatedClassCode, setGeneratedClassCode] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);

  const [filterClassCode, setFilterClassCode] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');

  const [showModal, setShowModal] = useState(false);



  useEffect(() => {
    // Load addresses from localStorage and sort them
    const storedAddresses = Object.keys(localStorage)
      .filter(key => key.startsWith('address_'))
      .sort();
    setAddresses(storedAddresses);

    const fetchAttendanceData = async () => {
      try {
        const params = new URLSearchParams();
        if (filterClassCode) params.append('classCode', filterClassCode);
        if (filterAddress) params.append('address', filterAddress);
        if (filterDate) {
          const date = new Date(filterDate);
          let startTime = new Date(date.setHours(0, 0, 0, 0)).getTime();
          let endTime = new Date(date.setHours(23, 59, 59, 999)).getTime();
          if (filterStartTime) {
            startTime = new Date(`${filterDate}T${filterStartTime}:00`).getTime();
          }
          if (filterEndTime) {
            endTime = new Date(`${filterDate}T${filterEndTime}:00`).getTime();
          }
          params.append('startTime', startTime);
          params.append('endTime', endTime);
        }
        const response = await fetch(`${config.API_URL}/attendance?${params.toString()}`);
        const data = await response.json();
        setAttendanceData(data);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
    const intervalId = setInterval(fetchAttendanceData, 2000);
    return () => clearInterval(intervalId);
  }, [filterClassCode, filterAddress, filterDate, filterStartTime, filterEndTime]);



  const handleAddressSelect = (e) => {
    setSelectedAddress(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleClassCodeChange = (e) => {
    setClassCode(e.target.value);
  };

  const handleClassIdChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setClassId(value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const isValidClassCode = (classCode) => {
    const classCodePattern = /^[A-Za-z0-9]{10}$/;
    return classCodePattern.test(classCode);
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();

    if (!isValidClassCode(classCode)) {
      toast.error('Invalid Class Code. It must be 10 characters.');
      return;
    }

    try {
      if (!password) {
        toast.error('Invalid address and password');
        return;
      }
      const storedData = JSON.parse(localStorage.getItem(selectedAddress));
      const hashedPassword = CryptoJS.SHA256(password).toString();

      if (hashedPassword !== storedData.hashedPassword) {
        toast.error('Invalid address and password');
        return;
      }

      const decryptedBytes = CryptoJS.AES.decrypt(storedData.privateKey, hashedPassword);
      const decryptedKey = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (decryptedKey) {
        // Update index and timestamp
        setIndex(Math.floor(Math.random() * 0xFFFFFFFF));
        setTimestamp(Date.now());

        // Generate the signature using the private key
        const ec = new EC('secp256k1');
        const keyPair = ec.keyFromPrivate(decryptedKey, 'hex');

        // Create the message to be signed
        const message = {
          index,
          timestamp,
          address: storedData.address,
          classCode
        };
        const msgHash = CryptoJS.SHA256(JSON.stringify(message)).toString();
        const signature = keyPair.sign(msgHash).toDER('hex');

        // Prepare the data to be sent
        const payload = {
          index,
          timestamp,
          address: storedData.address,
          classCode,
          signature,
          publicKey: storedData.publicKey
        };

        // Send the data to the server
        const response = await fetch(`${config.API_URL}/attendance/add_new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          toast.error(errorMessage);
          return;
        }

        toast.success('Attendance registered successfully!');
      } else {
        toast.error('Invalid address and password');
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to decrypt private key or register attendance');
    }
    setClassCode("")
    setPassword("")
  };

  const handleGenerateClassCode = async (e) => {
    e.preventDefault();

    try {
      const storedData = JSON.parse(localStorage.getItem(selectedAddress));
      if (!password) {
        toast.error('Invalid address and password');
        return;
      }
      const hashedPassword = CryptoJS.SHA256(password).toString();

      if (hashedPassword !== storedData.hashedPassword) {
        toast.error('Invalid address and password');
        return;
      }

      const decryptedBytes = CryptoJS.AES.decrypt(storedData.privateKey, hashedPassword);
      const decryptedKey = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (decryptedKey) {
        // Generate the class code
        const classCodeData = `${classId}${date}${startTime}${decryptedKey}`;
        const classCodeHash = CryptoJS.SHA256(classCodeData).toString();
        const classCodeWordArray = CryptoJS.enc.Hex.parse(classCodeHash);
        const classCodeBytes = CryptoJS.lib.WordArray.create(classCodeWordArray.words.slice(0, 5)).toString(CryptoJS.enc.Hex);
        const classCodeUint8Array = new Uint8Array(classCodeBytes.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const classCodeBase58 = bs58.encode(classCodeUint8Array).slice(0, 10); // Ensure it's 10 characters

        setGeneratedClassCode(classCodeBase58);
        setShowModal(true);
      } else {
        toast.error('Incorrect password');
      }
    } catch (err) {
      toast.error('Failed to decrypt private key or generate class code');
    }
    setPassword("")
  };

  const handleFilterChange = (filterName) => {
    const { name, value } = filterName.target;
    switch (name) {
      case 'classCode':
        setFilterClassCode(value);
        break;
      case 'address':
        setFilterAddress(value);
        break;
      case 'date':
        setFilterDate(value);
        if (value === '') {
          setFilterStartTime('');
          setFilterEndTime('');
        }
        break;
      case 'startTime':
        setFilterStartTime(value);
        if (filterEndTime) {
          const date1 = new Date();
          const date2 = new Date();
          const [hours1, minutes1] = value.split(':').map(Number);
          const [hours2, minutes2] = filterEndTime.split(':').map(Number);
          date1.setHours(hours1, minutes1, 0, 0);
          date2.setHours(hours2, minutes2, 0, 0);
          if (date1 > date2) {
            setFilterStartTime(filterEndTime);
          }
        }
        break;
      case 'endTime':
        setFilterEndTime(value);
        if (filterStartTime) {
          const date1 = new Date();
          const date2 = new Date();
          const [hours1, minutes1] = value.split(':').map(Number);
          const [hours2, minutes2] = filterStartTime.split(':').map(Number);
          date1.setHours(hours1, minutes1, 0, 0);
          date2.setHours(hours2, minutes2, 0, 0);
          if (date1 < date2) {
            setFilterEndTime(filterStartTime);
          }
        }
        break;
      case 'filterClear':
        setFilterClassCode('');
        setFilterAddress('');
        setFilterDate('');
        setFilterEndTime('');
        setFilterStartTime('');
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <MenuBar />
      <Container className="marginTitle">
        <h2><span className="badge text-bg-secondary">Attendance</span></h2>
      </Container>
      <Container className="marginTitle">
        <Card>
          <Card.Body>
            {/* Address Login Section */}
            <div className="mb-4">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Address:</Form.Label>
                  <select className="form-select" onChange={handleAddressSelect} value={selectedAddress}>
                    <option value="" disabled>Select an address</option>
                    {addresses.map(address => (
                      <option key={address} value={address}>{address}</option>
                    ))}
                  </select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password:</Form.Label>
                  <Form.Control type="password" value={password} onChange={handlePasswordChange} required />
                </Form.Group>
              </Form>
            </div>

            <Accordion>

              <Accordion.Item eventKey="1">
                <Accordion.Header>Take Attendance</Accordion.Header>
                <Accordion.Body>
                  <Form onSubmit={handleAttendanceSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Control type="text" value={classCode} placeholder='Class Code' onChange={handleClassCodeChange} required />
                    </Form.Group>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>Generate Class Code</Accordion.Header>
                <Accordion.Body>
                  <Form onSubmit={handleGenerateClassCode}>
                    <Form.Group className="mb-3">
                      <Form.Label>Class ID:</Form.Label>
                      <Form.Control type="text" value={classId} onChange={handleClassIdChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Date:</Form.Label>
                      <Form.Control type="date" value={date} onChange={handleDateChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time:</Form.Label>
                      <Form.Control type="time" value={startTime} onChange={handleStartTimeChange} required />
                    </Form.Group>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button type="submit" className="btn btn-primary">Generate Class Code</button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>Attendance Records</Accordion.Header>
                <Accordion.Body>
                  <Form>
                    <Form.Group as={Row} className="mb-3">
                      <Col>
                        <Form.Control
                          name="address"
                          placeholder="Address / SID"
                          type="text"
                          value={filterAddress}
                          onChange={handleFilterChange}
                        />
                      </Col>
                    </Form.Group>
                    <Row>
                      <Col sm="6">
                        <Form.Group className="mb-3">
                          <Form.Control
                            name="classCode"
                            placeholder="Class Code"
                            type="text"
                            value={filterClassCode}
                            onChange={handleFilterChange}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Control
                            name="date"
                            type="date"
                            value={filterDate}
                            onChange={handleFilterChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col sm="6">
                        <Form.Group className="mb-3">
                          <Form.Control
                            name="startTime"
                            type="time"
                            value={filterStartTime}
                            onChange={handleFilterChange}
                            disabled={!filterDate}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Control
                            name="endTime"
                            type="time"
                            value={filterEndTime}
                            onChange={handleFilterChange}
                            disabled={!filterDate}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        name="filterClear"
                        onClick={handleFilterChange}
                        className="btn btn-secondary"
                        type="button"
                      >
                        Clear
                      </button>
                    </div>
                  </Form>
                  <hr />
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ whiteSpace: 'nowrap' }}>
                      <thead>
                        <tr>
                          <th>Address</th>
                          <th>SID</th>
                          <th>Class Code</th>
                          <th>Date</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceData.map((record, index) => (
                          <tr key={index}>
                            <td>{record.address}</td>
                            <td>{record.sid}</td>
                            <td>{record.classCode}</td>
                            <td>{new Date(record.dateTime).toLocaleDateString()}</td>
                            <td>{new Date(record.dateTime).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Accordion.Body>
              </Accordion.Item>


            </Accordion>
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Class Code</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ textAlign: 'center' }}>
                <h3>{generatedClassCode}</h3>
              </Modal.Body>
          </Modal>
          </Card.Body>
        </Card>
      </Container>
      <ToastContainer />
    </div>
  );
};

export default AttendanceRegister;