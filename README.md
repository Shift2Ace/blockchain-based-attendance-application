# Web Page Structure
Front End
- Blockchain
  - Get blockchain
  - Get transaction
  - Take attendance
  - Mine new block
- Wallet
  - Create wallet
  - Create address
  - Create transaction
  - Get balance
- Node
  - Get nodes list

Back End
- Blockchain
  - Update the latest block
- Node
  - Connect to new node

# Block Structure
- Block Header
  - Index
  - Previous Block Hash
  - Merkle Root
  - Nonce
  - Miner
- Records
  - Inputs[10]
    - Transaction
    - Index
    - Address
    - Amount
    - Signature
  - Outputs[]
    - Address
    - Amount
  - Attendance[10]
    - Timestamp
    - Address
    - Student id
    - Event id
    - Event holder
    - Event signature
    - Student signature

# Create Wallet
1. Create wallet from password, output unique wallet id
2. Create address(unique) with wallet id and password

# Wallet
- ID
- Password Hash
- Secert
- KeyPairs[2]
  - Index
  - Secret Key
  - Public Key

# Network
- HTTP server
  - join nodes
  - get info
  - send info
 
# Add node
  1. New node send `IP address` to any node
  2. New node get `node list` from any node
  3. Connected node send `IP address` of new node to other node

# Install Node Modules
```
npm install
```
```
npm install lodash
```

# Build Docker
Build the Docker image
```
docker build -t blockchain-based-attendance-application .
```
Run Docker container
```
docker run --name Attendance App -p 3000:3000 blockchain-based-attendance-application
```
