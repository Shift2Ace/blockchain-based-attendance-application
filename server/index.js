const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const server_port = 5000;
const R = require('ramda');


const fileManger = require('./lib/file_manager');
const nodeManager = require('./lib/node_manager');
const validator = require('./lib/validator')
const blockchainManager = require('./lib/blockchain');
const walletManager = require('./lib/wallet')
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
    const firstBlock = blockchainManager.createFirstBlock();
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
  if (referer == 'http://localhost:3000/') {
    next();
  } else {
    res.status(403).send('Access forbidden: your IP is not allowed');
  }
};

// upload name and email to data/test.json
app.post('/api/test', allowed_url_limiter, (req, res) => {
  // get data
  const data = req.body;
  // show data
  console.log('Received data:', data);
  // get json file
  fs.readFile('data/test.json', 'utf8', (err, jsonString) => {
    if (err) {
      console.log('File read failed:', err);
      return res.status(500).send('Internal Server Error'); s
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
app.post('/node/connect_new', localhost_limiter, (req, res) => {
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

      //get blockchain from the node
      fetch(`${url}/api/blockchain`)
        .then(response => response.json())
        .then(remoteBlockchain => {
          //choose the blockchain by longest-chain rule
          const localBlockchain = JSON.parse(fs.readFileSync('./data/blockchain.json', 'utf8'));
          //finish the longest rule alg...
          //local blockchain => localBlockchain
          //blockchain from the node => remoteBlockchain
          //you may use the updatedBlockchain for the final bc
          let updatedBlockchain = null;
          fs.writeFileSync('./data/blockchain.json', JSON.stringify(updatedBlockchain, null, 2));
          //if local blockchain win, change the targe node's blockchain 
          if (updatedBlockchain == localBlockchain){
            fetch(`${url}/api/acceptblockchain`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(updatedBlockchain)
            })
              .then(response => {
                console.log(`statusCode: ${response.status}`);
                return response.text();
              })
              .then(data => {
                console.log(data);
              })
              .catch(error => {
                console.error(error);
              })
          }
          //get the node list from the new node
          fetch(`${url}/api/nodes`)
            .then(response =>response.json())
            .then(remoteNodes => {
              const localNodes = JSON.parse(fs.readFileSync('./data/node_list.json', 'utf8') || '[]');
              const updatedNodes = R.uniqBy(n => n.url, [...localNodes, { url }, ...remoteNodes]);

              fs.writeFileSync('./data/node_list.json', JSON.stringify(updatedNodes, null, 2));


              //send this url to the node
              fetch(`${url}/node/add_new`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({host: host_name, port: server_port, url:my_url})
              })
                .then(() => {
                  console.log('Successfully connected to the new node');
                  res.send({ status: 'success', my_url });
                })
                .catch(err => {
                  console.error('Error connecting to the new node:', err);
                  res.status(500).send('Failed to connect to the new node.');
                  return;
                });
            })
            .catch(err => {
              console.error('Error fetching nodes from the new node:', err);
              res.status(500).send('Failed to fetch node data.');
              return;
            });
        })
        .catch(err => {
          console.error('Error fetching blockchain from the new node:', err);
          res.status(500).send('Failed to fetch blockchain data.');
          return;
        })
    } catch (parseErr) {
      console.error('Error parsing JSON data:', parseErr);
      res.status(500).send('Internal Server Error');
    }


    //get the new blockchain and other -> done
    //get the list of node  -> done
    //send the url to the node -> done
  });
});

//response the blockchain
app.get('/api/blockchain', (req, res) => {
  const blockchainData = JSON.parse(fs.readFileSync('./data/blockchain.json', 'utf8'));
  res.json(blockchainData);
});

//response the node data
app.get('/api/nodes', (req, res) => {
  const nodeList = JSON.parse(fs.readFileSync('./data/node_list.json', 'utf8'));
  res.json(nodeList);
});

