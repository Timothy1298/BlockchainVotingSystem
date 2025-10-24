# 🔧 Technical Specifications: Blockchain Voting System

## 📋 **System Overview**

This document provides detailed technical specifications for the blockchain-based voting system designed for university elections. The system implements a three-tier architecture with blockchain integration, ensuring security, transparency, and scalability.

---

## 🏗️ **System Architecture**

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  React.js Frontend  │  Mobile App  │  Admin Dashboard      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Node.js/Express  │  RESTful APIs  │  Business Logic       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Database  │  File Storage  │  Blockchain Network  │
└─────────────────────────────────────────────────────────────┘
```

### **Component Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   (React.js)    │◄──►│  (Node.js)      │◄──►│   (Ethereum)    │
│                 │    │                 │    │                 │
│ • User Interface│    │ • API Gateway   │    │ • Smart         │
│ • State Mgmt    │    │ • Auth Service  │    │   Contracts     │
│ • Routing       │    │ • Business      │    │ • Vote Storage  │
│ • Components    │    │   Logic         │    │ • Consensus     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   MongoDB       │    │   Ganache       │
│                 │    │                 │    │   Network       │
│ • MetaMask      │    │ • User Data     │    │                 │
│ • Local Storage │    │ • Elections     │    │ • Test Network  │
│ • Session Mgmt  │    │ • Audit Logs    │    │ • Local Nodes   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 💻 **Frontend Specifications**

### **Technology Stack**

#### **Core Technologies**
- **Framework**: React.js 18.2.0+
- **Language**: JavaScript ES6+, TypeScript (optional)
- **Build Tool**: Vite 4.0+
- **Package Manager**: npm 8.0+

#### **UI/UX Technologies**
- **Styling**: Tailwind CSS 3.3+
- **Icons**: Lucide React 0.263+
- **Animations**: Framer Motion 10.16+
- **Charts**: Chart.js 4.4+ / Recharts 2.8+

#### **State Management**
- **Global State**: React Context API
- **Local State**: React Hooks (useState, useEffect, useReducer)
- **Data Fetching**: React Query 4.29+ / SWR 2.2+
- **Form Management**: React Hook Form 7.45+

#### **Routing and Navigation**
- **Router**: React Router DOM 6.15+
- **Navigation**: Programmatic navigation with useNavigate
- **Route Protection**: Custom ProtectedRoute component
- **Deep Linking**: URL-based state management

### **Component Architecture**

#### **Page Components**
```
src/pages/
├── auth/
│   ├── Login.jsx              # Unified login page
│   ├── Register.jsx           # User registration
│   └── ForgotPassword.jsx     # Password reset
├── voters/
│   ├── VoterDashboard.jsx     # Main voter interface
│   ├── VoterBallot.jsx        # Voting interface
│   ├── VoterProfile.jsx       # Profile management
│   └── VoterKycComplete.jsx   # KYC completion
├── admin/
│   ├── AdminDashboard.jsx     # Admin main interface
│   ├── AdminElections.jsx     # Election management
│   ├── AdminCandidates.jsx    # Candidate management
│   └── AdminKycReview.jsx     # KYC review system
└── system/
    ├── SystemMonitoring.jsx   # System health monitoring
    └── AuditDashboard.jsx     # Audit trail interface
```

#### **Reusable Components**
```
src/components/
├── common/
│   ├── GlobalUI.jsx           # Global UI state management
│   ├── NotificationWidget.jsx # Notification system
│   ├── LoadingSpinner.jsx     # Loading indicators
│   └── ErrorBoundary.jsx      # Error handling
├── voters/
│   ├── KYCStatusCard.jsx      # KYC status display
│   ├── VoteReceipt.jsx        # Vote receipt component
│   └── EligibilityCheck.jsx   # Voter eligibility
├── ui/
│   ├── Button.jsx             # Custom button component
│   ├── Modal.jsx              # Modal dialog component
│   ├── Form.jsx               # Form components
│   └── Table.jsx              # Data table component
└── features/
    ├── elections/
    ├── candidates/
    └── analytics/
