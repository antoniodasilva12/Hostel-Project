import React from 'react';
import Notifications from '../../components/notifications/Notifications';

const NotificationsPage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <Notifications />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 