//change the local blockchain to node's bc
app.post('/api/acceptblockchain', (req, res) => {
  const updatedBlockchain = req.body;
  fs.writeFileSync('./data/blockchain.json', JSON.stringify(updatedBlockchain, null, 2));
  res.status(200).json({message: 'Blockchain changed successfully'})
})

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
  let blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
  let applicationData = JSON.parse(fs.readFileSync('data/application.json', 'utf8'));
  const { index, timestamp, address, sid, signature, publicKey } = req.body;
  data = {
    index: index,
    timestamp: timestamp,
    address: address,
    sid: sid
  }

  if (!validator.verifyAddress(publicKey, address)) {
    return res.status(400).send('Address does not match public key');
  }

  if (!validator.verifySignature(publicKey, data, signature)) {
    return res.status(400).send('Invalid signature');
  }

  if (!validator.duplicateChecker(blockchainData, applicationData, index, signature)) {
    return res.status(400).send('Record duplicated');
  }

  if (!validator.replayChecker(applicationData, data)) {
    return res.status(400).send('Operation limit (Ten seconds)');
  }

  dataToSave = {
    type: "sid_register",
    ...req.body
  }

  // Save data to application.json
  fileManger.saveData(dataToSave, './data/application.json').then(success => {
    if (success) {
      return res.status(200).send('successfully');
    } else {
      return res.status(500).send(err);
    }
  });
});

// transaction
app.post('/wallet/transaction', (req, res) => {
  let blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
  let applicationData = JSON.parse(fs.readFileSync('data/application.json', 'utf8'));
  const { index, timestamp, fromAddress, toAddress, amount, signature, publicKey } = req.body;
  // duplicate check

  if (!validator.duplicateChecker(blockchainData, applicationData, index, signature)) {
    return res.status(400).send('Record duplicated');
  }

  // address check with public key
  if (!validator.verifyAddress(publicKey, fromAddress)) {
    return res.status(400).send('Address does not match public key');
  }

  // amount check with balance and pre transaction
  if (!validator.balanceChecker(blockchainData, applicationData, amount, fromAddress) || amount <= 0) {
    return res.status(400).send('Invalid Amount');
  }

  if (!validator.bs58AddressChecker(toAddress) || fromAddress == toAddress) {
    return res.status(400).send('Invalid Address');
  }

  data = {
    index: index,
    timestamp: timestamp,
    fromAddress: fromAddress,
    toAddress: toAddress,
    amount: amount
  }

  // signature check
  if (!validator.verifySignature(publicKey, data, signature)) {
    return res.status(400).send('Invalid signature');
  }

  // limit operation 
  if (!validator.replayChecker(applicationData, data)) {
    return res.status(400).send('Operation limit (Ten seconds)');
  }

  dataToSave = {
    type: "transaction",
    ...req.body
  }

  fileManger.saveData(dataToSave, './data/application.json').then(success => {
    if (success) {
      return res.status(200).send('successfully');
    } else {
      return res.status(500).send(err);
    }
  });
});

// get balance by address
app.get('/wallet/balance/:address', (req, res) => {
  const address = req.params.address;
  const blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
  let applicationData = JSON.parse(fs.readFileSync('data/application.json', 'utf8'));

  try {
    const balance = walletManager.getBalance(blockchainData, address);
    const preTransaction = walletManager.getPendingTransaction(applicationData, address)
    res.json({ balance, preTransaction });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the balance.' });
  }
});

// get sid by address
app.get('/wallet/sid/:address', (req, res) => {
  const address = req.params.address;
  const blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
  const sid = walletManager.getSid(blockchainData, address);
  res.json({ address, sid });
});

