const blockchain_tool = require('./blockchain_tool')

function createFirstBlock(){
    const header = {
        index: 0,
        pre_hash: "",
        merkle_root: "",
        nonce: 0,
        miner: "",
        data_len: 0,
        TargetDifficulty: 10,
        timestamp: 0
    }
    const new_header = {
        ...header,
        hash: blockchain_tool.calculateHash(header)
    }
    const block = {
        header : new_header,
        data : [],
        output: []
    }

    return block;
}

function createNewBlock(index, blockchain, data, miner, difficulty) {
    const nonce = Math.floor(Math.random() * Math.pow(2, 32));
    const output = blockchain_tool.getBlockOutput(miner,data,blockchain);
    const header = {
        index: index,
        pre_hash: blockchain[blockchain.length-1].header.hash,
        merkle_root: blockchain_tool.calculateMerkleRoot(data),
        nonce: nonce,
        miner: miner,
        data_len: data.length,
        TargetDifficulty: difficulty,
        timestamp: Date.now()
    };
    const hash = blockchain_tool.calculateHash(header);

    if (blockchain_tool.difficulty(hash) < difficulty) {
        return false;
    }

    const new_header = {
        ...header,
        hash: hash
    };

    const block = {
        header: new_header,
        data: data,
        // need to calculate the output from data
        output:output
    };

    return block;
}

function blockChecker (block){

}




module.exports = {
    createFirstBlock,
    createNewBlock
}