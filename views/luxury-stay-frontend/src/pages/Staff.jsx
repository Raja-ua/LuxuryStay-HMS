import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faUserTie, faUpload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '', email: '', contactNumber: '', dateOfBirth: '', 
    city: '', address: '', assignWork: '', role: '', joiningDate: '', 
    shift: '', salary: '', status: 'Active'
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/staff');
      setStaffList(data);
    } catch (err) { toast.error('Failed to fetch staff'); }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await api.get('/roles');
      setRolesList(data);
    } catch (err) { toast.error('Failed to fetch roles'); }
  };

  useEffect(() => { 
    fetchStaff(); 
    fetchRoles();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ 
      fullName: '', email: '', contactNumber: '', dateOfBirth: '', 
      city: '', address: '', assignWork: '', role: rolesList.length > 0 ? rolesList[0].name : '', joiningDate: '', 
      shift: '', salary: '', status: 'Active'
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({ 
      fullName: staff.fullName || '', 
      email: staff.email || '', 
      contactNumber: staff.contactNumber || '', 
      dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : '', 
      city: staff.city || '', 
      address: staff.address || '', 
      assignWork: staff.assignWork || '', 
      role: staff.role || (rolesList.length > 0 ? rolesList[0].name : ''), 
      joiningDate: staff.joiningDate ? staff.joiningDate.split('T')[0] : '', 
      shift: staff.shift || '', 
      salary: staff.salary || '', 
      status: staff.status || 'Active'
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const viewDetail = (id) => {
    navigate(`/admin/staff/${id}`);
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
        await api.delete(`/staff/${id}`);
        toast.success('Staff deleted');
        fetchStaff();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/staff/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchStaff();
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
      if (editingStaff) {
        await api.put(`/staff/${editingStaff._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Staff updated');
      } else {
        await api.post('/staff', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Staff created');
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) { toast.error('Operation failed'); }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage employees, roles, and statuses</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all font-semibold flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staffList.map(s => (
                <tr key={s._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5">
                    {s.image ? (
                      <img src={s.image} alt={s.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 border-2 border-white shadow-sm">
                        <FontAwesomeIcon icon={faUserTie} />
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-gray-800">{s.fullName}</div>
                    <div className="text-xs text-gray-500">{s.role || 'Staff'}</div>
                  </td>
                  <td className="p-5">
                    <select 
                      value={s.status}
                      onChange={(e) => handleStatusChange(s._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border cursor-pointer outline-none status-select ${
                        s.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      <option value="Active">ACTIVE</option>
                      <option value="Inactive">INACTIVE</option>
                    </select>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => viewDetail(s._id)} className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors inline-flex items-center justify-center" title="View Detail">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button onClick={() => openEditModal(s)} className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors inline-flex items-center justify-center" title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(s._id)} className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors inline-flex items-center justify-center" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400 font-medium">No staff members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? "Edit Staff" : "Add Staff"} maxWidth="max-w-4xl">
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
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Email</label>
              <input type="email" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Contact Number *</label>
              <input required pattern="[0-9]{11}" title="Contact number must be exactly 11 digits" placeholder="e.g. 03001234567" type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Date of Birth</label>
              <input type="date" max={new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">City</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Address</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Assign Work</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.assignWork} onChange={e => setFormData({...formData, assignWork: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Role *</label>
              <select required className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="" disabled>Select Role</option>
                {rolesList.map(r => (
                  <option key={r._id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Joining Date *</label>
              <input required type="date" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Shift</label>
              <input type="text" placeholder="e.g. Morning, Night" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Salary ($) *</label>
              <input required type="number" min="0" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Status *</label>
              <select required className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/30 mt-6">Save Staff</button>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
