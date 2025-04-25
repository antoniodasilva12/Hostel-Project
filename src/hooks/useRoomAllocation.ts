import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Room {
  id: number;
  room_number: string;
  floor: number;
  capacity: number;
  type: string;
  price_per_month: number;
}

interface RoomAllocation {
  id: string | number;
  room: Room;
  start_date: string;
  end_date: string | null;
  student_id?: string;
  room_id?: number;
  status: 'active' | 'inactive';
}

export const useRoomAllocation = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomAllocation, setRoomAllocation] = useState<RoomAllocation | null>(null);
  const [hasPendingBooking, setHasPendingBooking] = useState(false);

  const fetchRoomStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch active room allocation
      const { data: allocation, error: allocationError } = await supabase
        .from('room_allocations')
        .select(`
          id,
          start_date,
          end_date,
          status,
          room:rooms (
            id,
            room_number,
            floor,
            capacity,
            price_per_month,
            type
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .single();

      if (allocationError) {
        if (allocationError.code === 'PGRST116') {
          // No active allocation found, check for pending booking
          const { data: pendingBooking, error: pendingError } = await supabase
            .from('booking_requests')
            .select('id, status')
            .eq('student_id', user.id)
            .eq('status', 'pending')
            .single();

          if (pendingError && pendingError.code !== 'PGRST116') {
            throw pendingError;
          }

          setHasPendingBooking(!!pendingBooking);
          setRoomAllocation(null);
          return;
        }
        throw allocationError;
      }

      if (allocation) {
        setRoomAllocation(allocation as RoomAllocation);
        setHasPendingBooking(false);
      } else {
        setRoomAllocation(null);
        setHasPendingBooking(false);
      }
    } catch (err) {
      console.error('Error fetching room status:', err);
      setError('Failed to fetch room status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomStatus();
  }, []);

  return {
    loading,
    error,
    roomAllocation,
    hasPendingBooking,
    refreshAllocation: fetchRoomStatus
  };
}; 