```

### **State Management Architecture**

#### **Context Providers**
```javascript
// AuthContext - User authentication state
const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false
});

// MetaMaskContext - Blockchain wallet state
const MetaMaskContext = createContext({
  isConnected: false,
  selectedAccount: null,
  connect: () => {},
  disconnect: () => {}
});

// GlobalUIContext - UI state management
const GlobalUIContext = createContext({
  showToast: () => {},
  showLoader: () => {},
  hideLoader: () => {}
});
```

#### **Custom Hooks**
```javascript
// useAuth - Authentication management
const useAuth = () => {
  const { user, token, login, logout } = useContext(AuthContext);
  return { user, token, login, logout, isAuthenticated: !!user };
};

// useMetaMask - Blockchain wallet management
const useMetaMask = () => {
  const { isConnected, selectedAccount, connect } = useContext(MetaMaskContext);
  return { isConnected, selectedAccount, connect };
};

// useGlobalUI - UI state management
const useGlobalUI = () => {
  const { showToast, showLoader, hideLoader } = useContext(GlobalUIContext);
  return { showToast, showLoader, hideLoader };
};
```

### **API Integration**

#### **Service Layer**
```javascript
// API Base Configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### **API Services**
```javascript
// Authentication API
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password })
};

// Elections API
export const electionsAPI = {
  list: () => API.get('/elections'),
  create: (electionData) => API.post('/elections', electionData),
  update: (id, electionData) => API.put(`/elections/${id}`, electionData),
  delete: (id) => API.delete(`/elections/${id}`),
  getCandidates: (electionId) => API.get(`/elections/${electionId}/candidates`)
};

// Voting API
export const votingAPI = {
  vote: (electionId, candidateId) => API.post(`/votes/elections/${electionId}/vote`, { candidateId }),
  hasVoted: (electionId) => API.get(`/votes/hasVoted?electionId=${electionId}`),
  getVoteHistory: () => API.get('/votes/history'),
  verifyReceipt: (receiptHash) => API.get(`/votes/verify/${receiptHash}`)
};
```

---

## 🖥️ **Backend Specifications**

### **Technology Stack**

#### **Core Technologies**
- **Runtime**: Node.js 18.17.0+
- **Framework**: Express.js 4.18.2+
- **Language**: JavaScript ES6+
- **Package Manager**: npm 9.0+

#### **Database and Storage**
- **Database**: MongoDB 6.0+
- **ODM**: Mongoose 7.5+
- **File Storage**: Multer 1.4.5+ (for document uploads)
- **Caching**: Redis 7.0+ (optional)

#### **Security and Middleware**
- **Authentication**: JWT (jsonwebtoken 9.0+)
- **Password Hashing**: bcryptjs 2.4.3+
- **Security Headers**: Helmet 7.0+
- **CORS**: cors 2.8.5+
- **Rate Limiting**: express-rate-limit 6.10+
- **Input Validation**: express-validator 7.0+

#### **Development and Testing**
- **Process Manager**: nodemon 3.0+
- **Testing**: Jest 29.6+
- **API Documentation**: Swagger/OpenAPI 3.0+
- **Logging**: Winston 3.10+

### **Project Structure**

```
server/
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── authController.js
│   │   ├── voterAuthController.js
│   │   ├── electionController.js
│   │   ├── voteController.js
│   │   ├── adminKycController.js
│   │   └── notificationController.js
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Election.js
│   │   ├── VoteReceipt.js
│   │   ├── Notification.js
│   │   └── AuditLog.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── voterAuthRoutes.js
│   │   ├── electionRoutes.js
│   │   ├── voteRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   ├── upload.js
│   │   └── response.js
│   ├── blockchain/           # Blockchain integration
│   │   ├── listener.js
│   │   └── voting.js
│   ├── jobs/                 # Background jobs
│   │   └── tallySync.js
│   ├── utils/                # Utility functions
│   │   ├── logger.js
│   │   ├── email.js
│   │   └── metrics.js
│   ├── config/               # Configuration
│   │   ├── index.js
│   │   └── db.js
│   ├── app.js                # Express app configuration
│   └── server.js             # Server entry point
├── uploads/                  # File upload directory
├── logs/                     # Application logs
└── test/                     # Test files
```

