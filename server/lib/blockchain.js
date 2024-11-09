const blockchain_tool = require('./blockchain_tool')
const walletManager = require('./wallet')

const MIN_DIFFICULTY = 14; 
const TARGET_BLOCK_TIME = 10000; 
const DIFFICULTY_ADJUSTMENT_INTERVAL = 5;

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

function adjustDifficulty(blockchain, index) {
    if (index <= DIFFICULTY_ADJUSTMENT_INTERVAL) {
        return MIN_DIFFICULTY;
    }

    const first_adjustment_block = (Math.floor((index-1)/DIFFICULTY_ADJUSTMENT_INTERVAL)*DIFFICULTY_ADJUSTMENT_INTERVAL)-DIFFICULTY_ADJUSTMENT_INTERVAL;
    const last_adjustment_block = first_adjustment_block + DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = blockchain[last_adjustment_block].header.timestamp - blockchain[first_adjustment_block].header.timestamp;
    const averageTimePerBlock = timeTaken / DIFFICULTY_ADJUSTMENT_INTERVAL;

    const previousDifficulty = blockchain[last_adjustment_block].header.TargetDifficulty;
    if (averageTimePerBlock < TARGET_BLOCK_TIME) { 
        return previousDifficulty + 1;
    } else {
        return Math.max(previousDifficulty - 1, MIN_DIFFICULTY);
    }
}

function getAttendance(blockchain, address, classCode, startTime, endTime) {
    let attendances = [];
    let latestRecords = new Map();

    blockchain.forEach(block => {
        block.data.forEach(data => {
            if (data.type == 'attendance') {
                let record = {
                    address: data.address,
                    sid: walletManager.getSid(blockchain, data.address),
                    classCode: data.classCode,
                    dateTime: data.timestamp
                };

                if (address && data.address !== address && record.sid !== address) return;
                if (classCode && data.classCode !== classCode) return;
                if (startTime && data.timestamp < startTime) return;
                if (endTime && data.timestamp > endTime) return;

                if (classCode) {
                    // Only keep the latest record for each address
                    if (!latestRecords.has(data.address) || latestRecords.get(data.address).dateTime < data.timestamp) {
                        latestRecords.set(data.address, record);
                    }
                } else {
                    attendances.push(record);
                }
            }
        });
    });

    if (classCode) {
        attendances = Array.from(latestRecords.values());
    }

    // Sort attendances by dateTime in descending order
    attendances.sort((a, b) => b.dateTime - a.dateTime);

    return attendances;
}



module.exports = {
    createFirstBlock,
    createNewBlock,
    adjustDifficulty,
    getAttendance
}