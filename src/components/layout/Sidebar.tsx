import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { 
  FiHome, 
  FiLogOut, 
  FiTool, 
  FiDollarSign, 
  FiBox, 
  FiUsers, 
  FiSettings, 
  FiCalendar, 
  FiClock, 
  FiBookOpen,
  FiPieChart,
  FiTrendingUp,
  FiClipboard,
  FiBook,
  FiBell
} from 'react-icons/fi';
import { GiWashingMachine } from 'react-icons/gi';
import { IoBedOutline } from 'react-icons/io5';
import { BsPersonCircle } from 'react-icons/bs';
import { RiLeafLine } from 'react-icons/ri';
import { FiWifi, FiDroplet } from 'react-icons/fi';

type UserRole = 'admin' | 'student';

interface SidebarProps {
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);

  React.useEffect(() => {
    if (role === 'student') {
      fetchUnreadNotifications();
      subscribeToNotifications();
    }
  }, [role]);

  const fetchUnreadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('student_id', user.id)
        .eq('read', false);

      if (error) throw error;
      setUnreadNotifications(count || 0);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, () => {
        fetchUnreadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex items-center px-4 mb-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
      <div className="ml-2 flex-1 border-t border-gray-700 opacity-50" />
    </div>
  );

  const renderAdminSections = () => (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="pb-2">
        <SectionHeader title="Overview" />
        <div className="mt-1 space-y-1">
          <Link
            to="/admin"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiHome className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link
            to="/admin/students"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/students')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <BsPersonCircle className="mr-3 h-5 w-5" />
            Students
          </Link>
        </div>
      </div>

      {/* Room Management */}
      <div className="pb-2">
        <SectionHeader title="Room Management" />
        <div className="mt-1 space-y-1">
          <Link
            to="/admin/rooms"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/rooms')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <IoBedOutline className="mr-3 h-5 w-5" />
            Rooms
          </Link>
          <Link
            to="/admin/allocations"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/allocations')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiUsers className="mr-3 h-5 w-5" />
            Allocations
          </Link>
          <Link
            to="/admin/bookings"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/bookings')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiCalendar className="mr-3 h-5 w-5" />
            Booking Requests
          </Link>
        </div>
      </div>

      {/* Services Management */}
      <div className="pb-2">
        <SectionHeader title="Services" />
        <div className="mt-1 space-y-1">
          <Link
            to="/admin/maintenance"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/maintenance')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiTool className="mr-3 h-5 w-5" />
            Maintenance
          </Link>
          <Link
            to="/admin/laundry"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/laundry')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <GiWashingMachine className="mr-3 h-5 w-5" />
            Laundry Requests
          </Link>
          <Link
            to="/admin/meal-plans"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/meal-plans')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <RiLeafLine className="mr-3 h-5 w-5" />
            Meal Plans
          </Link>
        </div>
      </div>

      {/* Financial Management */}
      <div className="pb-2">
        <SectionHeader title="Finance" />
        <div className="mt-1 space-y-1">
          <Link
            to="/admin/payments"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/payments')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiDollarSign className="mr-3 h-5 w-5" />
            Payments
          </Link>
          <Link
            to="/admin/invoices"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/invoices')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiClipboard className="mr-3 h-5 w-5" />
            Invoices
          </Link>
        </div>
      </div>

      {/* Analytics & Reports */}
      <div className="pb-2">
        <SectionHeader title="Analytics" />
        <div className="mt-1 space-y-1">
          <Link
            to="/admin/reports"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/reports')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiPieChart className="mr-3 h-5 w-5" />
            Reports
          </Link>
          <Link
            to="/admin/predictive-analytics"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/predictive-analytics')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiTrendingUp className="mr-3 h-5 w-5" />
            Predictive Analytics
          </Link>
        </div>
      </div>

      {/* Resources */}
      <div className="pb-2">
        <SectionHeader title="Resources" />
        <div className="mt-1 space-y-1">
          <Link
            to="/admin/resources"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/resources')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiBox className="mr-3 h-5 w-5" />
            Resources
          </Link>
          <Link
            to="/admin/settings"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/admin/settings')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiSettings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );

  const renderStudentSections = () => (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="pb-2">
        <SectionHeader title="Overview" />
        <div className="mt-1 space-y-1">
          <Link
            to="/student"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/student')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiHome className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link
            to="/student/profile"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/student/profile')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <BsPersonCircle className="mr-3 h-5 w-5" />
            My Profile
          </Link>
        </div>
      </div>

      {/* Accommodation Section */}
      <div className="pb-2">
        <SectionHeader title="Accommodation" />
        <div className="mt-1 space-y-1">
          <Link
            to="/student/room"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/student/room')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <IoBedOutline className="mr-3 h-5 w-5" />
            Room Details
          </Link>
          <Link
            to="/student/booking"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/student/booking')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiCalendar className="mr-3 h-5 w-5" />
            Room Booking
          </Link>
        </div>
      </div>

      {/* Services Section */}
      <div className="pb-2">
        <SectionHeader title="Services" />
        <div className="mt-1 space-y-1">
          <Link
            to="/student/maintenance"
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isActive('/student/maintenance')
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <FiTool className="mr-3 h-5 w-5" />
            Maintenance Request
          </Link>
          <Link
            to="/student/laundry"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/student/laundry')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <GiWashingMachine className="mr-3 h-5 w-5" />
            Laundry Service
          </Link>
          <Link
            to="/student/meal"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/student/meal')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <RiLeafLine className="mr-3 h-5 w-5" />
            Meal Plan
          </Link>
          <Link
            to="/student/study-room"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/student/study-room')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FiBookOpen className="mr-3 h-5 w-5" />
            Study Room
          </Link>
        </div>
      </div>

      {/* Payments Section */}
      <div>
        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Payments
        </h3>
        <div className="mt-2 space-y-1">
          <Link
            to="/student/payment"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/student/payment')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FiDollarSign className="mr-3 h-5 w-5" />
            Make Payment
          </Link>
          <Link
            to="/student/payment-history"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/student/payment-history')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FiClock className="mr-3 h-5 w-5" />
            Payment History
          </Link>
        </div>
      </div>

      {/* Resources Section */}
      <div>
        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Resources
        </h3>
        <div className="mt-2 space-y-1">
          <Link
            to="/student/resources"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/student/resources')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FiBox className="mr-3 h-5 w-5" />
            Resources
          </Link>
          <Link
            to="/student/handbook"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/student/handbook')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FiBookOpen className="mr-3 h-5 w-5" />
            Student Handbook
          </Link>
        </div>
      </div>

      {/* Notifications Section */}
      <div>
        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Notifications
        </h3>
        <div className="mt-2 space-y-1">
          <Link
            to="/student/notifications"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/student/notifications')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="relative mr-3">
              <FiBell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </div>
            Notifications
          </Link>
        </div>
      </div>

      {/* Settings Section */}
      <div>
        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Settings
        </h3>
        <div className="mt-2 space-y-1">
          <Link
            to="/student/settings"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive('/student/settings')
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <FiSettings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-gray-800 z-10">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white">Student Portal</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 py-4">
            {role === 'admin' ? (
              renderAdminSections()
            ) : (
              renderStudentSections()
            )}
          </nav>
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
          >
            <FiLogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;