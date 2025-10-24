# 📱 UI Wireframes & Prototype Screenshots

## 📋 **Overview**

This document contains comprehensive UI wireframes, mockups, and prototype screenshots for the blockchain-based voting system, covering all major user interfaces and user flows.

---

## 🎯 **User Interface Architecture**

### **UI Component Hierarchy**

```
┌─────────────────────────────────────────────────────────────────┐
│                    UI COMPONENT HIERARCHY                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    MAIN APPLICATION                            │
├─────────────────────────────────────────────────────────────────┤
│  Header          │  Navigation    │  Main Content              │
│  • Logo          │  • Sidebar     │  • Page Content            │
│  • User Menu     │  • Menu Items  │  • Dynamic Content         │
│  • Notifications │  • Active State│  • Modals/Overlays         │
│  • Search        │  • Breadcrumbs │  • Forms                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PAGE COMPONENTS                             │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard       │  Voting       │  Admin Panel               │
│  • Stats Cards   │  • Ballot     │  • User Management         │
│  • Charts        │  • Results    │  • Election Management     │
│  • Notifications │  • History    │  • KYC Review              │
│  • Quick Actions │  • Receipts   │  • System Monitoring       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏠 **Dashboard Wireframes**

### **Voter Dashboard - Desktop**

```
┌─────────────────────────────────────────────────────────────────┐
│  🗳️ BLOCK VOTE                    🔔 👤 Timothy Kuria ▼        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ 📊 Dashboard    │  │ 🗳️ Cast Vote    │  │ 📋 My Profile   │ │
│  │                 │  │                 │  │                 │ │
│  │ • Active: 2     │  │ • Elections: 3  │  │ • KYC: Complete │ │
│  │ • Upcoming: 1   │  │ • Voted: 1      │  │ • Votes: 5      │ │
│  │ • Completed: 3  │  │ • Eligible: 2   │  │ • Status: Active│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📈 Recent Activity                                         │ │
│  │                                                             │ │
│  │ ✅ Voted in Student Union Election - 2 hours ago          │ │
│  │ 📋 KYC verification completed - 1 day ago                 │ │
│  │ 🔔 New election: Faculty Representative - 3 days ago      │ │
│  │ 📊 Election results published - 1 week ago                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🗳️ Active Elections                                        │ │
│  │                                                             │ │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ │ Student Union   │  │ Faculty Rep     │  │ Club Elections  │ │
│  │ │                 │  │                 │  │                 │ │
│  │ │ ⏰ Ends: 2 days │  │ ⏰ Ends: 5 days │  │ ⏰ Ends: 1 week │ │
│  │ │ 👥 1,250 votes  │  │ 👥 890 votes    │  │ 👥 450 votes    │ │
│  │ │ ✅ Voted        │  │ 🗳️ Vote Now     │  │ 🗳️ Vote Now     │ │
│  │ └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **Voter Dashboard - Mobile**

