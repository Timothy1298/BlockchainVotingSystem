# 🗄️ Database Schema & Entity Relationship Diagram (ERD)

## 📋 **Overview**

This document contains the complete database schema and Entity Relationship Diagram (ERD) for the blockchain-based voting system, including all entities, relationships, and constraints.

---

## 🎯 **Entity Relationship Diagram (ERD)**

### **Complete ERD Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIP DIAGRAM                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USER        │    │    ELECTION     │    │   CANDIDATE     │
│                 │    │                 │    │                 │
│ • user_id (PK)  │    │ • election_id   │    │ • candidate_id  │
│ • full_name     │    │   (PK)          │    │   (PK)          │
│ • email         │    │ • title         │    │ • name          │
│ • password_hash │    │ • description   │    │ • seat          │
│ • role          │    │ • starts_at     │    │ • bio           │
│ • student_id    │    │ • ends_at       │    │ • manifesto     │
│ • faculty       │    │ • status        │    │ • photo_url     │
│ • created_at    │    │ • voting_enabled│    │ • is_active     │
│ • updated_at    │    │ • created_by    │    │ • created_at    │
│                 │    │ • created_at    │    │ • updated_at    │
│                 │    │ • updated_at    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1:N                   │ 1:N                   │ 1:N
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   KYC_INFO      │    │   VOTE_RECORD   │    │   VOTE_RECEIPT  │
│                 │    │                 │    │                 │
│ • kyc_id (PK)   │    │ • vote_id (PK)  │    │ • receipt_id    │
│ • user_id (FK)  │    │ • election_id   │    │   (PK)          │
│ • kyc_status    │    │   (FK)          │    │ • vote_id (FK)  │
│ • biometric_    │    │ • voter_id (FK) │    │ • receipt_hash  │
│   status        │    │ • candidate_id  │    │ • transaction_  │
│ • overall_      │    │   (FK)          │    │   hash          │
│   status        │    │ • vote_timestamp│    │ • block_number  │
│ • verified_at   │    │ • blockchain_   │    │ • gas_used      │
│ • verified_by   │    │   tx_hash       │    │ • created_at    │
│ • admin_notes   │    │ • is_verified   │    │                 │
│ • created_at    │    │ • created_at    │    │                 │
│ • updated_at    │    │ • updated_at    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1:N                   │ 1:1                   │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   KYC_DOCUMENT  │    │   AUDIT_LOG     │    │  NOTIFICATION   │
│                 │    │                 │    │                 │
│ • doc_id (PK)   │    │ • log_id (PK)   │    │ • notif_id (PK) │
│ • kyc_id (FK)   │    │ • user_id (FK)  │    │ • user_id (FK)  │
│ • document_type │    │ • action_type   │    │ • title         │
│ • file_url      │    │ • resource_type │    │ • message       │
│ • file_name     │    │ • resource_id   │    │ • type          │
│ • file_size     │    │ • ip_address    │    │ • is_read       │
│ • mime_type     │    │ • user_agent    │    │ • created_at    │
│ • uploaded_at   │    │ • timestamp     │    │ • read_at       │
│ • verified      │    │ • details       │    │                 │
│ • verified_at   │    │ • created_at    │    │                 │
│ • verified_by   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BLOCKCHAIN_   │    │   SYSTEM_       │    │   USER_SESSION  │
│   TRANSACTION   │    │   CONFIG        │    │                 │
│                 │    │                 │    │ • session_id    │
│ • tx_id (PK)    │    │ • config_id     │    │   (PK)          │
│ • vote_id (FK)  │    │   (PK)          │    │ • user_id (FK)  │
│ • tx_hash       │    │ • config_key    │    │ • token_hash    │
│ • block_number  │    │ • config_value  │    │ • ip_address    │
│ • gas_used      │    │ • description   │    │ • user_agent    │
│ • gas_price     │    │ • is_active     │    │ • expires_at    │
│ • status        │    │ • created_at    │    │ • created_at    │
│ • created_at    │    │ • updated_at    │    │ • last_accessed │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🗄️ **Detailed Database Schema**

### **1. USER Table**

```sql
CREATE TABLE users (
    user_id VARCHAR(24) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('voter', 'admin') DEFAULT 'voter',
    student_id VARCHAR(20) UNIQUE,
    faculty VARCHAR(100),
    national_id VARCHAR(20) UNIQUE,
    contact VARCHAR(20),
    is_registered BOOLEAN DEFAULT FALSE,
    registration_date TIMESTAMP NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    login_attempts INT DEFAULT 0,
    lock_until TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_student_id (student_id),
    INDEX idx_role (role),
    INDEX idx_is_registered (is_registered)
);
```

