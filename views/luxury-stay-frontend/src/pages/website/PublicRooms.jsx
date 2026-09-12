import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useSettings } from '../../context/SettingsContext';
import { calculateDynamicPricing } from '../../utils/pricing';

const PublicRooms = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [bookingData, setBookingData] = useState({ 
    checkInDate: '', checkOutDate: '',
    fullName: '', email: '', contactNumber: '', cnic: '',
    initialPaymentAmount: '', paymentMethod: 'Cash'
  });

  useEffect(() => {
    const fetchRoomsAndUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setBookingData(prev => ({
            ...prev,
            fullName: parsed.fullName || parsed.name || '',
            email: parsed.email || '',
            contactNumber: parsed.contactNumber || '',
            cnic: parsed.cnic || ''
          }));
        }
        
        const { data } = await api.get('/rooms');
        setRooms(data.filter(r => r.status === 'available'));
      } catch (err) {
        toast.error('Failed to load rooms'); 
      }
    };
    fetchRoomsAndUser();
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
    setBookingData(prev => ({
      ...prev,
      checkInDate: '', checkOutDate: '', initialPaymentAmount: '', paymentMethod: 'Cash'
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTotals = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate || !selectedRoom || !settings) {
      return { subtotal: 0, tax: 0, total: 0, breakdown: null };
    }
    const pricing = calculateDynamicPricing(selectedRoom.pricePerNight, bookingData.checkInDate, bookingData.checkOutDate, settings);
    return { 
      subtotal: pricing.subTotal, 
      tax: pricing.taxTotal, 
      total: pricing.grandTotal,
      breakdown: pricing.breakdown
    };
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const { total } = getTotals();
      if (total <= 0) return toast.error('Invalid dates selected');
      
      setIsSubmitting(true);
      
      const payload = {
        guestId: user._id,
        roomId: selectedRoom._id,
        ...bookingData,
        status: 'pending',
        totalAmount: total
      };
      
      await api.post('/reservations', payload);
      toast.success('Room booked successfully! Wait for confirmation.');
      setSelectedRoom(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedRoom) {
    const totals = getTotals();
    return (
      <div className="bg-gray-50 min-h-screen pb-16 font-sans">
        {/* Hero Banner for Checkout */}
        <div className="relative bg-[#0f172a] text-white py-16 flex items-center justify-center text-center">
            <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" alt="Booking Banner" className="w-full h-full object-cover opacity-20" />
            </div>
            <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-serif mb-4 font-bold text-white tracking-tight">Book Your Stay</h1>
                <p className="text-[#d4af37] tracking-widest uppercase text-sm font-bold">Luxury Awaits You</p>
                <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-6"></div>
            </div>
        </div>

        <div className="container mx-auto px-4 mt-12 max-w-7xl">
            <form onSubmit={handleBookSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
               {/* Left Side Forms */}
               <div className="w-full lg:w-2/3 space-y-8">
                   
                   {/* Step 1: Stay Details */}
                   <div className="bg-white p-8 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 rounded-none relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]"></div>
                       <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#1b3658] text-white flex items-center justify-center text-sm font-bold shadow-sm">1</span> 
                          Stay Details
                       </h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                             <label className="block text-gray-700 font-medium mb-2 text-sm uppercase tracking-wider">Check In *</label>
                             <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full border-gray-200 border p-4 bg-gray-50 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all rounded-none" value={bookingData.checkInDate} onChange={e => setBookingData({...bookingData, checkInDate: e.target.value})} />
                           </div>
                           <div>
                             <label className="block text-gray-700 font-medium mb-2 text-sm uppercase tracking-wider">Check Out *</label>
                             <input required type="date" min={bookingData.checkInDate || new Date().toISOString().split('T')[0]} className="w-full border-gray-200 border p-4 bg-gray-50 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all rounded-none" value={bookingData.checkOutDate} onChange={e => setBookingData({...bookingData, checkOutDate: e.target.value})} />
                           </div>
                       </div>
                   </div>

                   {/* Step 2: Guest Details */}
                   <div className="bg-white p-8 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 rounded-none relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]"></div>
                       <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#1b3658] text-white flex items-center justify-center text-sm font-bold shadow-sm">2</span> 
                          Guest Details
                       </h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm uppercase tracking-wider">Full Name *</label>
                            <input required type="text" minLength="3" className="w-full border-gray-200 border p-4 bg-gray-50 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all rounded-none" value={bookingData.fullName} onChange={e => setBookingData({...bookingData, fullName: e.target.value})} />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm uppercase tracking-wider">Email *</label>
                            <input required type="email" readOnly className="w-full border-gray-200 border p-4 bg-gray-100 text-gray-500 cursor-not-allowed outline-none rounded-none" value={bookingData.email} />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm uppercase tracking-wider">Contact Number *</label>
                            <input required type="text" pattern="[0-9]{11}" placeholder="e.g. 03001234567" className="w-full border-gray-200 border p-4 bg-gray-50 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all rounded-none" value={bookingData.contactNumber} onChange={e => setBookingData({...bookingData, contactNumber: e.target.value})} />
                          </div>
                          <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm uppercase tracking-wider">CNIC / ID *</label>
                            <input required type="text" pattern="[0-9]{13}" placeholder="e.g. 4210112345678" className="w-full border-gray-200 border p-4 bg-gray-50 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all rounded-none" value={bookingData.cnic} onChange={e => setBookingData({...bookingData, cnic: e.target.value})} />
                          </div>
                       </div>
                   </div>

                   {/* Step 3: Payment */}
                   <div className="bg-white p-8 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 rounded-none relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]"></div>
                       <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#1b3658] text-white flex items-center justify-center text-sm font-bold shadow-sm">3</span> 
                          Payment Information
                       </h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm uppercase tracking-wider">Initial Payment ($) *</label>
                            <input required type="number" min="1" max={totals.total || 99999} className="w-full border-gray-200 border p-4 bg-gray-50 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all rounded-none" placeholder="Minimum $1 required" value={bookingData.initialPaymentAmount} onChange={e => setBookingData({...bookingData, initialPaymentAmount: e.target.value})} />
                            {bookingData.initialPaymentAmount && totals.total > 0 && (
                              <p className="text-xs mt-3 text-gray-600 font-medium bg-blue-50 p-2 border border-blue-100">
                                Remaining Balance: <span className="text-red-500 font-bold">${Math.max(0, totals.total - Number(bookingData.initialPaymentAmount)).toFixed(2)}</span>
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-gray-700 font-medium mb-2 text-sm uppercase tracking-wider">Payment Method</label>
                            <select className="w-full border-gray-200 border p-4 bg-gray-50 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all rounded-none" value={bookingData.paymentMethod} onChange={e => setBookingData({...bookingData, paymentMethod: e.target.value})}>
                              <option value="Cash">Cash at Counter</option>
                              <option value="Card">Credit/Debit Card</option>
                              <option value="Online">Online Transfer</option>
                            </select>
                          </div>
                       </div>
                   </div>
                   
                   <div className="flex justify-start items-center mt-4 pb-10">
                      <button type="button" onClick={() => { setSelectedRoom(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2 transition-colors uppercase text-sm tracking-wider">
                         &larr; Back to Rooms
                      </button>
                   </div>
               </div>

               {/* Right Side Summary */}
               <div className="w-full lg:w-1/3">
                   <div className="bg-white border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8 sticky top-24 rounded-none">
                       <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Booking Summary</h3>
                       
                       <div className="flex flex-col gap-4 mb-6">
                          <div className="w-full h-48 bg-gray-200 shrink-0 overflow-hidden">
                             {selectedRoom.images && selectedRoom.images[0] ? <img src={selectedRoom.images[0]} className="w-full h-full object-cover" alt="Room" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>}
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-900 text-xl leading-tight mb-1">{selectedRoom.type}</h4>
                             <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Room {selectedRoom.roomNumber}</p>
                             <p className="text-lg font-black text-[#d4af37]">${selectedRoom.pricePerNight} <span className="text-sm font-normal text-gray-500">/ night</span></p>
                          </div>
                       </div>
                       
                       {totals.breakdown && (
                         <div className="space-y-4 text-sm text-gray-600 border-t border-gray-100 pt-6 border-b pb-6">
                           <div className="flex justify-between items-center">
                             <span className="text-gray-500 font-medium">Check-in</span>
                             <span className="font-bold text-gray-900">{bookingData.checkInDate ? new Date(bookingData.checkInDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                           </div>
                           <div className="flex justify-between items-center">
                             <span className="text-gray-500 font-medium">Check-out</span>
                             <span className="font-bold text-gray-900">{bookingData.checkOutDate ? new Date(bookingData.checkOutDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                           </div>
                           <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-200">
                             <span className="text-gray-500">Base ({totals.breakdown.standardNights} nights)</span>
                             <span className="font-medium">${totals.breakdown.standardTotal.toFixed(2)}</span>
                           </div>
                           {totals.breakdown.weekendNights > 0 && (
                             <div className="flex justify-between items-center text-orange-600">
                               <span>Weekend ({totals.breakdown.weekendNights} nights)</span>
                               <span className="font-medium">+ ${totals.breakdown.weekendSurchargeAmount.toFixed(2)}</span>
                             </div>
                           )}
                           {totals.breakdown.holidayNights > 0 && (
                             <div className="flex justify-between items-center text-purple-600">
                               <span>Holiday ({totals.breakdown.holidayNights} nights)</span>
                               <span className="font-medium">+ ${totals.breakdown.holidaySurchargeAmount.toFixed(2)}</span>
                             </div>
                           )}
                           <div className="flex justify-between items-center font-bold text-gray-800 pt-3 border-t border-gray-100">
                             <span>Subtotal</span>
                             <span>${totals.subtotal.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                             <span className="text-gray-500">Taxes ({settings?.taxRate || 0}%)</span>
                             <span className="font-medium">${totals.tax.toFixed(2)}</span>
                           </div>
                         </div>
                       )}
                       
                       <div className="flex justify-between items-center py-6 text-2xl font-black text-gray-900">
                          <span>Total</span>
                          <span className="text-[#d4af37]">${totals.total.toFixed(2)}</span>
                       </div>
                       
                       <button disabled={isSubmitting} type="submit" className="w-full bg-[#1b3658] hover:bg-[#122640] text-white font-bold py-4 rounded-none transition shadow-lg flex justify-center items-center gap-2 uppercase tracking-widest text-sm disabled:opacity-70 disabled:cursor-not-allowed">
                         {isSubmitting ? (
                           <>
                             <FontAwesomeIcon icon={faSpinner} spin /> Processing...
                           </>
                         ) : (
                           'Confirm Reservation'
                         )}
                       </button>
                       <p className="text-center text-xs text-gray-400 mt-4 font-medium leading-relaxed">
                          By proceeding, you agree to our Terms & Conditions and the hotel's Cancellation Policy.
                       </p>
                   </div>
               </div>
            </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // ORIGINAL ROOMS LIST VIEW (No modifications below, except removing Modal)
  // ----------------------------------------------------------------------
  return (
    <div className="bg-gray-50 min-h-screen">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {rooms.map((room) => (
            <div key={room._id} className="flex flex-col bg-white shadow-xl hover:shadow-2xl overflow-hidden group hover:-translate-y-2 transition-all duration-500 rounded-2xl relative border border-gray-100">
              <div className="w-full h-56 relative overflow-hidden bg-gray-200">
                {room.images && room.images.length > 0 ? (
                  <img src={room.images[0]} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-[#d4af37] shadow-sm rounded-full">
                  {room.type}
                </div>
              </div>
              <div className="w-full p-6 flex flex-col flex-grow justify-between text-left">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-serif text-gray-900 font-bold">Room {room.roomNumber}</h3>
                    <div className="text-right">
                      <span className="text-xl font-bold text-[#d4af37]">${room.pricePerNight}</span>
                      <span className="text-[10px] text-gray-500 block uppercase tracking-widest mt-0.5">/ Night</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                    {room.description || 'Experience unparalleled comfort in this exquisitely designed room, offering premium amenities and a serene atmosphere tailored for a perfect stay.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.features && room.features.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-[10px] bg-gray-50 px-2.5 py-1 rounded-md text-gray-600 font-medium border border-gray-100">
                        {f}
                      </span>
                    ))}
                    <span className="text-[10px] bg-gray-50 px-2.5 py-1 rounded-md text-gray-600 font-medium border border-gray-100">
                      {room.capacity} Guests
                    </span>
                  </div>
                </div>
                <div className="mt-auto pt-2">
                  <button 
                    onClick={() => handleBookClick(room)}
                    className="w-full bg-[#1b3658] hover:bg-[#122640] text-white font-bold uppercase tracking-widest text-xs py-3.5 px-6 transition duration-300 rounded-xl shadow-md hover:shadow-lg"
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {rooms.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No rooms available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRooms;
