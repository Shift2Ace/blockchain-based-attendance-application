const R = require('ramda');
const fs = require('fs');
const path = require('path');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');

const walletListPath = path.join(__dirname, '../../data/wallet.json');

class Wallet {
    constructor() {
        this.id = null;
        this.passwordHash = null;
        this.secret = null;
        this.keyPairs = [];
    }

    // create wallet and add to data/wallet.json
    static createWalletFromPassword(password) {
        let wallet = new Wallet();
        wallet.id = CryptoUtil.randomId();
        wallet.passwordHash = CryptoUtil.hash(password);
    
        try {
            let walletList = [];
            if (fs.existsSync(walletListPath)) {
                const data = fs.readFileSync(walletListPath, 'utf8');
                walletList = JSON.parse(data);
            }
                walletList.push(wallet);
            fs.writeFileSync(walletListPath, JSON.stringify(walletList, null, 2));
        } catch (error) {
            console.error('Error handling wallet file:', error);
            throw new Error('Failed to create wallet');
        }
        return wallet;
    }
}

module.exports = Wallet;