### **Database Schema**

#### **User Model**
```javascript
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
  studentId: { type: String, unique: true, sparse: true },
  faculty: { type: String },
  nationalId: { type: String, unique: true, sparse: true },
  contact: { type: String },
  isRegistered: { type: Boolean, default: false },
  registrationDate: { type: Date },
  
  // KYC Information
  kycInfo: {
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String }
    },
    blockchainInfo: {
      walletAddress: { type: String, lowercase: true },
      walletType: { type: String, default: 'MetaMask' },
      isConnected: { type: Boolean, default: false },
      connectedAt: { type: Date }
    },
    documents: {
      governmentId: {
        documentType: { type: String, enum: ['passport', 'national_id', 'driver_license', null] },
        documentNumber: { type: String },
        issuingCountry: { type: String },
        expiryDate: { type: Date },
        fileUrl: { type: String },
        uploadedAt: { type: Date },
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      proofOfAddress: {
        documentType: { type: String, enum: ['utility_bill', 'bank_statement', 'rental_agreement', null] },
        fileUrl: { type: String },
        uploadedAt: { type: Date },
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      selfie: {
        fileUrl: { type: String },
        uploadedAt: { type: Date },
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    },
    biometricInfo: {
      facialRecognition: {
        biometricTemplate: { type: String },
        confidence: { type: Number, min: 0, max: 100 },
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      livenessCheck: {
        passed: { type: Boolean, default: false },
        confidence: { type: Number, min: 0, max: 100 },
        verifiedAt: { type: Date }
      }
    },
    verification: {
      kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      biometricStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      overallStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      verifiedAt: { type: Date },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      adminNotes: { type: String }
    },
    privacyConsent: {
      dataProcessing: { type: Boolean, default: false },
      biometricProcessing: { type: Boolean, default: false },
      blockchainStorage: { type: Boolean, default: false },
      marketingCommunications: { type: Boolean, default: false },
      consentDate: { type: Date }
    },
    registrationSteps: {
      personalInfo: { type: Boolean, default: false },
      blockchainConnection: { type: Boolean, default: false },
      documentUpload: { type: Boolean, default: false },
      biometricVerification: { type: Boolean, default: false },
      reviewSubmit: { type: Boolean, default: false }
    }
  },
  
  // Security and authentication
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastLogin: { type: Date },
  
  // Voting history
  votingHistory: [{
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
    seats: [String],
    votedAt: Date,
    transactionHash: String,
    receiptHash: String
  }]
}, {
  timestamps: true
});
```

#### **Election Model**
```javascript
const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  electionType: { type: String, required: true },
  description: { type: String },
  seats: [{ type: String, required: true }],
  subSeats: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Blockchain integration
  chainElectionId: { type: Number },
  lastSyncedBlock: { type: Number },
  
  // Timing
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  
  // Status and configuration
  status: { 
    type: String, 
    enum: ['Setup', 'Open', 'Closed', 'Finalized'], 
    default: 'Setup' 
  },
  votingEnabled: { type: Boolean, default: false },
  candidateListLocked: { type: Boolean, default: false },
  
  // Candidates
  candidates: [{
    name: { type: String, required: true },
    seat: { type: String, required: true },
    votes: { type: Number, default: 0 },
    chainCandidateId: { type: Number },
    bio: { type: String },
    photoUrl: { type: String },
    manifesto: { type: String },
    isActive: { type: Boolean, default: true },
    party: { type: String },
    position: { type: String },
    email: { type: String },
    phone: { type: String },
    age: { type: Number }
  }],
  
  // Voters and results
  voters: [{ type: String }],
  registeredVoters: [{ type: String }],
  voterSeatVotes: { type: mongoose.Schema.Types.Mixed, default: {} },
  voterCandidateVotes: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Results and verification
  results: { type: mongoose.Schema.Types.Mixed, default: {} },
  finalResultsHash: { type: String },
  totalVotes: { type: Number, default: 0 },
  turnoutPercentage: { type: Number },
  
  // Rules and configuration
  rules: {
    oneVotePerId: { type: Boolean, default: true },
    anonymous: { type: Boolean, default: true },
    eligibility: { type: String, default: 'registered' }
  },
  
  // Audit trail
  statusHistory: [{
    status: { type: String, enum: ['Setup', 'Open', 'Closed', 'Finalized'] },
    at: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});
```

