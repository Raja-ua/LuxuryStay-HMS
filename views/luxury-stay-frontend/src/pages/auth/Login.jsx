import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Logo from '../../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');

  useEffect(() => {
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.isStaff || user.role !== 'guest') {
          const isMaint = ['housekeeping', 'maintenance', 'cleaner', 'sweeper'].includes(user.role);
          window.location.replace(isMaint ? '/admin/maintenance' : '/admin');
        } else {
          window.location.replace('/');
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, [userStr]);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginType, setLoginType] = useState('user'); // 'user' or 'staff'

  // If user is already logged in, do not render the login page at all while redirecting
  if (userStr) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = loginType === 'staff' ? '/staff/login' : '/users/login';
      const { data } = await api.post(endpoint, formData);
      const user = loginType === 'staff' ? data.staff : data.user;
      
      if (user) {
        // Normalize staff object to match user structure if needed
        const loggedInUser = {
          ...user,
          role: loginType === 'staff' ? user.role.toLowerCase() : user.role,
          isStaff: loginType === 'staff'
        };
        
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        toast.success(`Logged in as ${loggedInUser.role}!`);
        
        // Redirect based on role and login type
        if (loginType === 'staff' || loggedInUser.role !== 'guest') {
          const isMaint = ['housekeeping', 'maintenance', 'cleaner', 'sweeper'].includes(loggedInUser.role);
          if (isMaint) {
            window.location.replace('/admin/maintenance');
          } else {
            window.location.replace('/admin'); 
          }
        } else {
          window.location.replace('/'); 
        }
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans">
      
      {/* Branding */}
      <div className="mb-10 text-center">
        <Logo size="lg" isDark={true} />
      </div>

      <div className="w-full max-w-md bg-white border border-gray-200 p-10 md:p-12 shadow-sm rounded-none">
        <h2 className="text-3xl font-serif text-[#1b3658] mb-2 text-center">Sign In</h2>
        <p className="text-gray-500 mb-6 font-light text-center">Access your personalized dashboard</p>

        {/* Login Type Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
          <button 
            type="button"
            onClick={() => setLoginType('user')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${loginType === 'user' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Guest / Admin
          </button>
          <button 
            type="button"
            onClick={() => setLoginType('staff')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${loginType === 'staff' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Hotel Staff
          </button>
        </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Password</label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">Forgot password?</a>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength="6"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-12"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-11 text-gray-400 hover:text-gray-600 mt-1">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#937648] hover:bg-[#7d633b] text-white font-bold py-4 rounded-none active:scale-95 transition-all disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-600 font-medium">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register now</Link>
          </p>
        </div>
    </div>
  );
};

export default Login;
