import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi, faTv, faSnowflake, faCoffee, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/Modal';

const GuestRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({ checkInDate: '', checkOutDate: '' });
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get('/rooms');
        setRooms(data.filter(r => r.status === 'available'));
      } catch (err) { toast.error('Failed to load rooms'); }
    };
    fetchRooms();
  }, []);

  const openBookModal = (room) => {
    setSelectedRoom(room);
    setBookingData({ checkInDate: '', checkOutDate: '' });
    setIsModalOpen(true);
  };

  const calculateTotal = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate || !selectedRoom) return 0;
    const start = new Date(bookingData.checkInDate);
    const end = new Date(bookingData.checkOutDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 0 ? diffDays * selectedRoom.pricePerNight : selectedRoom.pricePerNight;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const totalAmount = calculateTotal();
      if (totalAmount <= 0) return toast.error('Invalid dates');
      
      const payload = {
        guestId: user._id,
        roomId: selectedRoom._id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        status: 'pending',
        totalAmount
      };
      
      await api.post('/reservations', payload);
      toast.success('Room booked successfully! Wait for admin confirmation.');
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Booking failed');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 relative">
              {room.image ? <img src={room.image} alt={room.type} className="w-full h-full object-cover" /> : <span>No Image</span>}
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
                ${room.pricePerNight}/night
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{room.type} - Room {room.roomNumber}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {room.features && room.features.map((f, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{f.trim()}</span>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <button 
                  onClick={() => openBookModal(room)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faCalendarCheck} /> Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
        {rooms.length === 0 && <p className="text-gray-500">No rooms available at the moment.</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Complete Booking">
        {selectedRoom && (
          <form onSubmit={handleBook} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-blue-800">{selectedRoom.type} (Room {selectedRoom.roomNumber})</p>
              <p className="text-blue-600">${selectedRoom.pricePerNight} per night</p>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Check In Date</label>
              <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full border p-2 rounded" value={bookingData.checkInDate} onChange={e => setBookingData({...bookingData, checkInDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Check Out Date</label>
              <input required type="date" min={bookingData.checkInDate || new Date().toISOString().split('T')[0]} className="w-full border p-2 rounded" value={bookingData.checkOutDate} onChange={e => setBookingData({...bookingData, checkOutDate: e.target.value})} />
            </div>
            <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
              <span>Total Estimated:</span>
              <span>${calculateTotal()}</span>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-semibold transition">
              Confirm Booking
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default GuestRooms;
