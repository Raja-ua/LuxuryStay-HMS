import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faEdit, faSave, faTimes, faIdCard, faCamera, faCity, faFlag } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    address: '',
    cnic: '',
    city: '',
    nationality: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        window.location.href = '/login';
        return;
      }
      const { data } = await api.get(`/users/${storedUser._id}`);
      setUser(data);
      setFormData({
        fullName: data.fullName || data.name || '',
        contactNumber: data.contactNumber || '',
        address: data.address || '',
        cnic: data.cnic || '',
        city: data.city || '',
        nationality: data.nationality || ''
      });
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const dataPayload = new FormData();
      Object.keys(formData).forEach(key => {
        dataPayload.append(key, formData[key]);
      });
      if (imageFile) {
        dataPayload.append('image', imageFile);
      }

      const { data } = await api.put(`/users/${user._id}`, dataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile updated successfully!');
      
      const updatedUser = { ...user, ...formData, image: data.image || user.image };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      setIsEditing(false);
      setImageFile(null);
      window.location.reload();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 font-serif">Loading profile...</div>;
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      
      {/* Page Title */}
      <div className="text-center mb-12">
        <p className="text-blue-600 uppercase tracking-[0.2em] text-sm font-bold mb-2">Guest Account</p>
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900">My Profile</h1>
        <div className="w-16 h-1 bg-blue-600 mx-auto mt-6"></div>
      </div>

      <div className="bg-white border border-gray-200 shadow-xl rounded-none overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Avatar & Summary */}
        <div className="w-full md:w-1/3 bg-gray-900 text-white p-10 flex flex-col items-center justify-center border-r border-gray-800">
          <div className="w-40 h-40 bg-gray-800 border-4 border-blue-500 rounded-none mb-6 relative group overflow-hidden">
            {user.image && !imageFile ? (
              <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
            ) : imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl text-gray-600">
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}
            
            {isEditing && (
              <label className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center text-white cursor-pointer transition-all">
                <FontAwesomeIcon icon={faCamera} className="text-2xl mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Change Photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
              </label>
            )}
          </div>
          
          <h2 className="text-2xl font-serif mb-2 text-center">{user.fullName || user.name || 'Guest'}</h2>
          <p className="text-gray-400 font-light mb-8 text-center">{user.email}</p>
          
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-gray-900 font-bold uppercase tracking-widest text-sm py-3 px-4 rounded-none transition duration-300 flex justify-center items-center gap-2"
            >
              <FontAwesomeIcon icon={faEdit} /> Edit Profile
            </button>
          ) : (
            <div className="w-full space-y-3">
              <button 
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-sm py-3 px-4 rounded-none transition duration-300 flex justify-center items-center gap-2 shadow-lg"
              >
                <FontAwesomeIcon icon={faSave} /> Save Changes
              </button>
              <button 
                onClick={() => { setIsEditing(false); setImageFile(null); }}
                className="w-full bg-transparent hover:bg-gray-800 text-gray-400 font-bold uppercase tracking-widest text-sm py-3 px-4 rounded-none transition duration-300 flex justify-center items-center gap-2"
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Details Form */}
        <div className="w-full md:w-2/3 p-10 bg-white">
          <h3 className="text-xl font-serif text-gray-900 mb-8 pb-4 border-b border-gray-100">Personal Information</h3>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" /> Full Name
                </label>
                {isEditing ? (
                  <input 
                    type="text" required
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-1 focus:ring-blue-600 outline-none transition-all" 
                    value={formData.fullName} 
                    onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  />
                ) : (
                  <div className="p-3 bg-gray-50 text-gray-800 font-medium border-l-2 border-blue-500">{user.fullName || user.name || 'Not provided'}</div>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <FontAwesomeIcon icon={faPhone} className="text-blue-500 mr-2" /> Phone Number
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-1 focus:ring-blue-600 outline-none transition-all" 
                    value={formData.contactNumber} 
                    onChange={e => setFormData({...formData, contactNumber: e.target.value})} 
                  />
                ) : (
                  <div className="p-3 bg-gray-50 text-gray-800 font-medium border-l-2 border-blue-500">{user.contactNumber || 'Not provided'}</div>
                )}
              </div>

              {/* CNIC */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <FontAwesomeIcon icon={faIdCard} className="text-blue-500 mr-2" /> National ID / CNIC
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-1 focus:ring-blue-600 outline-none transition-all" 
                    value={formData.cnic} 
                    onChange={e => setFormData({...formData, cnic: e.target.value})} 
                  />
                ) : (
                  <div className="p-3 bg-gray-50 text-gray-800 font-medium border-l-2 border-blue-500">{user.cnic || 'Not provided'}</div>
                )}
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <FontAwesomeIcon icon={faFlag} className="text-blue-500 mr-2" /> Nationality
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-1 focus:ring-blue-600 outline-none transition-all" 
                    value={formData.nationality} 
                    onChange={e => setFormData({...formData, nationality: e.target.value})} 
                  />
                ) : (
                  <div className="p-3 bg-gray-50 text-gray-800 font-medium border-l-2 border-blue-500">{user.nationality || 'Not provided'}</div>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <FontAwesomeIcon icon={faCity} className="text-blue-500 mr-2" /> City
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-1 focus:ring-blue-600 outline-none transition-all" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                  />
                ) : (
                  <div className="p-3 bg-gray-50 text-gray-800 font-medium border-l-2 border-blue-500">{user.city || 'Not provided'}</div>
                )}
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 mr-2" /> Email Address
                </label>
                <div className="p-3 bg-gray-100 text-gray-500 font-medium border-l-2 border-gray-300 cursor-not-allowed">
                  {user.email}
                </div>
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 mr-2" /> Full Address
                </label>
                {isEditing ? (
                  <textarea 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-1 focus:ring-blue-600 outline-none transition-all min-h-[100px]" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  ></textarea>
                ) : (
                  <div className="p-4 bg-gray-50 text-gray-800 font-medium border-l-2 border-blue-500 min-h-[100px]">
                    {user.address || 'No address provided yet.'}
                  </div>
                )}
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
