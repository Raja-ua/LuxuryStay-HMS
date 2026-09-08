import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConciergeBell, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    status: 'Pending',
    assignedTo: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role?.toLowerCase() === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, staffRes] = await Promise.all([
        api.get('/services'),
        api.get('/staff')
      ]);
      setRequests(reqRes.data);
      setStaff(staffRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (req) => {
    setEditingId(req._id);
    setFormData({
      status: req.status || 'Pending',
      assignedTo: req.assignedTo?._id || req.assignedTo || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/services/${editingId}`, formData);
      toast.success('Request updated');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Request deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Guest Services</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage room service, wake-up calls, and transport requests</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Guest & Room</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Service Details</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Requested Time</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Assigned To</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Status</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500 font-medium">No service requests found.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{req.guestId?.fullName || 'Unknown Guest'}</p>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">Room {req.roomId?.roomNumber || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800 text-sm">{req.serviceType}</p>
                      <p className="text-gray-600 text-sm max-w-xs truncate">{req.description}</p>
                    </td>
                    <td className="p-4 font-medium text-gray-700 text-sm">
                      {req.requestedTime ? new Date(req.requestedTime).toLocaleString() : 'As soon as possible'}
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {req.assignedTo?.fullName || 'Unassigned'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-3">
                      <button onClick={() => handleOpenModal(req)} className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 rounded-lg hover:bg-blue-100" title="Update Status">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(req._id)} className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 rounded-lg hover:bg-red-100" title="Delete Request">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Request" maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Assign To</label>
            <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
              <option value="">Unassigned</option>
              {staff.map(s => (
                <option key={s._id} value={s._id}>{s.fullName} ({s.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Status *</label>
            <select required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 border-blue-500 ring-2 ring-blue-500/30" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg mt-4">
            Save Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceRequests;
