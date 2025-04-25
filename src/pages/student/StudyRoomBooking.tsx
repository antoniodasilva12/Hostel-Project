import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FiClock, FiUsers, FiBook, FiCalendar } from 'react-icons/fi';
import { useAuthCheck } from '../../components/AuthCheck';

interface StudyRoom {
  id: string;
  room_number: string;
  capacity: number;
  facilities: string[];
  floor: number;
  is_available: boolean;
}

interface Booking {
  id?: string;
  student_id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at?: string;
}

const StudyRoomBooking = () => {
  useAuthCheck();
  
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudyRooms();
    fetchMyBookings();
  }, []);

  const fetchStudyRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('is_available', true);

      if (error) throw error;
      setStudyRooms(data || []);
    } catch (err) {
      console.error('Error fetching study rooms:', err);
      setError('Failed to fetch study rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('study_room_bookings')
        .select('*, study_room:study_rooms(*)')
        .eq('student_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setMyBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch your bookings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if the room is available for the selected time slot
      const { data: existingBookings } = await supabase
        .from('study_room_bookings')
        .select('*')
        .eq('room_id', selectedRoom)
        .eq('date', selectedDate)
        .eq('status', 'approved')
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

      if (existingBookings && existingBookings.length > 0) {
        setError('This time slot is already booked. Please select a different time.');
        return;
      }

      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('study_room_bookings')
        .insert({
          student_id: user.id,
          room_id: selectedRoom,
          date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      setSuccess('Study room booking request submitted successfully!');
      await fetchMyBookings();
      
      // Reset form
      setSelectedRoom('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError('Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Study Room Booking</h2>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Form */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Book a Study Room</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700">
                  Study Room
                </label>
                <select
                  id="room"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a room</option>
                  {studyRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} (Capacity: {room.capacity} people)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Book Study Room'}
              </button>
            </form>
          </div>

          {/* My Bookings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">My Bookings</h3>
            {myBookings.length === 0 ? (
              <p className="text-gray-500">No bookings found.</p>
            ) : (
              <div className="space-y-4">
                {myBookings.map(booking => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Room {booking.study_room?.room_number}
                        </h4>
                        <p className="text-sm text-gray-500">
                          <FiCalendar className="inline-block mr-1" />
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          <FiClock className="inline-block mr-1" />
                          {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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

export default StudyRoomBooking; 