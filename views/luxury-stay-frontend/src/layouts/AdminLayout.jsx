import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHotel, faUser, faUserTie, faIdBadge, faBed, faClipboardList, 
  faSignOutAlt, faBroom, faMoneyBillWave, faCommentDots,
  faBars, faGlobe, faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import Logo from '../components/Logo';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (!loggedUser) {
      navigate('/login');
    } else {
      const parsed = JSON.parse(loggedUser);
      if (parsed.role === 'guest') {
        toast.error('Unauthorized access');
        navigate('/');
      } else {
        setUser(parsed);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user || user.role === 'guest') return null;

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: faHotel },
    { name: 'Rooms', path: '/admin/rooms', icon: faBed },
    { name: 'Reservations', path: '/admin/reservations', icon: faClipboardList },
    { name: 'Billings', path: '/admin/billings', icon: faMoneyBillWave },
    { name: 'Messages', path: '/admin/messages', icon: faEnvelope },
    { name: 'Feedbacks', path: '/admin/feedbacks', icon: faCommentDots },
    { name: 'Users', path: '/admin/users', icon: faUser },
    { name: 'Staff Management', path: '/admin/staff', icon: faUserTie },
    { name: 'Roles', path: '/admin/roles', icon: faIdBadge },
  ];

  return (
    <div className="admin-panel min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className={`bg-gray-900 text-white w-72 flex-shrink-0 hidden md:flex flex-col shadow-2xl relative z-10 print:hidden`}>
        <div className="p-6 border-b border-gray-800 flex justify-center">
          <Logo size="md" isDark={false} />
        </div>
        
        <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-800">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border-2 border-blue-500 overflow-hidden">
            {user.image ? (
              <img src={user.image} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <FontAwesomeIcon icon={faUserTie} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-gray-100 capitalize">{user.fullName || user.name || 'Admin User'}</p>
            <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold">{user.role}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Main Menu</p>
          {adminLinks.map((link) => {
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white font-medium hover:translate-x-1'
                }`}
              >
                <div className={`flex items-center justify-center w-6 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  <FontAwesomeIcon icon={link.icon} className="text-lg" />
                </div>
                {link.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-3 bg-gray-900/50">
          <Link to="/" className="w-full flex items-center justify-center gap-2 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white py-3.5 rounded-xl transition-all font-semibold hover:shadow-lg">
            <FontAwesomeIcon icon={faGlobe} /> Public Website
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white py-3.5 rounded-xl transition-all font-semibold">
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center md:hidden sticky top-0 z-20 print:hidden">
          <div className="flex items-center">
            <Logo size="md" isDark={true} />
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </header>
        
        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="md:hidden bg-gray-900 text-white absolute inset-0 z-40 flex flex-col animate-fade-in">
            <div className="p-6 flex justify-between items-center border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-blue-500 overflow-hidden">
                  {user.image ? (
                    <img src={user.image} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <FontAwesomeIcon icon={faUserTie} className="text-gray-400 text-sm" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-100 capitalize">{user.fullName || user.name || 'Admin User'}</p>
                  <p className="text-xs text-blue-400 uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">&times;</button>
            </div>
            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-2">
              {adminLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-4 p-4 rounded-xl ${location.pathname === link.path ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-800'}`}>
                  <FontAwesomeIcon icon={link.icon} className="w-6 text-xl" /> {link.name}
                </Link>
              ))}
            </nav>
            <div className="p-6 border-t border-gray-800 space-y-3">
              <Link to="/" className="w-full flex justify-center py-4 bg-gray-800 rounded-xl font-bold"><FontAwesomeIcon icon={faGlobe} className="mr-2" /> View Website</Link>
              <button onClick={handleLogout} className="w-full py-4 bg-red-600 rounded-xl font-bold"><FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout</button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
