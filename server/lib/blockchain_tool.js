const CryptoJS = require("crypto-js");
const Wallet = require("./wallet");

function calculateHash(header) {
  const headerString = JSON.stringify(header);
  const hashedValue = CryptoJS.SHA256(
    CryptoJS.SHA256(headerString).toString()
  ).toString();
  return hashedValue;
}

function calculateMerkleRoot(data) {
  if (data.length === 0) return "";

  function hashTransaction(transaction) {
    return CryptoJS.SHA256(JSON.stringify(transaction)).toString();
  }

  let hashes = data.map(hashTransaction);

  while (hashes.length > 1) {
    if (hashes.length % 2 !== 0) {
      hashes.push(hashes[hashes.length - 1]);
    }

    const newHashes = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const combinedHash = CryptoJS.SHA256(
        hashes[i] + hashes[i + 1]
      ).toString();
      newHashes.push(combinedHash);
    }
    hashes = newHashes;
  }

  return hashes[0];
}

// check the difficulty / number of 0 of hash
function difficulty(hash) {
  let binaryString = parseInt(hash, 16).toString(2).padStart(256, "0");
  let leadingZeros = 0;
  for (let char of binaryString) {
    if (char === "0") {
      leadingZeros++;
    } else {
      break;
    }
  }

  return leadingZeros;
}


function getBlockOutput(miner, data, blockchain) {
  let balances = new Map();

  function getBalance(address) {
    return Wallet.getBalance(blockchain, address);
  }

  balances.set(miner, getBalance(miner) + 50);

  data.forEach((transaction) => {
    if (transaction.type === "transaction") {
      balances.set(
        transaction.from_address,
        getBalance(transaction.from_address) - transaction.amount
      );
      balances.set(
        transaction.to_address,
        getBalance(transaction.to_address) + transaction.amount
      );
    }
  });

  let output = [];
  balances.forEach((balance, address) => {
    output.push({ address: address, balance: balance });
  });

  return output;
}

module.exports = {
  calculateHash,
  calculateMerkleRoot,
  difficulty,
  getBlockOutput
};
