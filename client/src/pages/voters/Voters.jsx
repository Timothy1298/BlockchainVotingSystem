import React, { memo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { VoterManagement } from '../../components/features/voters';
import { useGlobalUI } from '../../components/common';
const VotersPage = memo(() => {
  const { showToast } = useGlobalUI();
  return (
    <DashboardLayout>
      <VoterManagement showToast={showToast} />
    </DashboardLayout>
  );
});

VotersPage.displayName = 'VotersPage';

export default VotersPage;