### **API Endpoints**

#### **Authentication Endpoints**
```javascript
// POST /api/auth/login
// POST /api/auth/register
// POST /api/auth/forgot-password
// POST /api/auth/reset-password/:token
// GET /api/auth/me
// POST /api/auth/logout

// POST /api/voter-auth/login
// POST /api/voter-auth/register
// GET /api/voter-auth/profile
// PUT /api/voter-auth/profile
// GET /api/voter-auth/kyc-status
// POST /api/voter-auth/connect-wallet
// POST /api/voter-auth/upload-document
// POST /api/voter-auth/update-kyc-info
// POST /api/voter-auth/submit-biometric
// POST /api/voter-auth/submit-registration
// GET /api/voter-auth/registration-status
// GET /api/voter-auth/check-wallet/:address
// POST /api/voter-auth/forgot-password
// POST /api/voter-auth/reset-password/:token
```

#### **Election Management Endpoints**
```javascript
// GET /api/elections
// POST /api/elections
// GET /api/elections/:id
// PUT /api/elections/:id
// DELETE /api/elections/:id
// GET /api/elections/:id/candidates
// POST /api/elections/:id/candidates
// PUT /api/elections/:id/candidates/:candidateId
// DELETE /api/elections/:id/candidates/:candidateId
```

#### **Voting Endpoints**
```javascript
// POST /api/votes/elections/:electionId/vote
// GET /api/votes/hasVoted?electionId=:electionId
// GET /api/votes/history
// GET /api/votes/verify/:receiptHash
// GET /api/votes/audit-trail/:electionId
```

#### **Admin Endpoints**
```javascript
// GET /api/admin/kyc/pending
// GET /api/admin/kyc/:userId
// POST /api/admin/kyc/:userId/approve
// POST /api/admin/kyc/:userId/reject
// GET /api/admin/audit-logs
// GET /api/admin/system-health
// GET /api/admin/analytics
```

### **Middleware Configuration**

#### **Authentication Middleware**
```javascript
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
```

