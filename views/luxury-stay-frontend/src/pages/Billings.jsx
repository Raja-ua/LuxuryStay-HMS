import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faPrint } from '@fortawesome/free-solid-svg-icons';

const Billings = () => {
  const [billings, setBillings] = useState([]);
  const [reservations, setReservations] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);
  
  const [formData, setFormData] = useState({
    reservationId: '', guestId: '', roomCharges: 0, additionalCharges: 0, totalAmount: 0, status: 'pending'
  });

  const fetchData = async () => {
    try {
      const [billsRes, resRes] = await Promise.all([
        api.get('/billings'), api.get('/reservations')
      ]);
      setBillings(billsRes.data);
      setReservations(resRes.data);
    } catch (err) { toast.error('Failed to fetch data'); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAddModal = () => {
    setEditingBill(null);
    setFormData({ reservationId: '', guestId: '', roomCharges: 0, additionalCharges: 0, totalAmount: 0, status: 'pending' });
    setIsModalOpen(true);
  };

  const openEditModal = (bill) => {
    setEditingBill(bill);
    setFormData({ 
      reservationId: bill.reservationId?._id || '', 
      guestId: bill.guestId?._id || '', 
      roomCharges: bill.roomCharges, 
      additionalCharges: bill.additionalCharges, 
      totalAmount: bill.totalAmount, 
      status: bill.status 
    });
    setIsModalOpen(true);
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
        await api.delete(`/billings/${id}`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err) { toast.error('Delete failed'); }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/billings/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleReservationSelect = (e) => {
    const resId = e.target.value;
    const res = reservations.find(r => r._id === resId);
    if (res) {
      setFormData({
        ...formData,
        reservationId: resId,
        guestId: res.guestId?._id,
        roomCharges: res.totalAmount,
        totalAmount: Number(res.totalAmount) + Number(formData.additionalCharges),
        status: res.paymentStatus === 'Refunded' ? 'refunded' : (res.paymentStatus === 'Paid' ? 'paid' : 'pending')
      });
    }
  };

  const handleAdditionalChargesChange = (e) => {
    const val = Number(e.target.value);
    setFormData({
      ...formData,
      additionalCharges: val,
      totalAmount: Number(formData.roomCharges) + val
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBill) await api.put(`/billings/${editingBill._id}`, formData);
      else await api.post('/billings', formData);
      toast.success('Success');
      setIsModalOpen(false);
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const handlePrint = (bill) => {
    setSelectedBillForPrint(bill);
    setTimeout(() => window.print(), 100);
  };

  return (
    <>
      <div className="animate-fade-in-up print:hidden">
        <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Billings & Invoices</h1>
          <p className="text-gray-500 mt-1">Manage guest billing, additional charges, and print invoices</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all font-semibold flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} /> Create Bill
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Room Charges</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Additional</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {billings.map(b => (
                <tr key={b._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5 font-bold text-gray-800">{b.guestId?.fullName || b.guestId?.name || 'Unknown'}</td>
                  <td className="p-5 text-gray-600 font-medium">${b.roomCharges}</td>
                  <td className="p-5 text-gray-600 font-medium">${b.additionalCharges}</td>
                  <td className="p-5 font-bold text-blue-600">${b.totalAmount}</td>
                  <td className="p-5 text-green-600 font-bold">${b.reservationId?.paidAmount || 0}</td>
                  <td className="p-5">
                    {(() => {
                      const remaining = b.totalAmount - (b.reservationId?.paidAmount || 0);
                      return remaining < 0 
                        ? <span className="text-purple-600 font-bold whitespace-nowrap">Refund: ${Math.abs(remaining)}</span>
                        : <span className="text-red-500 font-bold">${remaining}</span>;
                    })()}
                  </td>
                  <td className="p-5">
                    <select 
                      value={b.status}
                      onChange={(e) => handleStatusChange(b._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border cursor-pointer outline-none status-select ${
                        b.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                        b.status === 'refunded' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value="pending">PENDING</option>
                      <option value="paid">PAID</option>
                      <option value="refunded">REFUNDED</option>
                    </select>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors inline-flex items-center justify-center" title="Print Invoice" onClick={() => handlePrint(b)}>
                      <FontAwesomeIcon icon={faPrint} />
                    </button>
                    <button onClick={() => openEditModal(b)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors inline-flex items-center justify-center" title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(b._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors inline-flex items-center justify-center" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {billings.length === 0 && (
                <tr><td colSpan="8" className="p-8 text-center text-gray-400 font-medium">No billings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBill ? "Edit Bill" : "Create Bill"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Select Reservation *</label>
            <select required className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.reservationId} onChange={handleReservationSelect}>
              <option value="">Select a reservation to bill...</option>
              {reservations.map(r => (
                <option key={r._id} value={r._id}>
                  {r.fullName || r.guestId?.fullName || 'Unknown Guest'} - Room {r.roomId?.roomNumber || 'Unknown'}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Room Charges ($)</label>
              <input required type="number" readOnly className="w-full bg-gray-100 border border-gray-200 text-gray-500 p-3 rounded-xl cursor-not-allowed outline-none" value={formData.roomCharges} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Additional Charges ($)</label>
              <input required type="number" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.additionalCharges} onChange={handleAdditionalChargesChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Status</label>
              <input 
                type="text" 
                readOnly 
                className={`w-full border p-3 rounded-xl font-bold uppercase tracking-wide cursor-not-allowed outline-none ${
                  formData.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 
                  formData.status === 'refunded' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                value={formData.status === 'paid' ? 'Paid' : (formData.status === 'refunded' ? 'Refunded' : 'Unpaid (Pending)')} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Total ($)</label>
              <input required type="number" readOnly className="w-full bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-xl font-black outline-none" value={formData.totalAmount} />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/30 mt-4">Save Bill</button>
        </form>
      </Modal>
      </div>

      {/* Printable Invoice - Only visible during printing */}
      {selectedBillForPrint && (
        <div className="hidden print:block p-8 bg-white text-black font-sans w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-10 border-b-2 border-gray-200 pb-6">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">LuxuryStay</h1>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-800 tracking-widest uppercase">Invoice</h2>
              <p className="text-gray-500 mt-2 font-medium">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="mb-12 flex justify-between bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Billed To</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedBillForPrint.guestId?.fullName || selectedBillForPrint.guestId?.name || 'Guest User'}</h3>
              <p className="text-gray-600 font-medium">{selectedBillForPrint.guestId?.email || 'N/A'}</p>
              <p className="text-gray-600 font-medium">{selectedBillForPrint.guestId?.contactNumber || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Invoice Details</p>
              <p className="text-gray-800 font-bold mb-1">Bill No: <span className="text-gray-500 font-medium">#{selectedBillForPrint._id.slice(-6).toUpperCase()}</span></p>
              <p className="text-gray-800 font-bold">Status: <span className={`uppercase tracking-wider ${selectedBillForPrint.status === 'paid' ? 'text-green-600' : selectedBillForPrint.status === 'refunded' ? 'text-purple-600' : 'text-amber-500'}`}>{selectedBillForPrint.status}</span></p>
            </div>
          </div>
          
          <div className="mb-12">
            <div className="border-t-2 border-b-2 border-gray-800 py-4 space-y-4">
              <div className="flex justify-between items-center px-2">
                <span className="font-bold text-gray-600 uppercase tracking-wider text-sm">Room Charges</span>
                <span className="font-bold text-gray-900 text-lg">${selectedBillForPrint.roomCharges}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="font-bold text-gray-600 uppercase tracking-wider text-sm">Additional Charges</span>
                <span className="font-bold text-gray-900 text-lg">${selectedBillForPrint.additionalCharges}</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-b-2 border-gray-800 py-6 px-2 bg-gray-50">
              <span className="font-black text-xl text-gray-900 uppercase tracking-widest">Total Amount</span>
              <span className="font-black text-4xl text-gray-900">${selectedBillForPrint.totalAmount}</span>
            </div>
          </div>
          
          <div className="text-center mt-20 text-gray-500 text-sm">
            <p className="font-bold text-gray-800 text-lg mb-2">Thank you for choosing LuxuryStay!</p>
            <p className="font-medium">If you have any questions concerning this invoice, please contact our support.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Billings;
