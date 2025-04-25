import React from 'react';
import { useAuthCheck } from '../../components/AuthCheck';
import { useRoomAllocation } from '../../hooks/useRoomAllocation';
import { FiHome, FiLayers, FiUsers, FiDollarSign, FiCalendar, FiClock } from 'react-icons/fi';

const Room: React.FC = () => {
  useAuthCheck();
  const { loading, error, roomAllocation, hasPendingBooking, refreshAllocation } = useRoomAllocation();

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

  if (!roomAllocation && !hasPendingBooking) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-50 p-3 rounded-full">
              <FiHome className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-4">Room Status</h2>
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              You don't have a room allocated yet.
            </p>
            <p className="text-sm text-gray-500">
              Please book a room to view your room details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasPendingBooking) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-yellow-50 p-3 rounded-full">
              <FiClock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-4">Room Status</h2>
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Your room booking request is pending approval.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              An administrator will review your request soon.
            </p>
            <button
              onClick={refreshAllocation}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FiClock className="w-4 h-4 mr-2" />
              Check Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // At this point, we know roomAllocation is not null
  const allocation = roomAllocation!;

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Room Details</h2>
            <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
              Active Allocation
            </span>
          </div>
          
          {/* Room Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FiHome className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Room Number</p>
                  <p className="text-lg font-semibold text-gray-900">{allocation.room.room_number}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <FiLayers className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Floor</p>
                  <p className="text-lg font-semibold text-gray-900">{allocation.room.floor}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <FiUsers className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Room Type</p>
                  <p className="text-lg font-semibold text-gray-900">{allocation.room.type || 'Standard'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <FiDollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
                  <p className="text-lg font-semibold text-gray-900">KSh {allocation.room.price_per_month.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <FiCalendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="text-lg font-semibold text-gray-900">{new Date(allocation.start_date).toLocaleDateString()}</p>
                </div>
              </div>

              {allocation.end_date && (
                <div className="flex items-start space-x-4">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <FiClock className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">End Date</p>
                    <p className="text-lg font-semibold text-gray-900">{new Date(allocation.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="border-t pt-6">
            <button
              onClick={refreshAllocation}
              className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FiClock className="w-4 h-4 mr-2" />
              Refresh Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room; 