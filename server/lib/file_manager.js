const fs = require('fs');

const saveData = (data, filePath) => {
  return new Promise((resolve, reject) => {
    // Read the existing data from the file
    fs.readFile(filePath, 'utf8', (err, fileData) => {
      if (err) {
        console.error('Error reading file:', err);
        return resolve(false);
      }

      let jsonArray;
      try {
        // Parse the existing data as JSON
        jsonArray = JSON.parse(fileData);
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        return resolve(false);
      }

      // Add the new data to the array
      jsonArray.push(data);

      // Write the updated array back to the file
      fs.writeFile(filePath, JSON.stringify(jsonArray, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Error writing file:', writeErr);
          return resolve(false);
        } else {
          console.log('Data saved successfully!');
          return resolve(true);
        }
      });
    });
  });
};

module.exports = {
  saveData
};
