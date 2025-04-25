import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { mpesaService } from '../../services/mpesa';

interface Room {
  id: string;
  room_number: string;
  floor: number;
  capacity: number;
  type: string;
  price_per_month: number;
  is_occupied: boolean;
}

interface PaymentType {
  id: string;
  name: string;
  amount: number;
  selected: boolean;
}

const Payment = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roomDetails, setRoomDetails] = useState<Room | null>(null);
  const [selectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Payment types state
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([
    { id: 'room', name: 'Room Rent', amount: 0, selected: true },
    { id: 'wifi', name: 'WiFi', amount: 1000, selected: false },
    { id: 'electricity', name: 'Electricity', amount: 500, selected: false },
    { id: 'water', name: 'Water', amount: 300, selected: false },
    { id: 'gym_basic', name: 'Gym (Basic Plan)', amount: 800, selected: false },
    { id: 'gym_premium', name: 'Gym (Premium Plan)', amount: 1200, selected: false },
    { id: 'meal', name: 'Meal Plan', amount: 3000, selected: false },
    { id: 'maintenance', name: 'Maintenance', amount: 500, selected: false },
  ]);

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [mealSubscription, setMealSubscription] = useState<any>(null);

  useEffect(() => {
    loadRoomAndPayments();
  }, []);

  useEffect(() => {
    // Update room rent in payment types when room details are loaded
    if (roomDetails) {
      setPaymentTypes(prev => prev.map(type => 
        type.id === 'room' 
          ? { ...type, amount: roomDetails.price_per_month }
          : type
      ));
    }
  }, [roomDetails]);

  useEffect(() => {
    // Calculate total amount whenever payment types change
    const total = paymentTypes
      .filter(type => type.selected)
      .reduce((sum, type) => sum + type.amount, 0);
    setTotalAmount(total);
  }, [paymentTypes]);

  const handlePaymentTypeToggle = (id: string) => {
    setPaymentTypes(prev => prev.map(type => 
      type.id === id ? { ...type, selected: !type.selected } : type
    ));
  };

  const loadRoomAndPayments = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Current user ID:', user.id);

      // Fetch room details from room_allocations
      const { data: allocation, error: allocationError } = await supabase
        .from('room_allocations')
        .select(`
          *,
          room:room_id (*)
        `)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (allocationError) {
        console.error('Error fetching allocation:', allocationError);
        throw allocationError;
      }

      if (allocation?.room) {
        setRoomDetails(allocation.room);
      } else {
        setRoomDetails(null);
      }

      // Fetch meal subscription
      const { data: mealData, error: mealError } = await supabase
        .from('meal_subscriptions')
        .select('*')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .single();

      if (mealError && mealError.code !== 'PGRST116') {
        console.error('Error fetching meal subscription:', mealError);
      } else if (mealData) {
        setMealSubscription(mealData);
        // Update meal plan amount in payment types
        setPaymentTypes(prev => prev.map(type => {
          if (type.id === 'meal') {
            const planPrice = mealPlans.find(p => p.id === mealData.plan_id)?.price || type.amount;
            return { ...type, amount: planPrice, selected: true };
          }
          return type;
        }));
      }

    } catch (error) {
      console.error('Error loading room and payments:', error);
      setError('Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  // Add meal plans data
  const mealPlans = [
    {
      id: 1,
      name: "Basic Plan",
      price: 3000,
    },
    {
      id: 2,
      name: "Standard Plan",
      price: 4500,
    },
    {
      id: 3,
      name: "Premium Plan",
      price: 6000,
    }
  ];

  // Add gym plans data
  const gymPlans = [
    {
      id: 'gym_basic',
      name: "Basic Plan",
      price: 800,
      features: [
        "Access to basic gym equipment",
        "Standard workout area",
        "Locker room access",
        "Basic fitness consultation",
        "Operating hours: 6 AM - 10 PM"
      ]
    },
    {
      id: 'gym_premium',
      name: "Premium Plan",
      price: 1200,
      features: [
        "Access to all gym equipment",
        "Priority workout area",
        "Personal locker",
        "Personal trainer (2 sessions/month)",
        "24/7 gym access",
        "Nutrition consultation",
        "Group classes access"
      ]
    }
  ];

  const handlePayment = async () => {
    if (!roomDetails) return;

    try {
      setProcessingPayment(true);
      setSuccess(null);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate room allocation
      if (!roomDetails) {
        setError('No active room allocation found');
        return;
      }

      // Validate at least one payment type is selected
      if (!paymentTypes.some(type => type.selected)) {
        setError('Please select at least one payment type');
        return;
      }

      // Validate phone number
      let formattedPhone = phoneNumber;
      
      // Remove any spaces or special characters
      formattedPhone = formattedPhone.replace(/[^0-9]/g, '');
      
      // Add country code if not present
      if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.slice(1)}`;
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = `254${formattedPhone}`;
      }
      
      // Validate final format
      if (!formattedPhone.match(/^254[0-9]{9}$/)) {
        setError('Please enter a valid phone number (e.g., 0712345678 or 254712345678)');
        return;
      }
      
      // Update phone number to formatted version
      setPhoneNumber(formattedPhone);

      // Check if payment for selected month already exists
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', user.id)
        .eq('month', selectedMonth)
        .eq('status', 'completed')
        .maybeSingle();

      if (existingPayment) {
        setError('Payment for this month has already been made');
        return;
      }

      // Generate payment description
      const servicesDescription = paymentTypes
        .filter(type => type.selected)
        .map(type => type.name)
        .join(', ');

      // Generate a unique reference number using servicesDescription
      const referenceNumber = `PAY-${user.id.slice(0, 4)}-${selectedMonth.replace('-', '')}-${servicesDescription}`.toUpperCase();

      try {
        setSuccess('Initiating M-Pesa payment...');
        console.log('Initiating payment with phone:', phoneNumber);
        
        // Initiate STK Push with total amount
        const stkResponse = await mpesaService.initiateSTKPush({
          amount: totalAmount,
          phoneNumber: phoneNumber,
          accountReference: "Student Portal",
          transactionDesc: `Payment for: ${servicesDescription}`
        });

        console.log('STK Push Response:', stkResponse);

        if (stkResponse.ResponseCode === '0') {
          // Create a pending payment record
          const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
              student_id: user.id,
              amount: totalAmount,
              status: 'pending',
              payment_date: new Date().toISOString(),
              payment_method: 'mpesa',
              reference_number: referenceNumber,
              month: selectedMonth,
              checkout_request_id: stkResponse.CheckoutRequestID
            })
            .select()
            .single();

          if (paymentError) {
            console.error('Error creating payment record:', paymentError);
            throw new Error('Failed to create payment record. Please try again.');
          }

          if (!payment) {
            throw new Error('No payment record created. Please try again.');
          }

          setSuccess('Please check your phone to complete the M-Pesa payment. Do not close this page.');

          try {
            // Wait for payment completion using the new polling method
            const status = await mpesaService.waitForPayment(stkResponse.CheckoutRequestID);
            
            if (!status) {
              throw new Error('Payment verification failed. Please check your M-Pesa messages.');
            }
            
            // Payment successful
            const { error: updateError } = await supabase
              .from('payments')
              .update({ 
                status: 'completed',
                payment_date: new Date().toISOString(),
                transaction_code: status.MpesaReceiptNumber || referenceNumber
              })
              .eq('id', payment.id);

            if (updateError) {
              console.error('Error updating payment status:', updateError);
              setError('Payment may have been successful but status update failed. Please contact support with reference: ' + referenceNumber);
              return;
            }

            setSuccess('Payment completed successfully! Reference: ' + referenceNumber);
            await loadRoomAndPayments();
            
          } catch (err: any) {
            console.error('Error during payment:', err);
            
            // Update payment status to failed
            await supabase
              .from('payments')
              .update({ 
                status: 'failed',
                transaction_code: null 
              })
              .eq('id', payment.id);

            setError('Payment processing failed. Please try again.');
          }
        } else {
          throw new Error(stkResponse.ResponseDescription || 'Failed to initiate payment. Please check your phone number.');
        }

      } catch (err: any) {
        console.error('Error processing M-Pesa payment:', err);
        setError(err.message || 'Failed to process payment. Please try again.');
      }

    } catch (err: any) {
      console.error('Error initiating payment:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800">No Room Allocated</h2>
          <p className="text-yellow-700">
            You need to have an allocated room before making payments.
            Please contact the administrator for room allocation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Make Payment</h2>

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

        <div className="space-y-6">
          {/* Payment Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Services to Pay For</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentTypes.map(type => (
                <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={type.id}
                      checked={type.selected}
                      onChange={() => handlePaymentTypeToggle(type.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                      disabled={type.id === 'meal' && mealSubscription?.status === 'active'}
                    />
                    <label htmlFor={type.id} className="ml-3">
                      <span className="text-gray-700">{type.name}</span>
                      {type.id === 'meal' && mealSubscription && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({mealPlans.find(p => p.id === mealSubscription.plan_id)?.name || 'Unknown Plan'})
                        </span>
                      )}
                      {(type.id === 'gym_basic' || type.id === 'gym_premium') && (
                        <div className="mt-1 text-xs text-gray-500">
                          {gymPlans.find(p => p.id === type.id)?.features.map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <span className="mr-1">•</span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      )}
                    </label>
                  </div>
                  <span className="text-gray-900 font-medium">KSh {type.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">KSh {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
            <div className="flex items-center p-4 border border-blue-500 bg-blue-50 rounded-lg">
              <FiDollarSign className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-blue-700">M-Pesa Payment</h4>
                <p className="text-sm text-blue-600">Pay securely using M-Pesa mobile money</p>
              </div>
            </div>
          </div>

          {/* Phone Number Input for M-Pesa */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              M-Pesa Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254XXXXXXXXX"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter your phone number in the format: 254XXXXXXXXX
            </p>
          </div>

          {/* Payment Button */}
          <div>
        <button
          onClick={handlePayment}
              disabled={processingPayment || !totalAmount}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {processingPayment 
            ? 'Processing Payment...' 
                : `Pay KSh ${totalAmount.toLocaleString()}`}
        </button>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
