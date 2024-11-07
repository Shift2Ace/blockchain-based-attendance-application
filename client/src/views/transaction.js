import React, { useState, useEffect } from 'react';
import MenuBar from './components/menu';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';
import config from './components/config.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Transaction = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [password, setPassword] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [index, setIndex] = useState(() => Math.floor(Math.random() * 0xFFFFFFFF)); // Random 32-bit number
  const [timestamp, setTimestamp] = useState(() => Date.now()); // Current time
  const [isConfirming, setIsConfirming] = useState(false);

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

  const handleToAddressChange = (e) => {
    setToAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(parseInt(e.target.value, 10));
  };

  const handleConfirm = () => {
    setIsConfirming(true);
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!toAddress || !amount) {
      toast.error('To Address and Amount are required.');
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
          fromAddress: storedData.address,
          toAddress,
          amount
        };
        const msgHash = CryptoJS.SHA256(JSON.stringify(message)).toString();
        const signature = keyPair.sign(msgHash).toDER('hex');

        // Prepare the data to be sent
        const payload = {
          index,
          timestamp,
          fromAddress: storedData.address,
          toAddress,
          amount,
          signature,
          publicKey: storedData.publicKey
        };
        console.log(message)
        console.log(payload)

        // Send the data to the server
        const response = await fetch(`${config.API_URL}/wallet/transaction`, {
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

        toast.success('Transaction successful! Redirecting ...');
        setTimeout(() => {
          navigate('/wallet');
        }, 2000); // Redirect after 2 seconds
      } else {
        toast.error('Incorrect password');
      }
    } catch (err) {
        console.log(err)
      toast.error('Failed to decrypt private key or process transaction');
    }
  };

  return (
    <div>
      <MenuBar />
      <h1>Transaction Page</h1>
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
          <label>To Address:</label>
          <input
            type="text"
            value={toAddress}
            onChange={handleToAddressChange}
            required
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            required
          />
        </div>
        {isConfirming ? (
          <div>
            <p>Confirm the transaction details:</p>
            <p>To Address: {toAddress}</p>
            <p>Amount: {amount}</p>
            <button type="button" onClick={handleCancel}>Cancel</button>
            <button type="submit">Confirm</button>
          </div>
        ) : (
          <button type="button" onClick={handleConfirm}>Proceed</button>
        )}
      </form>
      <ToastContainer />
    </div>
  );
};

export default Transaction;
