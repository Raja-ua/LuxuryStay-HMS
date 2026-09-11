import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHotel, faBed, faClipboardList, faMoneyBillWave, faUser, faCog, 
  faSignOutAlt, faBars, faGlobe, faUserTie, faEnvelope, faCommentDots, 
  faBroom, faConciergeBell, faIdBadge, faShieldAlt, faChevronDown 
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import api from '../services/api';
import Logo from '../components/Logo';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    
    const parsed = JSON.parse(loggedUser);
    if (parsed.role === 'guest') {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }
    
    setUser(parsed);

    // Fetch roles to get current user's permissions
    const fetchRolePermissions = async () => {
      try {
        const { data } = await api.get('/roles');
        const myRole = data.find(r => r.name.toLowerCase() === parsed.role.toLowerCase());
        
        if (parsed.role.toLowerCase() === 'admin') {
          // Admin gets everything
          setPermissions(['view_dashboard', 'manage_reservations', 'manage_rooms', 'manage_guests', 'manage_staff', 'manage_billing', 'manage_maintenance', 'manage_settings', 'manage_roles']);
        } else if (myRole && myRole.permissions) {
          setPermissions(myRole.permissions);
        } else {
          // Fallback basic permissions based on old hardcoded logic
          const isMaint = ['housekeeping', 'maintenance', 'cleaner', 'sweeper'].includes(parsed.role.toLowerCase());
          setPermissions(isMaint ? ['manage_maintenance'] : ['view_dashboard', 'manage_reservations', 'manage_rooms', 'manage_billing', 'manage_maintenance', 'manage_guests']);
        }
      } catch (error) {
        console.error('Failed to load permissions');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRolePermissions();
  }, [navigate]);

  useEffect(() => {
    // Basic route protection based on permissions
    if (!loadingRoles && permissions.length > 0) {
      const path = location.pathname;
      
      // Auto-redirect if they land on /admin but lack dashboard view
      if (path === '/admin' && !permissions.includes('view_dashboard')) {
        if (permissions.includes('manage_maintenance')) navigate('/admin/maintenance');
        else if (permissions.includes('manage_reservations')) navigate('/admin/reservations');
      }
    }
  }, [location.pathname, loadingRoles, permissions, navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.replace('/login');
  };

  const toggleMenu = (name) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (!user || user.role === 'guest' || loadingRoles) return <div className="h-screen flex items-center justify-center bg-gray-50"><FontAwesomeIcon icon={faCog} className="animate-spin text-4xl text-blue-500" /></div>;

  const hasPerm = (perm) => permissions.includes(perm);

  const adminLinks = [
    hasPerm('view_dashboard') && { name: 'Dashboard', path: '/admin', icon: faHotel },
    hasPerm('manage_rooms') && { name: 'Rooms', path: '/admin/rooms', icon: faBed },
    hasPerm('manage_reservations') && { name: 'Reservations', path: '/admin/reservations', icon: faClipboardList },
    hasPerm('manage_billing') && { name: 'Billings', path: '/admin/billings', icon: faMoneyBillWave },
    hasPerm('manage_maintenance') && { 
      name: 'Operations', 
      icon: faBroom, 
      subLinks: [
        { name: 'Housekeeping', path: '/admin/housekeeping' },
        { name: 'Maintenance', path: '/admin/maintenance' },
        { name: 'Guest Services', path: '/admin/services' }
      ]
    },
    hasPerm('manage_guests') && { name: 'Messages', path: '/admin/messages', icon: faEnvelope },
    hasPerm('manage_guests') && { name: 'Feedbacks', path: '/admin/feedbacks', icon: faCommentDots },
    hasPerm('manage_guests') && { name: 'Users', path: '/admin/users', icon: faUser },
    (hasPerm('manage_staff') || hasPerm('manage_roles')) && { 
      name: 'Staff', 
      icon: faUserTie, 
      subLinks: [
        hasPerm('manage_staff') && { name: 'Staff List', path: '/admin/staff' },
        hasPerm('manage_roles') && { name: 'Roles & Permissions', path: '/admin/roles' }
      ].filter(Boolean)
    },
    hasPerm('manage_settings') && { name: 'Settings', path: '/admin/settings', icon: faCog },
  ].filter(Boolean);

  const renderNavLinks = (isMobile = false) => {
    return adminLinks.map((link) => {
      if (link.subLinks) {
        const isActiveParent = link.subLinks.some(sub => location.pathname === sub.path || location.pathname.startsWith(sub.path + '/'));
        const isOpen = openMenus[link.name] !== undefined ? openMenus[link.name] : isActiveParent;
        
        return (
          <div key={link.name} className="flex flex-col">
            <button 
              onClick={() => toggleMenu(link.name)}
              className={`flex items-center justify-between w-full p-4 rounded-xl transition-all duration-300 ${
                isActiveParent 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white font-medium hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-6 ${isActiveParent ? 'text-white' : 'text-gray-500'}`}>
                  <FontAwesomeIcon icon={link.icon} className={isMobile ? "text-xl" : "text-lg"} />
                </div>
                {link.name}
              </div>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={`text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-1 ml-4 pl-4 border-l border-gray-800 space-y-1 pb-1">
                  {link.subLinks.map(sub => {
                    const isSubActive = location.pathname === sub.path || location.pathname.startsWith(sub.path + '/');
                    return (
                      <Link 
                        key={sub.path} 
                        to={sub.path} 
                        onClick={() => isMobile && setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                          isSubActive 
                            ? 'text-white bg-gray-800 font-bold shadow-sm' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-blue-500' : 'bg-gray-600'}`}></span>
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
      return (
        <Link 
          key={link.path} 
          to={link.path} 
          onClick={() => isMobile && setSidebarOpen(false)}
          className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
            isActive 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold' 
              : 'text-gray-400 hover:bg-gray-800 hover:text-white font-medium hover:translate-x-1'
          }`}
        >
          <div className={`flex items-center justify-center w-6 ${isActive ? 'text-white' : 'text-gray-500'}`}>
            <FontAwesomeIcon icon={link.icon} className={isMobile ? "text-xl" : "text-lg"} />
          </div>
          {link.name}
        </Link>
      )
    });
  };

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
          {renderNavLinks(false)}
        </nav>
        
        <div className="p-4 border-t border-gray-800 space-y-3 bg-gray-900/50">
          {hasPerm('view_dashboard') && (
            <Link to="/" className="w-full flex items-center justify-center gap-2 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white py-3.5 rounded-xl transition-all font-semibold hover:shadow-lg">
              <FontAwesomeIcon icon={faGlobe} /> Public Website
            </Link>
          )}
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white py-3.5 rounded-xl transition-all font-semibold">
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header (Desktop & Mobile) */}
        <header className="md:hidden bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center sticky top-0 z-20 print:hidden">
          <div className="flex items-center">
            <Logo size="md" isDark={true} />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
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
              {renderNavLinks(true)}
            </nav>
            
            <div className="p-6 border-t border-gray-800 space-y-3">
              {hasPerm('view_dashboard') && (
                <Link to="/" className="w-full flex justify-center py-4 bg-gray-800 rounded-xl font-bold"><FontAwesomeIcon icon={faGlobe} className="mr-2" /> View Website</Link>
              )}
              <button onClick={handleLogout} className="w-full py-4 bg-red-600 rounded-xl font-bold"><FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout</button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
