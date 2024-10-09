const express = require('express');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept');
  res.header("Access-Control-Expose-Headers", "X-RateLimit-Limit");
  next()
});

app.post('/api/test', (req, res) => {
  const data = req.body;
  console.log('Received data:', data);

  fs.readFile('data/test.json', 'utf8', (err, jsonString) => {
    if (err) {
      console.log('File read failed:', err);
      return res.status(500).send('Internal Server Error');
    }
    const jsonData = JSON.parse(jsonString || '[]');
    jsonData.push(data);

    fs.writeFile('data/test.json', JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.log('Error writing file:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.status(200).send('Data saved successfully');
    });
  });
});

app.get('/', (req, res) => {
    res.send('Server in running ...');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
