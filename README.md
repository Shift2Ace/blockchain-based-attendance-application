# blockchain-based-attendance-application

Register page:

Login page:

Attendance page: 

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
