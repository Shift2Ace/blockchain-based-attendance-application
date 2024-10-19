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
- Records (choose one)
  - Transaction
    - Inputs[]
      - Transaction
      - Index
      - Address
      - Public key
      - Amount
      - Signature
    - Outputs[]
      - Address
      - Amount
        
  - SID Register
    - Address
    - Public key
    - Student id
    - Signature
      
  - Attendance
    - Timestamp
    - Address
    - Public key
    - Event id
    - Event holder
    - Event signature
    - Student signature

# Wallet
- Address
- Encrypted Secret Key
- Public Key
- Password Hash

# Mempool Update Checks
1. Format
2. Public Key Verification
3. Signature Verification
4. Double-Spending Check
5. Sufficient Fees
6. Nonce and Sequence

#Blockchain Update Checks
1. Block Structure
2. Previous Block Hash
3. Proof of Work
4. Timestamp
5. Merkle Root
6. Transaction Validity
7. Signature Verification
8. Double-Spending Check
9. Script Validation
10. Block Reward and Fees

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