```
┌─────────────────────────────────┐
│ 🗳️ BLOCK VOTE        🔔 👤 ▼    │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📊 Dashboard                │ │
│ │                             │ │
│ │ Active Elections: 2         │ │
│ │ Upcoming Elections: 1       │ │
│ │ Completed Elections: 3      │ │
│ │ KYC Status: ✅ Complete     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🗳️ Quick Actions            │ │
│ │                             │ │
│ │ [🗳️ Cast Vote]              │ │
│ │ [📋 View Results]           │ │
│ │ [📊 My History]             │ │
│ │ [⚙️ Settings]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📈 Recent Activity          │ │
│ │                             │ │
│ │ ✅ Voted in Student Union   │ │
│ │    2 hours ago              │ │
│ │                             │ │
│ │ 📋 KYC completed            │ │
│ │    1 day ago                │ │
│ │                             │ │
│ │ 🔔 New election available   │ │
│ │    3 days ago               │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 🗳️ **Voting Interface Wireframes**

### **Election Ballot - Desktop**

```
┌─────────────────────────────────────────────────────────────────┐
│  🗳️ BLOCK VOTE                    🔔 👤 Timothy Kuria ▼        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏠 Dashboard > 🗳️ Cast Vote > Student Union Election          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🗳️ Student Union Election 2024                             │ │
│  │                                                             │ │
│  │ 📅 Voting Period: Dec 1-15, 2024                          │ │
│  │ ⏰ Time Remaining: 2 days, 14 hours                        │ │
│  │ 👥 Total Votes: 1,250                                      │ │
│  │                                                             │ │
│  │ Please select your candidate for Student Union President:  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 👤 John Smith                                               │ │
│  │                                                             │ │
│  │ [📸 Photo]                                                  │ │
│  │                                                             │ │
│  │ 🎯 Manifesto: "Building a stronger student community..."   │ │
│  │ 📧 Contact: john.smith@university.edu                      │ │
│  │                                                             │ │
│  │ [○] Select John Smith                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 👤 Sarah Johnson                                            │ │
│  │                                                             │ │
│  │ [📸 Photo]                                                  │ │
│  │                                                             │ │
│  │ 🎯 Manifesto: "Transparency and accountability..."         │ │
│  │ 📧 Contact: sarah.j@university.edu                         │ │
│  │                                                             │ │
│  │ [○] Select Sarah Johnson                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 👤 Michael Brown                                            │ │
│  │                                                             │ │
│  │ [📸 Photo]                                                  │ │
│  │                                                             │ │
│  │ 🎯 Manifesto: "Innovation and student welfare..."          │ │
│  │ 📧 Contact: m.brown@university.edu                         │ │
│  │                                                             │ │
│  │ [○] Select Michael Brown                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                    [🗳️ Submit Vote]                            │
│                                                                 │
│  ⚠️  Once submitted, your vote cannot be changed.              │
│  🔒 Your vote is encrypted and recorded on the blockchain.     │
└─────────────────────────────────────────────────────────────────┘
```

### **Vote Confirmation Modal**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌─────────────────────────┐                 │
│                    │ 🗳️ Confirm Your Vote    │                 │
│                    ├─────────────────────────┤                 │
│                    │                         │                 │
│                    │ You are about to vote   │                 │
│                    │ for:                    │                 │
│                    │                         │                 │
│                    │ 👤 John Smith           │                 │
│                    │ Student Union President │                 │
│                    │                         │                 │
│                    │ Election:               │                 │
│                    │ Student Union 2024      │                 │
│                    │                         │                 │
│                    │ ⚠️  This action cannot  │                 │
│                    │     be undone.          │                 │
│                    │                         │                 │
│                    │ [Cancel]  [🗳️ Vote]     │                 │
│                    └─────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Vote Receipt**

```
┌─────────────────────────────────────────────────────────────────┐
│  🗳️ BLOCK VOTE                    🔔 👤 Timothy Kuria ▼        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏠 Dashboard > 🗳️ Cast Vote > Vote Receipt                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ✅ Vote Successfully Cast!                                  │ │
│  │                                                             │ │
│  │ Your vote has been recorded on the blockchain and is       │ │
│  │ immutable. Here are your vote details:                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📋 Vote Receipt                                            │ │
│  │                                                             │ │
│  │ Election: Student Union Election 2024                      │ │
│  │ Candidate: John Smith                                      │ │
│  │ Position: Student Union President                          │ │
│  │ Vote Time: Dec 13, 2024 at 2:30 PM                        │ │
│  │                                                             │ │
│  │ 🔗 Transaction Hash:                                       │ │
│  │ 0x4a7b8c9d2e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d2e1f3a5b6c │ │
│  │                                                             │ │
│  │ 📊 Block Number: 1,234,567                                 │ │
│  │ ⛽ Gas Used: 45,000                                        │ │
│  │                                                             │ │
│  │ 🔐 Receipt Hash:                                           │ │
│  │ a1b2c3d4e5f6a7b8c9d2e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📱 Share Your Receipt                                      │ │
│  │                                                             │ │
│  │ [📋 Copy Receipt] [📧 Email Receipt] [📱 SMS Receipt]      │ │
│  │                                                             │ │
│  │ [🔍 Verify Vote] [📊 View Results] [🏠 Back to Dashboard]  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👨‍💼 **Admin Dashboard Wireframes**

### **Admin Dashboard - Desktop**

