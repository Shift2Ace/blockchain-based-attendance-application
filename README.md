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
    - Address
    - Amount
  - Outputs[]
    - Address
    - Amount
  - Attendance[10]
    - Timestamp
    - Student id
    - Event id
    - Event holder
    - Event signature
    - Student signature

# Network
- HTTP server
  - get info
  - send info
 
# Add node
  1. New node send `IP address` to any node
  2. New node get `node list` from any node
  3. Connected node send `IP address` of new node to other node
