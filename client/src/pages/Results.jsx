import React, { memo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Results } from '../components/common'; 

const ResultsPage = memo(() => {
  return (
    <DashboardLayout>
      <Results />
    </DashboardLayout>
  );
});

ResultsPage.displayName = 'ResultsPage';

export default ResultsPage;