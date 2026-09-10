import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, faCheck, faSave, faPlus, faTrash, faEdit,
  faHotel, faClipboardList, faUser, faBed, faCog, faSyncAlt,
  faMoneyBillWave, faBroom, faUserTie 
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

// Simplified permissions mapping directly to Pages
const PERMISSION_GROUPS = [
  {
    group: 'Dashboard',
    icon: faHotel,
    permissions: [{ id: 'view_dashboard', label: 'View Dashboard', desc: 'Can access the main dashboard and analytics page' }]
  },
  {
    group: 'Rooms',
    icon: faBed,
    permissions: [{ id: 'manage_rooms', label: 'Manage Rooms', desc: 'Can view, add, and edit room inventory and pricing' }]
  },
  {
    group: 'Reservations',
    icon: faClipboardList,
    permissions: [{ id: 'manage_reservations', label: 'Manage Reservations', desc: 'Can handle guest bookings, check-ins, and check-outs' }]
  },
  {
    group: 'Billings',
    icon: faMoneyBillWave,
    permissions: [{ id: 'manage_billing', label: 'Manage Billings', desc: 'Can view invoices, payments, and financial records' }]
  },
  {
    group: 'Maintenance',
    icon: faBroom,
    permissions: [{ id: 'manage_maintenance', label: 'Maintenance & Services', desc: 'Access to Maintenance tasks and Guest Services pages' }]
  },
  {
    group: 'Guests Data',
    icon: faUser,
    permissions: [{ id: 'manage_guests', label: 'Guests, Messages & Feedback', desc: 'Access to registered Users, Guest Messages, and Feedbacks' }]
  },
  {
    group: 'Staff & Roles',
    icon: faUserTie,
    permissions: [
      { id: 'manage_staff', label: 'Staff Management', desc: 'Can add, edit, and remove hotel staff accounts' },
      { id: 'manage_roles', label: 'Roles & Permissions', desc: 'Can create roles and assign system permissions' }
    ]
  },
  {
    group: 'Settings',
    icon: faCog,
    permissions: [{ id: 'manage_settings', label: 'System Settings', desc: 'Can configure hotel holidays, pricing surges, and core settings' }]
  }
];

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });

  const fetchRoles = async () => {
    try {
      const { data } = await api.get('/roles');
      setRoles(data || []);
      if (data && data.length > 0 && !selectedRole) setSelectedRole(data[0]);
    } catch (error) {
      toast.error('Failed to fetch roles');
      setRoles([]);
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

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditRoleId(null);
    setFormData({ name: '', description: '', permissions: [] });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role, e) => {
    e.stopPropagation(); // prevent row click selection
    setIsEditMode(true);
    setEditRoleId(role._id);
    setFormData({ name: role.name, description: role.description || '', permissions: role.permissions || [] });
    setIsModalOpen(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/roles/${editRoleId}`, formData);
        toast.success('Role updated successfully');
      } else {
        await api.post('/roles', formData);
        toast.success('Role added successfully');
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (err) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} role`);
    }
  };

  const handleDeleteRole = async (id, e) => {
    e.stopPropagation();
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
          onClick={handleOpenCreateModal} 
          className="w-full md:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} /> Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roles List Table (Left Side) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden col-span-1 lg:col-span-2 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
          <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="bg-gray-50/90 backdrop-blur-sm border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6 w-[25%]">Role Name</th>
                  <th className="p-4 w-[40%]">Description</th>
                  <th className="p-4 text-center w-[15%]">Permissions</th>
                  <th className="p-4 text-center w-[20%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                      No roles found. Click "Add Role" to create one.
                    </td>
                  </tr>
                ) : (
                  roles.map(role => {
                    const isAdmin = role.name.toLowerCase() === 'admin';
                    return (
                      <tr 
                        key={role._id} 
                        onClick={() => setSelectedRole(role)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedRole?._id === role._id ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="p-4 pl-6 font-bold text-gray-800 align-top">
                          <div className="flex flex-col items-start gap-1">
                            <span>{role.name}</span>
                            {isAdmin && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest mt-1">System Role</span>}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600 whitespace-pre-wrap align-top break-words">
                          {role.description || <span className="text-gray-400 italic">No description</span>}
                        </td>
                        <td className="p-4 text-center text-sm font-bold text-blue-600 align-top">
                          {isAdmin ? 'All' : (role.permissions?.length || 0)}
                        </td>
                        <td className="p-4 text-center align-top">
                          {!isAdmin && (
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={(e) => handleOpenEditModal(role, e)}
                                className="text-gray-400 hover:text-blue-600 p-2 transition-colors rounded-lg hover:bg-blue-50"
                                title="Edit Role"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteRole(role._id, e)}
                                className="text-gray-400 hover:text-red-600 p-2 transition-colors rounded-lg hover:bg-red-50"
                                title="Delete Role"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Manager (Right Side) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col col-span-1 h-[calc(100vh-12rem)] min-h-[500px]">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0 flex items-center justify-between">
            {selectedRole ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editing Role</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedRole.name}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-50/50 rounded-xl flex items-center justify-center border border-blue-100 shadow-inner shrink-0">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 text-xl" />
                </div>
              </>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-gray-900">Permissions Manager</h3>
                <p className="text-sm text-gray-500 mt-1">Select a role from the table</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-white border-b border-gray-50/50 shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.02)] z-10">
            <h4 className="font-bold text-gray-800">Manage Permissions</h4>
          </div>

          <div className="p-6 pt-5 flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
            {selectedRole ? (
              selectedRole.name.toLowerCase() === 'admin' ? (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center mt-4">
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
                                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{perm.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center text-gray-400 py-10">
                <FontAwesomeIcon icon={faShieldAlt} className="text-4xl mb-3 opacity-20" />
                <p>Select a role to view permissions</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3 shrink-0">
            <button 
              onClick={handleResetPermissions}
              disabled={!selectedRole || selectedRole.name.toLowerCase() === 'admin'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 hover:text-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed bg-white"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Edit Role" : "Create New Role"}>
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Role Name *</label>
            <input required type="text" placeholder="e.g. Front Desk" className="w-full border-gray-300 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea rows="3" placeholder="e.g. Manage front desk operations" className="w-full border-gray-300 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition">
            {isEditMode ? "Update Role" : "Create Role"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Roles;
