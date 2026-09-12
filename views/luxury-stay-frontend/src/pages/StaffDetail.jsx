import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUserTie, faEnvelope, faPhone, faMapMarkerAlt, faCalendarAlt, faMoneyBillWave, faClock, faBriefcase } from '@fortawesome/free-solid-svg-icons';

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    const fetchStaffDetail = async () => {
      try {
        const { data } = await api.get(`/staff/${id}`);
        setStaff(data);
      } catch (err) {
        toast.error('Failed to fetch staff details');
        navigate('/admin/staff');
      }
    };
    fetchStaffDetail();
  }, [id, navigate]);

  if (!staff) return <div className="text-center py-10">Loading...</div>;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/staff')} className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:shadow-md transition-all active:scale-95">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Staff Profile</h1>
          <p className="text-gray-500 mt-1">Detailed information and work assignments</p>
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
              {staff.image ? (
                <img src={staff.image} alt={staff.fullName} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl bg-white relative z-10 ring-4 ring-[#d4af37]/30" />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-xl relative z-10 ring-4 ring-[#d4af37]/30">
                  <FontAwesomeIcon icon={faUserTie} className="text-[#1b3658] text-6xl opacity-50" />
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <h2 className="text-3xl font-black text-[#1b3658] tracking-tight flex items-center gap-3">
                {staff.fullName}
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border ${
                  staff.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {staff.status}
                </span>
              </h2>
              <p className="text-[#d4af37] font-bold uppercase tracking-widest text-sm mt-1">{staff.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-colors hover:shadow-md">
              <h3 className="text-lg font-black text-[#1b3658] mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserTie} className="text-[#d4af37]" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900 break-all text-sm">{staff.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Number</p>
                    <p className="font-semibold text-gray-900 text-sm">{staff.contactNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Birth</p>
                    <p className="font-semibold text-gray-900 text-sm">{formatDate(staff.dateOfBirth)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address & City</p>
                    <p className="font-semibold text-gray-900 leading-relaxed text-sm">
                      {staff.address || staff.city ? `${staff.address || ''}${staff.address && staff.city ? ', ' : ''}${staff.city || ''}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-colors hover:shadow-md">
              <h3 className="text-lg font-black text-[#1b3658] mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faBriefcase} className="text-[#d4af37]" /> Work Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faBriefcase} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Work</p>
                    <p className="font-semibold text-gray-900 text-sm">{staff.assignWork || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Joining Date</p>
                    <p className="font-semibold text-gray-900 text-sm">{formatDate(staff.joiningDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shift</p>
                    <p className="font-semibold text-gray-900 text-sm">{staff.shift || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 transition-colors hover:bg-[#1b3658]/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-[#1b3658] text-[#d4af37] shadow-sm flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Salary</p>
                    <p className="font-semibold text-gray-900 text-sm">{staff.salary ? `$${staff.salary}` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetail;
