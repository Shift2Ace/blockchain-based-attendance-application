import React, { useState, useEffect } from 'react';
import MenuBar from './components/menu';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';
import config from './components/config.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SidRegister = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [password, setPassword] = useState('');
  const [sid, setSid] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load addresses from localStorage and sort them
    const storedAddresses = Object.keys(localStorage)
      .filter(key => key.startsWith('address_'))
      .sort();
    setAddresses(storedAddresses);

    // Get the default address from the URL
    const params = new URLSearchParams(location.search);
    const defaultAddress = params.get('address');
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [location]);

  const handleAddressSelect = (e) => {
    setSelectedAddress(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSidChange = (e) => {
    setSid(e.target.value);
  };

  const isValidSid = (sid) => {
    const sidPattern = /^[0-9]{8}$/;
    return sidPattern.test(sid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidSid(sid)) {
      toast.error('Invalid SID. It must be 8 digits.');
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
        // Generate the signature using the private key
        const ec = new EC('secp256k1');
        const keyPair = ec.keyFromPrivate(decryptedKey, 'hex');
        const msgHash = CryptoJS.SHA256(sid).toString();
        const signature = keyPair.sign(msgHash).toDER('hex');

        // Prepare the data to be sent
        const payload = {
          publicKey: storedData.publicKey,
          address: storedData.address,
          signature,
          sid,
        };

        // Send the data to the server
        const response = await fetch(`${config.API_URL}/wallet/sid_register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to register SID');
        }

        toast.success('SID registered successfully! Redirecting after 6 seconds');
        setTimeout(() => {
          navigate('/wallet');
        }, 6000); // Redirect after 2 seconds
      } else {
        toast.error('Incorrect password');
      }
    } catch (err) {
      toast.error('Failed to decrypt private key or register SID');
    }
  };

  return (
    <div>
      <MenuBar />
      <h1>SID Register Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Address:</label>
          <select onChange={handleAddressSelect} value={selectedAddress}>
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
          <label>SID:</label>
          <input
            type="text"
            value={sid}
            onChange={handleSidChange}
            required
          />
        </div>
        <button type="submit">Register SID</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default SidRegister;
