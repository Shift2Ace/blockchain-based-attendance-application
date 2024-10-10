const express = require('express');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(express.json());

// allow access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept');
  res.header("Access-Control-Expose-Headers", "X-RateLimit-Limit");
  next()
});

const allowedIPs = ['127.0.0.1', '::1', '192.168.1.75','::ffff:192.168.1.75'];

const ipFilter_post = (req, res, next) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  console.log(forwardedFor," post required")
  if (allowedIPs.includes(forwardedFor)) {
    next();
  } else {
    res.status(403).send('Access forbidden: your IP is not allowed');
  }
};

const ipFilter_get = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  console.log(ip," get required")
  if (allowedIPs.includes(ip)) {
    next();
  } else {
    res.status(403).send('Access forbidden: your IP is not allowed');
  }
};

// upload name and email to data/test.json
app.post('/api/test',ipFilter_post, (req, res) => {
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

// index page of server
app.get('/', (req, res) => {
    res.send('Server in running ...');
});

// limit only localhost access this page
app.get('/local-limit-test', ipFilter_get,(req, res) => {
  res.send('localhost access only');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
