import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faEnvelope, faPhone, faMapMarkerAlt, faIdCard, faGlobe } from '@fortawesome/free-solid-svg-icons';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setUser(data);
      } catch (err) {
        toast.error('Failed to fetch user details');
        navigate('/admin/users');
      }
    };
    fetchUserDetail();
  }, [id, navigate]);

  if (!user) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/users')} className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:shadow-md transition-all active:scale-95">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Profile</h1>
          <p className="text-gray-500 mt-1">Detailed information and status</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        </div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 sm:-mt-20 mb-8">
            <div className="relative group">
              {user.image ? (
                <img src={user.image} alt={user.fullName} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl bg-white relative z-10" />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center border-4 border-white shadow-xl relative z-10">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400 text-6xl" />
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                {user.fullName}
                {user.role === 'admin' && (
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border ${
                    user.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {user.status || 'Active'}
                  </span>
                )}
              </h2>
              <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mt-1">{user.role || 'guest'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faEnvelope} className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                <p className="font-medium text-gray-900 break-all">{user.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faPhone} className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Number</p>
                <p className="font-medium text-gray-900">{user.contactNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faIdCard} className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CNIC</p>
                <p className="font-medium text-gray-900">{user.cnic || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faGlobe} className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nationality</p>
                <p className="font-medium text-gray-900">{user.nationality || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 md:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address & City</p>
                <p className="font-medium text-gray-900 leading-relaxed">
                  {user.address || 'N/A'} {user.city ? `, ${user.city}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