#### **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const voteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // limit each IP to 1 vote per minute
  message: 'Voting too frequently, please wait',
  standardHeaders: true,
  legacyHeaders: false
});
```

---

## ⛓️ **Blockchain Specifications**

### **Smart Contract Architecture**

#### **SimpleVoting.sol**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Election {
        uint id;
        string title;
        string description;
        uint startsAt;
        uint endsAt;
        uint candidatesCount;
        bool exists;
        bool votingEnabled;
        uint totalVotes;
    }

    mapping(uint => Election) public elections;
    mapping(uint => mapping(uint => Candidate)) private candidates;
    mapping(uint => mapping(address => bool)) private hasVoted;
    mapping(uint => mapping(address => bool)) private registeredVoters;
    
    uint public electionsCount;
    address public owner;

    event ElectionCreated(uint indexed electionId, string title);
    event CandidateAdded(uint indexed electionId, uint indexed candidateId, string name);
    event VoteCast(uint indexed electionId, uint indexed candidateId, bytes32 receipt);
    event VoterRegistered(uint indexed electionId, address indexed voter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier electionExists(uint _electionId) {
        require(elections[_electionId].exists, "Election not found");
        _;
    }

    modifier onlyRegisteredVoter(uint _electionId) {
        require(registeredVoters[_electionId][msg.sender], "Voter not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createElection(
        string memory _title,
        string memory _description,
        uint _startsAt,
        uint _endsAt
    ) public onlyOwner returns (uint) {
        electionsCount++;
        uint electionId = electionsCount;
        
        elections[electionId] = Election({
            id: electionId,
            title: _title,
            description: _description,
            startsAt: _startsAt,
            endsAt: _endsAt,
            candidatesCount: 0,
            exists: true,
            votingEnabled: false,
            totalVotes: 0
        });
        
        emit ElectionCreated(electionId, _title);
        return electionId;
    }

    function addCandidate(uint _electionId, string memory _name) public onlyOwner electionExists(_electionId) {
        Election storage e = elections[_electionId];
        e.candidatesCount++;
        uint candidateId = e.candidatesCount;
        
        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            voteCount: 0
        });
        
        emit CandidateAdded(_electionId, candidateId, _name);
    }

    function registerVoter(uint _electionId, address _voter) public onlyOwner electionExists(_electionId) {
        require(!registeredVoters[_electionId][_voter], "Voter already registered");
        registeredVoters[_electionId][_voter] = true;
        emit VoterRegistered(_electionId, _voter);
    }

    function enableVoting(uint _electionId) public onlyOwner electionExists(_electionId) {
        elections[_electionId].votingEnabled = true;
    }

    function castVote(uint _electionId, uint _candidateId) public electionExists(_electionId) onlyRegisteredVoter(_electionId) {
        Election storage e = elections[_electionId];
        require(e.votingEnabled, "Voting is not enabled");
        require(!hasVoted[_electionId][msg.sender], "Already voted in this election");
        require(_candidateId > 0 && _candidateId <= e.candidatesCount, "Invalid candidate");
        require(block.timestamp >= e.startsAt, "Election has not started");
        require(block.timestamp <= e.endsAt, "Election has ended");
        
        hasVoted[_electionId][msg.sender] = true;
        candidates[_electionId][_candidateId].voteCount++;
        e.totalVotes++;
        
        bytes32 receipt = keccak256(abi.encodePacked(_electionId, _candidateId, block.number, block.timestamp));
        emit VoteCast(_electionId, _candidateId, receipt);
    }

    function getElection(uint _electionId) public view returns (
        uint id,
        string memory title,
        string memory description,
        uint startsAt,
        uint endsAt,
        uint candidatesCount,
        bool votingEnabled,
        uint totalVotes
    ) {
        require(elections[_electionId].exists, "Election not found");
        Election storage e = elections[_electionId];
        return (e.id, e.title, e.description, e.startsAt, e.endsAt, e.candidatesCount, e.votingEnabled, e.totalVotes);
    }

    function getCandidate(uint _electionId, uint _candidateId) public view returns (
        uint id,
        string memory name,
        uint voteCount
    ) {
        require(elections[_electionId].exists, "Election not found");
        Candidate storage c = candidates[_electionId][_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    function hasVotedIn(uint _electionId, address _voter) public view returns (bool) {
        require(elections[_electionId].exists, "Election not found");
        return hasVoted[_electionId][_voter];
    }

    function isVoterRegistered(uint _electionId, address _voter) public view returns (bool) {
        require(elections[_electionId].exists, "Election not found");
        return registeredVoters[_electionId][_voter];
    }
}
```

### **Blockchain Integration**