### **2. ELECTION Table**

```sql
CREATE TABLE elections (
    election_id VARCHAR(24) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    election_type VARCHAR(100) NOT NULL,
    description TEXT,
    seats JSON NOT NULL,
    sub_seats JSON DEFAULT '{}',
    chain_election_id INT,
    last_synced_block INT,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    status ENUM('Setup', 'Open', 'Closed', 'Finalized') DEFAULT 'Setup',
    voting_enabled BOOLEAN DEFAULT FALSE,
    candidate_list_locked BOOLEAN DEFAULT FALSE,
    results JSON DEFAULT '{}',
    final_results_hash VARCHAR(255),
    total_votes INT DEFAULT 0,
    turnout_percentage DECIMAL(5,2),
    rules JSON DEFAULT '{}',
    created_by VARCHAR(24),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_status (status),
    INDEX idx_voting_enabled (voting_enabled),
    INDEX idx_starts_at (starts_at),
    INDEX idx_ends_at (ends_at),
    INDEX idx_chain_election_id (chain_election_id)
);
```

### **3. CANDIDATE Table**

```sql
CREATE TABLE candidates (
    candidate_id VARCHAR(24) PRIMARY KEY,
    election_id VARCHAR(24) NOT NULL,
    name VARCHAR(100) NOT NULL,
    seat VARCHAR(100) NOT NULL,
    votes INT DEFAULT 0,
    chain_candidate_id INT,
    bio TEXT,
    photo_url VARCHAR(500),
    manifesto TEXT,
    name_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    party VARCHAR(100),
    position VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE,
    INDEX idx_election_id (election_id),
    INDEX idx_seat (seat),
    INDEX idx_is_active (is_active),
    INDEX idx_chain_candidate_id (chain_candidate_id)
);
```

### **4. KYC_INFO Table**

```sql
CREATE TABLE kyc_info (
    kyc_id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    address JSON DEFAULT '{}',
    blockchain_info JSON DEFAULT '{}',
    documents JSON DEFAULT '{}',
    biometric_info JSON DEFAULT '{}',
    verification JSON DEFAULT '{}',
    privacy_consent JSON DEFAULT '{}',
    registration_steps JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_verification_status (verification->>'$.kycStatus'),
    INDEX idx_overall_status (verification->>'$.overallStatus')
);
```

### **5. KYC_DOCUMENT Table**

```sql
CREATE TABLE kyc_documents (
    doc_id VARCHAR(24) PRIMARY KEY,
    kyc_id VARCHAR(24) NOT NULL,
    document_type ENUM('government_id', 'proof_of_address', 'selfie') NOT NULL,
    document_subtype ENUM('passport', 'national_id', 'driver_license', 'utility_bill', 'bank_statement', 'rental_agreement') NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(100),
    issuing_country VARCHAR(100),
    expiry_date DATE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    verified_by VARCHAR(24),
    
    FOREIGN KEY (kyc_id) REFERENCES kyc_info(kyc_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id),
    INDEX idx_kyc_id (kyc_id),
    INDEX idx_document_type (document_type),
    INDEX idx_verified (verified),
    INDEX idx_uploaded_at (uploaded_at)
);
```

### **6. VOTE_RECORD Table**

```sql
CREATE TABLE vote_records (
    vote_id VARCHAR(24) PRIMARY KEY,
    election_id VARCHAR(24) NOT NULL,
    voter_id VARCHAR(24) NOT NULL,
    candidate_id VARCHAR(24) NOT NULL,
    vote_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blockchain_tx_hash VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_timestamp TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE,
    FOREIGN KEY (voter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote_per_election (election_id, voter_id),
    INDEX idx_election_id (election_id),
    INDEX idx_voter_id (voter_id),
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_vote_timestamp (vote_timestamp),
    INDEX idx_blockchain_tx_hash (blockchain_tx_hash)
);
```

### **7. VOTE_RECEIPT Table**

```sql
CREATE TABLE vote_receipts (
    receipt_id VARCHAR(24) PRIMARY KEY,
    vote_id VARCHAR(24) NOT NULL,
    receipt_hash VARCHAR(255) UNIQUE NOT NULL,
    transaction_hash VARCHAR(255) NOT NULL,
    block_number BIGINT NOT NULL,
    gas_used INT NOT NULL,
    gas_price BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vote_id) REFERENCES vote_records(vote_id) ON DELETE CASCADE,
    INDEX idx_vote_id (vote_id),
    INDEX idx_receipt_hash (receipt_hash),
    INDEX idx_transaction_hash (transaction_hash),
    INDEX idx_block_number (block_number)
);
```

