const blockchain_tool = require('./blockchain_tool')

function createFirstBlock(){
    const header = {
        index: 0,
        pre_hash: "",
        merkle_root: "",
        nonce: 0,
        miner: "",
        data_len: 0
    }
    const new_header = {
        ...header,
        hash: blockchain_tool.calculateHash(header)
    }
    const block = {
        header : new_header,
        data : []
    }

    return block;
}

module.exports = {
    createFirstBlock
}