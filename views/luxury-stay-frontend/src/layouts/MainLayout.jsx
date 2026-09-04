import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHotel, faUser, faBed, faClipboardList, 
  faSignOutAlt, faBroom, faMoneyBillWave, faCommentDots,
  faBars, faCalendarPlus
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (!loggedUser) navigate('/login');
    else setUser(JSON.parse(loggedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role !== 'guest';

  const adminLinks = [
    { name: 'Dashboard', path: '/', icon: faHotel },
    { name: 'Rooms', path: '/rooms', icon: faBed },
    { name: 'Reservations', path: '/reservations', icon: faClipboardList },
    { name: 'Tasks', path: '/tasks', icon: faBroom },
    { name: 'Billings', path: '/billings', icon: faMoneyBillWave },
    { name: 'Feedbacks', path: '/feedbacks', icon: faCommentDots },
    { name: 'Users', path: '/users', icon: faUser },
  ];

  const guestLinks = [
    { name: 'Dashboard', path: '/', icon: faHotel },
    { name: 'Book a Room', path: '/guest/rooms', icon: faCalendarPlus },
    { name: 'My Bookings', path: '/guest/bookings', icon: faClipboardList },
    { name: 'My Bills', path: '/guest/bills', icon: faMoneyBillWave },
    { name: 'Feedback', path: '/guest/feedback', icon: faCommentDots },
  ];

  const navLinks = isAdmin ? adminLinks : guestLinks;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Desktop */}
      <aside className={`bg-gray-900 text-white w-64 flex-shrink-0 hidden md:flex flex-col`}>
        <div className="p-4 bg-gray-800 text-xl font-bold flex items-center gap-3">
          <FontAwesomeIcon icon={faHotel} className="text-blue-400" /> LuxuryStay
        </div>
        <div className="px-4 py-2 bg-gray-700 text-xs text-gray-300 font-semibold uppercase tracking-wider">
          {isAdmin ? 'Admin Panel' : 'Guest Portal'}
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`flex items-center gap-3 px-6 py-3 transition ${location.pathname === link.path ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
            >
              <FontAwesomeIcon icon={link.icon} className="w-5 text-center" /> {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="mb-4 text-sm">
            <p className="text-gray-400">Logged in as:</p>
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-blue-400 uppercase">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded transition">
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm md:hidden p-4 flex justify-between items-center">
          <div className="text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faHotel} className="text-blue-600" /> LuxuryStay
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600">
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </header>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden bg-gray-900 text-white absolute inset-0 z-40 flex flex-col h-full">
            <div className="p-4 flex justify-end">
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            <div className="px-4 py-2 bg-gray-700 text-xs text-gray-300 font-semibold uppercase tracking-wider mb-2">
              {isAdmin ? 'Admin Panel' : 'Guest Portal'}
            </div>
            <nav className="flex-1 px-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 p-4 mb-2 rounded ${location.pathname === link.path ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                >
                  <FontAwesomeIcon icon={link.icon} className="w-5" /> {link.name}
                </Link>
              ))}
            </nav>
            <div className="p-4">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-3 rounded transition">
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
