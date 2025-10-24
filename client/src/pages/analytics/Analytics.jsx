import React, { memo } from 'react';
import {DashboardLayout} from '../../layouts/DashboardLayout';
import { AnalyticsReports } from '../../components/features/analytics';

const Analytics = memo(() => {
  return (
    <DashboardLayout>
      <AnalyticsReports />
    </DashboardLayout>
  );
});

Analytics.displayName = 'Analytics';

export default Analytics;
