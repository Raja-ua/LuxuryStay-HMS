import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Logo from '../../components/Logo';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    cnic: '',
    nationality: '',
    city: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match!');
    }
    
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.name); // Using fullName as expected by backend user model
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('contactNumber', formData.contactNumber);
      data.append('cnic', formData.cnic);
      data.append('nationality', formData.nationality);
      data.append('city', formData.city);
      data.append('address', formData.address);
      data.append('role', 'guest'); // hardcoded role

      await api.post('/users', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans py-12">
      
      {/* Branding */}
      <div className="mb-10 text-center">
        <Logo size="lg" isDark={true} />
      </div>

      <div className="w-full max-w-3xl bg-white border border-gray-200 p-8 md:p-12 shadow-sm rounded-none">
        <h2 className="text-3xl font-serif text-[#1b3658] mb-2 text-center">Create Account</h2>
        <p className="text-gray-500 mb-8 font-light text-center">Please fill in your details to register as a Guest.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Full Name *</label>
                <input required minLength="3" type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Email Address *</label>
                <input required type="email" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Contact Number *</label>
                <input required pattern="[0-9]{11}" title="Contact number must be exactly 11 digits" type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="e.g. 03001234567" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">CNIC / ID *</label>
                <input required pattern="[0-9]{13}" title="CNIC must be exactly 13 digits without dashes" type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="e.g. 4210112345678" value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Nationality</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="e.g. American" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">City</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="New York" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Address</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="123 Main St" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Password *</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  minLength="6"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">Confirm Password *</label>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required
                  minLength="6"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-12"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#937648] hover:bg-[#7d633b] text-white font-bold py-4 rounded-none active:scale-95 transition-all disabled:opacity-70 mt-6 cursor-pointer"
            >
              {isLoading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-gray-600 font-medium">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
    </div>
  );
};

export default Register;
