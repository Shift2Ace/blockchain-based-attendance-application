const bs58 = require('bs58');
const CryptoJS = require('crypto-js');
const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');
const { Buffer } = require('buffer');

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

module.exports = {
    verifySignature,
    verifyAddress
};