```
┌─────────────────────────────────────────────────────────────────┐
│  🗳️ BLOCK VOTE - ADMIN              🔔 👤 Admin User ▼        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ 📊 System Stats │  │ 🗳️ Elections    │  │ 👥 Users        │ │
│  │                 │  │                 │  │                 │ │
│  │ • Total Users:  │  │ • Active: 2     │  │ • Total: 1,250  │ │
│  │   1,250         │  │ • Upcoming: 1   │  │ • Verified: 980 │ │
│  │ • Active Votes: │  │ • Completed: 3  │  │ • Pending: 270  │ │
│  │   2,450         │  │ • Total: 6      │  │ • Blocked: 0    │ │
│  │ • System Health:│  │ • Turnout: 75%  │  │ • New Today: 15 │ │
│  │   ✅ 99.9%      │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📈 Recent Activity                                         │ │
│  │                                                             │ │
│  │ 🔔 New KYC application from john.doe@university.edu        │ │
│  │ 🗳️ 45 new votes cast in Student Union Election            │ │
│  │ ⚠️  System maintenance scheduled for tonight               │ │
│  │ ✅ KYC approved for 12 users                               │ │
│  │ 📊 Election results published for Faculty Rep              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🗳️ Active Elections                                        │ │
│  │                                                             │ │
│  │ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ │ Student Union   │  │ Faculty Rep     │  │ Club Elections  │ │
│  │ │                 │  │                 │  │                 │ │
│  │ │ 📅 Dec 1-15     │  │ 📅 Dec 5-20     │  │ 📅 Dec 10-25    │ │
│  │ │ 👥 1,250 votes  │  │ 👥 890 votes    │  │ 👥 450 votes    │ │
│  │ │ 📊 75% turnout  │  │ 📊 68% turnout  │  │ 📊 45% turnout  │ │
│  │ │ [📊 View Stats] │  │ [📊 View Stats] │  │ [📊 View Stats] │ │
│  │ └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **KYC Review Interface**

```
┌─────────────────────────────────────────────────────────────────┐
│  🗳️ BLOCK VOTE - ADMIN              🔔 👤 Admin User ▼        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏠 Dashboard > 👥 Users > KYC Review                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📋 KYC Applications - Pending Review                       │ │
│  │                                                             │ │
│  │ 🔍 Search: [________________] [🔍 Search]                  │ │
│  │ 📊 Filter: [All Status ▼] [All Types ▼] [📅 Date Range]    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 👤 John Doe - john.doe@university.edu                      │ │
│  │                                                             │ │
│  │ 📅 Submitted: Dec 10, 2024 at 2:30 PM                     │ │
│  │ 🆔 Student ID: STU2024001                                  │ │
│  │ 🏫 Faculty: Computer Science                               │ │
│  │                                                             │ │
│  │ 📄 Documents Submitted:                                    │ │
│  │ ✅ Government ID (Passport) - Verified                     │ │
│  │ ✅ Proof of Address (Utility Bill) - Verified             │ │
│  │ ✅ Selfie Photo - Pending Review                           │ │
│  │                                                             │ │
│  │ 🔍 Biometric Verification:                                 │ │
│  │ ✅ Facial Recognition - 95% Confidence                     │ │
│  │ ✅ Liveness Check - Passed                                 │ │
│  │                                                             │ │
│  │ 📝 Admin Notes:                                            │ │
│  │ [________________________________________________]         │ │
│  │                                                             │ │
│  │ [❌ Reject] [✅ Approve] [📋 Request More Info]            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 👤 Sarah Wilson - sarah.w@university.edu                   │ │
│  │                                                             │ │
│  │ 📅 Submitted: Dec 9, 2024 at 4:15 PM                      │ │
│  │ 🆔 Student ID: STU2024002                                  │ │
│  │ 🏫 Faculty: Business Administration                        │ │
│  │                                                             │ │
│  │ 📄 Documents Submitted:                                    │ │
│  │ ⚠️  Government ID (National ID) - Needs Review             │ │
│  │ ✅ Proof of Address (Bank Statement) - Verified           │ │
│  │ ✅ Selfie Photo - Verified                                 │ │
│  │                                                             │ │
│  │ 🔍 Biometric Verification:                                 │ │
│  │ ✅ Facial Recognition - 92% Confidence                     │ │
│  │ ✅ Liveness Check - Passed                                 │ │
│  │                                                             │ │
│  │ 📝 Admin Notes:                                            │ │
│  │ [________________________________________________]         │ │
│  │                                                             │ │
│  │ [❌ Reject] [✅ Approve] [📋 Request More Info]            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 **Mobile Interface Wireframes**

### **Mobile Voting Flow**

