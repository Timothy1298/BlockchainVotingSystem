# 🔄 Data Flow Diagrams (DFD)

## 📋 **Overview**

This document contains comprehensive Data Flow Diagrams (DFD) for the blockchain-based voting system, including Level 0 (Context), Level 1 (System), and Level 2 (Process) diagrams.

---

## 🎯 **DFD Level 0 - Context Diagram**

### **System Context and External Entities**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DFD LEVEL 0 - CONTEXT DIAGRAM               │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   Voter         │
                    │   (Student)     │
                    └─────────┬───────┘
                              │
                              │ Vote Data
                              │ Authentication
                              │ KYC Documents
                              │
                    ┌─────────▼───────┐
                    │                 │
                    │  BLOCKCHAIN     │
                    │  VOTING         │
                    │  SYSTEM         │
                    │                 │
                    │                 │
                    └─────────┬───────┘
                              │
                              │ Election Results
                              │ Vote Receipts
                              │ Notifications
                              │
                    ┌─────────▼───────┐
                    │   Election      │
                    │   Administrator │
                    └─────────────────┘

┌─────────────────┐                    ┌─────────────────┐
│   University    │                    │   Blockchain    │
│   Database      │◄──────────────────►│   Network       │
│   (MongoDB)     │                    │   (Ethereum)    │
│                 │                    │                 │
│ • User Data     │                    │ • Smart         │
│ • Elections     │                    │   Contracts     │
│ • Audit Logs    │                    │ • Vote Records  │
│ • KYC Docs      │                    │ • Transactions  │
└─────────────────┘                    └─────────────────┘

