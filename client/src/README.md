# Blockchain Voting System - Frontend Architecture

## 📁 Project Structure

This document outlines the organized folder structure of the Blockchain Voting System frontend application.

### 🏗️ Overall Architecture

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (routes)
├── hooks/              # Custom React hooks
├── contexts/           # React contexts for state management
├── services/           # API and external service integrations
├── utils/              # Utility functions and helpers
├── layouts/            # Layout components
├── connectors/         # Web3 connectors
└── assets/             # Static assets
```

## 📦 Components Organization

### `/components/`

Components are organized into three main categories:

#### 🎨 UI Components (`/components/ui/`)
Reusable UI building blocks:

- **`/layout/`** - Layout components
  - `AppLayout.jsx` - Main application layout
  - `Layout.jsx` - Generic layout wrapper
  - `Navbar.jsx` - Navigation bar
  - `Topbar.jsx` - Top navigation bar

- **`/modals/`** - Modal components
  - `Modal.jsx` - Base modal component
  - `ConfirmationDialog.jsx` - Confirmation dialogs

- **`/forms/`** - Form components
  - `FormComponents.jsx` - Reusable form elements

- **`/feedback/`** - User feedback components
  - `Toast.jsx` - Toast notifications
  - `Notifications.jsx` - Notification system
  - `LoadingSkeleton.jsx` - Loading states
  - `SkeletonLoader.jsx` - Skeleton loading components

#### 🚀 Feature Components (`/components/features/`)
Domain-specific feature components:

- **`/elections/`** - Election management
  - `ElectionCard.jsx` - Election display card
  - `ElectionManage.jsx` - Election management interface
  - `ElectionWizard.jsx` - Election creation wizard
  - `ElectionLifecycleControls.jsx` - Election lifecycle management
  - `ElectionNotifications.jsx` - Election notifications
  - `ElectionLanguageSupport.jsx` - Multi-language support
  - `ElectionBackup.jsx` - Election backup/restore
  - `ElectionAnalytics.jsx` - Election analytics
  - `ElectionsList.jsx` - Elections listing

- **`/candidates/`** - Candidate management
  - `CandidateCard.jsx` - Candidate display card
  - `CandidateManagement.jsx` - Candidate management interface
  - `CandidateForm.jsx` - Candidate form
  - `FilterControls.jsx` - Search and filter controls
  - `MetaMaskAccounts.jsx` - MetaMask account management
  - `StatisticsDashboard.jsx` - Statistics display
  - `VotingModal.jsx` - Voting interface modal

- **`/voters/`** - Voter management
  - `VotersList.jsx` - Voters listing
  - `VoterManagement.jsx` - Voter management interface
  - `VoterEligibility.jsx` - Voter eligibility checking

- **`/admin/`** - Admin features
  - `AdminPasswordPrompt.jsx` - Admin authentication
  - `AdminSettings.jsx` - Admin settings
  - `AdminUserManagement.jsx` - User management
  - `UsersList.jsx` - Users listing

- **`/analytics/`** - Analytics and reporting
  - `AnalyticsReports.jsx` - Analytics reports
  - `LiveVoteTrendChart.jsx` - Live voting trends
  - `VoteCharts.jsx` - Voting charts

- **`/blockchain/`** - Blockchain integration
  - `BlockchainHealth.jsx` - Blockchain status
  - `WalletBanner.jsx` - Wallet connection banner
  - `WalletConnectCard.jsx` - Wallet connection interface
  - `ConnectButton.jsx` - Wallet connect button

#### 🔧 Common Components (`/components/common/`)
Shared utility components:

- `Cards.jsx` - Generic card components
- `Results.jsx` - Results display
- `Profile.jsx` - User profile
- `HelpGuide.jsx` - Help and documentation
- `ProtectedRoutes.jsx` - Route protection
- `DebugAuth.jsx` - Authentication debugging
- `GloabalUI.jsx` - Global UI utilities
- `AuditLogs.jsx` - Audit logging
- `SystemHealthDashboard.jsx` - System health monitoring
- `SystemStatus.jsx` - System status
- `PerformanceMonitor.jsx` - Performance monitoring
- `NetworkStatus.jsx` - Network status
- `LiveSyncStatus.jsx` - Live sync status
- `OfflineMode.jsx` - Offline mode handling
- `ErrorBoundary.jsx` - Error boundary component

## 📄 Pages Organization

### `/pages/`

Pages are organized by feature domain:

- **`/admin/`** - Admin pages
  - `AdminSettings.jsx` - Admin settings page

- **`/elections/`** - Election pages
  - `Elections.jsx` - Elections listing page
  - `ElectionDetails.jsx` - Election details page
  - `ElectionManagement.jsx` - Election management page

- **`/candidates/`** - Candidate pages
  - `Candidates.jsx` - Candidates management page
  - `CandidatesRefactored.jsx` - Refactored candidates page

- **`/voters/`** - Voter pages
  - `Voters.jsx` - Voters management page

- **`/analytics/`** - Analytics pages
  - `Analytics.jsx` - Analytics dashboard page

- **`/system/`** - System pages
  - `SystemLogs.jsx` - System logs page
  - `SystemMonitoring.jsx` - System monitoring page

- **`/blockchain/`** - Blockchain pages
  - `BlockchainHealth.jsx` - Blockchain health page

- **`/auth/`** - Authentication pages
  - `Login.jsx` - Login page
  - `Register.jsx` - Registration page
  - `ForgotPassword.jsx` - Password reset request
  - `ResetPassword.jsx` - Password reset

## 🪝 Hooks Organization

### `/hooks/`

Custom hooks are organized by domain:

- **`/elections/`** - Election-related hooks
  - `useElections.js` - Election data and operations

- **`/candidates/`** - Candidate-related hooks
  - `useCandidates.js` - Candidate data and operations
  - `useFilters.js` - Search and filtering logic

- **`/voters/`** - Voter-related hooks
  - `useVoters.js` - Voter data and operations
  - `useVoting.js` - Voting logic and state

- **`/admin/`** - Admin-related hooks
  - `useUsers.js` - User management

- **`/system/`** - System-related hooks
  - `useSystemMonitoring.js` - System monitoring
  - `useAuditLogs.js` - Audit logging

- **`/blockchain/`** - Blockchain-related hooks
  - `useMetaMask.js` - MetaMask integration
  - `useWallet.js` - Wallet management

- **`/auth/`** - Authentication hooks
  - `useAuth.js` - Authentication state and operations

## 🗃️ Contexts Organization

### `/contexts/`

React contexts are organized by domain:

- **`/auth/`** - Authentication context
  - `AuthContext.jsx` - Authentication state

- **`/blockchain/`** - Blockchain contexts
  - `MetaMaskContext.jsx` - MetaMask integration
  - `WalletContext.jsx` - Wallet state

- **`/candidates/`** - Candidate context
  - `CandidatesContext.jsx` - Candidate data and operations

- **`/voters/`** - Voter context
  - `VotingContext.jsx` - Voting state and operations

- **`/ui/`** - UI context
  - `UIContext.jsx` - UI state (modals, notifications, etc.)

## 🔧 Services Organization

### `/services/`

Services are organized by type:

- **`/api/`** - API services
  - `api.js` - REST API client and endpoints

- **`/blockchain/`** - Blockchain services
  - `web3.js` - Web3 integration and blockchain operations

## 🛠️ Utils Organization

### `/utils/`

Utility functions are organized by purpose:

- **`/validation/`** - Validation utilities
  - `validation.js` - Form validation schemas and helpers

- **`/accessibility/`** - Accessibility utilities
  - `accessibility.js` - ARIA helpers, keyboard navigation, etc.

## 📋 Import Guidelines

### Clean Imports with Index Files

Each folder contains an `index.js` file for clean imports:

```javascript
// ✅ Good - Clean imports
import { CandidateCard, VotingModal } from '../components/features/candidates';
import { useCandidates, useFilters } from '../hooks/candidates';
import { CandidatesContext } from '../contexts/candidates';

