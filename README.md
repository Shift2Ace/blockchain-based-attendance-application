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
  - Merkle Root of Data
  - Nonce
  - Miner
  - Num of Data
  - Hash
- Data[8]
  - Transaction
    - Type (transaction)
    - Index (random number)
    - Timestamp
    - From address
    - To address
    - Amount
    - Signature (Index,Timestamp,addresses,amount)
    - Public key
  
  - SID Register
    - Type (sid register)
    - Index (random number)
    - Timestamp
    - Address
    - Student id
    - Signature (Index,Timestamp,address,sid)
    - Public key
      
  - Attendance
    - Type (attendance)
    - Index (random number)
    - Timestamp
    - Address
    - Event id
    - Student signature (Index,Timestamp,address,event id)
    - Public key
      
- Outputs[]
    - Address
    - Amount
      
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

# Blockchain Update Checks
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
```
Run Docker container
```
```