┌─────────────────┐                    ┌─────────────────┐
│   External      │                    │   Notification  │
│   Services      │                    │   Services      │
│                 │                    │                 │
│ • Email Service │                    │ • SMS Gateway   │
│ • File Storage  │                    │ • Push Notif    │
│ • Analytics     │                    │ • Webhooks      │
└─────────────────┘                    └─────────────────┘
```

---

## 🔄 **DFD Level 1 - System Diagram**

### **Main System Processes**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DFD LEVEL 1 - SYSTEM DIAGRAM                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Voter         │    │   Admin         │    │   System        │
│   Interface     │    │   Interface     │    │   Monitor       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ User Data            │ Admin Commands       │ System Data
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN VOTING SYSTEM                    │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 1.0         │  │ 2.0         │  │ 3.0         │            │
│  │ User        │  │ Election    │  │ Vote        │            │
│  │ Management  │  │ Management  │  │ Processing  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│         ▼                 ▼                 ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 4.0         │  │ 5.0         │  │ 6.0         │            │
│  │ KYC         │  │ Blockchain  │  │ Results     │            │
│  │ Processing  │  │ Integration │  │ Management  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│         ▼                 ▼                 ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 7.0         │  │ 8.0         │  │ 9.0         │            │
│  │ Audit       │  │ Notification│  │ Security    │            │
│  │ Logging     │  │ Management  │  │ Management  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Data     │    │   Election      │    │   Audit         │
│   Store         │    │   Data Store    │    │   Data Store    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔄 **DFD Level 2 - Process Details**

### **Process 1.0 - User Management**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DFD LEVEL 2 - PROCESS 1.0                   │
│                    USER MANAGEMENT                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Voter         │    │   Admin         │    │   External      │
│   Registration  │    │   User Mgmt     │    │   Auth Service  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ User Data            │ Admin Actions        │ Auth Data
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER MANAGEMENT PROCESS                     │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 1.1         │  │ 1.2         │  │ 1.3         │            │
│  │ User        │  │ Authentication│  │ Profile     │            │
│  │ Registration│  │ & Authorization│  │ Management  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│         ▼                 ▼                 ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 1.4         │  │ 1.5         │  │ 1.6         │            │
│  │ Role        │  │ Session     │  │ User        │            │
│  │ Management  │  │ Management  │  │ Validation  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User          │    │   Session       │    │   Validation    │
│   Database      │    │   Store         │    │   Results       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Process 2.0 - Election Management**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DFD LEVEL 2 - PROCESS 2.0                   │
│                    ELECTION MANAGEMENT                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin         │    │   Election      │    │   Candidate     │
│   Dashboard     │    │   Data          │    │   Data          │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ Admin Commands       │ Election Info        │ Candidate Info
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ELECTION MANAGEMENT PROCESS                 │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 2.1         │  │ 2.2         │  │ 2.3         │            │
│  │ Election    │  │ Candidate   │  │ Election    │            │
│  │ Creation    │  │ Management  │  │ Scheduling  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│         ▼                 ▼                 ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 2.4         │  │ 2.5         │  │ 2.6         │            │
│  │ Voter       │  │ Election    │  │ Results     │            │
│  │ Registration│  │ Monitoring  │  │ Calculation │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Election      │    │   Monitoring    │    │   Results       │
│   Database      │    │   Data          │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Process 3.0 - Vote Processing**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DFD LEVEL 2 - PROCESS 3.0                   │
│                    VOTE PROCESSING                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Voter         │    │   Election      │    │   Blockchain    │
│   Interface     │    │   Data          │    │   Network       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ Vote Data            │ Election Rules       │ Smart Contract
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VOTE PROCESSING SYSTEM                      │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 3.1         │  │ 3.2         │  │ 3.3         │            │
│  │ Vote        │  │ Vote        │  │ Blockchain  │            │
│  │ Validation  │  │ Recording   │  │ Submission  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│         ▼                 ▼                 ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 3.4         │  │ 3.5         │  │ 3.6         │            │
│  │ Receipt     │  │ Vote        │  │ Audit       │            │
│  │ Generation  │  │ Verification│  │ Trail       │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vote          │    │   Verification  │    │   Audit         │
│   Database      │    │   Results       │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Process 4.0 - KYC Processing**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DFD LEVEL 2 - PROCESS 4.0                   │
│                    KYC PROCESSING                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Voter         │    │   Document      │    │   Admin         │
│   Documents     │    │   Storage       │    │   Review        │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ KYC Documents        │ Document Data        │ Review Actions
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    KYC PROCESSING SYSTEM                       │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 4.1         │  │ 4.2         │  │ 4.3         │            │
│  │ Document    │  │ Document    │  │ Biometric   │            │
│  │ Upload      │  │ Validation  │  │ Verification│            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│         ▼                 ▼                 ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 4.4         │  │ 4.5         │  │ 4.6         │            │
│  │ Admin       │  │ KYC         │  │ Status      │            │
│  │ Review      │  │ Approval    │  │ Update      │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Review        │    │   KYC           │    │   Status        │
│   Database      │    │   Database      │    │   Notifications │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Process 5.0 - Blockchain Integration**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DFD LEVEL 2 - PROCESS 5.0                   │
│                    BLOCKCHAIN INTEGRATION                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Smart         │    │   Blockchain    │
│   Data          │    │   Contracts     │    │   Events        │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ Transaction Data     │ Contract Calls       │ Event Data
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN INTEGRATION SYSTEM               │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 5.1         │  │ 5.2         │  │ 5.3         │            │
│  │ Transaction │  │ Smart       │  │ Event       │            │
│  │ Preparation │  │ Contract    │  │ Processing  │            │
│  │             │  │ Execution   │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│         ▼                 ▼                 ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 5.4         │  │ 5.5         │  │ 5.6         │            │
│  │ Gas         │  │ Transaction │  │ Data        │            │
│  │ Management  │  │ Monitoring  │  │ Synchronization│         │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gas           │    │   Transaction   │    │   Synchronized  │
│   Database      │    │   Logs          │    │   Data          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔄 **Data Flow Summary**

### **Key Data Flows**

#### **1. User Registration Flow**
```
User Input → Validation → Database Storage → Blockchain Registration → Confirmation
```

#### **2. Vote Casting Flow**
```
Vote Input → Validation → Blockchain Transaction → Receipt Generation → Result Update
```

#### **3. KYC Processing Flow**
```
Document Upload → Validation → Admin Review → Approval/Rejection → Status Update
```

#### **4. Election Management Flow**
```
Election Creation → Candidate Addition → Voter Registration → Voting Period → Results
```

#### **5. Audit Trail Flow**
```
System Events → Logging → Database Storage → Audit Reports → Compliance Check
```

---

## 📊 **Data Store Definitions**

### **Data Stores (D1-D9)**

```
D1: User Database
    - User profiles
    - Authentication data
    - Role assignments
    - Session information

