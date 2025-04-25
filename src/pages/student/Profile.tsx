import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import type { UserProfile } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCreditCard, FiCalendar, FiBook, FiPhone, FiShield, FiClock } from 'react-icons/fi';

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!session?.user) {
          throw new Error('No user session found');
        }

        // First verify that the user is a student
        const { data: roleData, error: roleError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (roleError) {
          throw new Error(`Failed to verify role: ${roleError.message}`);
        }

        if (!roleData || roleData.role !== 'student') {
          // If not a student, redirect to appropriate dashboard
          navigate(roleData?.role === 'admin' ? '/admin/dashboard' : '/login');
          throw new Error('Unauthorized: Student access only');
        }

        // Fetch student profile with role verification
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .eq('role', 'student')
          .single();

        if (profileError) throw profileError;
        if (!data) throw new Error('Profile not found');
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6 mb-1">
        <div className="flex items-center space-x-6">
          <div className="bg-white p-2 rounded-full">
            <FiUser className="h-16 w-16 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{profile?.full_name}</h1>
            <div className="flex items-center text-blue-100">
              <FiBook className="h-5 w-5 mr-2" />
              <span>Student</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-b-lg shadow-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-4">
                  <FiUser className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Full Name</label>
                    <div className="mt-1 text-gray-900 font-medium">{profile?.full_name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Student ID</label>
                    <div className="mt-1 text-gray-900 font-medium">{profile?.student_id || 'Not set'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">National ID</label>
                    <div className="mt-1 text-gray-900 font-medium">{profile?.national_id}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Gender</label>
                    <div className="mt-1 text-gray-900 font-medium capitalize">{profile?.gender || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-4">
                  <FiMail className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email Address</label>
                    <div className="mt-1 text-gray-900 font-medium">{profile?.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                    <div className="mt-1 text-gray-900 font-medium">{profile?.phone_number || 'Not set'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-4">
                  <FiShield className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Role</label>
                    <div className="mt-1 text-gray-900 font-medium capitalize">{profile?.role}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Status</label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Information */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-4">
                  <FiClock className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Membership Information</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Member Since</label>
                    <div className="mt-1 text-gray-900 font-medium">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                    <div className="mt-1 text-gray-900 font-medium">
                      {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 