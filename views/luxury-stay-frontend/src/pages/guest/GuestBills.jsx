import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faPrint, faCheckCircle, faExclamationCircle, faReceipt } from '@fortawesome/free-solid-svg-icons';

const GuestBills = () => {
  const [bills, setBills] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const [loading, setLoading] = useState(true);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const { data } = await api.get('/billings');
        const userBills = data.filter(b => b.guestId?._id === user._id || b.guestId === user._id);
        // Sort by date descending
        userBills.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
        setBills(userBills);
        setLoading(false);
      } catch (err) { 
        toast.error('Failed to load payments/bills');
        setLoading(false);
      }
    };
    fetchBills();
  }, [user._id]);

  const handlePrint = (bill) => {
    setSelectedBillForPrint(bill);
    setTimeout(() => window.print(), 100);
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading payments...</div>;

  return (
    <>
    <div className="max-w-6xl mx-auto print:hidden">
      <div className="mb-8 border-b pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">My Payments & Invoices</h1>
          <p className="text-gray-500 mt-2">View your billing history and payment details.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map(b => (
          <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition duration-300 relative group">
            {/* Header */}
            <div className={`p-5 flex justify-between items-center ${
              b.status === 'paid' ? 'bg-green-50' : b.status === 'refunded' ? 'bg-purple-50' : 'bg-yellow-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  b.status === 'paid' ? 'bg-green-100 text-green-600' : b.status === 'refunded' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <FontAwesomeIcon icon={faReceipt} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Invoice</h2>
                  <span className="text-xs text-gray-500">{new Date(b.issuedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <button 
                className="text-gray-400 hover:text-blue-600 bg-white w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition" 
                title="Print Invoice" 
                onClick={() => handlePrint(b)}
              >
                <FontAwesomeIcon icon={faPrint} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Room Charges:</span>
                  <span className="font-medium text-gray-800">${b.roomCharges}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Additional Charges:</span>
                  <span className="font-medium text-gray-800">${b.additionalCharges}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-100 mt-3 text-gray-800">
                  <span>Total Bill:</span>
                  <span>${b.totalAmount}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-600">Amount Paid:</span>
                  <span className="font-bold text-green-600">${b.reservationId?.paidAmount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  {(() => {
                    const diff = b.totalAmount - (b.reservationId?.paidAmount || 0);
                    if (diff < 0) {
                      return (
                        <>
                          <span className="font-semibold text-gray-600">Refund Due:</span>
                          <span className="font-bold text-purple-600">${Math.abs(diff)}</span>
                        </>
                      );
                    }
                    return (
                      <>
                        <span className="font-semibold text-gray-600">Remaining Balance:</span>
                        <span className="font-bold text-red-500">${diff}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className={`px-6 py-4 border-t border-gray-100 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm ${
              b.status === 'paid' ? 'text-green-600' : b.status === 'refunded' ? 'text-purple-600' : 'text-yellow-600'
            }`}>
              <FontAwesomeIcon icon={b.status === 'paid' || b.status === 'refunded' ? faCheckCircle : faExclamationCircle} />
              {b.status === 'paid' ? 'Fully Paid' : b.status === 'refunded' ? 'Refunded' : 'Pending Payment'}
            </div>
          </div>
        ))}
        {bills.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-5xl text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Payments Found</h3>
            <p className="text-gray-500">You don't have any generated invoices yet.</p>
          </div>
        )}
      </div>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedBillForPrint.guestId?.fullName || selectedBillForPrint.guestId?.name || user.fullName || user.name || 'Guest User'}</h3>
              <p className="text-gray-600 font-medium">{selectedBillForPrint.guestId?.email || user.email || 'N/A'}</p>
              <p className="text-gray-600 font-medium">{selectedBillForPrint.guestId?.contactNumber || user.contactNumber || 'N/A'}</p>
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

export default GuestBills;
