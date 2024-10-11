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

// index page of server
app.get('/', (req, res) => {
  console.log(req)
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


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
