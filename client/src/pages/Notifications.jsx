import React, { memo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Notifications as NotificationsComponent } from '../components/ui/feedback';

const Notifications = memo(() => {
  return (
    <DashboardLayout>
      <NotificationsComponent />
    </DashboardLayout>
  );
});

Notifications.displayName = 'Notifications';

export default Notifications;
