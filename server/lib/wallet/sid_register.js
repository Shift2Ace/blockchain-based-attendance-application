const fs = require('fs');
const { ec: EC } = require('elliptic');
const CryptoJS = require('crypto-js');

const ec = new EC('secp256k1');

const verifySignature = (publicKey, sid, signature) => {
  const key = ec.keyFromPublic(publicKey, 'hex');
  const msgHash = CryptoJS.SHA256(sid).toString();
  return key.verify(msgHash, signature);
};

const saveData = (dataToSave, filePath, callback) => {
  fs.readFile(filePath, (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return callback('Error reading file');
    }

    const jsonData = data ? JSON.parse(data) : [];
    jsonData.push(dataToSave);

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        return callback('Error writing file');
      }

      callback(null);
    });
  });
};

module.exports = {
  verifySignature,
  saveData,
};
