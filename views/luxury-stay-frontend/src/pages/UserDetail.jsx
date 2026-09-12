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
        <div className="h-40 bg-[#1b3658] border-b-4 border-[#d4af37] relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Subtle gold accent shape in the banner */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4af37] rounded-full opacity-10 blur-2xl"></div>
        </div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 sm:-mt-20 mb-8">
            <div className="relative group">
              {user.image ? (
                <img src={user.image} alt={user.fullName} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl bg-white relative z-10 ring-4 ring-[#d4af37]/30" />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-xl relative z-10 ring-4 ring-[#d4af37]/30">
                  <FontAwesomeIcon icon={faUser} className="text-[#1b3658] text-6xl opacity-50" />
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <h2 className="text-3xl font-black text-[#1b3658] tracking-tight flex items-center gap-3">
                {user.fullName}
                {user.role === 'admin' && (
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border ${
                    user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {user.status || 'Active'}
                  </span>
                )}
              </h2>
              <p className="text-[#d4af37] font-bold uppercase tracking-widest text-sm mt-1">{user.role || 'guest'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
              <div className="w-12 h-12 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faEnvelope} className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                <p className="font-semibold text-gray-900 break-all">{user.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
              <div className="w-12 h-12 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faPhone} className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Number</p>
                <p className="font-semibold text-gray-900">{user.contactNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
              <div className="w-12 h-12 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faIdCard} className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CNIC</p>
                <p className="font-semibold text-gray-900">{user.cnic || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
              <div className="w-12 h-12 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faGlobe} className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nationality</p>
                <p className="font-semibold text-gray-900">{user.nationality || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02] md:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address & City</p>
                <p className="font-semibold text-gray-900">
                  {user.address || user.city ? `${user.address || ''}${user.address && user.city ? ', ' : ''}${user.city || ''}` : 'N/A'}
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
