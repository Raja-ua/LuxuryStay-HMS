import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faBroom, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';

const MaintenanceTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    roomId: '',
    issueType: 'Cleaning',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: ''
  });

  const [editingId, setEditingId] = useState(null);
  
  // Role checks
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role?.toLowerCase() || '';
  const isMaintenanceStaff = ['housekeeping', 'maintenance', 'cleaner', 'sweeper'].includes(userRole);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // If maintenance staff, only fetch their specific tasks
      const tasksEndpoint = isMaintenanceStaff && user.isStaff ? `/maintenance/staff/${user._id}` : '/maintenance';
      
      const [tasksRes, roomsRes, staffRes] = await Promise.all([
        api.get(tasksEndpoint),
        api.get('/rooms'),
        api.get('/staff')
      ]);
      setTasks(tasksRes.data);
      setRooms(roomsRes.data);
      setStaff(staffRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setFormData({
        roomId: task.roomId?._id || '',
        issueType: task.issueType || 'Cleaning',
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        assignedTo: task.assignedTo?._id || ''
      });
      setEditingId(task._id);
    } else {
      setFormData({
        roomId: '',
        issueType: 'Cleaning',
        description: '',
        priority: 'Medium',
        status: 'Pending',
        assignedTo: ''
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/maintenance/${editingId}`, formData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/maintenance', formData);
        toast.success('Task created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/maintenance/${id}`);
        toast.success('Task deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setTasks(tasks.map(t => t._id === id ? { ...t, status: newStatus } : t));
      await api.put(`/maintenance/${id}`, { status: newStatus });
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
      fetchData();
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return 'text-red-600 font-bold';
      case 'High': return 'text-orange-500 font-bold';
      case 'Medium': return 'text-blue-500';
      case 'Low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{isMaintenanceStaff ? 'My Assigned Tasks' : 'Maintenance & Housekeeping'}</h1>
          <p className="text-gray-500 mt-1 font-medium">{isMaintenanceStaff ? 'Update your task status here' : 'Manage cleaning and repair tasks'}</p>
        </div>
        {!isMaintenanceStaff && (
          <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} /> New Task
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Room</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Issue Type</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Description</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Priority</th>
                {!isMaintenanceStaff && <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Assigned To</th>}
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Status</th>
                <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <tr><td colSpan={isMaintenanceStaff ? "6" : "7"} className="p-8 text-center text-gray-500 font-medium">No tasks found.</td></tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{task.roomId?.roomNumber || 'N/A'}</td>
                    <td className="p-4 font-medium text-gray-700">{task.issueType}</td>
                    <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{task.description}</td>
                    <td className={`p-4 ${getPriorityColor(task.priority)}`}>{task.priority}</td>
                    {!isMaintenanceStaff && <td className="p-4 font-medium text-gray-700">{task.assignedTo?.fullName || 'Unassigned'}</td>}
                    <td className="p-4">
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer outline-none appearance-none ${getStatusColor(task.status)} border border-transparent hover:border-gray-300 focus:ring-2 focus:ring-blue-500/50 pr-7 text-center`}
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.3rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                      >
                        <option value="Pending" className="bg-white text-gray-900">Pending</option>
                        <option value="In Progress" className="bg-white text-gray-900">In Progress</option>
                        <option value="Resolved" className="bg-white text-gray-900">Resolved</option>
                      </select>
                    </td>
                    <td className="p-4 flex justify-center gap-3">
                      <button onClick={() => handleOpenModal(task)} className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 rounded-lg hover:bg-blue-100" title={isMaintenanceStaff ? "Update Status" : "Edit Task"}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {!isMaintenanceStaff && (
                        <button onClick={() => handleDelete(task._id)} className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 rounded-lg hover:bg-red-100" title="Delete Task">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? (isMaintenanceStaff ? "Update Task Status" : "Edit Task") : "Add New Task"} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Room *</label>
              <select required disabled={isMaintenanceStaff} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 disabled:bg-gray-100" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
                <option value="">Select Room</option>
                {rooms.map(r => (
                  <option key={r._id} value={r._id}>{r.roomNumber} - {r.type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Issue Type *</label>
              <select required disabled={isMaintenanceStaff} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 disabled:bg-gray-100" value={formData.issueType} onChange={e => setFormData({...formData, issueType: e.target.value})}>
                <option value="Cleaning">Cleaning</option>
                <option value="Repair">Repair</option>
                <option value="Supply Request">Supply Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Description *</label>
              <textarea required disabled={isMaintenanceStaff} rows="3" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 disabled:bg-gray-100" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the issue..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Priority *</label>
              <select required disabled={isMaintenanceStaff} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 disabled:bg-gray-100" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {!isMaintenanceStaff && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Assign To</label>
                <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                  <option value="">Unassigned</option>
                  {staff.map(s => (
                    <option key={s._id} value={s._id}>{s.fullName} ({s.role})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Status *</label>
              <select required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 border-blue-500 ring-2 ring-blue-500/30" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg mt-4">
            {isMaintenanceStaff ? 'Update Status' : (editingId ? 'Update Task' : 'Create Task')}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceTasks;
