import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FiCheck, FiX, FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';

interface BookingRequest {
  id: string;
  student_id: string;
  room_id: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  profiles: {
    full_name: string;
    registration_number: string;
    email: string;
  };
  rooms: {
    room_number: string;
    type: string;
    floor_number: number | null;
    is_occupied: boolean;
  };
}

const BookingRequests: React.FC = () => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingRequests, setProcessingRequests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'request_date' | 'room_number'>('request_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchBookingRequests();
  }, [filter, sortField, sortOrder]);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('booking_requests')
        .select(`
          *,
          profiles (full_name, registration_number, email),
          rooms (room_number, type, floor_number, is_occupied)
        `)
        .order(sortField === 'room_number' ? 'rooms(room_number)' : sortField, { ascending: sortOrder === 'asc' });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      console.error('Error fetching booking requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this booking request?')) {
      return;
    }

    try {
      setProcessingRequests(prev => [...prev, id]);
      setError(null);
      
      // Optimistic update
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      ));
      
      // 1. Get the booking request details
      const { data: requestData, error: requestError } = await supabase
        .from('booking_requests')
        .select(`
          *,
          rooms!inner(is_occupied)
        `)
        .eq('id', id)
        .single();
      
      if (requestError) throw new Error('Failed to fetch booking request: ' + requestError.message);
      if (!requestData) throw new Error('Booking request not found');

      // 2. Check if room is already occupied
      if (requestData.rooms.is_occupied) {
        throw new Error('This room is already occupied');
      }

      // 3. Update booking status
      const { error: updateError } = await supabase
        .from('booking_requests')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('status', 'pending'); // Only approve if still pending
        
      if (updateError) throw new Error('Failed to update booking status: ' + updateError.message);

      // 4. Create room allocation
      const { error: allocationError } = await supabase
        .from('room_allocations')
        .insert([{
          student_id: requestData.student_id,
          room_id: requestData.room_id,
          start_date: new Date().toISOString(),
          status: 'active'
        }]);
      
      if (allocationError) {
        // Rollback booking status if allocation fails
        await supabase
          .from('booking_requests')
          .update({ status: 'pending' })
          .eq('id', id);
        throw new Error('Failed to create room allocation: ' + allocationError.message);
      }
      
      // 5. Update room status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ is_occupied: true })
        .eq('id', requestData.room_id);

      if (roomError) {
        // Rollback previous changes if room update fails
        await supabase
          .from('room_allocations')
          .delete()
          .eq('student_id', requestData.student_id)
          .eq('room_id', requestData.room_id);
        
        await supabase
          .from('booking_requests')
          .update({ status: 'pending' })
          .eq('id', id);
        
        throw new Error('Failed to update room status: ' + roomError.message);
      }

      // Refresh the data to ensure consistency
      await fetchBookingRequests();
      
    } catch (err: any) {
      console.error('Error in approval process:', err);
      setError(err.message || 'Failed to approve booking request');
      // Revert optimistic update on error
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'pending' } : req
      ));
      await fetchBookingRequests(); // Refresh to ensure consistent state
    } finally {
      setProcessingRequests(prev => prev.filter(reqId => reqId !== id));
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this booking request?')) {
      return;
    }

    try {
      setProcessingRequests(prev => [...prev, id]);
      setError(null);
      
      // 1. Update the status to rejected
      const { error: updateError } = await supabase
        .from('booking_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('status', 'pending'); // Only reject if still pending
        
      if (updateError) throw new Error('Failed to reject booking request: ' + updateError.message);

      await fetchBookingRequests();
      
    } catch (err: any) {
      console.error('Error in rejection process:', err);
      setError(err.message || 'Failed to reject booking request');
      await fetchBookingRequests(); // Refresh to ensure consistent state
    } finally {
      setProcessingRequests(prev => prev.filter(reqId => reqId !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.profiles.full_name.toLowerCase().includes(searchLower) ||
      request.profiles.registration_number.toLowerCase().includes(searchLower) ||
      request.rooms.room_number.toLowerCase().includes(searchLower)
    );
  });

  const toggleSort = (field: 'request_date' | 'room_number') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
          <button
            onClick={fetchBookingRequests}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-md hover:bg-gray-50"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          {/* Status Filters */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                filter === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                filter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Rejected
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name, reg no, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('room_number')}
                >
                  <div className="flex items-center">
                    Room
                    <FiFilter className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('request_date')}
                >
                  <div className="flex items-center">
                    Request Date
                    <FiFilter className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No booking requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.profiles.full_name}</div>
                      <div className="text-sm text-gray-500">{request.profiles.registration_number}</div>
                      <div className="text-sm text-gray-500">{request.profiles.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Room {request.rooms.room_number}</div>
                      <div className="text-sm text-gray-500">{request.rooms.type}</div>
                      {request.rooms.floor_number && (
                        <div className="text-sm text-gray-500">Floor {request.rooms.floor_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.request_date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={processingRequests.includes(request.id)}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <FiCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={processingRequests.includes(request.id)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
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

export default BookingRequests; 