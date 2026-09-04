import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/Modal';

const PublicRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({ 
    checkInDate: '', checkOutDate: '',
    fullName: '', email: '', contactNumber: '', cnic: '', nationality: '', city: '', address: '',
    initialPaymentAmount: '', paymentMethod: 'Cash'
  });
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get('/rooms');
        // Only show available rooms for booking publicly
        setRooms(data.filter(r => r.status === 'available'));
      } catch (err) { toast.error('Failed to load rooms'); }
    };
    fetchRooms();
  }, []);

  const handleBookClick = (room) => {
    if (!user) {
      toast.error('Please login to book a room');
      navigate('/login');
      return;
    }
    if (user.role !== 'guest') {
      toast.error('Staff cannot book rooms from the public portal');
      return;
    }
    setSelectedRoom(room);
    setCurrentStep(1);
    setBookingData({ 
      checkInDate: '', checkOutDate: '',
      fullName: user.fullName || user.name || '',
      email: user.email || '',
      contactNumber: user.contactNumber || '',
      cnic: user.cnic || '',
      nationality: user.nationality || '',
      city: user.city || '',
      address: user.address || '',
      initialPaymentAmount: '', paymentMethod: 'Cash'
    });
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

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    try {
      const totalAmount = calculateTotal();
      if (totalAmount <= 0) return toast.error('Invalid dates selected');
      
      const payload = {
        guestId: user._id,
        roomId: selectedRoom._id,
        ...bookingData,
        status: 'pending',
        totalAmount
      };
      
      await api.post('/reservations', payload);
      toast.success('Room booked successfully! Wait for confirmation.');
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Booking failed');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Advanced Hero Section */}
      <div className="relative bg-gray-900 text-white py-24 flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Luxury Rooms" 
            className="w-full h-full object-cover opacity-30 transform scale-105 hover:scale-100 transition-transform duration-1000"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Our Luxurious Rooms
          </h1>
          <p className="text-xl text-gray-300 font-light leading-relaxed">
            Choose from our selection of premium rooms designed to provide you with the utmost comfort, elegance, and world-class amenities.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {rooms.map((room) => (
            <div key={room._id} className="flex flex-col bg-white shadow-xl border border-gray-100 overflow-hidden group hover:-translate-y-2 transition-transform duration-500 rounded-none relative">
              
              {/* Top Image Section */}
              <div className="w-full h-80 relative overflow-hidden bg-gray-200">
                {room.images && room.images.length > 0 ? (
                  <img src={room.images[0]} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 text-xs font-bold tracking-widest uppercase text-gray-900 shadow-sm border-l-2 border-gray-900">
                  {room.type}
                </div>
              </div>

              {/* Price floating badge */}
              <div className="absolute top-[18rem] right-6 bg-gray-900 text-white px-6 py-3 font-bold shadow-xl border border-gray-700">
                ${room.pricePerNight} <span className="text-xs font-normal uppercase tracking-wider">/ Night</span>
              </div>

              {/* Bottom Content Section */}
              <div className="w-full p-10 flex flex-col flex-grow justify-between text-left">
                <div>
                  <h3 className="text-3xl font-serif text-gray-900 mb-4 mt-2">Room {room.roomNumber}</h3>
                  <p className="text-gray-500 font-light leading-relaxed mb-6 line-clamp-3">
                    {room.description || 'Experience unparalleled comfort in this exquisitely designed room, offering premium amenities and a serene atmosphere tailored for a perfect stay.'}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-8">
                    {room.features && room.features.map((f, i) => (
                      <span key={i} className="text-sm text-gray-600 flex items-center gap-1 font-medium">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-gray-900 text-xs" /> {f}
                      </span>
                    ))}
                    <span className="text-sm text-gray-600 flex items-center gap-1 font-medium">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-gray-900 text-xs" /> {room.capacity} Guests
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1 font-medium">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-gray-900 text-xs" /> Floor {room.floor}
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => handleBookClick(room)}
                    className="w-full bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold uppercase tracking-widest text-sm py-4 px-6 transition duration-300"
                  >
                    Reserve This Room
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="w-full text-center py-20">
              <h2 className="text-3xl font-serif text-gray-400">No rooms available at the moment.</h2>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Complete Your Booking" maxWidth="max-w-4xl">
        <form onSubmit={handleBookSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto p-2">
          
          <div className="bg-blue-50 p-6 rounded-none border border-blue-100 flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-blue-900 text-xl mb-1">Room {selectedRoom?.roomNumber} - {selectedRoom?.type}</h3>
              <p className="text-blue-700">${selectedRoom?.pricePerNight} / night</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 uppercase font-bold tracking-wider mb-1">Total Estimated</p>
              <p className="text-3xl font-black text-blue-900">${calculateTotal()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between relative mb-8 px-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-none z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-none z-0 transition-all duration-300" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
            
            {[1, 2, 3].map((step) => (
              <div key={step} className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-none font-bold border-4 transition-colors duration-300 ${
                currentStep >= step ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-gray-200 text-gray-400'
              }`}>
                {step}
              </div>
            ))}
          </div>

          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Step 1: Guest Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Full Name *</label>
                  <input required type="text" minLength="3" title="Name must be at least 3 characters" className="w-full border-gray-300 border p-3 rounded-none focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50" value={bookingData.fullName} onChange={e => setBookingData({...bookingData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Email *</label>
                  <input required type="email" readOnly className="w-full border-gray-300 border p-3 rounded-none bg-gray-100 text-gray-500 cursor-not-allowed outline-none" value={bookingData.email} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Contact Number *</label>
                  <input required type="text" pattern="[0-9]{11}" title="Contact number must be exactly 11 digits" placeholder="e.g. 03001234567" className="w-full border-gray-300 border p-3 rounded-none focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50" value={bookingData.contactNumber} onChange={e => setBookingData({...bookingData, contactNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">CNIC / ID *</label>
                  <input required type="text" pattern="[0-9]{13}" title="CNIC must be exactly 13 digits without dashes" placeholder="e.g. 4210112345678" className="w-full border-gray-300 border p-3 rounded-none focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50" value={bookingData.cnic} onChange={e => setBookingData({...bookingData, cnic: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Step 2: Stay Details</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Check In *</label>
                  <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full border-gray-300 border p-3 rounded-none focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50" value={bookingData.checkInDate} onChange={e => setBookingData({...bookingData, checkInDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Check Out *</label>
                  <input required type="date" min={bookingData.checkInDate || new Date().toISOString().split('T')[0]} className="w-full border-gray-300 border p-3 rounded-none focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50" value={bookingData.checkOutDate} onChange={e => setBookingData({...bookingData, checkOutDate: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Step 3: Payment Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Initial Payment Amount ($) *</label>
                  <input required type="number" min="1" max={calculateTotal() || 99999} className="w-full border-gray-300 border p-3 rounded-none focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50" placeholder="Minimum $1 required to book" value={bookingData.initialPaymentAmount} onChange={e => setBookingData({...bookingData, initialPaymentAmount: e.target.value})} />
                  {bookingData.initialPaymentAmount && calculateTotal() > 0 && (
                    <p className="text-sm mt-2 text-gray-600 font-medium bg-orange-50 p-2 rounded-none border border-orange-100">
                      Remaining Balance Due: <span className="text-red-500 font-bold">${Math.max(0, calculateTotal() - Number(bookingData.initialPaymentAmount))}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Payment Method</label>
                  <select className="w-full border-gray-300 border p-3 rounded-none focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50" value={bookingData.paymentMethod} onChange={e => setBookingData({...bookingData, paymentMethod: e.target.value})}>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Online">Online Transfer</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-6 border-t mt-6 flex gap-4">
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="w-1/3 bg-gray-100 text-gray-700 p-4 rounded-none font-bold hover:bg-gray-200 transition-all active:scale-95 text-lg">
                Back
              </button>
            )}
            <button type="submit" className="flex-1 bg-blue-600 text-white p-4 rounded-none font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95 text-lg">
              {currentStep === 3 ? 'Confirm Reservation' : 'Next Step'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PublicRooms;
