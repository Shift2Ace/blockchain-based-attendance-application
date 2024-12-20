const bs58 = require('bs58');
const CryptoJS = require('crypto-js');
const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');
const { Buffer } = require('buffer');
const walletManager = require('./wallet')

function verifySignature(publicKey, data, signature) {
    const key = ec.keyFromPublic(publicKey, 'hex');
    const hash = CryptoJS.SHA256(JSON.stringify(data)).toString();
    return key.verify(hash, signature);
}

function verifyAddress(publicKey, input_address) {
    const sha256Hash = CryptoJS.SHA256(publicKey).toString();
    const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();
    const ripemd160Hash_bytes = Buffer.from(ripemd160Hash, 'hex');
    const address = bs58.default.encode(ripemd160Hash_bytes);
    return address == input_address;
}

function duplicateChecker (blockchain,application,index,signature){
    for (let b = 0; b < blockchain.length; b++){
        var block = blockchain[b];
        for (let d = 0; d < block.data.length; d++){
            var data = block.data[d]
            if (data.index == index && data.signature == signature){
                return false;
            }
        }
    }
    for (let a = 0; a < application.length; a++){
        if (application[a].index == index && application[a].signature == signature){
            return false;
        }
    }

    return true
}

function balanceChecker (blockchain, application, amount, address){
    const blockchainBalance = walletManager.getBalance(blockchain,address);
    const pendingBalance = walletManager.getPendingTransaction(application,address);
    const totalBalance = blockchainBalance + pendingBalance;
    if (amount > totalBalance){
        return false;
    }else{
        return true;
    }
}

function bs58AddressChecker(address) {
    try {
      const decoded = bs58.default.decode(address);
      return decoded.length === 20;
    } catch (error) {
      return false;
    }
  }

module.exports = {
    verifySignature,
    verifyAddress,
    duplicateChecker,
    balanceChecker,
    bs58AddressChecker
};
