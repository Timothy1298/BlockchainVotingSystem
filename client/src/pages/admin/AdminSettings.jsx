import React, { memo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import AdminSettingsComponent from '../../components/features/admin/AdminSettings';

const AdminSettings = memo(() => {
  return (
    <DashboardLayout>
      <AdminSettingsComponent />
    </DashboardLayout>
  );  
});

AdminSettings.displayName = 'AdminSettings';

export default AdminSettings;