```
┌─────────────────────────────────┐
│ 🗳️ BLOCK VOTE        🔔 👤 ▼    │
├─────────────────────────────────┤
│                                 │
│ 🗳️ Student Union Election       │
│                                 │
│ 📅 Dec 1-15, 2024              │
│ ⏰ 2 days remaining             │
│ 👥 1,250 votes cast             │
│                                 │
│ Select your candidate:          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 John Smith               │ │
│ │                             │ │
│ │ [📸 Photo]                  │ │
│ │                             │ │
│ │ 🎯 "Building a stronger     │ │
│ │    student community..."    │ │
│ │                             │ │
│ │ [○] Select                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Sarah Johnson            │ │
│ │                             │ │
│ │ [📸 Photo]                  │ │
│ │                             │ │
│ │ 🎯 "Transparency and        │ │
│ │    accountability..."       │ │
│ │                             │ │
│ │ [○] Select                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Michael Brown            │ │
│ │                             │ │
│ │ [📸 Photo]                  │ │
│ │                             │ │
│ │ 🎯 "Innovation and          │ │
│ │    student welfare..."      │ │
│ │                             │ │
│ │ [○] Select                  │ │
│ └─────────────────────────────┘ │
│                                 │
│        [🗳️ Submit Vote]        │
│                                 │
│ ⚠️ Vote cannot be changed      │
│ 🔒 Encrypted on blockchain     │
└─────────────────────────────────┘
```

### **Mobile KYC Process**

```
┌─────────────────────────────────┐
│ 🗳️ BLOCK VOTE        🔔 👤 ▼    │
├─────────────────────────────────┤
│                                 │
│ 📋 Complete Your KYC            │
│                                 │
│ Step 2 of 5: Document Upload    │
│                                 │
│ ████████░░ 40% Complete         │
│                                 │
│ 📄 Government ID                │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📷 Take Photo or Upload     │ │
│ │                             │ │
│ │ [📷 Camera] [📁 Gallery]    │ │
│ │                             │ │
│ │ Accepted formats:           │ │
│ │ • JPEG, PNG, PDF            │ │
│ │ • Max size: 10MB            │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📄 Proof of Address            │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📷 Take Photo or Upload     │ │
│ │                             │ │
│ │ [📷 Camera] [📁 Gallery]    │ │
│ │                             │ │
│ │ Examples:                   │ │
│ │ • Utility bill              │ │
│ │ • Bank statement            │ │
│ │ • Rental agreement          │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📄 Selfie Photo                │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📷 Take Selfie              │ │
│ │                             │ │
│ │ [📷 Take Photo]             │ │
│ │                             │ │
│ │ Requirements:               │ │
│ │ • Clear face visibility     │ │
│ │ • Good lighting             │ │
│ │ • No sunglasses/hats        │ │
│ └─────────────────────────────┘ │
│                                 │
│ [← Back] [Continue →]           │
└─────────────────────────────────┘
```

---

## 🔐 **Authentication Wireframes**

### **Login Page**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌─────────────────────────┐                 │
│                    │                         │                 │
│                    │    🗳️ BLOCK VOTE        │                 │
│                    │                         │                 │
│                    │  Secure Voting System   │                 │
│                    │                         │                 │
│                    │ ┌─────────────────────┐ │                 │
│                    │ │ Email               │ │                 │
│                    │ │ [________________]  │ │                 │
│                    │ └─────────────────────┘ │                 │
│                    │                         │                 │
│                    │ ┌─────────────────────┐ │                 │
│                    │ │ Password            │ │                 │
│                    │ │ [________________]  │ │                 │
│                    │ └─────────────────────┘ │                 │
│                    │                         │                 │
│                    │ [ ] Remember me         │                 │
│                    │                         │                 │
│                    │ [🔐 Login]              │                 │
│                    │                         │                 │
│                    │ [🔗 Forgot Password?]   │                 │
│                    │                         │                 │
│                    │ Don't have an account?  │                 │
│                    │ [📝 Register Here]      │                 │
│                    │                         │                 │
│                    │ 🔒 Powered by Blockchain│                 │
│                    └─────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Registration Page**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ┌─────────────────────────┐                 │
│                    │                         │                 │
│                    │    📝 Create Account    │                 │
│                    │                         │                 │
│                    │ ┌─────────────────────┐ │                 │
│                    │ │ Full Name           │ │                 │
│                    │ │ [________________]  │ │                 │
│                    │ └─────────────────────┘ │                 │
│                    │                         │                 │
│                    │ ┌─────────────────────┐ │                 │
│                    │ │ Email               │ │                 │
│                    │ │ [________________]  │ │                 │
│                    │ └─────────────────────┘ │                 │
│                    │                         │                 │
│                    │ ┌─────────────────────┐ │                 │
│                    │ │ Student ID          │ │                 │
│                    │ │ [________________]  │ │                 │
│                    │ └─────────────────────┘ │                 │
│                    │                         │                 │
│                    │ ┌─────────────────────┐ │                 │
│                    │ │ Faculty             │ │                 │
│                    │ │ [Select Faculty ▼]  │ │                 │
│                    │ └─────────────────────┘ │                 │
│                    │                         │                 │
│                    │ ┌─────────────────────┐ │                 │
│                    │ │ Password            │ │                 │
│                    │ │ [________________]  │ │                 │
│                    │ └─────────────────────┘ │                 │
│                    │                         │                 │
│                    │ ┌─────────────────────┐ │                 │
│                    │ │ Confirm Password    │ │                 │
│                    │ │ [________________]  │ │                 │
│                    │ └─────────────────────┘ │                 │
│                    │                         │                 │
│                    │ [ ] I agree to terms   │                 │
│                    │                         │                 │
│                    │ [📝 Create Account]    │                 │
│                    │                         │                 │
│                    │ Already have account?  │                 │
│                    │ [🔐 Login Here]        │                 │
│                    └─────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 **Results and Analytics Wireframes**

