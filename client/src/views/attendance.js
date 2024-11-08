import React, { useState, useEffect } from 'react';
import MenuBar from './components/menu';
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';
import config from './components/config.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bs58 from 'bs58';

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidClassCode(classCode)) {
      toast.error('Invalid Class Code. It must be 10 characters.');
      return;
    }

    try {
      if (!password){
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
  };

  const handleGenerateClassCode = async (e) => {
    e.preventDefault();
  
    try {
      const storedData = JSON.parse(localStorage.getItem(selectedAddress));
      if (!password){
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
      } else {
        toast.error('Incorrect password');
      }
    } catch (err) {
      toast.error('Failed to decrypt private key or generate class code');
    }
  };
  
  return (
    <div>
      <MenuBar />
      
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
      <h1>Attendance</h1>  
      <form onSubmit={handleSubmit}>
        <div>
          <label>Class Code:</label>
          <input
            type="text"
            value={classCode}
            onChange={handleClassCodeChange}
            required
          />
        </div>
        <button type="submit">Register Attendance</button>
      </form>

      <h2>Generate Class Code</h2>
      <form onSubmit={handleGenerateClassCode}>
        <div>
          <label>Class ID:</label>
          <input
            type="text"
            value={classId}
            onChange={handleClassIdChange}
            required
          />
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            required
          />
        </div>
        <div>
          <label>Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={handleStartTimeChange}
            required
          />
        </div>
        <button type="submit">Generate Class Code</button>
      </form>
      {generatedClassCode && (
        <div>
          <h3>Generated Class Code:</h3>
          <p>{generatedClassCode}</p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AttendanceRegister;