#### **Web3 Configuration**
```javascript
const { Web3 } = require('web3');
const SimpleVotingABI = require('../build/contracts/SimpleVoting.json').abi;

class BlockchainService {
  constructor() {
    this.web3 = new Web3(process.env.BLOCKCHAIN_RPC || 'http://localhost:8545');
    this.contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
    this.contract = new this.web3.eth.Contract(SimpleVotingABI, this.contractAddress);
  }

  async createElection(title, description, startsAt, endsAt) {
    const accounts = await this.web3.eth.getAccounts();
    const adminAccount = accounts[0];
    
    const tx = await this.contract.methods.createElection(
      title,
      description,
      Math.floor(startsAt.getTime() / 1000),
      Math.floor(endsAt.getTime() / 1000)
    ).send({ from: adminAccount, gas: 3000000 });
    
    return tx.events.ElectionCreated.returnValues.electionId;
  }

  async addCandidate(electionId, candidateName) {
    const accounts = await this.web3.eth.getAccounts();
    const adminAccount = accounts[0];
    
    await this.contract.methods.addCandidate(electionId, candidateName)
      .send({ from: adminAccount, gas: 1000000 });
  }

  async registerVoter(electionId, voterAddress) {
    const accounts = await this.web3.eth.getAccounts();
    const adminAccount = accounts[0];
    
    await this.contract.methods.registerVoter(electionId, voterAddress)
      .send({ from: adminAccount, gas: 500000 });
  }

  async castVote(electionId, candidateId, voterAddress) {
    await this.contract.methods.castVote(electionId, candidateId)
      .send({ from: voterAddress, gas: 200000 });
  }

  async hasVotedIn(electionId, voterAddress) {
    return await this.contract.methods.hasVotedIn(electionId, voterAddress).call();
  }

  async isVoterRegistered(electionId, voterAddress) {
    return await this.contract.methods.isVoterRegistered(electionId, voterAddress).call();
  }

  async getElection(electionId) {
    return await this.contract.methods.getElection(electionId).call();
  }

  async getCandidate(electionId, candidateId) {
    return await this.contract.methods.getCandidate(electionId, candidateId).call();
  }
}
```

### **Event Listening**
```javascript
const blockchainListener = {
  async startListening() {
    const contract = new web3.eth.Contract(SimpleVotingABI, contractAddress);
    
    // Listen for VoteCast events
    contract.events.VoteCast({
      fromBlock: 'latest'
    }, (error, event) => {
      if (error) {
        console.error('Error listening to VoteCast events:', error);
        return;
      }
      
      console.log('Vote cast event received:', event.returnValues);
      this.processVoteEvent(event.returnValues);
    });
    
    // Listen for VoterRegistered events
    contract.events.VoterRegistered({
      fromBlock: 'latest'
    }, (error, event) => {
      if (error) {
        console.error('Error listening to VoterRegistered events:', error);
        return;
      }
      
      console.log('Voter registered event received:', event.returnValues);
      this.processVoterRegistrationEvent(event.returnValues);
    });
  },

  async processVoteEvent(voteData) {
    const { electionId, candidateId, receipt } = voteData;
    
    // Update database with vote information
    await this.updateVoteInDatabase(electionId, candidateId, receipt);
    
    // Update election statistics
    await this.updateElectionStats(electionId);
  },

  async processVoterRegistrationEvent(registrationData) {
    const { electionId, voter } = registrationData;
    
    // Update voter registration status in database
    await this.updateVoterRegistrationStatus(electionId, voter);
  }
};
```

---

## 🔒 **Security Specifications**

### **Cryptographic Security**

#### **Password Security**
```javascript
const bcrypt = require('bcryptjs');

// Password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password verification
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

#### **JWT Token Security**
```javascript
const jwt = require('jsonwebtoken');

// Token generation
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Token verification
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

### **Input Validation**
```javascript
const { body, validationResult } = require('express-validator');

// User registration validation
const validateUserRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('studentId')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('Student ID must be between 5 and 20 characters')
];

// Vote casting validation
const validateVote = [
  body('candidateId')
    .isMongoId()
    .withMessage('Invalid candidate ID'),
  body('electionId')
    .isMongoId()
    .withMessage('Invalid election ID')
];
```

### **File Upload Security**
```javascript
const multer = require('multer');
const path = require('path');

// Configure multer for secure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});
```

---

## 📊 **Performance Specifications**

### **System Requirements**

#### **Minimum Requirements**
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 20 GB available space
- **Network**: 10 Mbps internet connection

#### **Recommended Requirements**
- **CPU**: 4 cores, 3.0 GHz
- **RAM**: 8 GB
- **Storage**: 50 GB available space
- **Network**: 100 Mbps internet connection

