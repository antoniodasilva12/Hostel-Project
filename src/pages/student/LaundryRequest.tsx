import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import LaundryTimePrediction from './LaundryTimePrediction';

interface LaundryRequest {
  id: string;
  student_id: string;
  room_number: string;
  number_of_clothes: number;
  special_instructions: string;
  pickup_time: string;
  status: 'pending' | 'processing' | 'ready' | 'collected';
  created_at: string;
}

const LaundryRequest = () => {
  const [requests, setRequests] = useState<LaundryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [hasPendingBooking, setHasPendingBooking] = useState(false);
  const [formData, setFormData] = useState({
    number_of_clothes: 0,
    special_instructions: '',
    pickup_time: ''
  });

  useEffect(() => {
    fetchRequests();
    checkRoomStatus();
  }, []);

  const checkRoomStatus = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch room from room_allocations
      const { data: allocation, error: allocationError } = await supabase
        .from('room_allocations')
        .select(`
          *,
          room:room_id (
            id,
            room_number
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (allocationError) {
        console.error('Error fetching allocation:', allocationError);
        throw allocationError;
      }

      if (allocation?.room?.room_number) {
        setRoomNumber(allocation.room.room_number);
        setHasPendingBooking(false);
      } else {
        setRoomNumber(null);
        setHasPendingBooking(false);
      }

    } catch (error) {
      console.error('Error checking room status:', error);
      setError('Failed to check room status');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('laundry_requests')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to fetch laundry requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber) {
      setError('You must have an allocated room to submit laundry requests');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate pickup time is not in the past
      const pickupTime = new Date(formData.pickup_time);
      if (pickupTime < new Date()) {
        throw new Error('Pickup time cannot be in the past');
      }

      // Validate number of clothes
      if (formData.number_of_clothes <= 0) {
        throw new Error('Number of clothes must be greater than 0');
      }

      const { error: submitError } = await supabase
        .from('laundry_requests')
        .insert({
          student_id: user.id,
          room_number: roomNumber,
          number_of_clothes: formData.number_of_clothes,
          special_instructions: formData.special_instructions || '',
          pickup_time: pickupTime.toISOString(),
          status: 'pending'
        })
        .select();

      if (submitError) throw new Error(submitError.message);

      setFormData({
        number_of_clothes: 0,
        special_instructions: '',
        pickup_time: ''
      });
      setError(null);
      await fetchRequests();

    } catch (err: any) {
      console.error('Error submitting request:', err);
      setError(err.message || 'Failed to submit laundry request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'collected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshStatus = () => {
    setLoading(true);
    checkRoomStatus();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Submit Request Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Laundry Request</h2>
          
          {!roomNumber && (
            <div className="mb-6">
              <div className="flex items-start space-x-2 text-yellow-700 bg-yellow-50 p-4 rounded-lg mb-2">
                <FiAlertCircle className="w-5 h-5 mt-0.5" />
                {hasPendingBooking ? (
                  <p className="text-sm">You have a pending room booking request. Laundry services will be available after your booking is approved.</p>
                ) : (
                  <p className="text-sm">You need to have an allocated room to submit laundry requests.</p>
                )}
              </div>
              <button 
                type="button"
                onClick={refreshStatus}
                className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800 flex justify-center items-center"
              >
                <FiRefreshCw className="w-4 h-4 mr-1" />
                Refresh booking status
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="number_of_clothes" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Clothes
              </label>
              <input
                id="number_of_clothes"
                type="number"
                min="1"
                value={formData.number_of_clothes}
                onChange={(e) => setFormData({ ...formData, number_of_clothes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="pickup_time" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Pickup Time
              </label>
              <input
                id="pickup_time"
                type="datetime-local"
                value={formData.pickup_time}
                onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                id="special_instructions"
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any special instructions for handling your laundry"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting || !roomNumber}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>

          <div className="mt-6">
            <LaundryTimePrediction
              onTimeSelected={(time) => setFormData({ ...formData, pickup_time: time })}
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Laundry Requests</h2>
            
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No laundry requests found</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-600">
                          {new Date(request.created_at).toLocaleString()}
                        </div>
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">
                            Number of Clothes:
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            {request.number_of_clothes}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-sm font-medium text-gray-700">
                            Pickup Time:
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            {new Date(request.pickup_time).toLocaleString()}
                          </span>
                        </div>
                        {request.special_instructions && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-700">
                              Special Instructions:
                            </span>
                            <p className="mt-1 text-sm text-gray-600">
                              {request.special_instructions}
                            </p>
                          </div>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaundryRequest;