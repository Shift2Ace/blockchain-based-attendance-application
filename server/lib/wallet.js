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

function getSid(blockchain, address){
    for (let i = blockchain.length-1; i >= 0; i--){
        blockData = blockchain[i].data
        for (let y = blockData.length-1; y >= 0; y--){
            if (blockData[y].type == 'sid_register'){
                if(blockData[y].address == address){
                    return blockData[y].sid;
                }
            }
        }
    }
    return null
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
    getPendingTransaction,
    getSid
};