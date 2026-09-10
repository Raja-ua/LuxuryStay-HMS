import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, faCheck, faSave, faPlus, faTrash, 
  faHotel, faClipboardList, faUser, faBed, faCog, faSyncAlt 
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

// Grouped permissions to match the elegant design
const PERMISSION_GROUPS = [
  {
    group: 'Dashboard',
    icon: faHotel,
    permissions: [
      { id: 'view_dashboard', label: 'View Dashboard', desc: 'Can access and view dashboard analytics' }
    ]
  },
  {
    group: 'Bookings',
    icon: faClipboardList,
    permissions: [
      { id: 'manage_reservations', label: 'Manage Bookings', desc: 'Can create, edit, and cancel bookings' },
      { id: 'manage_billing', label: 'Manage Billing', desc: 'Can handle payments, invoices, and refunds' }
    ]
  },
  {
    group: 'Guests',
    icon: faUser,
    permissions: [
      { id: 'manage_guests', label: 'Manage Guests', desc: 'Can view, add, and edit guest profiles' }
    ]
  },
  {
    group: 'Rooms & Services',
    icon: faBed,
    permissions: [
      { id: 'manage_rooms', label: 'Manage Rooms', desc: 'Can edit room inventory, statuses, and rates' },
      { id: 'manage_maintenance', label: 'Manage Maintenance', desc: 'Can handle housekeeping and service requests' }
    ]
  },
  {
    group: 'System Configuration',
    icon: faCog,
    permissions: [
      { id: 'manage_staff', label: 'Manage Staff', desc: 'Can create, edit, and deactivate staff accounts' },
      { id: 'manage_roles', label: 'Manage Roles', desc: 'Can modify access roles and permissions' },
      { id: 'manage_settings', label: 'Manage Settings', desc: 'Can configure system-wide settings and policies' }
    ]
  }
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
      toast.success('Permissions saved successfully!');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to save permissions');
    }
  };

  const handleResetPermissions = () => {
    if (!selectedRole) return;
    setSelectedRole({ ...selectedRole, permissions: [] });
    toast.success('Permissions reset. Click save to apply.');
  };

  const handleTogglePermission = (permId) => {
    if (!selectedRole || selectedRole.name.toLowerCase() === 'admin') return;
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user roles and their descriptions</p>
        </div>
        <button 
          onClick={() => { setFormData({ name: '', description: '', permissions: [] }); setIsModalOpen(true); }} 
          className="w-full md:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} /> Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roles List Table (Left Side) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden col-span-1 lg:col-span-2 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Role Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-center">Permissions</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => {
                  const isAdmin = role.name.toLowerCase() === 'admin';
                  return (
                    <tr 
                      key={role._id} 
                      onClick={() => setSelectedRole(role)}
                      className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedRole?._id === role._id ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="p-4 pl-6 font-bold text-gray-800 flex items-center gap-2">
                        {role.name}
                        {isAdmin && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">System Role</span>}
                      </td>
                      <td className="p-4 text-sm text-gray-600 truncate max-w-[200px]">{role.description || '-'}</td>
                      <td className="p-4 text-center text-sm font-bold text-blue-600">{isAdmin ? 'All' : (role.permissions?.length || 0)}</td>
                      <td className="p-4 text-center">
                        {!isAdmin && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteRole(role._id); }}
                            className="text-gray-400 hover:text-red-600 p-2 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Manager (Right Side) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col col-span-1">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Permissions Manager</h3>
            <p className="text-sm text-gray-500 mt-1">Select a role to manage its permissions</p>
            
            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Role</label>
              <select 
                className="w-full bg-white border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold shadow-sm cursor-pointer appearance-none"
                value={selectedRole?._id || ''}
                onChange={(e) => setSelectedRole(roles.find(r => r._id === e.target.value))}
              >
                {roles.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Manage Permissions</h4>
            
            {selectedRole ? (
              selectedRole.name.toLowerCase() === 'admin' ? (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-3xl text-blue-500 mb-3" />
                  <p className="font-bold text-blue-900">Full System Access</p>
                  <p className="text-sm text-blue-700 mt-1">The Admin role has unrestricted access to all features and settings. It cannot be modified.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.group} className="flex gap-4">
                      {/* Left icon / label */}
                      <div className="w-24 flex-shrink-0 flex flex-col items-center justify-start text-gray-400 pt-1">
                        <FontAwesomeIcon icon={group.icon} className="text-xl mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-center">{group.group}</span>
                      </div>
                      
                      {/* Checkboxes */}
                      <div className="flex-1 space-y-4 border-l border-gray-100 pl-4">
                        {group.permissions.map(perm => {
                          const isGranted = selectedRole.permissions?.includes(perm.id);
                          return (
                            <label key={perm.id} className="flex items-start gap-3 cursor-pointer group">
                              <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors border flex-shrink-0 ${isGranted ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
                                {isGranted && <FontAwesomeIcon icon={faCheck} className="text-white text-[10px]" />}
                              </div>
                              <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={isGranted} 
                                onChange={() => handleTogglePermission(perm.id)} 
                              />
                              <div>
                                <p className={`text-sm font-bold ${isGranted ? 'text-gray-900' : 'text-gray-700'}`}>{perm.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{perm.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
            <button 
              onClick={handleResetPermissions}
              disabled={!selectedRole || selectedRole.name.toLowerCase() === 'admin'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 hover:text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faSyncAlt} className="text-xs" /> Reset
            </button>
            <button 
              onClick={handleSavePermission}
              disabled={!selectedRole || selectedRole.name.toLowerCase() === 'admin'}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faSave} /> Save Permissions
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Role">
        <form onSubmit={handleAddRole} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Role Name *</label>
            <input required type="text" placeholder="e.g. Front Desk" className="w-full border-gray-300 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <input type="text" placeholder="e.g. Manage front desk operations" className="w-full border-gray-300 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">Create Role</button>
        </form>
      </Modal>
    </div>
  );
};

export default Roles;
