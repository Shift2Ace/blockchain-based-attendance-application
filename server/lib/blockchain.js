const blockchain_tool = require('./blockchain_tool')
const walletManager = require('./wallet')

const MIN_DIFFICULTY = 14;
const TARGET_BLOCK_TIME = 10000;
const DIFFICULTY_ADJUSTMENT_INTERVAL = 5;

function createFirstBlock() {
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
        header: new_header,
        data: [],
        output: []
    }

    return block;
}

function createNewBlock(index, blockchain, data, miner, difficulty) {
    const nonce = Math.floor(Math.random() * Math.pow(2, 32));
    const output = blockchain_tool.getBlockOutput(miner, data, blockchain);
    const header = {
        index: index,
        pre_hash: blockchain[blockchain.length - 1].header.hash,
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
        output: output
    };

    return block;
}

function blockChecker(block) {

}

function adjustDifficulty(blockchain, index) {
    if (index <= DIFFICULTY_ADJUSTMENT_INTERVAL) {
        return MIN_DIFFICULTY;
    }

    const first_adjustment_block = (Math.floor((index - 1) / DIFFICULTY_ADJUSTMENT_INTERVAL) * DIFFICULTY_ADJUSTMENT_INTERVAL) - DIFFICULTY_ADJUSTMENT_INTERVAL;
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

function detectFork(blockchain, newBlock) {
    const latestBlock = blockchain[blockchain.length - 1]; //get the latest block
    if (newBlock.header.index == latestBlock.header.index && newBlock.header.pre_hash == latestBlock.header.pre_hash) {

        console.log(`Fork detected. Saving the latest block to fork${newBlock.header.index}.json`);


        const forkFilePath = `../data/fork_${newBlock.header.index}.json`;


        //create this new file and save the newBlock into it
        const forkData = [newBlock];
        fs.writeFileSync(forkFilePath, JSON.stringify(forkData, null, 2), 'utf-8');
        return true;
    }
    return false; 
}

function saveBlock(blockchain, newBlock, fork) {
    const forkFilePath = `../data/fork_${newBlock.header.index}.json`;
    const BlockFilePath = `../data/blockchain.json`;

    // Get the latest block from the blockchain
    const latestBlock = blockchain[blockchain.length - 1];

    if (blockchain[newBlock.header.index - 1].header.hash == newBlock.header.pre_hash) {
        // Save to the main blockchain file
        fs.writeFileSync(blockFilePath, JSON.stringify(blockchain, null, 2), 'utf-8');
        console.log(`Block added to the main blockchain at ${blockFilePath}`);
        return true;

    } else if (fork[fork.length - 1].header.hash == newBlock.header.pre_hash) {
        // Save to fork_<index>.json
        const forkData = [fork];
        fs.writeFileSync(forkFilePath, JSON.stringify(forkData, null, 2), 'utf-8');
        console.log(`Fork block saved to ${forkFilePath}`);
        return true;
    }
    return false;
}


function resolveFork(mainChain, forkChain) {

    // Calculate chain difficulties starting from the fork index
    const forkStartIndex = newBlock[0].header.index;
    const mainChainDifficulty = calculateChainDifficulty(mainChain, forkStartIndex);
    const forkChainDifficulty = calculateChainDifficulty(forkChain, forkStartIndex);

    console.log(`Main chain difficulty: ${mainChainDifficulty}`);
    console.log(`Fork chain difficulty: ${forkChainDifficulty}`);

    const difficultyDifference = forkChainDifficulty - mainChainDifficulty;

    if (difficultyDifference <= -100) {
        console.log('Main chain is stronger by at least 100. Deleting fork chain...');
    } else if (difficultyDifference >= 100) {
        console.log('Fork chain is stronger by at least 100. Replacing main chain...');
        try {
            fs.writeFileSync(blockFilePath, JSON.stringify(forkChain, null, 2), 'utf-8');
            console.log('Main chain replaced with fork chain.');
        } catch (err) {
            console.error('Error replacing main chain:', err);
        }
    } else {
        console.log('Difference is less than 100. No action taken.');
        return;
    }

    // Clear the fork chain file in all cases
    try {
        fs.writeFileSync(forkFilePath, JSON.stringify([], null, 2), 'utf-8');
        console.log(`Cleared fork file: ${forkFilePath}`);
    } catch (err) {
        console.error(`Error clearing fork file ${forkFilePath}:`, err);
    }
}


function calculateChainDifficulty(chain, startIndex) {
    if (!Array.isArray(chain)) {
        console.error("Invalid chain: not an array.");
        return 0;
    }

    return chain
        .filter(block => block && block.header && block.header.index >= startIndex) // Validate block structure
        .reduce((total, block) => total + block.header.index + block.header.TargetDifficulty, 0);
}




module.exports = {
    createFirstBlock,
    createNewBlock,
    adjustDifficulty,
    getAttendance
}