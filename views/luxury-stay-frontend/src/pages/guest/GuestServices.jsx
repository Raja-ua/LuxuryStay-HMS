import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GuestServices = () => {
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '',
    serviceType: 'Room Service',
    description: '',
    requestedTime: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      
      const [resData, servData] = await Promise.all([
        api.get('/reservations'),
        api.get(`/services/user/${user._id}`)
      ]);

      // Filter active reservations for this user
      const userReservations = resData.data.filter(r => {
          const guestIdStr = r.guestId?._id || r.guestId;
          return guestIdStr === user._id && r.status === 'checked-in';
      });
      
      const uniqueRooms = [];
      userReservations.forEach(r => {
        if (r.roomId && !uniqueRooms.find(rm => rm._id === r.roomId._id)) {
          uniqueRooms.push(r.roomId);
        }
      });
      setRooms(uniqueRooms);
      
      if (uniqueRooms.length > 0 && !formData.roomId) {
        setFormData(prev => ({ ...prev, roomId: uniqueRooms[0]._id }));
      }

      setServices(servData.data);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomId) {
      return toast.error("Please select your room.");
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      await api.post('/services', {
        ...formData,
        guestId: user._id,
        status: 'Pending'
      });
      
      toast.success('Service requested successfully!');
      setFormData(prev => ({ ...prev, description: '', requestedTime: '' })); 
      fetchData(); 
    } catch (error) {
      toast.error('Failed to request service. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-8">
      {/* Request Form Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-black text-[#1b3658] mb-2">Request Guest Service</h2>
        <p className="text-gray-500 mb-8">Need something? Request room service, a wake-up call, or transport.</p>

        {rooms.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl font-medium border border-yellow-200">
            You don't have any currently active (checked-in) room bookings to request a service for.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Select Your Room</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                  required
                >
                  <option value="" disabled>Select a room</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>Room {room.roomNumber} - {room.type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Service Type</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  required
                >
                  <option value="Room Service">Room Service</option>
                  <option value="Wake-up Call">Wake-up Call</option>
                  <option value="Transport">Transport / Taxi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Details</label>
              <textarea 
                rows="3" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. Please bring two extra pillows..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Requested Time (Optional)</label>
              <input 
                type="datetime-local" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={formData.requestedTime}
                onChange={(e) => setFormData({...formData, requestedTime: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full md:w-auto px-10 bg-[#1b3658] text-white font-bold py-4 rounded-xl hover:bg-[#12243d] active:scale-95 transition-all shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Submitting...' : 'Request Service'}
            </button>
          </form>
        )}
      </div>

      {/* History Section */}
      {services.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-2xl font-black text-[#1b3658] mb-6">My Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Date</th>
                  <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Room</th>
                  <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Service</th>
                  <th className="p-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600 font-medium">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-gray-900">{s.roomId?.roomNumber || 'N/A'}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800 text-sm">{s.serviceType}</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{s.description}</p>
                      {s.requestedTime && (
                        <p className="text-xs text-blue-600 mt-1 font-bold">Time: {new Date(s.requestedTime).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestServices;
