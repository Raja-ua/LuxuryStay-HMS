import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faBed, faDoorOpen, faCreditCard, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

const GuestBookings = () => {
  const [bookings, setBookings] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/reservations');
        // Filter reservations for this guest
        const userBookings = data.filter(r => r.guestId?._id === user._id || r.guestId === user._id);
        // Sort by check-in date descending
        userBookings.sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
        setBookings(userBookings);
        setLoading(false);
      } catch (err) { 
        toast.error('Failed to load bookings');
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user._id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading bookings...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-800">My Bookings</h1>
        <p className="text-gray-500 mt-2">Manage and view your hotel reservations.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map(b => (
          <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition duration-300 flex flex-col">
            <div className={`p-4 text-white flex justify-between items-center ${
              b.status === 'confirmed' || b.status === 'checked-in' ? 'bg-green-600' :
              b.status === 'cancelled' ? 'bg-red-600' : 'bg-blue-600'
            }`}>
              <span className="font-bold uppercase tracking-wider text-sm">{b.status}</span>
              <span className="font-semibold text-lg">${b.totalAmount}</span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4 text-gray-800">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faBed} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{b.roomId?.type || 'Standard'} Room</h3>
                  <p className="text-sm text-gray-500">Room Number: {b.roomId?.roomNumber || 'TBD'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-gray-600 text-sm flex items-center gap-2">
                    <FontAwesomeIcon icon={faDoorOpen} className="text-gray-400" /> Check In
                  </div>
                  <div className="font-semibold text-gray-800">{new Date(b.checkInDate).toLocaleDateString()}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-600 text-sm flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" /> Check Out
                  </div>
                  <div className="font-semibold text-gray-800">{new Date(b.checkOutDate).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Payment Status</span>
                  <span className={`text-sm font-bold flex items-center gap-1 ${
                    b.paymentStatus === 'Paid' ? 'text-green-600' :
                    b.paymentStatus === 'Partially Paid' ? 'text-yellow-600' : 'text-red-500'
                  }`}>
                    <FontAwesomeIcon icon={b.paymentStatus === 'Paid' ? faCreditCard : faMoneyBillWave} /> {b.paymentStatus || 'Unpaid'}
                  </span>
                </div>
                {b.remainingAmount > 0 && (
                  <div className="text-right flex flex-col">
                    <span className="text-xs text-red-500 uppercase tracking-wider font-bold mb-1">Due</span>
                    <span className="text-sm font-bold text-red-600">${b.remainingAmount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-5xl text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Bookings Found</h3>
            <p className="text-gray-500">You haven't made any reservations yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestBookings;
