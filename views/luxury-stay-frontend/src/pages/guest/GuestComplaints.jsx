import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GuestComplaints = () => {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '',
    issueType: 'Repair',
    description: '',
    priority: 'Medium'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user's active/past bookings to get rooms
    const fetchRooms = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        const { data } = await api.get('/reservations');
        // Filter reservations for this user
        const userReservations = data.filter(r => {
            const guestIdStr = r.guestId?._id || r.guestId;
            return guestIdStr === user._id && (r.status === 'confirmed' || r.status === 'checked-in');
        });
        
        // Extract unique rooms
        const uniqueRooms = [];
        userReservations.forEach(r => {
          if (r.roomId && !uniqueRooms.find(rm => rm._id === r.roomId._id)) {
            uniqueRooms.push(r.roomId);
          }
        });
        setRooms(uniqueRooms);
        
        if (uniqueRooms.length > 0) {
          setFormData(prev => ({ ...prev, roomId: uniqueRooms[0]._id }));
        }
      } catch (error) {
        console.error("Failed to load rooms", error);
      }
    };
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomId) {
      return toast.error("Please select your room.");
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      await api.post('/maintenance', {
        ...formData,
        requestedBy: user._id,
        status: 'Pending'
      });
      
      toast.success('Issue reported successfully! Our staff will attend to it shortly.');
      setFormData(prev => ({ ...prev, description: '' })); // reset only description
    } catch (error) {
      toast.error('Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <h2 className="text-3xl font-black text-[#1b3658] mb-2">Report an Issue</h2>
      <p className="text-gray-500 mb-8">Having trouble in your room? Let us know and we will fix it right away.</p>

      {rooms.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl">
          You don't have any active room bookings at the moment to report an issue.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Issue Type</label>
            <select 
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={formData.issueType}
              onChange={(e) => setFormData({...formData, issueType: e.target.value})}
              required
            >
              <option value="Repair">Repair / Maintenance</option>
              <option value="Cleaning">Housekeeping / Cleaning</option>
              <option value="Supply Request">Supply Request (Towels, Water, etc.)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Priority Level</label>
            <select 
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              required
            >
              <option value="Low">Low - Whenever possible</option>
              <option value="Medium">Medium - Soon</option>
              <option value="High">High - Important</option>
              <option value="Urgent">Urgent - Needs immediate attention</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Please describe the issue</label>
            <textarea 
              rows="4" 
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. The AC is making a strange noise..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-[#1b3658] text-white font-bold py-4 rounded-xl hover:bg-[#12243d] active:scale-95 transition-all shadow-lg mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      )}
    </div>
  );
};

export default GuestComplaints;
