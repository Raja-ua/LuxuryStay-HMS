import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faMinus } from '@fortawesome/free-solid-svg-icons';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '', type: 'Single', status: 'available', pricePerNight: '', features: '',
    floor: '', capacity: '', description: ''
  });
  const [beds, setBeds] = useState([{ bedType: 'Single', quantity: 1 }]);
  const [imageFiles, setImageFiles] = useState([]);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch (err) {
      toast.error('Failed to fetch rooms');
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({ 
      roomNumber: '', type: 'Single', status: 'available', pricePerNight: '', features: '',
      floor: '', capacity: '', description: '' 
    });
    setBeds([{ bedType: 'Single', quantity: 1 }]);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({ 
      roomNumber: room.roomNumber, 
      type: room.type, 
      status: room.status, 
      pricePerNight: room.pricePerNight, 
      features: room.features ? room.features.join(',') : '',
      floor: room.floor || '',
      capacity: room.capacity || '',
      description: room.description || ''
    });
    setBeds(room.beds && room.beds.length > 0 ? room.beds : [{ bedType: 'Single', quantity: 1 }]);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const viewDetail = (id) => {
    navigate(`/admin/rooms/${id}`);
  };

  const handleAddBed = () => {
    setBeds([...beds, { bedType: 'Single', quantity: 1 }]);
  };

  const handleRemoveBed = (index) => {
    setBeds(beds.filter((_, i) => i !== index));
  };

  const handleBedChange = (index, field, value) => {
    const newBeds = [...beds];
    newBeds[index][field] = value;
    setBeds(newBeds);
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
        await api.delete(`/rooms/${id}`);
        toast.success('Room deleted');
        fetchRooms();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/rooms/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchRooms();
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
    
    data.append('beds', JSON.stringify(beds));

    if (imageFiles && imageFiles.length > 0) {
      Array.from(imageFiles).forEach(file => {
        data.append('images', file);
      });
    }

    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Room updated successfully');
      } else {
        await api.post('/rooms', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Room added successfully');
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Room Management</h1>
          <p className="text-gray-500 mt-1">Manage all hotel rooms, pricing, and availability</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/reservations', { state: { openAddBooking: true } })} className="bg-white border border-green-200 text-green-700 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:bg-green-50 active:scale-95 transition-all font-semibold flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} /> Add Booking
          </button>
          <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all font-semibold flex items-center gap-2">
            <FontAwesomeIcon icon={faPlus} /> Add Room
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Room No</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Floor</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rooms.map(room => (
                <tr key={room._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5 font-bold text-gray-800">{room.roomNumber}</td>
                  <td className="p-5">
                    <span className="font-medium text-gray-700">{room.type}</span>
                  </td>
                  <td className="p-5 text-gray-600 font-medium">{room.floor || '-'}</td>
                  <td className="p-5 text-gray-600 font-medium">{room.capacity || '-'}</td>
                  <td className="p-5">
                    <select 
                      value={room.status}
                      onChange={(e) => handleStatusChange(room._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm cursor-pointer outline-none status-select ${
                        room.status === 'available' ? 'bg-green-100 text-green-700 border border-green-200' :
                        room.status === 'occupied' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        room.status === 'cleaning' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      <option value="available">AVAILABLE</option>
                      <option value="occupied">OCCUPIED</option>
                      <option value="cleaning">CLEANING</option>
                      <option value="maintenance">MAINTENANCE</option>
                    </select>
                  </td>
                  <td className="p-5 text-right space-x-3">
                    <button onClick={() => viewDetail(room._id)} className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors inline-flex items-center justify-center" title="View Detail">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button onClick={() => openEditModal(room)} className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors inline-flex items-center justify-center" title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(room._id)} className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors inline-flex items-center justify-center" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-medium">No rooms found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? "Edit Room" : "Add Room"} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Room Number *</label>
              <input required type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Room Type</label>
              <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Single</option><option>Double</option><option>Suite</option><option>Deluxe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Floor</label>
              <input required type="text" placeholder="e.g. 1, 2, G" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Capacity (Persons) *</label>
              <input required type="number" min="1" max="20" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Status</label>
              <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="available">Available</option><option value="occupied">Occupied</option><option value="cleaning">Cleaning</option><option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Price Per Night ($) *</label>
              <input required type="number" min="1" max="100000" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Description</label>
              <textarea required className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Features (comma separated) *</label>
              <input required type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="WiFi, AC, TV, Minibar" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
            </div>
            
            {/* Beds Section */}
            <div className="md:col-span-2 border border-gray-200 rounded-2xl p-5 bg-gray-50/50 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-gray-800 text-lg">Beds Information</h3>
                <button type="button" onClick={handleAddBed} className="text-sm font-bold bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 active:scale-95 transition-all">
                  <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Bed Type
                </button>
              </div>
              {beds.map((bed, index) => (
                <div key={index} className="flex items-center gap-4 mb-3 p-3 bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Bed Size/Type *</label>
                    <select required className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={bed.bedType} onChange={e => handleBedChange(index, 'bedType', e.target.value)}>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Queen">Queen</option>
                      <option value="King">King</option>
                      <option value="Full">Full Size</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Qty *</label>
                    <input required type="number" min="1" max="10" className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={bed.quantity} onChange={e => handleBedChange(index, 'quantity', e.target.value)} />
                  </div>
                  {beds.length > 1 && (
                    <button type="button" onClick={() => handleRemoveBed(index)} className="mt-5 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Room Images (multiple allowed)</label>
              <input type="file" multiple accept="image/*" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all outline-none" onChange={e => setImageFiles(e.target.files)} />
              {editingRoom && editingRoom.images && editingRoom.images.length > 0 && (
                <p className="text-xs font-medium text-gray-500 mt-2 bg-blue-50 p-2 rounded-lg border border-blue-100 inline-block">
                  <span className="font-bold text-blue-700">{editingRoom.images.length}</span> image(s) currently uploaded. Uploading new images will add to them.
                </p>
              )}
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/30 mt-6">Save Room</button>
        </form>
      </Modal>
    </div>
  );
};

export default Rooms;
