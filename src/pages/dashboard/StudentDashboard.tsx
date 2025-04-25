import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { FiBook, FiBell, FiDollarSign, FiTool, FiClock, FiCalendar, FiBox } from 'react-icons/fi';
import { GiWashingMachine } from 'react-icons/gi';
import { IoBedOutline } from 'react-icons/io5';
import { RiLeafLine } from 'react-icons/ri';
import ChatBot from '../../components/ChatBot';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [recentPayment, setRecentPayment] = React.useState<any>(null);
  const [notifications, setNotifications] = React.useState<number>(0);
  const [maintenanceRequests, setMaintenanceRequests] = React.useState<number>(0);
  const [roomDetails, setRoomDetails] = React.useState<any>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [studentName, setStudentName] = React.useState<string>('');

  React.useEffect(() => {
    fetchDashboardData();
    // Add animation after initial load
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch student profile to get name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile?.full_name) {
        setStudentName(profile.full_name);
      }

      // Fetch recent payment
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', user.id)
        .order('payment_date', { ascending: false })
        .limit(1)
        .single();

      setRecentPayment(payments);

      // Fetch maintenance requests count
      const { count: requestCount } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact' })
        .eq('student_id', user.id)
        .eq('status', 'pending');

      setMaintenanceRequests(requestCount || 0);

      // Fetch room details
      const { data: room } = await supabase
        .from('room_allocations')
        .select('*, rooms(*)')
        .eq('student_id', user.id)
        .is('end_date', null)
        .single();

      setRoomDetails(room);

      // Fetch notifications count (unread)
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('student_id', user.id)
        .eq('read', false);

      setNotifications(notifCount || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const QuickAccessCard = ({ icon: Icon, title, value, link, bgColor }: any) => (
    <div 
      onClick={() => navigate(link)}
      className={`${bgColor} rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-102 hover:shadow-xl relative overflow-hidden ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-white/10 rounded-full transform rotate-12" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/90 text-sm font-medium uppercase tracking-wider">{title}</p>
          <Icon className="text-white h-7 w-7 opacity-90" />
        </div>
        <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Welcome, {studentName || 'Student'}!
            </h1>
            <p className="text-gray-500 text-sm">
              Here's an overview of your hostel activities
            </p>
          </div>
          <div className="text-sm text-gray-500 text-right">
            <div className="font-medium">
              {new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true 
              })}
            </div>
            <div>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickAccessCard
            icon={IoBedOutline}
            title="Room Details"
            value={roomDetails?.rooms?.room_number || 'Not Allocated'}
            link="/student/room"
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <QuickAccessCard
            icon={FiDollarSign}
            title="Latest Payment"
            value={recentPayment ? `KES ${recentPayment.amount}` : 'No Payment'}
            link="/student/payment"
            bgColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <QuickAccessCard
            icon={FiTool}
            title="Maintenance Requests"
            value={maintenanceRequests}
            link="/student/maintenance"
            bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          <QuickAccessCard
            icon={FiBell}
            title="Notifications"
            value={notifications}
            link="/student/notifications"
            bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        {/* Services Quick Access */}
        <div className={`transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">Quick Services</span>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-4" />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {[
              { icon: FiCalendar, title: 'Book Room', link: '/student/booking' },
              { icon: GiWashingMachine, title: 'Laundry', link: '/student/laundry' },
              { icon: RiLeafLine, title: 'Meal Plan', link: '/student/meal' },
              { icon: FiBox, title: 'Resources', link: '/student/resources' },
              { icon: FiBook, title: 'Handbook', link: '/student/handbook' }
            ].map((service, index) => (
              <button
                key={service.title}
                onClick={() => navigate(service.link)}
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102 group"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <service.icon className="h-7 w-7 text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-medium text-gray-700">{service.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">Recent Activity</span>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-4" />
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-6 backdrop-blur-sm bg-white/50">
            <div className="space-y-4">
              {recentPayment && (
                <div className="flex items-center text-sm p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <FiClock className="h-5 w-5 text-blue-500 mr-3" />
                  <span>Last payment of <strong>KES {recentPayment.amount}</strong> on {new Date(recentPayment.payment_date).toLocaleDateString()}</span>
                </div>
              )}
              {maintenanceRequests > 0 && (
                <div className="flex items-center text-sm p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <FiTool className="h-5 w-5 text-orange-500 mr-3" />
                  <span>You have <strong>{maintenanceRequests}</strong> pending maintenance {maintenanceRequests === 1 ? 'request' : 'requests'}</span>
                </div>
              )}
              {notifications > 0 && (
                <div className="flex items-center text-sm p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <FiBell className="h-5 w-5 text-purple-500 mr-3" />
                  <span>You have <strong>{notifications}</strong> unread {notifications === 1 ? 'notification' : 'notifications'}</span>
                </div>
              )}
              {!recentPayment && !maintenanceRequests && !notifications && (
                <div className="text-center text-gray-500 py-4">
                  No recent activity to display
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  );
};

export default StudentDashboard;