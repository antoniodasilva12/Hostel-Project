import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface LaundryRequestResponse {
  id: string;
  student_id: string;
  room_number: string;
  number_of_clothes: number;
  special_instructions: string;
  pickup_time: string;
  status: 'pending' | 'processing' | 'ready' | 'collected';
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface LaundryRequest {
  id: string;
  student_id: string;
  room_number: string;
  number_of_clothes: number;
  special_instructions: string;
  pickup_time: string;
  status: 'pending' | 'processing' | 'ready' | 'collected';
  created_at: string;
  student_name: string;
}

const Laundry: React.FC = () => {
  const [requests, setRequests] = useState<LaundryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLaundryRequests();
  }, []);

  const fetchLaundryRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify admin access
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session) {
        throw new Error('No active session found. Please log in.');
      }

      // Verify admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch profile: ${profileError.message}`);
      }

      if (!profile || profile.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      // Fetch laundry requests with student names using JOIN
      const { data: laundryData, error: laundryError } = await supabase
        .from('laundry_requests')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (laundryError) {
        console.error('Laundry fetch error:', laundryError);
        throw laundryError;
      }

      console.log('Fetched laundry data:', laundryData);

      // Transform the data to match our interface
      const transformedData: LaundryRequest[] = (laundryData || []).map((request: any) => ({
        id: request.id,
        student_id: request.student_id,
        room_number: request.room_number,
        number_of_clothes: request.number_of_clothes,
        special_instructions: request.special_instructions,
        pickup_time: request.pickup_time,
        status: request.status,
        created_at: request.created_at,
        student_name: request.profiles?.full_name || 'Unknown'
      }));

      setRequests(transformedData);
    } catch (err) {
      console.error('Error fetching laundry requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch laundry requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: LaundryRequest['status']) => {
    try {
      const { error } = await supabase
        .from('laundry_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh the requests list
      await fetchLaundryRequests();
    } catch (err) {
      console.error('Error updating request status:', err);
      setError('Failed to update request status');
    }
  };

  const getNextStatus = (currentStatus: LaundryRequest['status']): LaundryRequest['status'] | null => {
    const statusFlow: Record<LaundryRequest['status'], LaundryRequest['status'] | null> = {
      'pending': 'processing',
      'processing': 'ready',
      'ready': 'collected',
      'collected': null
    };
    return statusFlow[currentStatus];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Laundry Management</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No laundry requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.student_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.room_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.number_of_clothes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.pickup_time).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{request.special_instructions}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${request.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                        ${request.status === 'ready' ? 'bg-green-100 text-green-800' : ''}
                        ${request.status === 'collected' ? 'bg-gray-100 text-gray-800' : ''}
                      `}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {getNextStatus(request.status) && (
                        <button
                          onClick={() => updateRequestStatus(request.id, getNextStatus(request.status)!)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Mark as {getNextStatus(request.status)}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Laundry;
