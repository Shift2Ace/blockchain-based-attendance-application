const fs = require('fs');
const path = require('path');

const nodeListPath = path.join(__dirname, '../../data/node_list.json');

function addNode(host, port, callback) {
  const url = `http://${host}:${port}`;
  console.log(url, 'add');
  
  fs.readFile(nodeListPath, 'utf8', (err, jsonData) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return callback(err);
    }

    let nodeList;
    try {
      nodeList = JSON.parse(jsonData);
    } catch (parseErr) {
      console.error('Error parsing JSON data:', parseErr);
      return callback(parseErr);
    }

    // Add the new node object to the list
    nodeList.push({ host, port, url });

    fs.writeFile(nodeListPath, JSON.stringify(nodeList, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing JSON file:', writeErr);
        return callback(writeErr);
      }

      console.log('Node added successfully:', { host, port, url });
      callback(null, { host, port, url });
    });
  });
}

module.exports = { addNode };
