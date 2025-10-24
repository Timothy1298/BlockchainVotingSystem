import React, { memo } from 'react';
import {DashboardLayout} from '../../layouts/DashboardLayout';
import { BlockchainHealth } from '../../components/features/blockchain';
import { useGlobalUI } from '../../components/common';
const BlockchainHealthPage = memo(() => {
  const { showToast } = useGlobalUI();
  return (
    <DashboardLayout>
      <BlockchainHealth showToast={showToast} />
    </DashboardLayout>
  );
});

BlockchainHealthPage.displayName = 'BlockchainHealthPage';

export default BlockchainHealthPage;