### **Election Results Dashboard**

```
┌─────────────────────────────────────────────────────────────────┐
│  🗳️ BLOCK VOTE                    🔔 👤 Timothy Kuria ▼        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏠 Dashboard > 📊 Results > Student Union Election 2024       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🏆 Student Union Election 2024 - Final Results             │ │
│  │                                                             │ │
│  │ 📅 Election Period: Dec 1-15, 2024                        │ │
│  │ ⏰ Results Published: Dec 16, 2024 at 9:00 AM             │ │
│  │ 👥 Total Votes: 1,250 (75% turnout)                       │ │
│  │ 🔗 Blockchain Verified: ✅ Confirmed                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📊 Results Breakdown                                       │ │
│  │                                                             │ │
│  │ 🥇 John Smith - 45% (563 votes)                           │ │
│  │ ████████████████████████████████████████████████████████   │ │
│  │                                                             │ │
│  │ 🥈 Sarah Johnson - 35% (438 votes)                        │ │
│  │ ████████████████████████████████████████████████████       │ │
│  │                                                             │ │
│  │ 🥉 Michael Brown - 20% (249 votes)                        │ │
│  │ ████████████████████████████████████████████               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📈 Voting Statistics                                       │ │
│  │                                                             │ │
│  │ • Total Eligible Voters: 1,667                            │ │
│  │ • Votes Cast: 1,250                                       │ │
│  │ • Turnout Rate: 75%                                       │ │
│  │ • Invalid Votes: 0                                        │ │
│  │ • Blockchain Confirmations: 1,250                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🔗 Blockchain Verification                                 │ │
│  │                                                             │ │
│  │ 📊 Block Range: 1,234,500 - 1,235,750                     │ │
│  │ 🔐 Transaction Hash: 0x4a7b8c9d2e1f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d2e1f3a5b6c │ │
│  │ ⛽ Total Gas Used: 56,250,000                              │ │
│  │ ✅ All votes verified on blockchain                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [📋 Download Results] [🔍 Verify Vote] [🏠 Back to Dashboard]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 **Design System & UI Components**

### **Color Palette**

```
┌─────────────────────────────────────────────────────────────────┐
│                    COLOR PALETTE                               │
└─────────────────────────────────────────────────────────────────┘

Primary Colors:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ #1E40AF         │  │ #3B82F6         │  │ #60A5FA         │
│ (Blue-800)      │  │ (Blue-500)      │  │ (Blue-400)      │
│ Primary Dark    │  │ Primary         │  │ Primary Light   │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Secondary Colors:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ #059669         │  │ #10B981         │  │ #34D399         │
│ (Green-600)     │  │ (Green-500)     │  │ (Green-400)     │
│ Success Dark    │  │ Success         │  │ Success Light   │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Warning Colors:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ #D97706         │  │ #F59E0B         │  │ #FBBF24         │
│ (Orange-600)    │  │ (Orange-500)    │  │ (Orange-400)    │
│ Warning Dark    │  │ Warning         │  │ Warning Light   │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Error Colors:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ #DC2626         │  │ #EF4444         │  │ #F87171         │
│ (Red-600)       │  │ (Red-500)       │  │ (Red-400)       │
│ Error Dark      │  │ Error           │  │ Error Light     │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Neutral Colors:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ #111827         │  │ #6B7280         │  │ #F9FAFB         │
│ (Gray-900)      │  │ (Gray-500)      │  │ (Gray-50)       │
│ Text Dark       │  │ Text Medium     │  │ Background      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### **Typography Scale**