// ❌ Bad - Direct file imports
import CandidateCard from '../components/features/candidates/CandidateCard';
import useCandidates from '../hooks/candidates/useCandidates';
```

### Import Order

1. React and external libraries
2. Internal components (UI → Features → Common)
3. Hooks
4. Contexts
5. Services
6. Utils
7. Types/interfaces

```javascript
// Example import order
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

import { DashboardLayout } from '../../layouts/DashboardLayout';
import { CandidateCard } from '../../components/features/candidates';
import { useCandidates } from '../../hooks/candidates';
import { CandidatesContext } from '../../contexts/candidates';
import { electionsAPI } from '../../services/api';
import { validateForm } from '../../utils/validation';
```

## 🎯 Benefits of This Structure

### 1. **Scalability**
- Easy to add new features without cluttering
- Clear separation of concerns
- Modular architecture

### 2. **Maintainability**
- Related files are grouped together
- Easy to locate and modify components
- Clear import paths

### 3. **Developer Experience**
- Intuitive folder structure
- Clean imports with index files
- Consistent naming conventions

### 4. **Performance**
- Better tree-shaking with organized imports
- Easier code splitting by feature
- Reduced bundle size

### 5. **Team Collaboration**
- Clear ownership of different domains
- Reduced merge conflicts
- Easier code reviews

## 🚀 Getting Started

### Adding a New Component

1. **Determine the category:**
   - UI component → `/components/ui/[category]/`
   - Feature component → `/components/features/[domain]/`
   - Common component → `/components/common/`

2. **Create the component file:**
   ```bash
   touch src/components/features/elections/NewElectionComponent.jsx
   ```

3. **Update the index file:**
   ```javascript
   // src/components/features/elections/index.js
   export { default as NewElectionComponent } from './NewElectionComponent';
   ```

4. **Import and use:**
   ```javascript
   import { NewElectionComponent } from '../components/features/elections';
   ```

### Adding a New Hook

1. **Create the hook file:**
   ```bash
   touch src/hooks/elections/useNewElectionFeature.js
   ```

2. **Update the index file:**
   ```javascript
   // src/hooks/elections/index.js
   export { default as useNewElectionFeature } from './useNewElectionFeature';
   ```

3. **Import and use:**
   ```javascript
   import { useNewElectionFeature } from '../hooks/elections';
   ```

This structure provides a solid foundation for a scalable, maintainable React application with clear organization and excellent developer experience.