### **8. BLOCKCHAIN_TRANSACTION Table**

```sql
CREATE TABLE blockchain_transactions (
    tx_id VARCHAR(24) PRIMARY KEY,
    vote_id VARCHAR(24) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    gas_used INT NOT NULL,
    gas_price BIGINT NOT NULL,
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    confirmation_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    
    FOREIGN KEY (vote_id) REFERENCES vote_records(vote_id) ON DELETE CASCADE,
    INDEX idx_vote_id (vote_id),
    INDEX idx_tx_hash (tx_hash),
    INDEX idx_block_number (block_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### **9. AUDIT_LOG Table**

```sql
CREATE TABLE audit_logs (
    log_id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24),
    action_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(24),
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_resource_type (resource_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_ip_address (ip_address)
);
```

### **10. NOTIFICATION Table**

```sql
CREATE TABLE notifications (
    notif_id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);
```

### **11. USER_SESSION Table**

```sql
CREATE TABLE user_sessions (
    session_id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_accessed (last_accessed)
);
```

### **12. SYSTEM_CONFIG Table**

```sql
CREATE TABLE system_config (
    config_id VARCHAR(24) PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_config_key (config_key),
    INDEX idx_is_active (is_active)
);
```

---

## 🔗 **Relationship Definitions**

### **Primary Relationships**

#### **1. User → KYC Info (1:1)**
- Each user has exactly one KYC record
- KYC record cannot exist without a user
- Cascade delete when user is deleted

#### **2. User → Vote Records (1:N)**
- One user can have multiple votes (across different elections)
- Each vote belongs to exactly one user
- Cascade delete when user is deleted

#### **3. Election → Candidates (1:N)**
- One election can have multiple candidates
- Each candidate belongs to exactly one election
- Cascade delete when election is deleted

#### **4. Election → Vote Records (1:N)**
- One election can have multiple votes
- Each vote belongs to exactly one election
- Cascade delete when election is deleted

#### **5. Candidate → Vote Records (1:N)**
- One candidate can receive multiple votes
- Each vote is for exactly one candidate
- Cascade delete when candidate is deleted

#### **6. Vote Record → Vote Receipt (1:1)**
- Each vote has exactly one receipt
- Receipt cannot exist without a vote
- Cascade delete when vote is deleted

#### **7. Vote Record → Blockchain Transaction (1:1)**
- Each vote has exactly one blockchain transaction
- Transaction cannot exist without a vote
- Cascade delete when vote is deleted

#### **8. KYC Info → KYC Documents (1:N)**
- One KYC record can have multiple documents
- Each document belongs to exactly one KYC record
- Cascade delete when KYC record is deleted

#### **9. User → Notifications (1:N)**
- One user can have multiple notifications
- Each notification belongs to exactly one user
- Cascade delete when user is deleted

#### **10. User → User Sessions (1:N)**
- One user can have multiple active sessions
- Each session belongs to exactly one user
- Cascade delete when user is deleted

---

## 📊 **Indexing Strategy**

### **Primary Indexes**

```sql
-- User table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_registered ON users(is_registered);

-- Election table indexes
CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_elections_voting_enabled ON elections(voting_enabled);
CREATE INDEX idx_elections_starts_at ON elections(starts_at);
CREATE INDEX idx_elections_ends_at ON elections(ends_at);
CREATE INDEX idx_elections_chain_election_id ON elections(chain_election_id);

-- Vote records indexes
CREATE INDEX idx_vote_records_election_voter ON vote_records(election_id, voter_id);
CREATE INDEX idx_vote_records_timestamp ON vote_records(vote_timestamp);
CREATE INDEX idx_vote_records_blockchain_tx ON vote_records(blockchain_tx_hash);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

### **Composite Indexes**

```sql
-- Performance optimization indexes
CREATE INDEX idx_votes_election_candidate ON vote_records(election_id, candidate_id);
CREATE INDEX idx_candidates_election_seat ON candidates(election_id, seat);
CREATE INDEX idx_kyc_docs_type_verified ON kyc_documents(document_type, verified);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_sessions_user_expires ON user_sessions(user_id, expires_at);
```

---

## 🔒 **Security Constraints**

### **Data Integrity Constraints**

