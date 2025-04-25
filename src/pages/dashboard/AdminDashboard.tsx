import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar role="admin" />
      <div className="pl-64">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;