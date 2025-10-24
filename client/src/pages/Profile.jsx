import React, { memo } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Profile as ProfileComponent } from '../components/common';

const Profile = memo(() => {
  return (
    <DashboardLayout title="Profile">
      <ProfileComponent />
    </DashboardLayout>
  );
});

Profile.displayName = 'Profile';

export default Profile;