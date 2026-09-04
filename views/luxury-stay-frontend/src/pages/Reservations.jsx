import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faMoneyBill, faMoneyBillWave, faEye, faPlus } from '@fortawesome/free-solid-svg-icons';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedResForPayment, setSelectedResForPayment] = useState(null);
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'Cash' });
  
  const [formData, setFormData] = useState({
    roomId: '', checkInDate: '', checkOutDate: '', status: 'pending', totalAmount: '',
    fullName: '', email: '', contactNumber: '', cnic: '', nationality: '', city: '', address: ''
  });

  const fetchData = async () => {
    try {
      const [resData, roomsData] = await Promise.all([
        api.get('/reservations'), api.get('/rooms')
      ]);
      setReservations(resData.data);
      setRooms(roomsData.data);
    } catch (err) { toast.error('Failed to fetch data'); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (location.state?.openAddBooking) {
      setEditingRes(null);
      setFormData({ 
        roomId: location.state?.preselectedRoomId || '', checkInDate: '', checkOutDate: '', status: 'pending', totalAmount: '',
        fullName: '', email: '', contactNumber: '', cnic: '', nationality: '', city: '', address: ''
      });
      setIsModalOpen(true);
      // Clear state so it doesn't reopen on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (!editingRes && formData.roomId && formData.checkInDate && formData.checkOutDate) {
      const room = rooms.find(r => r._id === formData.roomId);
      if (room) {
        const start = new Date(formData.checkInDate);
        const end = new Date(formData.checkOutDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const total = diffDays > 0 ? diffDays * room.pricePerNight : room.pricePerNight;
        setFormData(prev => ({ ...prev, totalAmount: total }));
      }
    }
  }, [formData.roomId, formData.checkInDate, formData.checkOutDate, rooms, editingRes]);

  const openAddModal = () => {
    setEditingRes(null);
    setFormData({ 
      roomId: '', checkInDate: '', checkOutDate: '', status: 'pending', totalAmount: '',
      fullName: '', email: '', contactNumber: '', cnic: '', nationality: '', city: '', address: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (res) => {
    setEditingRes(res);
    setFormData({ 
      roomId: res.roomId?._id || '', 
      checkInDate: new Date(res.checkInDate).toISOString().split('T')[0], 
      checkOutDate: new Date(res.checkOutDate).toISOString().split('T')[0], 
      status: res.status, 
      totalAmount: res.totalAmount,
      fullName: res.guestId?.fullName || '',
      email: res.guestId?.email || '',
      contactNumber: res.guestId?.contactNumber || '',
      cnic: res.guestId?.cnic || '',
      nationality: res.guestId?.nationality || '',
      city: res.guestId?.city || '',
      address: res.guestId?.address || ''
    });
    setIsModalOpen(true);
  };

  const openPaymentModal = (res) => {
    setSelectedResForPayment(res);
    setPaymentData({ amount: '', method: 'Cash' });
    setIsPaymentModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/reservations/${id}`);
        toast.success('Reservation deleted');
        fetchData();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'early-checkout') {
      try {
        const res = reservations.find(r => r._id === id);
        const room = rooms.find(r => r._id === (res.roomId?._id || res.roomId));
        
        const checkIn = new Date(res.checkInDate);
        const now = new Date();
        const diffTime = Math.abs(now - checkIn);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) diffDays = 1;
        
        const newTotalAmount = diffDays * (room ? room.pricePerNight : 0);
        
        await api.put(`/reservations/${id}`, { 
          status: newStatus,
          checkOutDate: now.toISOString(),
          totalAmount: newTotalAmount > 0 ? newTotalAmount : res.totalAmount
        });
        toast.success('Early checkout processed & refund calculated');
        fetchData();
      } catch (err) {
        toast.error('Failed to process early checkout');
      }
      return;
    }

    try {
      await api.put(`/reservations/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRes) {
        // Update keeps guestId to modify same user if needed (handled in backend if we pass guestId, but backend expects email/cnic to find/create)
        // Wait, for edit, we might just update the reservation and NOT user, or we update both.
        // I updated backend to handle this by passing guestId.
        await api.put(`/reservations/${editingRes._id}`, { ...formData, guestId: editingRes.guestId?._id });
      } else {
        await api.post('/reservations', formData);
      }
      toast.success('Success');
      setIsModalOpen(false);
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reservations/${selectedResForPayment._id}/payments`, paymentData);
      toast.success('Payment added');
      setIsPaymentModalOpen(false);
      fetchData();
    } catch (err) { toast.error('Failed to add payment'); }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reservations</h1>
          <p className="text-gray-500 mt-1">Manage guest bookings, statuses, and payments</p>
        </div>

      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Room</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservations.map(r => (
                <tr key={r._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5 font-bold text-gray-800">{r.guestId?.fullName || r.guestId?.name || 'Unknown'}</td>
                  <td className="p-5 font-medium text-gray-700">{r.roomId?.roomNumber || 'Unknown'}</td>
                  <td className="p-5 text-gray-600 font-medium">{new Date(r.checkInDate).toLocaleDateString()}</td>
                  <td className="p-5 text-gray-600 font-medium">{new Date(r.checkOutDate).toLocaleDateString()}</td>
                  <td className="p-5 font-bold text-blue-600">${r.totalAmount}</td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide w-fit shadow-sm border ${
                        r.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' :
                        r.paymentStatus === 'Refunded' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        r.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {r.paymentStatus || 'Unpaid'}
                      </span>
                      {r.paymentStatus === 'Refunded' && r.refundAmount > 0 && (
                        <span className="text-xs text-purple-600 font-bold whitespace-nowrap">Refund: ${r.refundAmount}</span>
                      )}
                      {r.paymentStatus !== 'Paid' && r.paymentStatus !== 'Refunded' && (
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Due: ${(r.totalAmount - (r.paidAmount || 0))}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <select 
                      value={r.status}
                      onChange={(e) => handleStatusChange(r._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border cursor-pointer outline-none status-select ${
                        r.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                        r.status === 'checked-in' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        r.status === 'checked-out' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                        r.status === 'early-checkout' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        r.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value="pending">PENDING</option>
                      <option value="confirmed">CONFIRMED</option>
                      <option value="checked-in">CHECKED-IN</option>
                      <option value="checked-out">CHECKED-OUT</option>
                      <option value="early-checkout">EARLY CHECKOUT</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => openEditModal(r)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors inline-flex items-center justify-center" title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => openPaymentModal(r)} className="w-8 h-8 rounded-full bg-green-50 text-green-500 hover:bg-green-100 hover:text-green-700 transition-colors inline-flex items-center justify-center" title="Add Payment">
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                    </button>
                    <button onClick={() => handleDelete(r._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors inline-flex items-center justify-center" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan="8" className="p-8 text-center text-gray-400 font-medium">No reservations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRes ? "Edit Booking" : "Add Booking"} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto p-2">
          
          <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Guest Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Full Name *</label>
              <input required type="text" minLength="3" title="Name must be at least 3 characters" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Email *</label>
              <input required type="email" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Contact Number *</label>
              <input required type="text" pattern="[0-9]{11}" title="Contact number must be exactly 11 digits" placeholder="e.g. 03001234567" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">CNIC *</label>
              <input required type="text" pattern="[0-9]{13}" title="CNIC must be exactly 13 digits without dashes" placeholder="e.g. 4210112345678" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Nationality</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">City</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Address</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>

          <h3 className="font-bold text-gray-800 text-lg border-b pb-2 mt-6">Booking Details</h3>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Room *</label>
            <select required className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
              <option value="">Select Room</option>
              {rooms.map(r => <option key={r._id} value={r._id}>Room {r.roomNumber} - {r.type} (${r.pricePerNight}/night)</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Check In *</label>
              <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.checkInDate} onChange={e => setFormData({...formData, checkInDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Check Out *</label>
              <input required type="date" min={formData.checkInDate || new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.checkOutDate} onChange={e => setFormData({...formData, checkOutDate: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Status</label>
              <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
                <option value="checked-in">Checked In</option><option value="checked-out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Total Amount ($) *</label>
              <input required type="number" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} />
            </div>
          </div>
          
          {!editingRes && (
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-6">
              <h3 className="font-bold text-blue-900 text-lg border-b border-blue-200 pb-2 mb-4">Initial Payment *</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-blue-800 mb-1 uppercase tracking-wide">Amount ($)</label>
                  <input required type="number" min="1" max={formData.totalAmount || 1000000} className="w-full bg-white border border-blue-200 text-blue-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.initialPaymentAmount || ''} onChange={e => setFormData({...formData, initialPaymentAmount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-800 mb-1 uppercase tracking-wide">Payment Method</label>
                  <select className="w-full bg-white border border-blue-200 text-blue-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.paymentMethod || 'Cash'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                    <option value="Cash">Cash</option><option value="Credit Card">Credit Card</option><option value="Online">Online Transfer</option>
                  </select>
                </div>
              </div>
              {Number(formData.initialPaymentAmount) >= 0 && Number(formData.totalAmount) > 0 && (
                <div className="bg-white text-blue-900 p-3 rounded-xl mt-4 border border-blue-200 shadow-sm flex justify-between items-center">
                  <span className="font-bold text-sm uppercase tracking-wider text-blue-700">Remaining Balance</span>
                  <span className="text-xl font-black text-red-500">${Math.max(0, Number(formData.totalAmount) - (Number(formData.initialPaymentAmount) || 0))}</span>
                </div>
              )}
            </div>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/30 mt-6">Save Booking</button>
        </form>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Add Payment">
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Amount</p>
              <p className="text-xl font-bold text-gray-700">${selectedResForPayment?.totalAmount || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Already Paid</p>
              <p className="text-xl font-bold text-green-600">${selectedResForPayment?.paidAmount || 0}</p>
            </div>
            <div className="col-span-2 mt-2 pt-4 border-t border-gray-200">
              {(() => {
                const diff = selectedResForPayment ? (selectedResForPayment.totalAmount - (selectedResForPayment.paidAmount || 0)) : 0;
                if (diff < 0) {
                  return (
                    <>
                      <p className="text-sm text-purple-600 uppercase font-bold tracking-wider mb-1">Refund Due</p>
                      <p className="text-3xl font-black text-purple-600">${Math.abs(diff)}</p>
                    </>
                  );
                }
                return (
                  <>
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Current Due</p>
                    <p className="text-3xl font-black text-red-500">${diff}</p>
                  </>
                );
              })()}
            </div>
          </div>
          {selectedResForPayment && (selectedResForPayment.totalAmount - (selectedResForPayment.paidAmount || 0)) > 0 ? (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Amount to Pay ($) *</label>
                <input required type="number" min="1" max={selectedResForPayment ? (selectedResForPayment.totalAmount - (selectedResForPayment.paidAmount || 0)) : 100000} className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Payment Method *</label>
                <select required className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                  <option value="Cash">Cash</option><option value="Credit Card">Credit Card</option><option value="Online">Online Transfer</option>
                </select>
              </div>
              {Number(paymentData.amount) > 0 && selectedResForPayment && (
                <div className="bg-green-50 text-green-900 p-4 rounded-xl border border-green-200 flex justify-between items-center">
                  <span className="font-bold text-sm uppercase tracking-wider">Remaining Balance</span>
                  <span className="text-2xl font-black">${Math.max(0, (selectedResForPayment.totalAmount - (selectedResForPayment.paidAmount || 0)) - Number(paymentData.amount))}</span>
                </div>
              )}
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-lg hover:shadow-green-500/30 text-lg">Process Payment</button>
            </>
          ) : (
            <div className="text-center p-6 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
              <span className="font-bold text-lg text-gray-700">Payment Settled</span>
              <p className="text-sm mt-1">No additional payments required.</p>
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors">Close</button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Reservations;
