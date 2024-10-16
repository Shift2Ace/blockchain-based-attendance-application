# Web Page Structure
Front End
- Blockchain
  - Get blockchain
- Attendance
  - Get attendance record
  - Take attendance
- Wallet
  - Create wallet
  - Create address
  - Create transaction
  - Get transaction
  - Get balance
- Node
  - Connect Nodes (hide)
  - Get nodes list
- Mine (hide)
  - Control Panel

Back End
- Blockchain
  - Update the latest block
- Node
  - Send address(url)

# Block Structure
- Block Header
  - Index
  - Previous Block Hash
  - Merkle Root
  - Nonce
  - Miner
  - Type
- Records
  - Inputs[]
    - Transaction
    - Index
    - Address
    - Amount
    - Signature
  - Outputs[]
    - Address
    - Amount
  - Register
    - Address
    - Student id
    - Signature
  - Attendance
    - Timestamp
    - Address
    - Event id
    - Event holder
    - Event signature
    - Student signature

# Wallet
- ID
- Password Hash
- Secert
- KeyPairs[2]
  - Index
  - Secret Key
  - Public Key

# Create Wallet
1. Create wallet from password, output unique wallet id
2. Create address with wallet id, password and student id, output address,Keys

# Add node
1. New node get `node list` from any node
2. Send `url` to each node

# Install Node Modules
```
npm install
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
