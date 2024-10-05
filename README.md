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
- Records[]
  - ID
  - Type (take attendance / transaction / rew)
  - user address
  - class
    - id
    - address
    - sign
  - receiver address
  - Inputs[10]: sender
    - Address
    - Amount
  - Outputs[]: reciver
    - Address
    - Amount
  - Attendance[10]
    - Time
    - Student address
    - class id
    - class signature
    - Student signature


