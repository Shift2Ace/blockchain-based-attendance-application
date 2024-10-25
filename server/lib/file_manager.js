const fs = require('fs');

const checkAndSaveData = (dataToSave, filePath, callback) => {
  fs.readFile(filePath, (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return callback('Error reading file');
    }

    const jsonData = data ? JSON.parse(data) : [];
    const isDuplicate = jsonData.some(record => record.index === dataToSave.index && record.address === dataToSave.address);

    if (isDuplicate) {
      return callback(null, true);
    }

    jsonData.push(dataToSave);

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        return callback('Error writing file');
      }

      callback(null, false);
    });
  });
};

module.exports = {
  checkAndSaveData
};