### **Performance Metrics**

#### **Response Time Targets**
- **API Response**: < 200ms average
- **Page Load**: < 2 seconds
- **Vote Processing**: < 5 seconds
- **Database Queries**: < 100ms

#### **Throughput Targets**
- **Concurrent Users**: 1000+
- **Votes per Minute**: 500+
- **API Requests per Second**: 100+
- **Database Transactions**: 1000+ per second

#### **Availability Targets**
- **System Uptime**: 99.9%
- **Database Uptime**: 99.95%
- **Blockchain Connectivity**: 99.5%
- **Recovery Time**: < 30 minutes

### **Scalability Considerations**

#### **Horizontal Scaling**
- **Load Balancing**: Multiple server instances
- **Database Sharding**: Distribute data across multiple databases
- **CDN Integration**: Content delivery network for static assets
- **Microservices**: Split functionality into independent services

#### **Vertical Scaling**
- **CPU Optimization**: Efficient algorithms and caching
- **Memory Management**: Optimized data structures
- **Storage Optimization**: Database indexing and query optimization
- **Network Optimization**: Compression and connection pooling

---

## 🧪 **Testing Specifications**

### **Testing Strategy**

#### **Unit Testing**
- **Framework**: Jest
- **Coverage Target**: 80%+
- **Test Files**: `*.test.js`
- **Mocking**: Jest mocks for external dependencies

#### **Integration Testing**
- **API Testing**: Supertest for HTTP endpoints
- **Database Testing**: MongoDB memory server
- **Blockchain Testing**: Ganache test network
- **End-to-End Testing**: Cypress for UI testing

#### **Security Testing**
- **Penetration Testing**: OWASP ZAP
- **Vulnerability Scanning**: npm audit
- **Code Analysis**: ESLint security rules
- **Dependency Scanning**: Snyk

### **Test Environment Configuration**

#### **Development Environment**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### **Test Database Configuration**
```javascript
// test/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

---

## 📋 **Deployment Specifications**

### **Environment Configuration**

#### **Development Environment**
```bash
# .env.development
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/voting_system_dev
JWT_SECRET=dev-secret-key-change-in-production
BLOCKCHAIN_RPC=http://localhost:8545
VOTING_CONTRACT_ADDRESS=0x53a36f3419cfcADec5378ED2Ed91134b8fC9680a
BLOCKCHAIN_MOCK=false
SKIP_DB=false
LOG_LEVEL=debug
```

#### **Production Environment**
```bash
# .env.production
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://production-server:27017/voting_system
JWT_SECRET=super-secure-production-secret-key
BLOCKCHAIN_RPC=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
VOTING_CONTRACT_ADDRESS=0xPRODUCTION_CONTRACT_ADDRESS
BLOCKCHAIN_MOCK=false
SKIP_DB=false
LOG_LEVEL=info
```

### **Docker Configuration**

#### **Dockerfile**
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build client
WORKDIR /app/client
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["node", "server/src/server.js"]
```

#### **Docker Compose**
```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:6.0
    container_name: voting-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: voting_system
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - voting-network

  # Redis Cache (Optional)
  redis:
    image: redis:7-alpine
    container_name: voting-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - voting-network

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: voting-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGO_URI: mongodb://admin:password@mongodb:27017/voting_system?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      BLOCKCHAIN_RPC: ${BLOCKCHAIN_RPC}
      VOTING_CONTRACT_ADDRESS: ${VOTING_CONTRACT_ADDRESS}
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    networks:
      - voting-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: voting-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - voting-network

volumes:
  mongodb_data:
  redis_data:

networks:
  voting-network:
    driver: bridge
```

### **CI/CD Pipeline**

#### **GitHub Actions Workflow**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test
      env:
        NODE_ENV: test
        MONGO_URI: mongodb://localhost:27017/voting_system_test
    
    - name: Run security audit
      run: npm audit --audit-level moderate
    
    - name: Build application
      run: npm run build
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        echo "Deploying to production server..."
        # Add deployment commands here
