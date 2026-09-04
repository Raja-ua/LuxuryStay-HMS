import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const GuestFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({ rating: 5, comments: '' });
  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchFeedbacks = async () => {
    try {
      const { data } = await api.get('/feedbacks');
      setFeedbacks(data.filter(f => f.guestId?._id === user._id || f.guestId === user._id));
    } catch (err) { toast.error('Failed to load feedbacks'); }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/feedbacks', { ...formData, guestId: user._id });
      toast.success('Thank you for your feedback!');
      setFormData({ rating: 5, comments: '' });
      fetchFeedbacks();
    } catch (err) { toast.error('Failed to submit feedback'); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leave Feedback</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">How was your stay?</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Rating (1-5)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setFormData({...formData, rating: num})}
                  className={`text-2xl ${formData.rating >= num ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Comments</label>
            <textarea 
              required
              className="w-full border border-gray-300 p-3 rounded outline-none focus:ring-2 focus:ring-blue-500" 
              rows="4" 
              placeholder="Tell us about your experience..."
              value={formData.comments} 
              onChange={e => setFormData({...formData, comments: e.target.value})}
            ></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Submit Feedback
          </button>
        </form>
      </div>

      {feedbacks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Past Feedback</h2>
          <div className="space-y-4">
            {feedbacks.map(f => (
              <div key={f._id} className="bg-white p-4 rounded shadow-sm border border-gray-100">
                <div className="text-yellow-500 mb-2 text-lg">
                  {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                </div>
                <p className="text-gray-700">"{f.comments}"</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(f.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestFeedback;
