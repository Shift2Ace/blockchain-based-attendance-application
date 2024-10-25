import React, { useState, useEffect } from 'react';
import MenuBar from './components/menu';
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';
import config from './components/config.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttendanceRegister = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [password, setPassword] = useState('');
  const [classId, setClassId] = useState('');
  const [index, setIndex] = useState(() => Math.floor(Math.random() * 0xFFFFFFFF)); // Random 32-bit number
  const [timestamp, setTimestamp] = useState(() => Date.now()); // Current time



  useEffect(() => {
    // Load addresses from localStorage and sort them
    const storedAddresses = Object.keys(localStorage)
      .filter(key => key.startsWith('address_'))
      .sort();
    setAddresses(storedAddresses);
  }, []);

  const handleAddressSelect = (e) => {
    setSelectedAddress(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleClassIdChange = (e) => {
    setClassId(e.target.value);
  };

  const isValidClassId = (classId) => {
    const classIdPattern = /^[A-Za-z0-9]{10}$/;
    return classIdPattern.test(classId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidClassId(classId)) {
      toast.error('Invalid Class ID. It must be 10 characters.');
      return;
    }

    try {
      const storedData = JSON.parse(localStorage.getItem(selectedAddress));
      const hashedPassword = CryptoJS.SHA256(password).toString();

      if (hashedPassword !== storedData.hashedPassword) {
        toast.error('Incorrect password');
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
          classId
        };
        const msgHash = CryptoJS.SHA256(JSON.stringify(message)).toString();
        const signature = keyPair.sign(msgHash).toDER('hex');

        // Prepare the data to be sent
        const payload = {
          index,
          timestamp,
          address: storedData.address,
          classId,
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
        toast.error('Incorrect password');
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to decrypt private key or register attendance');
    }
  };

  return (
    <div>
      <MenuBar />
      <h1>Attendance</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Address:</label>
          <select onChange={handleAddressSelect} value={selectedAddress}>
            <option value="" disabled>Select an address</option>
            {addresses.map(address => (
              <option key={address} value={address}>{address}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div>
          <label>Class ID:</label>
          <input
            type="text"
            value={classId}
            onChange={handleClassIdChange}
            required
          />
        </div>
        <button type="submit">Register Attendance</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AttendanceRegister;