```

---

## 📱 **Mobile and Responsive Design**

### **Responsive Breakpoints**
```css
/* Mobile First Approach */
/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) { }

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) { }

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) { }

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) { }
```

### **Mobile Optimization Features**
- **Touch-friendly Interface**: Minimum 44px touch targets
- **Swipe Gestures**: Navigation and interaction support
- **Offline Capability**: Service worker for basic offline functionality
- **Progressive Web App**: Installable on mobile devices
- **Fast Loading**: Optimized images and lazy loading

---

## 🔧 **Development Tools and Utilities**

### **Code Quality Tools**

#### **ESLint Configuration**
```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'jsx-a11y'
  ],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

#### **Prettier Configuration**
```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### **Development Scripts**
```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "cd server && npm run build",
    "test": "npm run test:client && npm run test:server",
    "test:client": "cd client && npm run test",
    "test:server": "cd server && npm run test",
    "lint": "npm run lint:client && npm run lint:server",
    "lint:client": "cd client && npm run lint",
    "lint:server": "cd server && npm run lint",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "start": "node server/src/server.js",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  }
}
```

---

## 📊 **Monitoring and Analytics**

### **Application Monitoring**

#### **Health Check Endpoint**
```javascript
// Health check implementation
app.get('/api/health', async (req, res) => {
  try {
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      checks: {
        database: await checkDatabaseConnection(),
        blockchain: await checkBlockchainConnection(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };
    
    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      message: 'Service Unavailable',
      error: error.message
    });
  }
});
```

#### **Logging Configuration**
```javascript
// Winston logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'voting-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### **Performance Monitoring**

#### **Metrics Collection**
```javascript
// Performance metrics middleware
const metrics = {
  requestCount: 0,
  responseTime: [],
  errorCount: 0,
  
  recordRequest: (req, res, next) => {
    const start = Date.now();
    metrics.requestCount++;
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      metrics.responseTime.push(duration);
      
      if (res.statusCode >= 400) {
        metrics.errorCount++;
      }
    });
    
    next();
  },
  
  getMetrics: () => ({
    requestCount: metrics.requestCount,
    averageResponseTime: metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length,
    errorRate: metrics.errorCount / metrics.requestCount,
    uptime: process.uptime()
  })
};
```

---

## 🔐 **Security Best Practices**

### **Security Headers**
```javascript
// Helmet configuration for security headers
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### **Input Sanitization**
```javascript
// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };
  
  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  
  next();
};
```

---

## 📋 **Documentation Standards**

### **API Documentation**
```javascript
/**
 * @swagger
 * /api/elections:
 *   get:
 *     summary: Get all elections
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of elections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Election'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
```

### **Code Documentation**
```javascript
/**
 * Casts a vote for a candidate in an election
 * @param {string} electionId - The ID of the election
 * @param {string} candidateId - The ID of the candidate
 * @param {string} voterId - The ID of the voter
 * @returns {Promise<Object>} Vote result with receipt hash
 * @throws {Error} If election is not found or voter is not eligible
 */
async function castVote(electionId, candidateId, voterId) {
  // Implementation here
}
```

---

## 🎯 **Conclusion**

This technical specification document provides a comprehensive overview of the blockchain-based voting system architecture, implementation details, and deployment considerations. The system is designed to be:

- **Secure**: Multiple layers of security including cryptographic protection
- **Scalable**: Architecture supports horizontal and vertical scaling
- **Maintainable**: Clean code structure with comprehensive documentation
- **Testable**: Extensive testing framework with high coverage targets
- **Deployable**: Containerized deployment with CI/CD pipeline

The system successfully combines modern web technologies with blockchain innovation to create a robust, transparent, and efficient voting platform suitable for university elections.

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Technical Lead**: [Your Name]  
**Review Status**: Complete Technical Specification  

---

*This document serves as the definitive technical reference for the blockchain-based voting system implementation and should be updated as the system evolves.*