D2: Election Database
    - Election configurations
    - Candidate information
    - Voting rules
    - Election status

D3: Vote Database
    - Vote records
    - Receipt hashes
    - Vote history
    - Verification data

D4: KYC Database
    - Document storage
    - Verification status
    - Admin reviews
    - Biometric data

D5: Blockchain Network
    - Smart contracts
    - Transaction records
    - Vote data
    - Event logs

D6: Audit Database
    - System logs
    - User activities
    - Security events
    - Compliance records

D7: Notification Database
    - User notifications
    - Email templates
    - SMS records
    - Push notifications

D8: File Storage
    - KYC documents
    - System backups
    - Log files
    - Media files

D9: Cache Storage
    - Session data
    - API responses
    - Temporary data
    - Performance cache
```

---

## 🔄 **External Entity Definitions**

### **External Entities (E1-E6)**

```
E1: Voter (Student)
    - University students
    - Eligible voters
    - System users
    - Vote casters

E2: Election Administrator
    - University staff
    - System administrators
    - Election managers
    - KYC reviewers

E3: University Database
    - Student records
    - Academic data
    - Enrollment information
    - Authentication system

E4: Blockchain Network
    - Ethereum network
    - Smart contracts
    - Transaction processing
    - Consensus mechanism

E5: External Services
    - Email service
    - SMS gateway
    - File storage
    - Analytics service

E6: System Monitor
    - Performance monitoring
    - Security monitoring
    - Health checks
    - Alert system
```

---

## 📋 **Process Specifications**

### **Process Descriptions**

#### **1.0 User Management**
- **Purpose**: Manage user registration, authentication, and profiles
- **Inputs**: User data, authentication credentials, profile information
- **Outputs**: User records, authentication tokens, profile updates
- **Key Functions**: Registration, login, profile management, role assignment

#### **2.0 Election Management**
- **Purpose**: Create, configure, and manage elections
- **Inputs**: Election data, candidate information, voting rules
- **Outputs**: Election configurations, candidate lists, voting schedules
- **Key Functions**: Election creation, candidate management, voter registration

#### **3.0 Vote Processing**
- **Purpose**: Process and record votes securely
- **Inputs**: Vote data, voter credentials, election rules
- **Outputs**: Vote records, receipts, verification data
- **Key Functions**: Vote validation, recording, verification, receipt generation

#### **4.0 KYC Processing**
- **Purpose**: Verify voter identity and eligibility
- **Inputs**: Identity documents, biometric data, verification requests
- **Outputs**: Verification status, approval/rejection, audit records
- **Key Functions**: Document validation, biometric verification, admin review

#### **5.0 Blockchain Integration**
- **Purpose**: Integrate with blockchain for secure vote recording
- **Inputs**: Transaction data, smart contract calls, blockchain events
- **Outputs**: Blockchain transactions, event logs, synchronized data
- **Key Functions**: Transaction preparation, contract execution, event processing

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Data Flow Lead**: [Your Name]  
**Review Status**: Complete Data Flow Diagrams  

---

*This document provides comprehensive Data Flow Diagrams for the blockchain-based voting system, showing the flow of data through all system processes.*
