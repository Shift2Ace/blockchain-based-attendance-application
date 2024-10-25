const CryptoJS = require('crypto-js');
const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');

function verifySignature(publicKey, data, signature) {
    const key = ec.keyFromPublic(publicKey, 'hex');
    const hash = CryptoJS.SHA256(JSON.stringify(data)).toString();
    return key.verify(hash, signature);
}


function verifyAddress(publicKey, address) {
    const sha256Hash = CryptoJS.SHA256(publicKey).toString();
    const ripemd160Hash = CryptoJS.RIPEMD160(sha256Hash).toString();
    return ripemd160Hash === address;
}

module.exports = {
    verifySignature,
    verifyAddress
};