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

module.exports = {
    getBalance
};