```
┌─────────────────────────────────────────────────────────────────┐
│                    TYPOGRAPHY SCALE                            │
└─────────────────────────────────────────────────────────────────┘

Headings:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ H1: 2.5rem      │  │ H2: 2rem        │  │ H3: 1.5rem      │
│ (40px)          │  │ (32px)          │  │ (24px)          │
│ font-bold       │  │ font-semibold   │  │ font-semibold   │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Body Text:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Body: 1rem      │  │ Small: 0.875rem │  │ Caption: 0.75rem│
│ (16px)          │  │ (14px)          │  │ (12px)          │
│ font-normal     │  │ font-normal     │  │ font-normal     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### **Component Library**

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT LIBRARY                           │
└─────────────────────────────────────────────────────────────────┘

Buttons:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ [Primary]       │  │ [Secondary]     │  │ [Danger]        │
│ bg-blue-500     │  │ bg-gray-500     │  │ bg-red-500      │
│ text-white      │  │ text-white      │  │ text-white      │
│ px-4 py-2       │  │ px-4 py-2       │  │ px-4 py-2       │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Cards:
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Card Title                                              │ │
│ │                                                         │ │
│ │ Card content goes here with proper spacing and         │ │
│ │ typography for readability.                            │ │
│ │                                                         │ │
│ │ [Action Button]                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Forms:
┌─────────────────────────────────────────────────────────────┐
│ Label                                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Input field with placeholder text                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Helper text or error message                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 **Responsive Design Breakpoints**

### **Breakpoint System**

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSIVE BREAKPOINTS                      │
└─────────────────────────────────────────────────────────────────┘

Mobile First Approach:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Mobile          │  │ Tablet          │  │ Desktop         │
│ 0-767px         │  │ 768-1023px      │  │ 1024px+         │
│                 │  │                 │  │                 │
│ • Single column │  │ • 2 columns     │  │ • 3+ columns    │
│ • Stacked nav   │  │ • Collapsible   │  │ • Full sidebar  │
│ • Touch targets │  │   sidebar       │  │ • Hover states  │
│ • Large buttons │  │ • Medium cards  │  │ • Compact UI    │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Layout Adaptations:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Mobile Layout   │  │ Tablet Layout   │  │ Desktop Layout  │
│                 │  │                 │  │                 │
│ [Header]        │  │ [Header]        │  │ [Sidebar][Main] │
│ [Content]       │  │ [Sidebar][Main] │  │ [Header]        │
│ [Footer]        │  │ [Footer]        │  │ [Content]       │
│                 │  │                 │  │ [Footer]        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 🎯 **User Experience (UX) Guidelines**

### **Accessibility Standards**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCESSIBILITY GUIDELINES                   │
└─────────────────────────────────────────────────────────────────┘

WCAG 2.1 AA Compliance:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Color Contrast  │  │ Keyboard        │  │ Screen Reader   │
│ 4.5:1 minimum   │  │ Navigation      │  │ Support         │
│ for normal text │  │ All functions   │  │ ARIA labels     │
│ 3:1 for large   │  │ accessible via  │  │ Semantic HTML   │
│ text            │  │ keyboard        │  │ Alt text        │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Touch Targets:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Minimum Size    │  │ Spacing         │  │ Visual Feedback │
│ 44x44px         │  │ 8px minimum     │  │ Hover states    │
│ for all         │  │ between         │  │ Active states   │
│ interactive     │  │ touch targets   │  │ Focus indicators│
│ elements        │  │                 │  │ Loading states  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### **Performance Guidelines**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE GUIDELINES                     │
└─────────────────────────────────────────────────────────────────┘

Loading Times:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Initial Load    │  │ Page Transitions│  │ Image Loading   │
│ < 3 seconds     │  │ < 1 second      │  │ Lazy loading    │
│ on 3G network   │  │ Smooth          │  │ WebP format     │
│                 │  │ animations      │  │ Optimized sizes │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Optimization:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Code Splitting  │  │ Caching         │  │ Compression     │
│ Route-based     │  │ Service Worker  │  │ Gzip/Brotli     │
│ Component-based │  │ Browser cache   │  │ Minification    │
│ Lazy loading    │  │ CDN caching     │  │ Tree shaking    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**UI/UX Lead**: [Your Name]  
**Review Status**: Complete UI Wireframes & Prototypes  

---

*This document provides comprehensive UI wireframes, mockups, and design specifications for the blockchain-based voting system, covering all major user interfaces and user flows.*