```sql
-- Check constraints
ALTER TABLE users ADD CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE users ADD CONSTRAINT chk_password_length CHECK (CHAR_LENGTH(password_hash) >= 60);
ALTER TABLE elections ADD CONSTRAINT chk_election_dates CHECK (ends_at > starts_at);
ALTER TABLE vote_records ADD CONSTRAINT chk_vote_timestamp CHECK (vote_timestamp >= '2024-01-01');

-- Unique constraints
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT uk_users_student_id UNIQUE (student_id);
ALTER TABLE vote_receipts ADD CONSTRAINT uk_receipt_hash UNIQUE (receipt_hash);
ALTER TABLE blockchain_transactions ADD CONSTRAINT uk_tx_hash UNIQUE (tx_hash);
```

### **Referential Integrity**

```sql
-- Foreign key constraints with appropriate actions
ALTER TABLE elections ADD CONSTRAINT fk_elections_created_by 
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE candidates ADD CONSTRAINT fk_candidates_election 
    FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE;

ALTER TABLE vote_records ADD CONSTRAINT fk_votes_election 
    FOREIGN KEY (election_id) REFERENCES elections(election_id) ON DELETE CASCADE;

ALTER TABLE vote_records ADD CONSTRAINT fk_votes_voter 
    FOREIGN KEY (voter_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE vote_records ADD CONSTRAINT fk_votes_candidate 
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE;
```

---

## 📈 **Performance Optimization**

### **Query Optimization**

```sql
-- Materialized views for frequently accessed data
CREATE VIEW election_results AS
SELECT 
    e.election_id,
    e.title,
    e.status,
    c.candidate_id,
    c.name,
    c.seat,
    COUNT(v.vote_id) as vote_count,
    e.total_votes,
    ROUND((COUNT(v.vote_id) / e.total_votes) * 100, 2) as percentage
FROM elections e
LEFT JOIN candidates c ON e.election_id = c.election_id
LEFT JOIN vote_records v ON c.candidate_id = v.candidate_id
WHERE e.status = 'Closed'
GROUP BY e.election_id, c.candidate_id;

-- Index for the materialized view
CREATE INDEX idx_election_results_election ON election_results(election_id);
CREATE INDEX idx_election_results_candidate ON election_results(candidate_id);
```

### **Partitioning Strategy**

```sql
-- Partition audit logs by date for better performance
ALTER TABLE audit_logs PARTITION BY RANGE (YEAR(timestamp)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Partition vote records by election for better query performance
ALTER TABLE vote_records PARTITION BY HASH(election_id) PARTITIONS 4;
```

---

## 🔄 **Data Migration Scripts**

### **Initial Data Setup**

```sql
-- Insert default admin user
INSERT INTO users (user_id, full_name, email, password_hash, role, is_registered) 
VALUES ('admin001', 'System Administrator', 'admin@voting-system.com', 
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8K8K8', 
        'admin', TRUE);

-- Insert system configuration
INSERT INTO system_config (config_id, config_key, config_value, description) VALUES
('config001', 'voting_enabled', 'true', 'Global voting system status'),
('config002', 'kyc_required', 'true', 'KYC verification requirement'),
('config003', 'max_vote_attempts', '3', 'Maximum vote attempts per user'),
('config004', 'session_timeout', '3600', 'Session timeout in seconds'),
('config005', 'blockchain_network', 'ganache', 'Blockchain network configuration');
```

---

## 📊 **Database Statistics and Monitoring**

### **Performance Monitoring Queries**

```sql
-- Database size monitoring
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'voting_system'
ORDER BY (data_length + index_length) DESC;

-- Query performance monitoring
SELECT 
    query,
    count_star,
    avg_timer_wait/1000000000 as avg_time_seconds,
    sum_timer_wait/1000000000 as total_time_seconds
FROM performance_schema.events_statements_summary_by_digest
WHERE schema_name = 'voting_system'
ORDER BY sum_timer_wait DESC
LIMIT 10;

-- Index usage statistics
SELECT 
    table_name,
    index_name,
    cardinality,
    sub_part,
    packed,
    nullable,
    index_type
FROM information_schema.statistics
WHERE table_schema = 'voting_system'
ORDER BY table_name, seq_in_index;
```

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Database Lead**: [Your Name]  
**Review Status**: Complete Database Schema & ERD  

---

*This document provides comprehensive database schema and Entity Relationship Diagram for the blockchain-based voting system, including all tables, relationships, constraints, and optimization strategies.*
