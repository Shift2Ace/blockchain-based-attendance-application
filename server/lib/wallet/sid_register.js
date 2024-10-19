const fs = require('fs');
const { ec: EC } = require('elliptic');
const CryptoJS = require('crypto-js');

const ec = new EC('secp256k1');

const verifySignature = (publicKey, sid, signature) => {
  const key = ec.keyFromPublic(publicKey, 'hex');
  const msgHash = CryptoJS.SHA256(sid).toString();
  return key.verify(msgHash, signature);
};

const verifyAddress = (publicKey, address) => {
  const sha256Hash = CryptoJS.SHA256(publicKey).toString();
  const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();
  return ripemd160Hash === address;
};

const checkAndSaveData = (dataToSave, filePath, callback) => {
  fs.readFile(filePath, (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return callback('Error reading file');
    }

    const jsonData = data ? JSON.parse(data) : [];
    const isDuplicate = jsonData.some(record => record.sid === dataToSave.sid && record.address === dataToSave.address);

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
  verifySignature,
  verifyAddress,
  checkAndSaveData,
};