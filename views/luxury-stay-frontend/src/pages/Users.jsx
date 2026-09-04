import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faUser, faUpload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', contactNumber: '', cnic: '', 
    nationality: '', city: '', address: '', role: 'guest', status: 'Active'
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) { toast.error('Failed to fetch users'); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ 
      fullName: user.fullName || '', 
      email: user.email || '', 
      contactNumber: user.contactNumber || '', 
      cnic: user.cnic || '', 
      nationality: user.nationality || '',
      city: user.city || '', 
      address: user.address || '', 
      role: user.role || 'guest', 
      status: user.status || 'Active'
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const viewDetail = (id) => {
    navigate(`/admin/users/${id}`);
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
        await api.delete(`/users/${id}`);
        toast.success('User deleted');
        fetchUsers();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/users/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('User updated');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) { toast.error('Operation failed'); }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Users & Staff</h1>
          <p className="text-gray-500 mt-1">Manage administrators, staff, and guest accounts</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">CNIC</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5">
                    {u.image ? (
                      <img src={u.image} alt={u.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 border-2 border-white shadow-sm">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-gray-800">{u.fullName}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-5 text-gray-600 font-medium">{u.cnic || '-'}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {u.role || 'guest'}
                    </span>
                  </td>
                  <td className="p-5">
                    <select 
                      value={u.status || 'Active'}
                      onChange={(e) => handleStatusChange(u._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border cursor-pointer outline-none status-select ${
                        u.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      <option value="Active">ACTIVE</option>
                      <option value="Inactive">INACTIVE</option>
                    </select>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => viewDetail(u._id)} className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors inline-flex items-center justify-center" title="View Detail">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button onClick={() => openEditModal(u)} className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors inline-flex items-center justify-center" title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(u._id)} className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors inline-flex items-center justify-center" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit User" maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Profile Image</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                    <FontAwesomeIcon icon={faUpload} className="w-8 h-8 mb-3 text-blue-400 group-hover:text-blue-500" />
                    <p className="mb-2 text-sm font-semibold">Click to upload Profile Image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, or JPEG (MAX. 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                </label>
              </div>
              {imageFile && (
                <p className="text-sm text-green-700 mt-2 font-medium bg-green-50 p-3 rounded-xl border border-green-200 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} /> Selected: {imageFile.name}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Full Name *</label>
              <input required minLength="3" type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Email *</label>
              <input required type="email" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Contact Number *</label>
              <input required pattern="[0-9]{11}" title="Contact number must be exactly 11 digits" placeholder="e.g. 03001234567" type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">CNIC *</label>
              <input required pattern="[0-9]{13}" title="CNIC must be exactly 13 digits without dashes" placeholder="e.g. 4210112345678" type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} />
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
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Role *</label>
              <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="guest">Guest</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Status *</label>
              <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/30 mt-6">Save Changes</button>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
