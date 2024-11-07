function getBalance(blockchain, address){
    for (let i = blockchain.length-1; i >= 0; i--){
        block_output = blockchain[i].output
        for (let y = 0; y < block_output.length; y++){
            if (block_output[y].address == address){
                return block_output[y].balance;
            }
        }
    }
    return 0
}

function getPendingTransaction(application, address){
    var amount = 0;
    for (let i = 0; i < application.length; i++){
        if (application[i].type == 'transaction'){
            if (application[i].fromAddress == address){
                amount = amount - application[i].amount;
            }
            if (application[i].toAddress == address){
                amount = amount + application[i].amount;
            }
        }
    }
    return amount;
}

module.exports = {
    getBalance,
    getPendingTransaction
};