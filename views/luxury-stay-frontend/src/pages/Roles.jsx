import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faCheck, faSave, faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

// Define the available permissions in the system
const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard & Analytics' },
  { id: 'manage_reservations', label: 'Manage Reservations' },
  { id: 'manage_rooms', label: 'Manage Rooms & Inventory' },
  { id: 'manage_guests', label: 'Manage Guest Profiles' },
  { id: 'manage_staff', label: 'Manage Staff Accounts' },
  { id: 'manage_billing', label: 'Manage Billing & Payments' },
  { id: 'manage_maintenance', label: 'Manage Maintenance Requests' },
  { id: 'manage_settings', label: 'Manage System Settings' },
  { id: 'manage_roles', label: 'Manage Roles & Permissions' }
];

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });

  const fetchRoles = async () => {
    try {
      const { data } = await api.get('/roles');
      setRoles(data);
      if (data.length > 0 && !selectedRole) setSelectedRole(data[0]);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSavePermission = async () => {
    if (!selectedRole) return;
    try {
      await api.put(`/roles/${selectedRole._id}`, { permissions: selectedRole.permissions });
      toast.success('Permissions updated successfully!');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  const handleTogglePermission = (permId) => {
    if (!selectedRole) return;
    const hasPerm = selectedRole.permissions?.includes(permId);
    let updatedPerms = [];
    if (hasPerm) {
      updatedPerms = selectedRole.permissions.filter(p => p !== permId);
    } else {
      updatedPerms = [...(selectedRole.permissions || []), permId];
    }
    setSelectedRole({ ...selectedRole, permissions: updatedPerms });
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      await api.post('/roles', formData);
      toast.success('Role added successfully');
      setIsModalOpen(false);
      setFormData({ name: '', description: '', permissions: [] });
      fetchRoles();
    } catch (err) {
      toast.error('Failed to add role');
    }
  };

  const handleDeleteRole = async (id) => {
    if (roles.length === 1) return toast.error("Cannot delete the last role");
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Users with this role might lose access!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/roles/${id}`);
        toast.success('Role deleted');
        if (selectedRole?._id === id) setSelectedRole(roles.find(r => r._id !== id));
        fetchRoles();
      } catch (err) {
        toast.error('Failed to delete role');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading roles...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Roles & Permissions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage staff access levels and system permissions</p>
        </div>
        <button 
          onClick={() => { setFormData({ name: '', description: '', permissions: [] }); setIsModalOpen(true); }} 
          className="w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} /> Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden col-span-1">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700">Available Roles</h3>
          </div>
          <div className="p-2 space-y-1">
            {roles.map(role => (
              <div 
                key={role._id} 
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedRole?._id === role._id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
              >
                <div>
                  <h4 className={`font-bold ${selectedRole?._id === role._id ? 'text-blue-700' : 'text-gray-800'}`}>{role.name}</h4>
                  <p className="text-xs text-gray-500">{role.permissions?.length || 0} permissions</p>
                </div>
                {role.name.toLowerCase() !== 'admin' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteRole(role._id); }}
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Editor */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 col-span-1 lg:col-span-3">
          {selectedRole ? (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-blue-500" /> 
                    Editing Permissions: <span className="text-blue-600 break-all">{selectedRole.name}</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedRole.description || 'No description provided.'}</p>
                </div>
                <button 
                  onClick={handleSavePermission}
                  className="w-full md:w-auto bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/30"
                >
                  <FontAwesomeIcon icon={faSave} /> Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_PERMISSIONS.map(perm => {
                  const isGranted = selectedRole.permissions?.includes(perm.id);
                  const isAdmin = selectedRole.name.toLowerCase() === 'admin';
                  
                  return (
                    <div 
                      key={perm.id} 
                      onClick={() => !isAdmin && handleTogglePermission(perm.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isGranted ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-200'
                      } ${isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isGranted ? 'bg-blue-500 text-white' : 'bg-gray-200 text-transparent'
                      }`}>
                        <FontAwesomeIcon icon={faCheck} className="text-sm" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isGranted ? 'text-blue-900' : 'text-gray-700'}`}>{perm.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{perm.id}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedRole.name.toLowerCase() === 'admin' && (
                <p className="text-sm text-orange-600 font-bold mt-6 bg-orange-50 p-3 rounded-lg">
                  Admin role has all permissions by default. You cannot modify Admin permissions directly.
                </p>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FontAwesomeIcon icon={faShieldAlt} className="text-6xl mb-4 text-gray-200" />
              <p>Select a role to manage its permissions</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Role">
        <form onSubmit={handleAddRole} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Role Name *</label>
            <input required type="text" placeholder="e.g. Housekeeping" className="w-full border-gray-300 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <input type="text" placeholder="e.g. Can manage maintenance tasks" className="w-full border-gray-300 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">Create Role</button>
        </form>
      </Modal>
    </div>
  );
};

export default Roles;
