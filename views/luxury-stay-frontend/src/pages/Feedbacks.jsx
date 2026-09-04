import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/feedbacks');
      setFeedbacks(data);
    } catch (err) { 
      toast.error('Failed to fetch feedbacks'); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({ 
      title: 'Delete feedback?', 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#d33', 
      confirmButtonText: 'Delete' 
    });
    
    if (result.isConfirmed) {
      try {
        await api.delete(`/feedbacks/${id}`);
        toast.success('Deleted successfully');
        fetchData();
      } catch (err) { 
        toast.error('Delete failed'); 
      }
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Guest Feedbacks</h1>
        <p className="text-gray-500 mt-1">Review ratings and testimonials from your guests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {feedbacks.map(f => (
          <div key={f._id} className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group">
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleDelete(f._id)} 
                className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors inline-flex items-center justify-center"
                title="Delete Feedback"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xl border-2 border-white shadow-sm">
                {(f.guestId?.fullName || f.guestId?.name || 'G')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 leading-tight">
                  {f.guestId?.fullName || f.guestId?.name || 'Guest User'}
                </h3>
                <div className="text-amber-400 text-sm mt-0.5 tracking-widest">
                  {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                </div>
              </div>
            </div>
            
            <div className="relative">
              <span className="absolute -top-4 -left-2 text-4xl text-gray-100 font-serif leading-none">"</span>
              <p className="text-gray-600 italic relative z-10 text-sm leading-relaxed mb-4">
                {f.comments}
              </p>
            </div>
            
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50 pt-4 mt-auto">
              {new Date(f.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {feedbacks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="text-gray-300 mb-2"><FontAwesomeIcon icon={faTrash} size="3x" /></div>
            <h3 className="text-xl font-bold text-gray-400">No Feedback Yet</h3>
            <p className="text-gray-400">When guests leave reviews, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedbacks;