// mine the block
app.post('/blockchain/mine', localhost_limiter, (req, res) => {
  const address = req.body.address;
  let block = null;
  const startTime = Date.now();
  let recordsToUse = [];
  while (!block && (Date.now() - startTime < 6000)) {
    let blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
    let applicationData = JSON.parse(fs.readFileSync('data/application.json', 'utf8'));
    recordsToUse = applicationData.slice(0, 8); // Use up to 8 records
    var index = blockchainData.length;
    block = blockchainManager.createNewBlock(index, blockchainData, recordsToUse, address, blockchainManager.adjustDifficulty(blockchainData, index));    
  }

  if (block) {
    //check hash is meet a specific difficulty or not
    if (!validator.hashDifficultyChecker(block.header.hash, block.header.TargetDifficulty)) {
      res.status(200).json({ message: 'The hash does not meet a specific difficulty' });
    }else{
      let applicationData = JSON.parse(fs.readFileSync('data/application.json', 'utf8'));
      applicationData = applicationData.filter(record =>
        !recordsToUse.some(r => r.index === record.index && r.signature === record.signature)
      );
      fs.writeFileSync('data/application.json', JSON.stringify(applicationData, null, 2));
      let blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
      blockchainData.push(block);
      fs.writeFileSync('data/blockchain.json', JSON.stringify(blockchainData, null, 2));
      res.status(200).json({ message: 'Block mined successfully' });
    }
  } else {
    res.status(200).json({ message: 'No block mined' });
  }
  //send the block to all node
  fs.readFile('data/node_list.json','utf-8',(err, data) => {
    if (err){
      console.error("Failed to read node list:",err);
      return;
    }
    try{
      const nodesData = JSON.parse(data);
      nodesData.forEach(node => {
        const { host, port, url } = node;
        // send the data
        const targeturl = `${url}/api/acceptblock`;
        fetch(targeturl, {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify(block),
        })
        .then(response => {
          console.log(`statusCode: ${response.status}`);
          return response.text();
        })
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error(error);
        })
        console.log(`Sucessfully send block to ${url}`);
      })
    }catch (parseError){
      console.error("Failed to parse JSON:",parseError)
    }
  });
});

//accept the block from other node
app.post('/api/acceptblock', (req, res) => {
  const newBlock = req.body;
  //push the new block
  if (newBlock) {
    //check hash is meet a specific difficulty or not
    if (!validator.hashDifficultyChecker(block.header.hash, block.header.TargetDifficulty)) {
      res.status(200).json({ message: 'The hash does not meet a specific difficulty' });
    }else{
      let applicationData = JSON.parse(fs.readFileSync('data/application.json', 'utf8'));
      applicationData = applicationData.filter(record =>
        !recordsToUse.some(r => r.index === record.index && r.signature === record.signature)
      );
      fs.writeFileSync('data/application.json', JSON.stringify(applicationData, null, 2));
      let blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
      blockchainData.push(block);
      fs.writeFileSync('data/blockchain.json', JSON.stringify(blockchainData, null, 2));
      res.status(200).json({ message: 'Block mined successfully' });
    }
  } else {
    res.status(200).json({ message: 'No block received' });
  }
});

// attendance
app.post('/attendance/add_new', (req, res) => {
  let blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
  let applicationData = JSON.parse(fs.readFileSync('data/application.json', 'utf8'));
  const { index, timestamp, address, classCode, signature, publicKey } = req.body;
  data = {
    index,
    timestamp,
    address,
    classCode
  }

  if (!validator.verifyAddress(publicKey, address)) {
    console.log('Address does not match public key');
    return res.status(400).send('Address does not match public key');
  }

  if (!validator.verifySignature(publicKey, data, signature)) {
    console.log('Invalid signature');
    return res.status(400).send('Invalid signature');
  }

  if (!validator.duplicateChecker(blockchainData, applicationData, index, signature)) {
    return res.status(400).send('Record duplicated');
  }

  if (!validator.replayChecker(applicationData, data)) {
    return res.status(400).send('Operation limit (Ten seconds)');
  }

  dataToSave = {
    type: "attendance",
    ...req.body
  }

  // Save data to application.json
  fileManger.saveData(dataToSave, './data/application.json').then(success => {
    if (success) {
      return res.status(200).send('successfully');
    } else {
      return res.status(500).send(err);
    }
  });
});

// get attendance by address or class code
app.get('/attendance/', (req, res) => {
  const blockchainData = JSON.parse(fs.readFileSync('data/blockchain.json', 'utf8'));
  const address = req.query.address;
  const sid = req.query.sid;
  const classCode = req.query.classCode;
  const startTime = req.query.startTime;
  const endTime = req.query.endTime;
  const attendance = blockchainManager.getAttendance(blockchainData, address, classCode, startTime, endTime);
  res.json(attendance);
});

app.listen(server_port, () => {
  console.log(`Server running on http://localhost:${server_port}`);
});
