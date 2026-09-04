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
        <div className="h-40 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        </div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 sm:-mt-20 mb-8">
            <div className="relative group">
              {staff.image ? (
                <img src={staff.image} alt={staff.fullName} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl bg-white relative z-10" />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center border-4 border-white shadow-xl relative z-10">
                  <FontAwesomeIcon icon={faUserTie} className="text-gray-400 text-6xl" />
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                {staff.fullName}
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border ${
                  staff.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {staff.status}
                </span>
              </h2>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mt-1">{staff.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserTie} className="text-indigo-500" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-medium text-gray-900 break-all">{staff.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faPhone} className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Number</p>
                    <p className="font-medium text-gray-900">{staff.contactNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="font-medium text-gray-900">{formatDate(staff.dateOfBirth)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address & City</p>
                    <p className="font-medium text-gray-900 leading-relaxed">
                      {staff.address || 'N/A'} {staff.city ? `, ${staff.city}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faBriefcase} className="text-purple-500" /> Work Details
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faBriefcase} className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned Work</p>
                    <p className="font-medium text-gray-900">{staff.assignWork || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Joining Date</p>
                    <p className="font-medium text-gray-900">{formatDate(staff.joiningDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faClock} className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Shift</p>
                    <p className="font-medium text-gray-900">{staff.shift || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Salary</p>
                    <p className="font-medium text-gray-900">{staff.salary ? `$${staff.salary}` : 'N/A'}</p>
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
