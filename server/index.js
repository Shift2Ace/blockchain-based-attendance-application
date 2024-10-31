const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const server_port = 5000;
const R = require('ramda');


const fileManger = require('./lib/file_manager');
const nodeManager = require('./lib/node/node_manager');
const validator = require('./lib/validator')
const blockchainManager = require('./lib/blockchain');
const { register } = require('module');

app.use(express.json());

// allow access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept');
  res.header("Access-Control-Expose-Headers", "X-RateLimit-Limit");
  next()
});

// Check and create the first block if blockchain.json is empty
fs.readFile('data/blockchain.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading blockchain file:', err);
    return;
  }
  const blockchain = JSON.parse(data || '[]');
  if (blockchain.length === 0) {
    const firstBlock = blockchainManager.createFirstBlock;
    blockchain.push(firstBlock);
    fs.writeFile('data/blockchain.json', JSON.stringify(blockchain, null, 2), (err) => {
      if (err) {
        console.error('Error writing blockchain file:', err);
      } else {
        console.log('First block created and saved.');
      }
    });
  }
});

const allowed_url = ['http://localhost:3000/', 'http://192.168.1.75:3000/'];

// Only can post through the allowed host
const allowed_url_limiter = (req, res, next) => {
  const referer = req.get('Referer');
  console.log(referer)
  if (allowed_url.includes(referer)) {
    next();
  } else {
    res.status(403).send('Access forbidden: your IP is not allowed');
  }
};

// Only can post through the localhost
const localhost_limiter = (req, res, next) => {
  const referer = req.get('Referer');
  console.log(referer)
  if (referer == 'http://localhost:3000/')  {
    next();
  } else {
    res.status(403).send('Access forbidden: your IP is not allowed');
  }
};

// upload name and email to data/test.json
app.post('/api/test',allowed_url_limiter, (req, res) => {
  // get data
  const data = req.body;
  // show data
  console.log('Received data:', data);
  // get json file
  fs.readFile('data/test.json', 'utf8', (err, jsonString) => {
    if (err) {
      console.log('File read failed:', err);
      return res.status(500).send('Internal Server Error');s
    }
    const jsonData = JSON.parse(jsonString || '[]');
    // push data
    jsonData.push(data);
    // save file
    fs.writeFile('data/test.json', JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.log('Error writing file:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.status(200).send('Data saved successfully');
    });
  });
});

// index page of server / get the server_status.json
app.get('/', (req, res) => {
  fs.readFile('./data/server_status.json', 'utf8', (err, data) => {
      if (err) {
          res.status(500).json({ error: 'Error reading file' });
          return;
      }
      try {
          const jsonData = JSON.parse(data);
          res.json(jsonData);
      } catch (parseErr) {
          res.status(500).json({ error: 'Error parsing JSON' });
      }
  });
});

// join into other node
app.post('/node/connect_new',localhost_limiter, (req, res) => {
  const data = req.body;
  const { host, port } = data;
  const url = `http://${host}:${port}`;
  var my_url;
  console.log('Connect new network:', url);
  // Read the JSON file
  fs.readFile('./data/server_status.json', 'utf8', (err, jsonData) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    try {
      const serverStatus = JSON.parse(jsonData);
      const { host_name, server_port } = serverStatus;
      my_url = `http://${host_name}:${server_port}`;


      // You can now use my_url as needed
      res.send({ status: 'success', my_url });
    } catch (parseErr) {
      console.error('Error parsing JSON data:', parseErr);
      res.status(500).send('Internal Server Error');
    }
    

    //get the new blockchain and other
    //...
    //get the node network id
    //...
    //get the list of node
    //...
    //send the url to the node
    console.log('Send my url:', my_url);
    //...
  });
});

// add new url to the list of node
app.post('/node/add_new', (req, res) => {
  const { host, port } = req.body;
  nodeManager.addNode(host, port, (err, url) => {
    if (err) {
      res.status(500).send('Internal Server Error');
      return;
    }
    res.send({ status: 'success', node: url });
  });
});

// register SID
app.post('/wallet/sid_register', (req, res) => {
  const { index, timestamp, address, sid, signature, publicKey } = req.body;
  data = {
    index:index,
    timestamp:timestamp,
    address:address,
    sid:sid
  }

  if (!validator.verifyAddress(publicKey, address)) {
    console.log('Address does not match public key');
    return res.status(400).send('Address does not match public key');
  } 
  
  if (!validator.verifySignature(publicKey, data, signature)) {
    console.log('Invalid signature');
    return res.status(400).send('Invalid signature');
  }

  dataToSave = {
    type:"sid_register",
    ... req.body
  }

  // Save data to application.json
  const filePath = './data/application.json';
  fileManger.checkAndSaveData(dataToSave, filePath, (err, isDuplicate) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (isDuplicate) {
      return res.status(400).send('Duplicate record with same SID and address');
    }

    res.status(200).send('SID registered successfully');
  });
});

app.post('/blockchain/mine', (req, res) => {
  let block = null;

  while (!block) {
    let blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
    var index = blockchainData.length;
    var pre_hash = blockchainData[blockchainData.length - 1].header.hash;
    // mine the block
    block = blockchainManager.createNewBlock(index, pre_hash, [], "test", 15);
  }

  let blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
  blockchainData.push(block);
  fs.writeFileSync('data/blockchain.json', JSON.stringify(blockchainData, null, 2));
  res.status(200).json({ message: 'Block mined successfully', block: block });
});

// attendance
app.post('/attendance/add_new', (req, res) => {
  const { index, timestamp, address, classId, signature, publicKey } = req.body;
  data = {
    index:index,
    timestamp:timestamp,
    address:address,
    classId:classId
  }

  if (!validator.verifyAddress(publicKey, address)) {
    console.log('Address does not match public key');
    return res.status(400).send('Address does not match public key');
  } 
  
  if (!validator.verifySignature(publicKey, data, signature)) {
    console.log('Invalid signature');
    return res.status(400).send('Invalid signature');
  }

  dataToSave = {
    type:"attendance",
    ... req.body
  }

  // Save data to application.json
  const filePath = './data/application.json';
  fileManger.checkAndSaveData(dataToSave, filePath, (err, isDuplicate) => {
    if (err) {
      return res.status(500).send(err);
    }

    if (isDuplicate) {
      return res.status(400).send('Duplicate record with same SID and address');
    }

    res.status(200).send('SID registered successfully');
  });
});

app.listen(server_port, () => {
  console.log(`Server running on http://localhost:${server_port}`);
});
